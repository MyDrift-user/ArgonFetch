using ArgonFetch.Application.Dtos;
using MediatR;

namespace ArgonFetch.Application.Queries
{
    public class GetMediaQuery : IRequest<MediaInformationDto>
    {
        public GetMediaQuery(string query)
        {
            Query = query;
        }

        public string Query { get; set; }
    }

    public class GetMediaQueryHandler : IRequestHandler<GetMediaQuery, MediaInformationDto>
    {
        public async Task<MediaInformationDto> Handle(GetMediaQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
