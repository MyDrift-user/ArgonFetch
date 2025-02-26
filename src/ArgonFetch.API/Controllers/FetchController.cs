using ArgonFetch.Application.Dtos;
using ArgonFetch.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ArgonFetch.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FetchController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FetchController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("GetMedia", Name = "GetMedia")]
        public async Task<ActionResult<MediaInformationDto>> GetMedia(string url)
        {
            return await _mediator.Send(new GetMediaQuery(url));
        }

        [HttpGet("GetPlaylist", Name = "GetPlaylist")]
        public async Task<ActionResult<PlaylistInformationDto>> GetResource(string url)
        {
            return await _mediator.Send(new GetPlaylistQuery(url));
        }
    }
}
