from typing import List
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from fastapi import HTTPException
import requests
import ddl_retrievers.spotify_ddl_retriever
import ddl_retrievers.tiktok_ddl_retriever
import ddl_retrievers.universal_ddl_retriever
from models.music_information import MusicInformation
import ddl_retrievers
from models.playlist_information import PlaylistInformation
from platform_handlers import content_type_identifyer, platform_identifyer
from enums.audio_content_type import ContentType
from enums.platform import Platform
import yt_dlp
import ytmusicapi

from spotipy import SpotifyClientCredentials
import spotipy
import os

async def fetch_song(query_url: str) -> MusicInformation:
    platform = await platform_identifyer.identify(query_url)

    if platform is Platform.SPOTIFY:
        return await ddl_retrievers.spotify_ddl_retriever.get_streaming_url(query_url)

    elif platform is Platform.TIK_TOK:
        return await ddl_retrievers.tiktok_ddl_retriever.get_streaming_url(query_url)

    elif platform is Platform.SOUND_CLOUD:
        parsed_url = urlparse(query_url)

        subdomain = parsed_url.hostname.split('.')[0]

        if "api" in subdomain:
            response = requests.get(f"https://w.soundcloud.com/player/?url={query_url}")
            html_content = response.text

            soup = BeautifulSoup(html_content, 'html.parser')

            canonical_link = soup.find('link', rel='canonical')
            href = canonical_link.get('href')

            return await ddl_retrievers.universal_ddl_retriever.get_streaming_url(href)
        
        else:
            return await ddl_retrievers.universal_ddl_retriever.get_streaming_url(query_url)

    elif audio_content_type is ContentType.QUERY:
        yt = ytmusicapi.YTMusic()
        video_id = yt.search(query_url)[0]["videoId"]
        yt_music_url = f"https://music.youtube.com/watch?v={video_id}"
        return await ddl_retrievers.universal_ddl_retriever.get_streaming_url(yt_music_url)

    elif platform is Platform.ANYTHING_ELSE:
        audio_content_type = await content_type_identifyer.identify(query_url, platform)

        if audio_content_type is ContentType.YT_DLP:
            return await ddl_retrievers.universal_ddl_retriever.get_streaming_url(query_url)
        else:
            parsed_url = urlparse(query_url)
            song_name = os.path.basename(parsed_url.path)
            
            return MusicInformation(query_url, song_name, "unkown", 'https://cdn.pixabay.com/photo/2018/02/12/16/35/phonograph-record-3148686_640.jpg')
        
    else:
        return await ddl_retrievers.universal_ddl_retriever.get_streaming_url(query_url)

async def fetch_playlist(query: str) -> PlaylistInformation:
    platform = await platform_identifyer.identify(query)
    audio_content_type = await content_type_identifyer.identify(query, platform)

    # Spotify handling
    if (audio_content_type in [ContentType.PLAYLIST, ContentType.ALBUM]) and platform is Platform.SPOTIFY:
        client_credentials_manager = SpotifyClientCredentials(client_id=os.getenv('SPOTIFY_CLIENT_ID'), client_secret=os.getenv('SPOTIFY_CLIENT_SECRET'))
        sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)
        
        parse_result = urlparse(query)
        path = parse_result.path
        path_segments = path.strip("/").split("/")
        content_id = path_segments[-1]
        
        if audio_content_type is ContentType.PLAYLIST:
            content = sp.playlist(content_id)
            songs = [
                MusicInformation(
                    streaming_url=item['track']['external_urls']['spotify'],
                    song_name=item['track']['name'],
                    author=', '.join([artist['name'] for artist in item['track']['artists']]),
                    image_url=item['track']['album']['images'][0]['url'] if item['track']['album']['images'] else ''
                )
                for item in content['tracks']['items']
            ]
            return PlaylistInformation(
                playlist_name=content['name'],
                author=content['owner']['display_name'],
                image_url=content['images'][0]['url'] if content['images'] else '',
                songs=songs
            )
        
        elif audio_content_type is ContentType.ALBUM:
            content = sp.album(content_id)
            songs = [
                MusicInformation(
                    streaming_url=track['external_urls']['spotify'],
                    song_name=track['name'],
                    author=', '.join([artist['name'] for artist in track['artists']]),
                    image_url=content['images'][0]['url'] if content['images'] else ''
                )
                for track in content['tracks']['items']
            ]
            return PlaylistInformation(
                playlist_name=content['name'],
                author=', '.join([artist['name'] for artist in content['artists']]),
                image_url=content['images'][0]['url'] if content['images'] else '',
                songs=songs
            )

    # YouTube/SoundCloud handling
    elif audio_content_type in [ContentType.PLAYLIST, ContentType.RADIO, ContentType.YT_DLP]:
        ydl_opts = {
            'extract_flat': True,
            'quiet': True,
            'skip_download': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            playlist_info = ydl.extract_info(query, download=False)
            
            songs = []
            if 'entries' in playlist_info:
                for entry in playlist_info['entries']:
                    songs.append(MusicInformation(
                        streaming_url=entry['url'],
                        song_name=entry.get('title', 'Unknown'),
                        author=entry.get('uploader', 'Unknown'),
                        image_url=entry.get('thumbnail', '')
                    ))
            else:
                songs = [MusicInformation(
                    streaming_url=playlist_info['url'],
                    song_name=playlist_info.get('title', 'Unknown'),
                    author=playlist_info.get('uploader', 'Unknown'),
                    image_url=playlist_info.get('thumbnail', '')
                )]
            
            return PlaylistInformation(
                playlist_name=playlist_info.get('title', 'Unknown Playlist'),
                author=playlist_info.get('uploader', 'Unknown'),
                image_url=playlist_info.get('thumbnail', ''),
                songs=songs
            )
    
    raise HTTPException(
        status_code=400,
        detail=f"Unsupported content type: {audio_content_type} for platform: {platform}"
    )