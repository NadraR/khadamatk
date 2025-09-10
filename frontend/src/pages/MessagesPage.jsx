import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FaPaperPlane, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import chatService from "../services/chatService";
import "./MessagesPage.css";

const MessagesPage = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
      
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('[DEBUG] MessagesPage: Loading conversations for user:', currentUser);
      
      // Get target order ID early
      const targetOrderId = location.state?.orderId || searchParams.get('orderId');
      console.log('[DEBUG] Target order ID:', targetOrderId);
      
      // Use the proper API endpoint for conversations
      const result = await chatService.getUserConversations();
      
      if (!result.success) {
        console.warn('No conversations found, trying orders fallback');
        console.log('[DEBUG] Conversations error:', result.error);
        
        // Fallback to orders if conversations API fails
        const ordersResult = await chatService.getUserOrders();
        console.log('[DEBUG] Orders fallback result:', ordersResult);
        
        if (!ordersResult.success) {
          console.error('[DEBUG] Orders fallback failed:', ordersResult.error);
          setError(`فشل في تحميل المحادثات: ${ordersResult.error}`);
          setLoading(false);
          return;
        }
        
        // Handle different response formats from the API
        let orders = ordersResult.data || [];
        
        // If the response has a results property (paginated), use that
        if (ordersResult.data && ordersResult.data.results) {
          orders = ordersResult.data.results;
        } else if (ordersResult.data && !Array.isArray(ordersResult.data)) {
          // If data is an object but not an array, try to extract array from common properties
          orders = ordersResult.data.data || ordersResult.data.orders || [];
        }
        
        // Ensure orders is an array
        if (!Array.isArray(orders)) {
          console.warn('Orders data is not an array:', orders);
          orders = [];
        }
        
        // Filter orders based on user role
        let filteredOrders = orders;
        if (currentUser.role === 'worker') {
          // For workers, show orders where they are the worker or service provider
          filteredOrders = orders.filter(order => 
            order.worker_id === currentUser.id || 
            order.service?.provider?.id === currentUser.id ||
            order.service?.user_id === currentUser.id ||
            order.worker === currentUser.id
          );
        } else {
          // For clients, show orders where they are the customer
          filteredOrders = orders.filter(order => 
            order.customer === currentUser.id || 
            order.customer_id === currentUser.id
          );
        }
        
        // Filter out cancelled orders and transform into conversation format
        const conversationsData = filteredOrders
          .filter(order => order.status !== 'cancelled') // Don't show cancelled orders
          .filter(order => ['accepted', 'completed', 'in_progress', 'pending'].includes(order.status)) // Show all active orders
          .map(order => {
            // Determine the other party's name based on current user role
            let otherPartyName = 'Unknown User';
            
            if (currentUser.role === 'worker') {
              // Worker sees client name
              otherPartyName = order.customer_first_name && order.customer_last_name 
                ? `${order.customer_first_name} ${order.customer_last_name}`
                : order.customer_name || order.customer_username || 'عميل غير محدد';
            } else {
              // Client sees worker name
              otherPartyName = order.worker_name || order.worker_username || 'عامل غير محدد';
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
        
        // Auto-select conversation if orderId is provided in location state or URL params
        if (targetOrderId) {
          let targetConversation = conversationsData.find(conv => conv.orderId === parseInt(targetOrderId));
          
          // If conversation doesn't exist yet, create a placeholder
          if (!targetConversation && (location.state?.clientName || location.state?.workerName)) {
            const otherPartyName = location.state?.clientName || location.state?.workerName || 'Unknown User';
            targetConversation = {
              id: targetOrderId,
              orderId: targetOrderId,
              name: otherPartyName,
              lastMessage: 'بدء محادثة جديدة',
              unread: 0,
              status: 'accepted',
              service: location.state?.serviceName || 'خدمة غير محددة'
            };
            setConversations(prev => [targetConversation, ...prev]);
          }
          
          if (targetConversation) {
            setActiveConversation(targetConversation);
          }
        }
      } else {
        // Use conversations API response and normalize field names
        const conversationsData = (result.data || []).map(conv => ({
          ...conv,
          orderId: conv.order_id || conv.orderId, // Normalize order_id to orderId
          name: conv.other_participant?.name || conv.other_participant?.username || 'Unknown User',
          lastMessage: conv.last_message?.message || 'No messages yet',
          unread: conv.message_count || 0
        }));
        
        console.log('[DEBUG] MessagesPage: Loaded conversations:', conversationsData);
        console.log('[DEBUG] MessagesPage: First conversation details:', conversationsData[0]);
        console.log('[DEBUG] MessagesPage: Looking for target order ID:', targetOrderId);
        setConversations(conversationsData);
        
        // Debug: Check if target order exists in conversations
        if (targetOrderId) {
          const targetExists = conversationsData.find(conv => conv.orderId === parseInt(targetOrderId));
          console.log('[DEBUG] MessagesPage: Target order exists in conversations:', !!targetExists, targetExists);
        }
        
        // Auto-select conversation if orderId is provided in location state or URL params
        if (targetOrderId) {
          let targetConversation = conversationsData.find(conv => conv.orderId === parseInt(targetOrderId));
          
          // If conversation doesn't exist yet, create a placeholder
          if (!targetConversation && (location.state?.clientName || location.state?.workerName)) {
            const otherPartyName = location.state?.clientName || location.state?.workerName || 'Unknown User';
            targetConversation = {
              id: targetOrderId,
              orderId: targetOrderId,
              name: otherPartyName,
              lastMessage: 'بدء محادثة جديدة',
              unread: 0,
              status: 'accepted',
              service: location.state?.serviceName || 'خدمة غير محددة'
            };
            setConversations(prev => [targetConversation, ...prev]);
          }
          
          if (targetConversation) {
            setActiveConversation(targetConversation);
          }
        }
      }
      
      // Check if no conversations found
      const totalConversations = conversations.length;
      if (totalConversations === 0 && !targetOrderId) {
        toast.info(i18n.language === 'ar' ? 'لا توجد محادثات متاحة' : 'No conversations available');
      }
    } catch (error) {
      console.error('[DEBUG] Error loading conversations:', error);
      console.error('[DEBUG] Error details:', error.message, error.stack);
      
      // Handle different types of errors
      const errorMessage = i18n.language === 'ar' ? 
        `فشل في تحميل المحادثات: ${error.message || 'خطأ غير معروف'}` : 
        `Failed to load conversations: ${error.message || 'Unknown error'}`;
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [i18n.language, location.state, searchParams]);

  const loadMessages = useCallback(async (orderId) => {
    try {
      console.log('[DEBUG] MessagesPage: Loading messages for orderId:', orderId);
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
      console.log('[DEBUG] MessagesPage: Sending message to order:', activeConversation?.orderId);
      console.log('[DEBUG] MessagesPage: Active conversation:', activeConversation);
      
      if (!activeConversation?.orderId) {
        console.error('[DEBUG] MessagesPage: No orderId found in activeConversation');
        toast.error('خطأ: لا يمكن إرسال الرسالة - معرف الطلب مفقود');
        return;
      }
      
      // Try WebSocket first
      const wsSent = chatService.sendWebSocketMessage(activeConversation.orderId, messageText);
      
      if (!wsSent) {
        // Fallback to API
        const messageData = {
          message: messageText,
          sender: getCurrentUsername()
        };
        await chatService.sendMessage(activeConversation.orderId, messageData);
        
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

  const handleBackToDashboard = () => {
    // Check user role and navigate accordingly
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.role === 'worker') {
      navigate('/homeProvider');
    } else {
      navigate('/homeClient');
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
        <div className="conversations-header">
          <button className="back-button" onClick={handleBackToDashboard}>
            <FaArrowLeft />
            {i18n.language === 'ar' ? 'رجوع' : 'Back'}
          </button>
          <h3>{i18n.language === 'ar' ? 'الرسائل' : 'Messages'}</h3>
        </div>
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
              onClick={() => {
                console.log('[DEBUG] MessagesPage: Selecting conversation:', conv);
                setActiveConversation(conv);
              }}
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
