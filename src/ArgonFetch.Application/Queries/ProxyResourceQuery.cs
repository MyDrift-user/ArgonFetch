using MediatR;

namespace ArgonFetch.Application.Queries
{
    public class ProxyResourceQuery : IRequest<string>
    {
        public ProxyResourceQuery(string url)
        {
            this.url = url;
        }
        public string url { get; set; }
    }

    public class ProxyResourceQueryHandler : IRequestHandler<ProxyResourceQuery, string>
    {
        public async Task<string> Handle(ProxyResourceQuery request, CancellationToken cancellationToken)
        {
            return string.Empty;
        }
    }
}
