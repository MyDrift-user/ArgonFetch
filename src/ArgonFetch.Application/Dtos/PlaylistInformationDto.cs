namespace ArgonFetch.Application.Dtos
{
    public class PlaylistInformationDto
    {
        public required string Title { get; set; }
        public required string Author { get; set; }
        public required string ImageUrl { get; set; }
        public required string RequestedUrl { get; set; }
        public required List<MediaInformationDto> MediaItems { get; set; }
    }
}
