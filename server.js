const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize WebSocket server BEFORE starting HTTP server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/progress' });
  const connections = new Map(); // batchId -> Set of WebSocket connections
  
  // Store broadcast function globally for wsProgressManager to use
  global.wsBroadcast = (batchId, message) => {
    const batchConnections = connections.get(batchId);
    if (batchConnections && batchConnections.size > 0) {
      const messageStr = JSON.stringify(message);
      console.log(`Broadcasting to ${batchConnections.size} client(s) for batch ${batchId}:`, message.type, message.eventType);
      batchConnections.forEach((ws) => {
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.send(messageStr);
        }
      });
    } else {
      console.log(`No active connections for batch ${batchId}`);
    }
  };
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');
    
    // Extract batchId from query params
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const batchId = url.searchParams.get('batchId');
    
    if (!batchId) {
      ws.close(1008, 'Missing batchId parameter');
      return;
    }
    
    // Add connection to batch group
    if (!connections.has(batchId)) {
      connections.set(batchId, new Set());
    }
    connections.get(batchId).add(ws);
    console.log(`Batch ${batchId}: ${connections.get(batchId).size} connection(s)`);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      batchId,
      timestamp: new Date().toISOString(),
    }));
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      const batchConnections = connections.get(batchId);
      if (batchConnections) {
        batchConnections.delete(ws);
        if (batchConnections.size === 0) {
          connections.delete(batchId);
        }
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  // Start the server
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`✅ WebSocket server ready on ws://${hostname}:${port}/ws/progress`);
    
    // Store server, wss, and connections globally so wsProgressManager can access them
    global.httpServer = httpServer;
    global.wss = wss;
    global.wsConnections = connections;
  });
});

