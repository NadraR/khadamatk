import apiService from './ApiService';

class ChatService {
  constructor() {
    this.baseEndpoint = '/api/chat';
    this.wsConnections = new Map(); // Store WebSocket connections by order ID
  }

  // Get all conversations for the current user
  async getUserConversations() {
    try {
      // Check if user is authenticated
      const accessToken = localStorage.getItem('access');
      if (!accessToken) {
        return {
          success: false,
          error: 'User not authenticated',
          data: []
        };
      }

      const response = await apiService.get(`${this.baseEndpoint}/conversations/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication failed',
          data: []
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch conversations',
        data: []
      };
    }
  }

  // Get unread message count for the current user
  async getUnreadMessageCount() {
    try {
      // Check if user is authenticated
      const accessToken = localStorage.getItem('access');
      if (!accessToken) {
        return {
          success: false,
          error: 'User not authenticated',
          data: { unread_count: 0, has_unread: false }
        };
      }

      const response = await apiService.get(`${this.baseEndpoint}/messages/unread-count/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication failed',
          data: { unread_count: 0, has_unread: false }
        };
      }
      
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
      // Check if user is authenticated
      const accessToken = localStorage.getItem('access');
      if (!accessToken) {
        return {
          success: false,
          error: 'User not authenticated',
          data: { recent_messages: [], count: 0 }
        };
      }

      const response = await apiService.get(`${this.baseEndpoint}/messages/recent/?limit=${limit}`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching recent messages:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication failed',
          data: { recent_messages: [], count: 0 }
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch recent messages',
        data: { recent_messages: [], count: 0 }
      };
    }
  }

  // Mark all messages as read for the current user
  async markAllMessagesAsRead() {
    try {
      const response = await apiService.post(`${this.baseEndpoint}/messages/mark-all-read/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to mark all messages as read'
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

  // Get user orders (fallback for conversations)
  async getUserOrders() {
    try {
      // Check if user is authenticated
      const accessToken = localStorage.getItem('access');
      if (!accessToken) {
        return {
          success: false,
          error: 'User not authenticated',
          data: []
        };
      }

      const response = await apiService.get('/api/orders/');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication failed',
          data: []
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch orders',
        data: []
      };
    }
  }

  // Get messages for a specific order/conversation
  async getMessages(orderId) {
    try {
      // Check if user is authenticated
      const accessToken = localStorage.getItem('access');
      if (!accessToken) {
        return {
          success: false,
          error: 'User not authenticated',
          data: []
        };
      }

      const response = await apiService.get(`${this.baseEndpoint}/orders/${orderId}/messages/`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication failed',
          data: []
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Failed to fetch messages',
        data: []
      };
    }
  }

  // Send a message
  async sendMessage(orderId, messageData) {
    try {
      const accessToken = localStorage.getItem('access');
      if (!accessToken) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const response = await apiService.post(`${this.baseEndpoint}/orders/${orderId}/messages/`, messageData);
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

  // Connect to WebSocket (placeholder implementation)
  connectWebSocket(orderId, onMessageReceived = null) {
    try {
      console.log(`[DEBUG] Connecting WebSocket for order ${orderId}`);
      
      // For now, return a mock connection
      // In a real implementation, you would create a WebSocket connection here
      const mockConnection = {
        close: () => {
          console.log(`[DEBUG] Closing WebSocket for order ${orderId}`);
        },
        send: (message) => {
          console.log(`[DEBUG] Sending message via WebSocket:`, message);
        }
      };

      // Store the connection
      this.wsConnections.set(orderId, mockConnection);
      
      return mockConnection;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      return null;
    }
  }

  // Disconnect WebSocket
  disconnectWebSocket(orderId) {
    try {
      const connection = this.wsConnections.get(orderId);
      if (connection && connection.close) {
        connection.close();
        this.wsConnections.delete(orderId);
        console.log(`[DEBUG] Disconnected WebSocket for order ${orderId}`);
      }
    } catch (error) {
      console.error('Error disconnecting WebSocket:', error);
    }
  }
}

// Create and export a single instance
const chatService = new ChatService();
export default chatService;
export { ChatService };