import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useCustomAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/apiBaseUrl';
import './ChatPage.css';

const POLL_INTERVAL_MS = 3000;

// Backend returns timestamps without timezone info (e.g. "2026-04-16 05:00:36").
// Normalize to UTC ISO format so browsers parse them as UTC, not local time.
const parseUTC = (str) => new Date(str ? str.replace(' ', 'T').replace(/(?<!\+\d{2}:\d{2}|Z)$/, 'Z') : null);

export const ChatPage = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const { customAuth, backendAuthReady, backendAuthError } = useCustomAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const messagesAreaRef = useRef(null);
  const latestTimestampRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const [error, setError] = useState(null);

  // Resolve the active bearer token for either Auth0 or custom auth.
  const getToken = async () => {
    if (isAuthenticated) {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: import.meta.env.VITE_AUTH0_AUDIENCE },
      });
      return token || null;
    } else if (customAuth) {
      return customAuth;
    }
    return null;
  };

  const requireToken = async (requestName) => {
    const token = await getToken();
    if (!token) {
      const message = backendAuthError || 'Authentication is still loading. Please wait and retry.';
      console.warn(`[ChatPage] Skipping ${requestName} because no bearer token is available.`);
      throw new Error(message);
    }
    return token;
  };

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && !backendAuthReady) {
      setLoadingConversations(false);
      return;
    }

    if (!isAuthenticated && !customAuth) {
      setLoadingConversations(false);
      setConversations([]);
      return;
    }

    setLoadingConversations(true);
    setError(null);

    (async () => {
      try {
        const token = await requireToken('GET /chats');
        const res = await fetch(`${API_BASE_URL}/chats/`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
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
            time: parseUTC(c.created_at).toLocaleDateString(),
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
          latestTimestampRef.current = null;
          setSelectedConvoId(id);
          // Fetch messages even if convo not in list (handles new conversations with no messages yet)
          fetchMessages(id, convo);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
        setError(err.message);
      } finally {
        setLoadingConversations(false);
      }
    })();
  }, [isAuthenticated, customAuth, isLoading, backendAuthReady, backendAuthError]);

  const [selectedConvoId, setSelectedConvoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const [messages, setMessages] = useState([]);

  // Fetch messages for a conversation. If since is provided, only append new messages.
  const fetchMessages = async (chatId, convo, since = null) => {
    if (!chatId) return;
    try {
      const token = await requireToken(`GET /chats/${chatId}/messages`);
      const url = since
        ? `${API_BASE_URL}/chats/${chatId}/messages?since=${encodeURIComponent(since)}`
        : `${API_BASE_URL}/chats/${chatId}/messages`;
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to load messages');
      const data = await res.json();
      if (data.length === 0) return;

      const otherName = convo ? convo.name : null;
      const mapped = data.map((m) => {
        const sentAt = parseUTC(m.sent_at);
        const date = sentAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const time = sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          id: m.message_id,
          sender: m.sender_name === otherName ? 'them' : 'me',
          sender_name: m.sender_name,
          text: m.body,
          time,
          date,
        };
      });

      // Track the latest sent_at for subsequent polls
      const latestSentAt = data[data.length - 1].sent_at;
      latestTimestampRef.current = latestSentAt;

      if (since) {
        setMessages((prev) => [...prev, ...mapped]);
      } else {
        setMessages(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    // scroll to bottom when messages change
    if (messagesAreaRef.current) {
      messagesAreaRef.current.scrollTop = messagesAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Start polling for new messages whenever a conversation is selected
  useEffect(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (!selectedConvoId || !backendAuthReady) return;

    const convo = conversations.find((c) => c.id === selectedConvoId) || null;
    pollIntervalRef.current = setInterval(() => {
      if (latestTimestampRef.current) {
        fetchMessages(selectedConvoId, convo, latestTimestampRef.current);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    };
  }, [selectedConvoId, isAuthenticated, customAuth, backendAuthReady, conversations]);



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
    latestTimestampRef.current = null;
    setMessages([]);
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
      const token = await requireToken(`POST /chats/${selectedConvoId}/messages`);
      const res = await fetch(`${API_BASE_URL}/chats/${selectedConvoId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to send message');
      const m = await res.json();
        const sentAt = parseUTC(m.sent_at);
        const date = sentAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const time = sentAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const convo = conversations.find((c) => c.id === selectedConvoId);
        const newMsg = {
          id: m.message_id,
          sender: m.sender_name === (convo ? convo.name : '') ? 'them' : 'me',
          sender_name: m.sender_name,
          text: m.body,
          time,
          date,
        };
        latestTimestampRef.current = m.sent_at;
        setMessages((prev) => [...prev, newMsg]);
        setNewMessage('');
      } catch (err) {
        console.error('Error sending message:', err);
        setError(err.message);
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
            {error && (
              <div className="convo-error">
                <div className="convo-error-title">Unable to load conversations</div>
                <div className="convo-error-message">{error}</div>
                <button className="convo-error-retry" onClick={() => { setError(null); window.location.reload(); }}>RETRY</button>
              </div>
            )}
            {loadingConversations && !error ? (
              <div className="convo-empty">Loading conversations...</div>
            ) : !error && filteredConversations.length === 0 ? (
              <div className="convo-empty">No conversations yet. Start a chat with your coach or client!</div>
            ) : (
              filteredConversations.map((convo) => (
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
              ))
            )}
          </div>
        </div>

        <div className="chat-main">
          {!selectedConvo ? (
            <div className="chat-empty-state">
              <div className="chat-empty-icon">💬</div>
              <div className="chat-empty-title">Select a conversation</div>
              <div className="chat-empty-text">Choose a conversation from the sidebar or start a new chat with your coach/client.</div>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className="chat-header-avatar">{selectedConvo.initials}</div>
                  <div className="chat-header-info">
                    <div className="chat-header-name">{selectedConvo.name}</div>
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
                          {(msg.sender_name || '')
                            .split(' ')
                            .map((p) => p[0] || '')
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || '?'}
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
