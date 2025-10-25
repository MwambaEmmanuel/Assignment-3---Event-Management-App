import WebSocket from 'ws'

let wss: WebSocket.Server | null = null

export function initWebsocket(server: any) {
  wss = new WebSocket.Server({ server })
  wss.on('connection', (socket) => {
    console.log('WS client connected')
    socket.on('close', () => console.log('WS client disconnected'))
  })
}

export function broadcast(type: string, payload: any) {
  if (!wss) return
  const message = JSON.stringify({ type, payload })
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(message)
  })
}
import { ServerWebSocket } from 'bun';

// Store all connected WebSocket clients
const clients = new Set<ServerWebSocket>();

/**
 * Add a new WebSocket client
 */
export const addClient = (ws: ServerWebSocket) => {
  clients.add(ws);
  console.log(`🔌 WebSocket client connected. Total clients: ${clients.size}`);
};

/**
 * Remove a WebSocket client
 */
export const removeClient = (ws: ServerWebSocket) => {
  clients.delete(ws);
  console.log(`🔌 WebSocket client disconnected. Total clients: ${clients.size}`);
};

/**
 * Broadcast an event to all connected clients
 */
export const broadcastEvent = (type: string, data: any) => {
  const message = JSON.stringify({
    type,
    data,
    timestamp: new Date().toISOString(),
  });

  console.log(`📡 Broadcasting ${type} to ${clients.size} clients`);

  clients.forEach((client) => {
    try {
      client.send(message);
    } catch (error) {
      console.error('Error sending message to client:', error);
      // Remove client if sending fails
      clients.delete(client);
    }
  });
};

/**
 * Send a message to a specific client
 */
export const sendToClient = (ws: ServerWebSocket, type: string, data: any) => {
  try {
    const message = JSON.stringify({
      type,
      data,
      timestamp: new Date().toISOString(),
    });
    ws.send(message);
  } catch (error) {
    console.error('Error sending message to client:', error);
  }
};

/**
 * Get the number of connected clients
 */
export const getClientCount = () => {
  return clients.size;
};
