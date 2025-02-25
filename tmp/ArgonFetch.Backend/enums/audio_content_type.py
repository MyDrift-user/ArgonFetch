from enum import Enum

class ContentType(Enum):
    NOT_SUPPORTED = 1
    QUERY = 2
    SINGLE_SONG = 3
    PLAYLIST = 4
    RADIO = 5
    ALBUM = 6
    YT_DLP = 7

    def is_song(content_type):
        return content_type in {ContentType.SINGLE_SONG, ContentType.YT_DLP, ContentType.QUERY}