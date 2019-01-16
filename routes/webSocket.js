var WebSocketServer = require('ws').Server;
function webSocket(server) {
    var ws = new WebSocketServer({
        server: server
    });

    ws.on('connection', function(wsConnect) {
        wsConnect.on('message', function(message) {
            console.log('connection established');
            wsConnect.send(message)
        });
    });
}

module.exports = webSocket;