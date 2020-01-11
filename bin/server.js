const app = require('../app');
const http = require('http');
const debug = require('debug')

const port = process.env.PORT || 8080;

app.set('port', port);
let server = http.createServer(app);
server.listen(port);
server.on('listening', onListening);

function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}