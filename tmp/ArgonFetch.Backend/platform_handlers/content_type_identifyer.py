from enums.audio_content_type import ContentType
from enums.platform import Platform
import requests

from urllib.parse import urlparse
from urllib.parse import parse_qs

async def identify(query_url: str, platform: Platform) -> ContentType:
    if platform is Platform.YOUTUBE:
        parse_result = urlparse(query_url)
        query_params = parse_qs(parse_result.query)
        result = query_params.get("list", [None])[0]

        if result:
            if result.startswith('RD'):
                return ContentType.RADIO
            else:
                return ContentType.PLAYLIST
        else:
            return ContentType.SINGLE_SONG
    
    elif platform is Platform.SOUND_CLOUD:
        parse_result = urlparse(query_url)
        path = parse_result.path
        path_segments = path.strip("/").split("/")

        if "sets" in path_segments:
            return ContentType.PLAYLIST
        else:
            return ContentType.SINGLE_SONG
    
    elif platform is Platform.SPOTIFY:
        parse_result = urlparse(query_url)
        path = parse_result.path
        path_segments = path.strip("/").split("/")

        if "playlist" in path_segments:
            return ContentType.PLAYLIST
        elif "album" in path_segments:
            return ContentType.ALBUM
        elif "track" in path_segments:
            return ContentType.SINGLE_SONG
        else:
            return ContentType.NOT_SUPPORTED

    elif platform is Platform.NO_URL:
        return ContentType.QUERY
    
    elif platform is Platform.ANYTHING_ELSE:
        response = requests.get(query_url)
        contentType = response.headers['content-type']

        if "audio" in contentType or "video" in contentType:
            return ContentType.SINGLE_SONG
        else:
            return ContentType.YT_DLP
    
    elif platform is Platform.TIK_TOK:
        return ContentType.SINGLE_SONG

    else:
        return ContentType.NOT_SUPPORTED