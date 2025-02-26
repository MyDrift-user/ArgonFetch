using ArgonFetch.Application.Enums;

namespace ArgonFetch.Application.Services
{
    public class MediaContentIdentifierService
    {
        public async Task<ContentType> IdentifyContent(string queryUrl, Platform platform)
        {
            switch (platform)
            {
                case Platform.YOUTUBE:
                    var uri = new Uri(queryUrl);
                    var url_parms = System.Web.HttpUtility.ParseQueryString(uri.Query);
                    string listId = url_parms.Get("list"); // search list in 

                    if (!string.IsNullOrEmpty(listId))
                    {
                        return listId.StartsWith("RD") ? ContentType.RADIO : ContentType.PLAYLIST;
                    }
                    return ContentType.SINGLE_SONG;

                case Platform.SOUND_CLOUD:
                    var soundCloudPathSegments = new Uri(queryUrl).AbsolutePath.Trim('/').Split('/');
                    return soundCloudPathSegments.Contains("sets") ? ContentType.PLAYLIST : ContentType.SINGLE_SONG;

                case Platform.SPOTIFY:
                    var spotifyPathSegments = new Uri(queryUrl).AbsolutePath.Trim('/').Split('/');
                    if (spotifyPathSegments.Contains("playlist")) return ContentType.PLAYLIST;
                    if (spotifyPathSegments.Contains("album")) return ContentType.ALBUM;
                    if (spotifyPathSegments.Contains("track")) return ContentType.SINGLE_SONG;
                    return ContentType.NOT_SUPPORTED;

                // case Platform.ANYTHING_ELSE:
                //
                //    var response = await _httpClient.GetAsync(queryUrl);
                //    response.EnsureSuccessStatusCode();

                //    var contentType = response.Content.Headers.ContentType?.MediaType;

                //    return (contentType != null && (contentType.Contains("audio") || contentType.Contains("video")))
                //        ? ContentType.SINGLE_SONG
                //        : ContentType.YT_DLP;
                //}

                // TODO

                case Platform.NO_URL:
                    return ContentType.QUERY;

                case Platform.TIK_TOK:
                    return ContentType.SINGLE_SONG;

                default:
                    return ContentType.NOT_SUPPORTED;
            }
        }
    }
}
