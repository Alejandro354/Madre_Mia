import React, { useState, useEffect, useRef } from 'react';
import { Bell, MoreVertical, Paperclip, Smile, Image as ImageIcon, Send, Search, MessageCircle, ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import useIsMobile from '../../hooks/useIsMobile';
import { resolveMediaUrl } from '../../utils/media';

// El gateway unificado sirve el backend de practicaya bajo /practicaya.
const API_URL = '/practicaya';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const isMobile = useIsMobile();
  // On mobile, show either the conversation list or the active chat, never both
  const [mobileView, setMobileView] = useState('list');

  const [contacts, setContacts] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeContactName, setActiveContactName] = useState('');
  const [activeContactAvatar, setActiveContactAvatar] = useState('');
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect socket
  useEffect(() => {
    // socket.io interpreta cualquier segmento de ruta en la URL como un
    // "namespace", no como el prefijo real del handshake — por eso el
    // prefijo /practicaya va en `path`. Sin URL, se conecta al mismo origen
    // de la página y el proxy de Vite lo lleva al gateway.
    const socket = io({ path: '/practicaya/socket.io' });
    socketRef.current = socket;

    socket.on('connect', () => {
      // Join room with user id
      socket.emit('join', { room: String(user.id) });
    });

    socket.on('receive_message', (data) => {
      // Only add to messages if it's from the active chat
      setMessages(prev => {
        // Check if this message is relevant to the current conversation
        const isFromActiveChat = data.sender_id === activeChatId || data.receiver_id === activeChatId;
        if (!isFromActiveChat) return prev;
        
        // Avoid duplicates
        if (prev.find(m => m.id === data.id)) return prev;
        
        return [...prev, {
          id: data.id,
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
          text: data.contenido,
          time: new Date(data.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMine: data.sender_id === user.id,
        }];
      });

      // Update last message in contacts
      setContacts(prev => prev.map(c => {
        if (c.id === data.sender_id || c.id === data.receiver_id) {
          return { ...c, lastMessage: data.contenido };
        }
        return c;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, [user.id, activeChatId]);

  // Load contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/chat/contacts`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setContacts(data);
          
          // If there's a target user from query params
          if (targetUserId) {
            const targetId = parseInt(targetUserId);
            const existingContact = data.find(c => c.id === targetId);
            if (existingContact) {
              setActiveChatId(targetId);
              setActiveContactName(existingContact.name);
              setActiveContactAvatar(existingContact.avatarUrl);
              setMobileView('chat');
            } else {
              // Fetch user info for new chat
              const infoRes = await fetch(`${API_URL}/api/chat/user-info/${targetId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (infoRes.ok) {
                const info = await infoRes.json();
                // Add to contacts list temporarily
                const newContact = {
                  ...info,
                  lastMessage: '',
                  time: '',
                  unread: false
                };
                // Sin el guardia, abrir el chat de alguien con quien todavía no
                // hablaste lo agregaba dos veces: en desarrollo React monta el
                // efecto dos veces y las dos ejecuciones lo insertaban.
                setContacts(prev =>
                  prev.some(c => c.id === newContact.id) ? prev : [newContact, ...prev]
                );
                setActiveChatId(targetId);
                setActiveContactName(info.name);
                setActiveContactAvatar(info.avatarUrl);
                setMobileView('chat');
              }
            }
          } else if (data.length > 0) {
            // Select first contact if no target
            setActiveChatId(data[0].id);
            setActiveContactName(data[0].name);
            setActiveContactAvatar(data[0].avatarUrl);
          }
        }
      } catch (err) {
        console.error('Error loading contacts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [token, targetUserId]);

  // Load messages when active chat changes
  useEffect(() => {
    if (!activeChatId) return;

    const fetchMessages = async () => {
      setMessagesLoading(true);
      setMessages([]);
      try {
        const res = await fetch(`${API_URL}/api/chat/messages/${activeChatId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          window.dispatchEvent(new Event('messagesRead'));
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      } finally {
        setMessagesLoading(false);
      }
    };
    fetchMessages();
  }, [activeChatId, token]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChatId) return;

    socketRef.current?.emit('send_message', {
      sender_id: user.id,
      receiver_id: activeChatId,
      contenido: newMessage.trim()
    });

    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectContact = (contact) => {
    setActiveChatId(contact.id);
    setActiveContactName(contact.name);
    setActiveContactAvatar(contact.avatarUrl);
    setMobileView('chat');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando chats...</p>
      </div>
    );
  }

  return (
    <div style={{
      margin: isMobile ? '-0.75rem -1rem -1.5rem -1rem' : '-0.75rem -2.5rem -2.5rem -2.5rem',
      padding: isMobile ? 0 : '0 2.5rem 0 0',
      height: 'calc(100vh - 64px)',
      display: 'flex',
      background: 'white',
      borderTop: '1px solid var(--border-color)'
    }}>

      {/* Left Sidebar - Chat List */}
      <div style={{
        width: isMobile ? '100%' : '280px',
        flexShrink: 0,
        borderRight: isMobile ? 'none' : '1px solid var(--border-color)',
        display: isMobile && mobileView === 'chat' ? 'none' : 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {contacts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <MessageCircle size={40} color="var(--text-disabled)" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '0.9rem' }}>No tienes conversaciones aún.</p>
              <p style={{ fontSize: '0.8rem' }}>Contacta un candidato para iniciar un chat.</p>
            </div>
          ) : (
            contacts.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => selectContact(chat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem 1.15rem',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  background: chat.id === activeChatId ? 'rgb(230, 230, 230)' : 'white',
                  borderLeft: chat.id === activeChatId ? '4px solid var(--color-primary)' : '4px solid transparent',
                  borderBottom: '1px solid #f0f0f0',
                  transition: 'background 0.15s ease'
                }}
              >
                {/* Avatar */}
                {chat.avatarUrl ? (
                  <img 
                    src={resolveMediaUrl(chat.avatarUrl)}
                    alt={chat.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: chat.color || '#638FE9',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    flexShrink: 0
                  }}>
                    {chat.initial}
                  </div>
                )}
                
                {/* Chat Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h4 style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: chat.id === activeChatId ? '700' : '600',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {chat.name}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#999', flexShrink: 0, marginLeft: '0.5rem' }}>{chat.time}</span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {chat.lastMessage || 'Inicia la conversación...'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Area - Active Chat */}
      <div style={{
        flex: 1,
        display: isMobile && mobileView === 'list' ? 'none' : 'flex',
        flexDirection: 'column',
        background: 'white'
      }}>

        {activeChatId ? (
          <>
            {/* Chat Header */}
            <div style={{
              height: '72px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isMobile ? '0 1rem' : '0 2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
                {isMobile && (
                  <button
                    onClick={() => setMobileView('list')}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', flexShrink: 0, padding: 0
                    }}
                    aria-label="Volver a conversaciones"
                  >
                    <ArrowLeft size={22} />
                  </button>
                )}
                {activeContactAvatar ? (
                  <img 
                    src={resolveMediaUrl(activeContactAvatar)}
                    alt={activeContactName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', background: '#638FE9',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                  }}>
                    {activeContactName?.[0] || '?'}
                  </div>
                )}
                <h2 style={{
                  margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0
                }}>
                  {activeContactName}
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                <Bell size={20} style={{ cursor: 'pointer' }} />
                <MoreVertical size={20} style={{ cursor: 'pointer' }} />
              </div>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '1.25rem' : '2rem', display: 'flex', flexDirection: 'column' }}>
              
              {messagesLoading ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '0.85rem'
                }}>
                  <div className="chat-spinner" />
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cargando mensajes...</p>
                </div>
              ) : messages.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <MessageCircle size={48} color="var(--text-disabled)" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontSize: '1rem', fontWeight: '500' }}>No hay mensajes aún</p>
                  <p style={{ fontSize: '0.85rem' }}>Envía un mensaje para iniciar la conversación</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-end',
                        gap: '0.5rem',
                        alignSelf: msg.isMine ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* Bubble */}
                      <div style={{
                        background: msg.isMine ? 'var(--color-primary)' : '#F4F5FA',
                        color: msg.isMine ? 'white' : 'var(--text-primary)',
                        padding: '0.75rem 1.25rem',
                        borderRadius: msg.isMine ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        fontSize: '14px',
                        maxWidth: isMobile ? '82%' : '400px'
                      }}>
                        <div>{msg.text}</div>
                        <div style={{ 
                          fontSize: '0.7rem', 
                          marginTop: '0.25rem', 
                          textAlign: 'right',
                          opacity: 0.7
                        }}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div style={{ padding: isMobile ? '1rem' : '1.5rem 2rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>

                <div style={{
                  flex: 1,
                  border: '1px solid var(--border-color)',
                  borderRadius: '24px',
                  padding: isMobile ? '0.6rem 1rem' : '0.75rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <input
                    type="text"
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.95rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-family)'
                    }}
                  />
                  {!isMobile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#999' }}>
                    <Smile size={20} style={{ cursor: 'pointer' }} />
                    <ImageIcon size={20} style={{ cursor: 'pointer' }} />
                    <Paperclip size={20} style={{ cursor: 'pointer' }} />
                  </div>
                  )}
                </div>

                <button
                  onClick={handleSendMessage}
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: newMessage.trim() ? 'var(--color-primary)' : 'white', 
                    border: newMessage.trim() ? 'none' : '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: newMessage.trim() ? 'white' : '#999',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.2s ease'
                  }}>
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ 
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-secondary)'
          }}>
            <MessageCircle size={64} color="var(--text-disabled)" style={{ marginBottom: '1.5rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Selecciona una conversación</p>
            <p style={{ fontSize: '0.85rem' }}>O contacta un candidato para iniciar un chat</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Chat;
