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
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize WebSocket server
   */
  initialize(server: HTTPServer): void {
    if (this.wss) {
      console.log('WebSocket server already initialized');
      return;
    }

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
   * Ensure WebSocket is initialized (lazy initialization)
   */
  private ensureInitialized(): void {
    if (this.wss) return;

    // Try to get WebSocket server from global
    const wss = (global as any).wss as WebSocketServer | undefined;
    if (wss) {
      this.wss = wss;
      console.log('✅ WebSocket server connected to existing instance');
    } else {
      console.warn('WebSocket server not available');
    }
  }

  /**
   * Send progress update to all clients watching a batch
   */
  sendProgressUpdate(batchId: string, update: ProgressUpdate): void {
    this.ensureInitialized();
    
    const message = {
      type: 'progress',
      ...update,
      timestamp: update.timestamp.toISOString(),
    };

    // Use global broadcast function from server.js
    const broadcast = (global as any).wsBroadcast;
    if (broadcast) {
      broadcast(batchId, message);
    } else {
      console.warn('WebSocket broadcast function not available');
    }
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
