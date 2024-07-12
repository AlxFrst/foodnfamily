const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'NEW_ORDER') {
            broadcast(JSON.stringify({
                type: 'NEW_ORDER',
                order: parsedMessage.order,
            }));
        } else if (parsedMessage.type === 'UPDATE_ORDER_STATUS') {
            broadcast(JSON.stringify({
                type: 'UPDATE_ORDER_STATUS',
                orderId: parsedMessage.orderId,
                newStatus: parsedMessage.newStatus,
            }));
        } else if (parsedMessage.type === 'UPDATE_STOCK') { // Ajout de la gestion des mises à jour de stock
            broadcast(JSON.stringify({
                type: 'UPDATE_STOCK',
                itemId: parsedMessage.itemId,
                newStock: parsedMessage.newStock,
            }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

console.log('WebSocket server is running on ws://localhost:8080');
