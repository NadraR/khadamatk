import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const ChatApp = ({ currentUser }) => {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const location = useLocation();

  // جاي من زرار الـ Message
  useEffect(() => {
    if (location.state?.user) {
      setSelectedUser(location.state.user);
    }
  }, [location.state]);

  // fetch chat list
  const fetchConversations = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/chat/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });
    const data = await res.json();
    setConversations(data);
  };

  // fetch messages
  const fetchMessages = async (otherUser) => {
  if (!otherUser) return;
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/chat/?user1=${currentUser}&user2=${otherUser.id}`,
      { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
    );
    if (!res.ok) {
      console.error("Failed:", res.status);
      return setMessages([]);
    }
    const data = await res.json();
    if (Array.isArray(data)) {
      setMessages(data);
    } else {
      console.error("Unexpected response:", data);
      setMessages([]);
    }
  } catch (err) {
    console.error("Error fetching messages:", err);
    setMessages([]);
  }
};


  // send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    await fetch("http://127.0.0.1:8000/api/chat/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify({
        receiver: selectedUser.id,
        text,
      }),
    });
    setText("");
    fetchMessages(selectedUser);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    fetchMessages(selectedUser);
    const interval = setInterval(() => fetchMessages(selectedUser), 3000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  return (
    <div style={{ display: "flex", height: "500px", border: "1px solid #ddd" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "200px",
          borderRight: "1px solid #ddd",
          overflowY: "auto",
        }}
      >
        <h4 style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Chats</h4>
        {conversations.map((user) => (
          <div
            key={user.id}
            onClick={() => setSelectedUser(user)}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: selectedUser?.id === user.id ? "#f0f0f0" : "white",
              borderBottom: "1px solid #eee",
            }}
          >
            <b>{user.first_name || user.username}</b>
          </div>
        ))}
      </div>

      {/* Chat box */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedUser ? (
          <>
            <div
              style={{
                borderBottom: "1px solid #ddd",
                padding: "10px",
                fontWeight: "bold",
              }}
            >
              {selectedUser.first_name || selectedUser.username}
            </div>

            <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    textAlign: msg.sender === currentUser ? "right" : "left",
                    margin: "5px 0",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      background:
                        msg.sender === currentUser ? "#007bff" : "#f1f1f1",
                      color: msg.sender === currentUser ? "white" : "black",
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>

            <form
              onSubmit={sendMessage}
              style={{
                display: "flex",
                borderTop: "1px solid #ddd",
                padding: "10px",
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1, padding: "8px" }}
                placeholder="Type a message..."
              />
              <button
                type="submit"
                style={{
                  marginLeft: "8px",
                  padding: "8px 16px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#888",
            }}
          >
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;
