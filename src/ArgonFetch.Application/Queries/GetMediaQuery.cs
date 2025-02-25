using MediatR;

namespace ArgonFetch.Application.Queries
{
    public class GetMediaQuery : IRequest
    {
        public GetMediaQuery()
        {
        }
    }

    public class GetMediaQueryHandler : IRequestHandler<GetMediaQuery>
    {
        public Task Handle(GetMediaQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
