using ArgonFetch.Application.Dtos;
using MediatR;

namespace ArgonFetch.Application.Queries
{
    public class GetPlaylistQuery : IRequest<PlaylistInformationDto>
    {
        public GetPlaylistQuery(string query)
        {
            Query = query;
        }

        public string Query { get; set; }
    }

    public class GetPlaylistQueryHandler : IRequestHandler<GetPlaylistQuery, PlaylistInformationDto>
    {
        public async Task<PlaylistInformationDto> Handle(GetPlaylistQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
