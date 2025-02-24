import aiohttp
import mimetypes
from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
import uvicorn
import asyncio
import aiofiles
import os
import tempfile
from pathlib import Path
import json

from enums.audio_content_type import ContentType
from models.music_information import MusicInformation
from models.playlist_information import PlaylistInformation
from platform_handlers import content_type_identifyer, music_fetcher, platform_identifyer

app = FastAPI(title="ArgonFetch API", version="0.0.1")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to ["http://localhost:4200"] for more security
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"]   # Allows all headers
)

@app.get("/api/identify/is-song", response_model=bool)
async def identify_content(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    platform = await platform_identifyer.identify(url)
    content_type = await content_type_identifyer.identify(url, platform)

    if content_type is ContentType.NOT_SUPPORTED:
        raise HTTPException(status_code=400, detail="URL is not supported")

    return ContentType.is_song(content_type)

@app.get("/api/fetch/song", response_model=MusicInformation)
async def get_song_info(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    platform = await platform_identifyer.identify(url)
    content_type = await content_type_identifyer.identify(url, platform)

    if content_type is ContentType.NOT_SUPPORTED:
        raise HTTPException(status_code=400, detail="URL is not supported")

    if not ContentType.is_song(content_type):
        raise HTTPException(status_code=400, detail="Playlists are not supported")

    return await music_fetcher.fetch_song(url)

@app.get("/api/fetch/playlist", response_model=PlaylistInformation)
async def get_playlist_info(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    platform = await platform_identifyer.identify(url)
    content_type = await content_type_identifyer.identify(url, platform)

    if content_type is ContentType.NOT_SUPPORTED:
        raise HTTPException(status_code=400, detail="URL is not supported")

    if ContentType.is_song(content_type):
        raise HTTPException(status_code=400, detail="Songs are not supported")
    
    return await music_fetcher.fetch_playlist(url)

@app.get("/api/download/song")
async def download_song(url: str):
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    platform = await platform_identifyer.identify(url)
    content_type = await content_type_identifyer.identify(url, platform)

    if content_type is ContentType.NOT_SUPPORTED:
        raise HTTPException(status_code=400, detail="URL is not supported")

    if not ContentType.is_song(content_type):
        raise HTTPException(status_code=400, detail="Playlists are not supported")

    # Fetch song information
    song_info = await music_fetcher.fetch_song(url)

    if not song_info or not song_info.streaming_url:
        raise HTTPException(status_code=404, detail="Song not found")

    async def stream_generator():
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(song_info.streaming_url, timeout=60) as response:
                    if response.status != 200:
                        raise HTTPException(status_code=response.status, detail="Failed to fetch song")
                    
                    # Get content length for progress calculation
                    total_size = response.headers.get('Content-Length')
                    
                    # Stream in 256KB chunks
                    chunk_size = 256 * 1024
                    async for chunk in response.content.iter_chunked(chunk_size):
                        if chunk:  # Only yield non-empty chunks
                            yield chunk
                            
        except Exception as e:
            print(f"Streaming error: {str(e)}")
            raise HTTPException(status_code=500, detail="Stream interrupted")

    # Set response headers
    headers = {
        "Content-Disposition": f'attachment; filename="{song_info.song_name}.mp3"',
        "Content-Type": "audio/mpeg",
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache"
    }

    return StreamingResponse(
        stream_generator(),
        headers=headers,
        media_type="audio/mpeg"
    )

@app.websocket("/ws/download")
async def websocket_download(websocket: WebSocket):
    print("WebSocket connection attempt")
    try:
        await websocket.accept()
        print("WebSocket connection accepted")
        
        try:
            # Get the URL from the first message
            data = await websocket.receive_text()
            print(f"Received data: {data}")
            url = json.loads(data)['url']
            
            if not url:
                await websocket.send_json({"error": "URL is required"})
                return

            platform = await platform_identifyer.identify(url)
            content_type = await content_type_identifyer.identify(url, platform)

            if content_type is ContentType.NOT_SUPPORTED:
                await websocket.send_json({"error": "URL is not supported"})
                return

            if not ContentType.is_song(content_type):
                await websocket.send_json({"error": "Playlists are not supported"})
                return

            # Fetch song information
            song_info = await music_fetcher.fetch_song(url)

            if not song_info or not song_info.streaming_url:
                await websocket.send_json({"error": "Song not found"})
                return

            # Send song metadata
            await websocket.send_json({
                "type": "metadata",
                "filename": f"{song_info.song_name}.mp3",
                "content_type": "audio/mpeg"
            })

            # Stream the file in chunks
            timeout = aiohttp.ClientTimeout(total=None, connect=60, sock_read=60)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                # Add headers to prevent timeouts
                headers = {
                    'Connection': 'keep-alive',
                    'Keep-Alive': 'timeout=60, max=1000'
                }
                async with session.get(song_info.streaming_url, headers=headers) as response:
                    if response.status != 200:
                        await websocket.send_json({"error": "Failed to fetch song"})
                        return
                    
                    total_size = int(response.headers.get('Content-Length', 0))
                    bytes_downloaded = 0
                    last_progress_time = asyncio.get_event_loop().time()
                    
                    # Stream in smaller chunks for better reliability
                    chunk_size = 64 * 1024  # 64KB chunks
                    async for chunk in response.content.iter_chunked(chunk_size):
                        if chunk:
                            # Send the chunk as binary data
                            await websocket.send_bytes(chunk)
                            
                            # Update progress, but not too frequently
                            bytes_downloaded += len(chunk)
                            current_time = asyncio.get_event_loop().time()
                            if total_size > 0 and (current_time - last_progress_time) >= 0.5:
                                progress = int((bytes_downloaded / total_size) * 100)
                                await websocket.send_json({
                                    "type": "progress",
                                    "progress": progress
                                })
                                last_progress_time = current_time

                            # Add a small delay to prevent overwhelming the connection
                            await asyncio.sleep(0.01)

            # Send completion message
            await websocket.send_json({"type": "complete"})

        except asyncio.TimeoutError as e:
            print(f"Timeout error: {str(e)}")
            await websocket.send_json({"error": "Connection timed out"})
        except Exception as e:
            print(f"WebSocket error: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            await websocket.send_json({"error": str(e)})
    except Exception as e:
        print(f"Connection error: {str(e)}")
    finally:
        print("WebSocket connection closed")
        await websocket.close()

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)