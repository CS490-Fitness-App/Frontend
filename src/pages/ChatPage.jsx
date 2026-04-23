import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ChatPage.css';

export const ChatPage = () => {
  const [conversations] = useState([
    { id: 1, initials: 'MR', name: 'Marcus Rivera', preview: "Sounds good! Let's bump up the weight on squats this week.", time: '2:34 PM', unread: 2, type: 'coach', online: true },
    { id: 2, initials: 'SN', name: 'Sarah Nguyen', preview: 'Thanks for the meal plan update!', time: 'Yesterday', unread: 0, type: 'client', online: false },
    { id: 3, initials: 'LP', name: 'Lisa Park', preview: 'How was your workout today?', time: 'Mon', unread: 0, type: 'coach', online: true },
    { id: 4, initials: 'JD', name: 'James Davis', preview: "I'll send over the updated schedule by Friday.", time: 'Feb 22', unread: 0, type: 'client', online: false },
    { id: 5, initials: 'TW', name: 'Tom Wilson', preview: 'Got it, thanks coach!', time: 'Feb 20', unread: 0, type: 'client', online: false },
  ]);

  const [selectedConvoId, setSelectedConvoId] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Hey Alex! How did the push day go yesterday? I saw you logged it — solid numbers on the bench press. 💪', time: '9:15 AM', date: 'Feb 27, 2026' },
    { id: 2, sender: 'me', text: 'Thanks Marcus! It went well. I felt strong on bench — hit 185 for 3 sets of 5. Shoulders were a bit tight on the overhead press though.', time: '10:02 AM', date: 'Feb 27, 2026' },
    { id: 3, sender: 'them', text: "Nice work on the bench! For the OHP, try adding some shoulder dislocates with a band before your pressing sets. That should help with the tightness. I'll add it to your warmup.", time: '10:18 AM', date: 'Feb 27, 2026' },
    { id: 4, sender: 'me', text: 'Got it, I will try that. Also — do you think I should increase the weight on squats this week? I felt like 205 was getting easy.', time: '11:45 AM', date: 'Feb 27, 2026' },
    { id: 5, sender: 'them', text: "Sounds good! Let's bump up the weight on squats this week. Try 215 for your working sets and see how it feels. If form stays clean, we'll keep progressing.", time: '2:34 PM', date: 'Today' },
    { id: 6, sender: 'them', text: "Also don't forget your daily check-in today — I want to keep tracking your calories and sleep this week. You've been making great progress! 🔥", time: '2:35 PM', date: 'Today' },
  ]);

  const selectedConvo = conversations.find((c) => c.id === selectedConvoId);

  const filteredConversations = conversations.filter((convo) =>
    convo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectConversation = (convoId) => {
    setSelectedConvoId(convoId);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: messages.length + 1,
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
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

              <div className="messages-area">
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
