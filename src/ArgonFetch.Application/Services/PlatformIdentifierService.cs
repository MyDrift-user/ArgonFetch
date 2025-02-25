using ArgonFetch.Application.Enums;

namespace ArgonFetch.Application.Services
{
    public class PlatformIdentifierService
    {
        public Platform IdentifyPlatform(string queryUrl)
        {
            if (string.IsNullOrWhiteSpace(queryUrl))
            {
                return Platform.NO_URL;
            }

            Uri uri;
            try
            {
                uri = new Uri(queryUrl);
            }
            catch (UriFormatException)
            {
                return Platform.NO_URL;
            }

            string hostname = uri.Host.ToLower();

            switch (hostname)
            {
                case string h when h.Contains("spotify"):
                    return Platform.SPOTIFY;
                case string h when h.Contains("tiktok"):
                    return Platform.TIK_TOK;
                case string h when h.Contains("youtube") || h.Contains("youtu"):
                    return Platform.YOUTUBE;
                case string h when h.Contains("soundcloud"):
                    return Platform.SOUND_CLOUD;
                default:
                    return Platform.ANYTHING_ELSE;
            }
        }
    }
}
