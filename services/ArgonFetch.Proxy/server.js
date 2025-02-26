const cors_proxy = require('cors-anywhere');

const host = '0.0.0.0';
const port = 4442;

cors_proxy.createServer({
  originWhitelist: [],
  requireHeader: ['origin', 'x-requested-with'],
  removeHeaders: []
}).listen(port, host, () => {
  console.log(`CORS Anywhere is running on http://${host}:${port}`);
});
