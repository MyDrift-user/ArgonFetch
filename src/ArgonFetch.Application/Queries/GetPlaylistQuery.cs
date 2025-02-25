using MediatR;

namespace ArgonFetch.Application.Queries
{
    public class GetPlaylistQuery : IRequest
    {
        public GetPlaylistQuery()
        {
        }
    }

    public class GetPlaylistQueryHandler : IRequestHandler<GetPlaylistQuery>
    {
        public GetPlaylistQueryHandler()
        {
        }

        public Task Handle(GetPlaylistQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
