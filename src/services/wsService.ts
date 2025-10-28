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
