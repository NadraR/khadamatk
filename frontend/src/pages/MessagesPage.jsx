import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { FaPaperPlane, FaSpinner } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import chatService from "../services/chatService";
import "./MessagesPage.css";

const MessagesPage = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await chatService.getUserOrders();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Handle different response formats from the API
      let orders = result.data || [];
      
      // If the response has a results property (paginated), use that
      if (result.data && result.data.results) {
        orders = result.data.results;
      } else if (result.data && !Array.isArray(result.data)) {
        // If data is an object but not an array, try to extract array from common properties
        orders = result.data.data || result.data.orders || [];
      }
      
      // Ensure orders is an array
      if (!Array.isArray(orders)) {
        console.warn('Orders data is not an array:', orders);
        orders = [];
      }
      
      // Filter out cancelled orders and transform into conversation format
      const conversationsData = orders
        .filter(order => order.status !== 'cancelled') // Don't show cancelled orders
        .filter(order => ['accepted', 'completed', 'in_progress'].includes(order.status)) // Only show active orders
        .map(order => {
          // Determine the other party's name based on current user role
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          let otherPartyName = 'Unknown User';
          
          if (currentUser.role === 'worker') {
            // Worker sees client name
            otherPartyName = order.customer_first_name && order.customer_last_name 
              ? `${order.customer_first_name} ${order.customer_last_name}`
              : order.customer_name || 'عميل غير محدد';
          } else {
            // Client sees worker name
            otherPartyName = order.worker_name || 'عامل غير محدد';
          }
          
          return {
            id: order.id,
            orderId: order.id,
            name: otherPartyName,
            lastMessage: order.status || 'No messages yet',
            unread: 0, // TODO: Implement unread count
            status: order.status,
            service: order.service_name || order.service?.title || 'Unknown Service'
          };
        });
      
      setConversations(conversationsData);
      
      // Auto-select conversation if orderId is provided in location state
      const targetOrderId = location.state?.orderId;
      if (targetOrderId) {
        let targetConversation = conversationsData.find(conv => conv.orderId === parseInt(targetOrderId));
        
        // If conversation doesn't exist yet, create a placeholder
        if (!targetConversation && location.state?.clientName) {
          targetConversation = {
            id: targetOrderId,
            orderId: targetOrderId,
            name: location.state.clientName,
            lastMessage: 'بدء محادثة جديدة',
            unread: 0,
            status: 'accepted',
            service: location.state.serviceName || 'خدمة غير محددة'
          };
          setConversations(prev => [targetConversation, ...prev]);
        }
        
        if (targetConversation) {
          setActiveConversation(targetConversation);
        }
      }
      
      if (conversationsData.length === 0 && !location.state?.orderId) {
        toast.info(i18n.language === 'ar' ? 'لا توجد محادثات متاحة' : 'No conversations available');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      const errorMessage = i18n.language === 'ar' ? 'فشل في تحميل المحادثات' : 'Failed to load conversations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [i18n.language, location.state]);

  const loadMessages = useCallback(async (orderId) => {
    try {
      setError(null);
      const result = await chatService.getMessages(orderId);
      
      if (!result.success) {
        console.warn('No messages found for order:', orderId);
        setMessages([]);
        return;
      }
      
      const messagesData = result.data || [];
      
      // Transform messages to frontend format
      const transformedMessages = messagesData.map(msg => ({
        id: msg.id,
        sender: msg.sender_username === getCurrentUsername() ? "me" : "them",
        text: msg.message,
        time: new Date(msg.timestamp).toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit" 
        }),
        username: msg.sender_username,
        timestamp: msg.timestamp
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      // Don't show error toast for empty conversations
      setMessages([]);
    }
  }, [i18n.language]);

  const connectWebSocket = useCallback((orderId) => {
    wsRef.current = chatService.connectWebSocket(
      orderId,
      (data) => {
        // Handle incoming message
        const newMsg = {
          id: Date.now(), // Temporary ID
          sender: data.username === getCurrentUsername() ? "me" : "them",
          text: data.message,
          time: new Date(data.timestamp).toLocaleTimeString([], { 
            hour: "2-digit", 
            minute: "2-digit" 
          }),
          username: data.username,
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, newMsg]);
        
        // Show notification for new messages from others
        if (data.username !== getCurrentUsername()) {
          toast.info(`${data.username}: ${data.message}`, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
        const errorMessage = i18n.language === 'ar' ? 'خطأ في الاتصال المباشر' : 'Real-time connection error';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    );
  }, [i18n.language]);

  const getCurrentUsername = () => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        return JSON.parse(userData).username;
      } catch {
        return 'Unknown';
      }
    }
    return 'Unknown';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load user's orders/conversations on component mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.orderId);
      connectWebSocket(activeConversation.orderId);
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [activeConversation, loadMessages, connectWebSocket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !activeConversation || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    try {
      // Try WebSocket first
      const wsSent = chatService.sendWebSocketMessage(activeConversation.orderId, messageText);
      
      if (!wsSent) {
        // Fallback to API
        await chatService.sendMessage(activeConversation.orderId, messageText);
        
        // Add message to local state
        const newMsg = {
          id: Date.now(),
          sender: "me",
          text: messageText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          username: getCurrentUsername(),
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, newMsg]);
      }
      
      // Show success toast
      toast.success(i18n.language === 'ar' ? 'تم إرسال الرسالة' : 'Message sent successfully', {
        position: "bottom-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = i18n.language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message';
      setError(errorMessage);
      toast.error(errorMessage);
      // Restore message to input
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="messages-page">
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>{i18n.language === 'ar' ? 'جارٍ تحميل المحادثات...' : 'Loading conversations...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      {/* Sidebar Conversations */}
      <div className="conversations-list">
        <h3>{i18n.language === 'ar' ? 'الرسائل' : 'Messages'}</h3>
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => { setError(null); loadConversations(); }}>
              {i18n.language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}
        {conversations.length === 0 ? (
          <div className="no-conversations">
            {i18n.language === 'ar' ? 'لا توجد محادثات' : 'No conversations found'}
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation ${activeConversation?.id === conv.id ? "active" : ""}`}
              onClick={() => setActiveConversation(conv)}
            >
              <div className="conv-name">{conv.name}</div>
              <div className="conv-service">{conv.service}</div>
              <div className="conv-last">{conv.lastMessage}</div>
              {conv.unread > 0 && <span className="conv-unread">{conv.unread}</span>}
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div className="chat-window">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-title">{activeConversation.name}</div>
              <div className="chat-subtitle">{activeConversation.service}</div>
            </div>
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  {i18n.language === 'ar' ? 'لا توجد رسائل بعد' : 'No messages yet'}
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`chat-message ${msg.sender === "me" ? "me" : "them"}`}>
                    <div className="msg-text">{msg.text}</div>
                    <div className="msg-meta">
                      <span className="msg-time">{msg.time}</span>
                      {msg.sender === "them" && (
                        <span className="msg-username">{msg.username}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={i18n.language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                disabled={sending}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={sending || !newMessage.trim()}
                className={sending ? 'sending' : ''}
              >
                {sending ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat">
            {i18n.language === 'ar' ? 'اختر محادثة لعرض الرسائل' : 'Select a conversation to view messages'}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
