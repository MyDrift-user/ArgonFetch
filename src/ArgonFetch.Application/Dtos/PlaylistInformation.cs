namespace ArgonFetch.Application.Dtos
{
    public class PlaylistInformation
    {
        public required string Title { get; set; }
        public required string Author { get; set; }
        public required string ImageUrl { get; set; }
        public required string InputUrl { get; set; }
        public required List<MediaInformationDto> MediaItems { get; set; }
    }
}
