import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useCustomAuth } from '../context/AuthContext';
import './ChatPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const ChatPage = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const { customAuth } = useCustomAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const messagesAreaRef = useRef(null);

  // Helper to get auth token - define first so it can be used in useEffect
  const getToken = async () => {
    let token;
    if (isAuthenticated) {
      token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });
    } else if (customAuth) {
      token = customAuth;
    }
    return token;
  };

  useEffect(() => {
    setLoadingConversations(true);
    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/chats`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('Failed to load conversations');
        const data = await res.json();
        // data is a list of ConversationOut
        const mapped = data.map((c) => {
          const name = c.other_user_name || 'Unknown';
          const initials = name
            .split(' ')
            .map((p) => p[0] || '')
            .slice(0, 2)
            .join('')
            .toUpperCase();
          return {
            id: c.chat_id,
            name,
            other_user_name: c.other_user_name,
            initials,
            preview: '',
            time: new Date(c.created_at).toLocaleDateString(),
            unread: 0,
            type: 'client',
            online: false,
            coach_user_id: c.coach_user_id,
            client_user_id: c.client_user_id,
          };
        });
        setConversations(mapped);
        const chatParam = new URLSearchParams(window.location.search).get('chat');
        if (chatParam) {
          const id = Number(chatParam);
          console.log('Opening chat from URL param:', id);
          const convo = mapped.find((x) => x.id === id);
          setSelectedConvoId(id);
          // Fetch messages even if convo not in list (handles new conversations with no messages yet)
          fetchMessages(id, convo);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoadingConversations(false);
      }
    })();
  }, [isAuthenticated, customAuth]);

  const [selectedConvoId, setSelectedConvoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const [messages, setMessages] = useState([]);

  // Fetch messages for a conversation
  const fetchMessages = async (chatId, convo) => {
    if (!chatId) return;
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
        // data is list of MessageOut
        const mapped = data.map((m) => {
          const sentAt = new Date(m.sent_at);
          const date = sentAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
          const time = sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const otherName = convo ? convo.name : null;
          return {
            id: m.message_id,
            sender: m.sender_name === otherName ? 'them' : 'me',
            text: m.body,
            time,
            date,
          };
        });
        setMessages(mapped);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
  };

  useEffect(() => {
    // scroll to bottom when messages change
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  }, [messages]);



  // selectedConvo from list, or create a minimal one if opening a new conversation with no messages yet
  let selectedConvo = conversations.find((c) => c.id === selectedConvoId);
  if (!selectedConvo && selectedConvoId) {
    // Create a minimal selectedConvo for new conversations without messages
    console.log('Creating fallback selectedConvo for chat_id:', selectedConvoId);
    selectedConvo = {
      id: selectedConvoId,
      name: 'Coach', // generic fallback until first message arrives
      initials: 'C',
      online: false,
    };
  }
  console.log('selectedConvoId:', selectedConvoId, 'selectedConvo:', selectedConvo);

  const filteredConversations = conversations.filter((convo) =>
    convo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = (convoId) => {
    setSelectedConvoId(convoId);
    const convo = conversations.find((c) => c.id === convoId);
    if (convo) {
      fetchMessages(convoId, convo);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConvoId) return;

    const payload = { type: 'text', body: newMessage };
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/chats/${selectedConvoId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const m = await res.json();
        const sentAt = new Date(m.sent_at);
        const date = sentAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const time = sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const convo = conversations.find((c) => c.id === selectedConvoId);
        const newMsg = {
          id: m.message_id,
          sender: m.sender_name === (convo ? convo.name : '') ? 'them' : 'me',
          text: m.body,
          time,
          date,
        };
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage('');
      } catch (err) {
        console.error('Error sending message:', err);
      }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const groupedMessages = messages.reduce((acc, msg) => {
    if (!acc[msg.date]) acc[msg.date] = [];
    acc[msg.date].push(msg);
    return acc;
  }, {});

  return (
    <div className="chat-page">

      <div className="chat-layout">
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Messages</div>
            <div className="sidebar-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="SEARCH CONVERSATIONS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="conversation-list">
            {filteredConversations.map((convo) => (
              <div
                key={convo.id}
                className={`conversation-item ${selectedConvoId === convo.id ? 'active' : ''}`}
                onClick={() => handleSelectConversation(convo.id)}
              >
                <div className={`convo-avatar ${convo.type}`}>{convo.initials}</div>
                <div className="convo-info">
                  <div className="convo-name">{convo.name}</div>
                  <div className="convo-preview">{convo.preview}</div>
                </div>
                <div className="convo-meta">
                  <div className="convo-time">{convo.time}</div>
                  {convo.unread > 0 && <div className="convo-unread">{convo.unread}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          {selectedConvo && (
            <>
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className="chat-header-avatar">{selectedConvo.initials}</div>
                  <div className="chat-header-info">
                    <div className="chat-header-name">{selectedConvo.name}</div>
                    <div className={`chat-header-status ${selectedConvo.online ? 'online' : 'offline'}`}>
                      <div className="status-dot"></div>
                      {selectedConvo.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
                <div className="chat-header-right">
                  <button className="header-btn">VIEW PROFILE</button>
                  <button className="header-btn">VIEW PLAN</button>
                </div>
              </div>

              <div className="messages-area" ref={messagesAreaRef}>
                {Object.keys(groupedMessages).map((date) => (
                  <React.Fragment key={date}>
                    <div className="date-divider">
                      <div className="date-divider-line"></div>
                      <div className="date-divider-text">{date}</div>
                      <div className="date-divider-line"></div>
                    </div>
                    {groupedMessages[date].map((msg) => (
                      <div key={msg.id} className={`message-row ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                        <div className={`msg-avatar ${msg.sender === 'me' ? 'me' : 'coach'}`}>
                          {msg.sender === 'me' ? 'AJ' : selectedConvo.initials}
                        </div>
                        <div className="msg-content">
                          <div className="msg-bubble">{msg.text}</div>
                          <div className="msg-time">{msg.time}</div>
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>

              <div className="chat-input-area">
                <div className="chat-input-wrapper">
                  <button className="attach-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B6BA0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <textarea
                    className="chat-input"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows="1"
                  />
                </div>
                <button className="send-btn" onClick={handleSendMessage}>SEND</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
