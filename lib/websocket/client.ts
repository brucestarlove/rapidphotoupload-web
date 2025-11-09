import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";

/**
 * Convert WebSocket URL to HTTP/HTTPS URL for SockJS
 * SockJS requires HTTP/HTTPS URLs, not ws:// or wss://
 */
function normalizeWebSocketUrl(url: string): string {
  // Replace ws:// with http:// and wss:// with https://
  return url.replace(/^ws:\/\//, "http://").replace(/^wss:\/\//, "https://");
}

// Get WebSocket URL from environment variable and normalize it
const WS_URL = normalizeWebSocketUrl(
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws"
);

export interface WebSocketMessage {
  type: "ProgressUpdate" | "JobStatusUpdate";
  data: any;
}

export type MessageHandler = (message: WebSocketMessage) => void;

class WebSocketClient {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 5000; // Max 5 seconds
  private isConnecting = false;
  private isConnected = false;
  private messageHandlers: Set<MessageHandler> = new Set();

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.isConnecting = true;

      // Create SockJS connection
      const socket = new SockJS(WS_URL);
      
      // Create STOMP client over SockJS
      this.client = new Client({
        webSocketFactory: () => socket as any,
        reconnectDelay: 0, // We handle reconnection manually
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[STOMP]", str);
          }
        },
      });

      // Get auth token for connection headers
      const getAuthHeaders = () => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token");
          return token ? { Authorization: `Bearer ${token}` } : {};
        }
        return {};
      };

      // Handle successful connection
      this.client.onConnect = () => {
        this.isConnecting = false;
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        console.log("[WebSocket] Connected");
        resolve();
      };

      // Handle connection errors
      this.client.onStompError = (frame) => {
        console.error("[WebSocket] STOMP error:", frame);
        this.isConnecting = false;
        this.isConnected = false;
        reject(new Error(frame.headers["message"] || "WebSocket connection failed"));
      };

      // Handle disconnection
      this.client.onDisconnect = () => {
        console.log("[WebSocket] Disconnected");
        this.isConnected = false;
        this.subscriptions.clear();
        
        // Attempt reconnection if not manually disconnected
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect();
        }
      };

      // Connect with auth headers
      this.client.activate();
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[WebSocket] Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected && !this.isConnecting) {
        this.connect().catch((error) => {
          console.error("[WebSocket] Reconnection failed:", error);
        });
      }
    }, delay);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((sub) => sub.unsubscribe());
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
    }
  }

  /**
   * Subscribe to a job topic
   */
  subscribeToJob(jobId: string, handler: MessageHandler): () => void {
    if (!this.client || !this.isConnected) {
      console.warn("[WebSocket] Not connected, cannot subscribe");
      return () => {};
    }

    const topic = `/topic/job/${jobId}`;
    
    // Unsubscribe if already subscribed
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)?.unsubscribe();
    }

    // Add handler
    this.messageHandlers.add(handler);

    // Subscribe to topic
    const subscription = this.client.subscribe(topic, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        
        // Determine message type based on structure
        let type: "ProgressUpdate" | "JobStatusUpdate";
        if (data.photoId) {
          type = "ProgressUpdate";
        } else if (data.totalCount !== undefined) {
          type = "JobStatusUpdate";
        } else {
          console.warn("[WebSocket] Unknown message type:", data);
          return;
        }

        handler({ type, data });
      } catch (error) {
        console.error("[WebSocket] Failed to parse message:", error);
      }
    });

    this.subscriptions.set(topic, subscription);

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const webSocketClient = new WebSocketClient();

