using ArgonFetch.Application.Enums;
using ArgonFetch.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ArgonFetch.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class IdentifyController : ControllerBase
    {
        private readonly IMediator _mediator;
        public IdentifyController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("GetMediaType", Name = "GetMediaType")]
        public async Task<ActionResult<MediaType>> GetMediaType(string query)
        {
            return await _mediator.Send(new GetMediaTypeQuery(query));
        }
    }
}
