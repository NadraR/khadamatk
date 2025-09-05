import apiService from './ApiService';

class ChatService {
  constructor() {
    this.baseEndpoint = '/api/chat';
    this.wsConnections = new Map(); // Store WebSocket connections by order ID
  }

  // Get all conversations for the current user
  async getUserConversations() {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/conversations/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch conversations'
      };
    }
  }

  // Get unread message count for the current user
  async getUnreadMessageCount() {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/messages/unread-count/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch unread count',
        data: { unread_count: 0, has_unread: false }
      };
    }
  }

  // Get recent messages preview for the current user
  async getRecentMessages(limit = 5) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/messages/recent/?limit=${limit}`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch recent messages',
        data: { recent_messages: [], count: 0 }
      };
    }
  }

  // Get conversation details for a specific order
  async getConversation(orderId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/orders/${orderId}/conversation/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch conversation'
      };
    }
  }

  // Get messages for a specific order
  async getMessages(orderId) {
    try {
      const response = await apiService.get(`${this.baseEndpoint}/orders/${orderId}/messages/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch messages'
      };
    }
  }

  // Send a message to a specific order conversation
  async sendMessage(orderId, message) {
    try {
      const response = await apiService.post(`${this.baseEndpoint}/orders/${orderId}/messages/`, {
        message: message
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to send message'
      };
    }
  }

  // Format timestamp for display
  formatMessageTime(timestamp) {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'الآن'; // Now
    } else if (diffInMinutes < 60) {
      return `منذ ${diffInMinutes} دقيقة`; // X minutes ago
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `منذ ${hours} ساعة`; // X hours ago
    } else {
      return messageDate.toLocaleDateString('ar-SA', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  // Format message time for English
  formatMessageTimeEn(timestamp) {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // Less than 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return messageDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  // Get formatted message time based on language
  getFormattedMessageTime(timestamp, language = 'ar') {
    return language === 'ar' 
      ? this.formatMessageTime(timestamp) 
      : this.formatMessageTimeEn(timestamp);
  }

  // Check if user has permission to access a conversation
  async checkConversationAccess(orderId) {
    try {
      const result = await this.getConversation(orderId);
      return result.success;
    } catch (error) {
      return false;
    }
  }

  // Get conversation summary (for notifications/previews)
  async getConversationSummary(orderId) {
    try {
      const conversationResult = await this.getConversation(orderId);
      if (!conversationResult.success) {
        return null;
      }

      const messagesResult = await this.getMessages(orderId);
      if (!messagesResult.success) {
        return null;
      }

      const messages = messagesResult.data;
      const lastMessage = messages[messages.length - 1];

      return {
        orderId,
        conversationId: conversationResult.data.id,
        messageCount: messages.length,
        lastMessage: lastMessage ? {
          text: lastMessage.message,
          sender: lastMessage.sender_full_name,
          timestamp: lastMessage.timestamp
        } : null
      };
    } catch (error) {
      console.error('Error getting conversation summary:', error);
      return null;
    }
  }

  // ===== WebSocket Real-time Chat Functionality =====

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

  // Get user's orders (for WebSocket integration)
  async getUserOrders() {
    try {
      const response = await apiService.get('/api/orders/');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch orders'
      };
    }
  }

  // Enhanced send message that tries WebSocket first, falls back to HTTP
  async sendMessageEnhanced(orderId, message) {
    // Try WebSocket first for real-time delivery
    const wsSuccess = this.sendWebSocketMessage(orderId, message);
    
    if (wsSuccess) {
      console.log('Message sent via WebSocket');
      return {
        success: true,
        method: 'websocket',
        data: { message }
      };
    } else {
      // Fallback to HTTP API
      console.log('WebSocket not available, falling back to HTTP API');
      return await this.sendMessage(orderId, message);
    }
  }
}

// Create and export a single instance
const chatService = new ChatService();
export default chatService;
export { ChatService };
