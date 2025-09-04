import { ApiService } from './ApiService';

class ChatService {
  constructor() {
    this.baseEndpoint = '/api/chat';
    this.wsConnections = new Map(); // Store WebSocket connections by order ID
  }

  // Get user's orders with conversations
  async getUserOrders() {
    try {
      const response = await ApiService.get('/api/orders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Get conversation for a specific order
  async getConversation(orderId) {
    try {
      const response = await ApiService.get(`${this.baseEndpoint}/orders/${orderId}/conversation/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  // Get messages for a specific order
  async getMessages(orderId) {
    try {
      const response = await ApiService.get(`${this.baseEndpoint}/orders/${orderId}/messages/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a message via API (fallback)
  async sendMessage(orderId, message) {
    try {
      const response = await ApiService.post(`${this.baseEndpoint}/orders/${orderId}/messages/`, {
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // WebSocket connection for real-time chat
  connectWebSocket(orderId, onMessage, onError) {
    const token = localStorage.getItem('access');
    if (!token) {
      onError('No authentication token found');
      return null;
    }

    // Close existing connection if any
    if (this.wsConnections.has(orderId)) {
      this.wsConnections.get(orderId).close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat/${orderId}/`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for order ${orderId}`);
      // Send authentication token
      ws.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          onError(data.error);
        } else {
          onMessage(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        onError('Error parsing message');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      onError('WebSocket connection error');
    };

    ws.onclose = (event) => {
      console.log(`WebSocket closed for order ${orderId}:`, event.code, event.reason);
      this.wsConnections.delete(orderId);
    };

    this.wsConnections.set(orderId, ws);
    return ws;
  }

  // Send message via WebSocket
  sendWebSocketMessage(orderId, message) {
    const ws = this.wsConnections.get(orderId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        message: message
      }));
      return true;
    }
    return false;
  }

  // Disconnect WebSocket for specific order
  disconnectWebSocket(orderId) {
    const ws = this.wsConnections.get(orderId);
    if (ws) {
      ws.close();
      this.wsConnections.delete(orderId);
    }
  }

  // Disconnect all WebSocket connections
  disconnectAll() {
    this.wsConnections.forEach((ws, orderId) => {
      ws.close();
    });
    this.wsConnections.clear();
  }
}

export default new ChatService();
