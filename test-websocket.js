const WebSocket = require('ws');

console.log('Testing WebSocket connection...');

const ws = new WebSocket('ws://localhost:3000/ws/progress?batchId=test-123');

ws.on('open', function open() {
  console.log('✅ WebSocket connected successfully!');
});

ws.on('message', function message(data) {
  console.log('📨 Received:', data.toString());
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
});

ws.on('close', function close() {
  console.log('WebSocket closed');
  process.exit(0);
});

// Close after 3 seconds
setTimeout(() => {
  console.log('Closing connection...');
  ws.close();
}, 3000);
