import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Chat.css';

function Chat({ token }) {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchUserAndMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUserAndMessages = async () => {
    try {
      const userResponse = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserId(userResponse.data.id);
      
      await fetchMessages();
    } catch (err) {
      setError('Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/${matchId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to fetch messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    const tempContent = content;
    setContent('');

    try {
      const response = await axios.post(
        `/api/chat/${matchId}/messages`,
        { content: tempContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages([...messages, response.data]);
    } catch (err) {
      setError('Failed to send message');
      setContent(tempContent);
    }
  };

  if (loading) return <div className="loading">Loading chat...</div>;

  return (
    <div className="chat-container">
      <div className="chat-box card">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>Start the conversation! 💬</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender_id === userId ? 'sent' : 'received'}`}
              >
                <p>{msg.content}</p>
                <span className="timestamp">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
