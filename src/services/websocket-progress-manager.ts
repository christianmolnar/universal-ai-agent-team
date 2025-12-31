/**
 * WebSocket Progress Manager
 * Manages WebSocket connections for real-time batch analysis progress updates
 */

import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { ProgressUpdate } from '@/src/types/batch-analysis';

export class WebSocketProgressManager {
  private wss: WebSocketServer | null = null;
  private connections: Map<string, Set<WebSocket>> = new Map(); // batchId -> Set of WebSocket connections

  /**
   * Initialize WebSocket server
   */
  initialize(server: HTTPServer): void {
    this.wss = new WebSocketServer({ server, path: '/ws/progress' });

    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log('WebSocket client connected');

      // Extract batchId from query params
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const batchId = url.searchParams.get('batchId');

      if (!batchId) {
        ws.close(1008, 'Missing batchId parameter');
        return;
      }

      // Add connection to batch group
      if (!this.connections.has(batchId)) {
        this.connections.set(batchId, new Set());
      }
      this.connections.get(batchId)!.add(ws);

      // Handle client disconnect
      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        const connections = this.connections.get(batchId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            this.connections.delete(batchId);
          }
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send initial connection confirmation
      this.sendToClient(ws, {
        type: 'connected',
        batchId,
        timestamp: new Date().toISOString(),
      });
    });

    console.log('WebSocket server initialized on /ws/progress');
  }

  /**
   * Send progress update to all clients watching a batch
   */
  sendProgressUpdate(batchId: string, update: ProgressUpdate): void {
    const message = {
      type: 'progress',
      ...update,
      timestamp: update.timestamp.toISOString(),
    };

    // Use global wsBroadcast function from server.js if available
    if (typeof global !== 'undefined' && (global as any).wsBroadcast) {
      (global as any).wsBroadcast(batchId, message);
      return;
    }

    // Fallback to local connections (for when wsProgressManager is initialized)
    const connections = this.connections.get(batchId);
    if (!connections || connections.size === 0) {
      console.log(`No WebSocket connections found for batch ${batchId}`);
      return;
    }

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendToClient(ws, message);
      }
    });
  }

  /**
   * Send message to a specific client
   */
  private sendToClient(ws: WebSocket, data: any): void {
    try {
      ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  /**
   * Get number of active connections for a batch
   */
  getConnectionCount(batchId: string): number {
    return this.connections.get(batchId)?.size || 0;
  }

  /**
   * Close all connections for a batch
   */
  closeConnectionsForBatch(batchId: string): void {
    const connections = this.connections.get(batchId);
    if (connections) {
      connections.forEach((ws) => {
        ws.close(1000, 'Batch completed');
      });
      this.connections.delete(batchId);
    }
  }

  /**
   * Close all connections and shut down server
   */
  shutdown(): void {
    if (this.wss) {
      this.wss.clients.forEach((ws) => {
        ws.close(1001, 'Server shutting down');
      });
      this.wss.close();
      this.connections.clear();
      console.log('WebSocket server shut down');
    }
  }
}

// Singleton instance
export const wsProgressManager = new WebSocketProgressManager();
