from dataclasses import dataclass
from typing import List
from models.music_information import MusicInformation

@dataclass
class PlaylistInformation:
    playlist_name: str
    author: str
    image_url: str
    playlist_url: str
    songs: List[MusicInformation]
