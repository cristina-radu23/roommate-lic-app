import React, { useEffect, useState, useRef } from 'react';
import profileIcon from '../../assets/profileIcon.png';
import './Inbox.css';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';

interface ChatRoom {
  chatRoomId: number;
  ChatRoom: { chatRoomId: number; listingId: number; isMatchmaking: boolean };
  // ...other fields as needed
  users?: { userId: number; name: string; avatar?: string }[];
  unreadCount?: number;
}

interface Message {
  messageId: number;
  userId: number;
  content: string;
  createdAt: string;
  chatRoomId?: number;
  seen?: boolean;
  User?: { 
    userFirstName: string;
    userLastName: string;
    profilePicture?: string;
    isActive: boolean;
  };
}

// Helper to get the other user in a chat
function getOtherUser(chat: any, userId: number) {
  const users = chat.ChatRoom.ChatRoomUsers || [];
  return users.map((cu: any) => cu.User).find((u: any) => u && u.userId !== userId);
}

// Helper to get profile picture URL
function getProfilePictureUrl(profilePicture?: string) {
  if (!profilePicture) return profileIcon;
  return profilePicture.startsWith('http') ? profilePicture : `http://localhost:5000${profilePicture}`;
}

// Helper to count unread messages for a chat
// function countUnread(chat: any, userId: number) {
//   const lastMsg = (chat as any).lastMessage;
//   if (!lastMsg) return 0;
//   // Only count if the last message is not from the current user and is not seen
//   return lastMsg.userId !== userId && !lastMsg.seen ? 1 : 0;
// }

const Inbox: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket hook
  const { socket, isConnected } = useSocket();

  console.log('[Inbox] location.state:', location.state);
  console.log('[Inbox] WebSocket connected:', isConnected);

  const userId = Number(localStorage.getItem('userId')); // You should store userId on login
  const token = localStorage.getItem('token');

  // If coming from ListingPage with receiver info
  const { receiverId, receiverName, listingId } = (location.state || {}) as { receiverId?: number, receiverName?: string, listingId?: number };
  console.log('[Inbox] receiverId:', receiverId, 'receiverName:', receiverName, 'listingId:', listingId);
  const [pendingChat, setPendingChat] = useState<{ receiverId: number, receiverName: string, listingId: number } | null>(
    receiverId && receiverName && listingId ? { receiverId, receiverName, listingId } : null
  );
  console.log('[Inbox] pendingChat (init):', pendingChat);

  // Update pendingChat if location.state changes (e.g., navigating from ListingPage)
  useEffect(() => {
    console.log('[Inbox] useEffect update pendingChat', { receiverId, receiverName, listingId });
    if (receiverId && receiverName && listingId) {
      setPendingChat({ receiverId, receiverName, listingId });
      setSelectedChat(null);
      console.log('[Inbox] pendingChat set in useEffect:', { receiverId, receiverName, listingId });
    }
    // eslint-disable-next-line
  }, [receiverId, receiverName, listingId]);

  // Auto-select chat if chatRoomId is present in the URL
  useEffect(() => {
    const chatRoomIdParam = searchParams.get('chatRoomId');
    if (chatRoomIdParam && chats.length > 0) {
      const chatRoomId = Number(chatRoomIdParam);
      const found = chats.find(chat => (chat.ChatRoom?.chatRoomId || chat.chatRoomId) === chatRoomId);
      if (found) setSelectedChat(found);
    }
  }, [searchParams, chats]);

  // Fetch chat list
  useEffect(() => {
    if (!userId) return;
    setLoadingChats(true);
    fetch(`http://localhost:5000/api/chat/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        setChats(data);
        setLoadingChats(false);
      });
  }, [userId]);

  // Fetch messages for selected chat
  useEffect(() => {
    if (selectedChat) {
      fetch(`http://localhost:5000/api/chat/room/${selectedChat.ChatRoom.chatRoomId}/messages`)
        .then(res => res.json())
        .then(setMessages);
    }
  }, [selectedChat]);

  // If coming from ListingPage, open a new chat window (not in chat list yet)
  useEffect(() => {
    if (pendingChat) {
      setSelectedChat(null);
    }
  }, [pendingChat]);

  // Auto-select existing chat if navigating with a receiver
  useEffect(() => {
    if (pendingChat && chats.length > 0) {
      const existing = chats.find(chat => {
        const other = getOtherUser(chat, userId);
        return other && other.userId === pendingChat.receiverId;
      });
      if (existing) {
        setSelectedChat(existing);
        setPendingChat(null);
      }
    }
  }, [pendingChat, chats, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as seen when entering a chatroom
  useEffect(() => {
    if (selectedChat && userId) {
      fetch('http://localhost:5000/api/messages/seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatRoomId: selectedChat.ChatRoom.chatRoomId, userId })
      }).then(() => {
        // Refresh chat list after marking as seen
        fetch(`http://localhost:5000/api/chat/user/${userId}`)
          .then(res => res.json())
          .then(data => {
            setChats(data);
            window.dispatchEvent(new CustomEvent('refresh-unread'));
          });
      });
    }
  }, [selectedChat, userId]);

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('new_message', (data: Message) => {
      console.log('[Inbox] Received new message:', data);
      if (selectedChat?.ChatRoom.chatRoomId === data.chatRoomId) {
        setMessages(prev => [...prev, data]);
      }
      // Update chat list with new message
      updateChatList();
    });

    // Listen for typing indicators
    socket.on('user_typing', (data: { userId: number; chatRoomId: number }) => {
      if (selectedChat?.ChatRoom.chatRoomId === data.chatRoomId) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      }
    });

    socket.on('user_stop_typing', (data: { userId: number; chatRoomId: number }) => {
      if (selectedChat?.ChatRoom.chatRoomId === data.chatRoomId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }
    });

    // Listen for message seen notifications
    socket.on('message_seen', (data: { chatRoomId: number; seenBy: number }) => {
      console.log('[Inbox] Message seen:', data);
      // Update UI to show message as seen
      updateMessageStatus(data);
    });

    // Listen for unread count updates
    socket.on('unread_count_update', (data: { chatRoomId: number; count: number }) => {
      console.log('[Inbox] Unread count update:', data);
      // Update unread count in chat list
      updateUnreadCount(data);
    });

    return () => {
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.off('message_seen');
      socket.off('unread_count_update');
    };
  }, [socket, selectedChat]);

  // Helper functions for WebSocket updates
  const updateChatList = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`http://localhost:5000/api/chat/user/${userId}`);
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error('Error updating chat list:', error);
    }
  };

  const updateMessageStatus = (data: { chatRoomId: number; seenBy: number }) => {
    // Update messages to show as seen
    setMessages(prev => prev.map(msg => ({
      ...msg,
      seen: msg.chatRoomId === data.chatRoomId ? true : msg.seen
    })));
  };

  const updateUnreadCount = (data: { chatRoomId: number; count: number }) => {
    // Update unread count in chat list
    setChats(prev => prev.map(chat => {
      if (chat.ChatRoom.chatRoomId === data.chatRoomId) {
        return {
          ...chat,
          unreadCount: (chat.unreadCount || 0) + data.count
        };
      }
      return chat;
    }));
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      let chatRoomId = selectedChat?.ChatRoom.chatRoomId;
      
      // If this is a new chat (from ListingPage), create it first
      if (pendingChat && !chatRoomId) {
        const createRes = await fetch('http://localhost:5000/api/chat/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            listingId: pendingChat.listingId,
            userIds: [userId, pendingChat.receiverId],
            isMatchmaking: false
          })
        });
        const createData = await createRes.json();
        chatRoomId = createData.chatRoomId;
        
        // Refresh chat list
        const chatListRes = await fetch(`http://localhost:5000/api/chat/user/${userId}`);
        const chatList = await chatListRes.json();
        setChats(chatList);
        
        // If chat already existed, select it; otherwise select the new chat
        const newChat = chatList.find((c: any) => c.ChatRoom.chatRoomId === chatRoomId);
        setSelectedChat(newChat);
        setPendingChat(null);
        
        // Join the chat room via WebSocket
        if (socket && chatRoomId) {
          socket.emit('join_chat', { chatRoomId });
        }
        
        if (createData.existing) {
          // Send message via WebSocket for existing chat
          if (socket && chatRoomId) {
            socket.emit('send_message', {
              chatRoomId,
              content: message
          });
          }
          setMessage('');
          setSending(false);
          return;
        }
      }

      // Send message via WebSocket
      if (socket && chatRoomId) {
        socket.emit('send_message', {
          chatRoomId,
          content: message
        });
        setMessage('');
      } else {
        // Fallback to REST API if WebSocket is not available
      await fetch('http://localhost:5000/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          chatRoomId,
          userId,
          content: message
        })
      });
      setMessage('');
        
        // Refresh messages and chat list
      if (chatRoomId) {
        const msgRes = await fetch(`http://localhost:5000/api/chat/room/${chatRoomId}/messages`);
        setMessages(await msgRes.json());
      }
      const chatListRes = await fetch(`http://localhost:5000/api/chat/user/${userId}`);
      setChats(await chatListRes.json());
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleChatClick = (chat: ChatRoom) => {
    setSelectedChat(chat);
    setPendingChat(null);
    
    // Join the chat room via WebSocket
    if (socket && chat.ChatRoom.chatRoomId) {
      socket.emit('join_chat', { chatRoomId: chat.ChatRoom.chatRoomId });
    }
    
    // Optimistically set unreadCount to 0 for this chat
    setChats(prevChats => prevChats.map(c =>
      c.ChatRoom.chatRoomId === chat.ChatRoom.chatRoomId ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleTyping = () => {
    if (!socket || !selectedChat) return;

    // Emit typing start
    socket.emit('typing_start', {
      chatRoomId: selectedChat.ChatRoom.chatRoomId
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        chatRoomId: selectedChat.ChatRoom.chatRoomId
      });
    }, 2000);
  };

  // Render chat list
  const renderChatList = () => (
    <div className="inbox-list">
      {loadingChats ? <div style={{ padding: 16 }}>Loading...</div> : null}
      {chats.map((chat) => {
        const otherUser = getOtherUser(chat, userId);
        const lastMsg = (chat as any).lastMessage;
        let lastMsgContent = '';
        if (lastMsg) {
          lastMsgContent = lastMsg.content;
          if (lastMsg.userId === userId) {
            lastMsgContent = `you: ${lastMsgContent}`;
          }
        }
        const unread = (chat as any).unreadCount || 0;
        return (
          <div
            key={chat.ChatRoom.chatRoomId}
            className={`inbox-list-item${selectedChat?.ChatRoom.chatRoomId === chat.ChatRoom.chatRoomId ? ' selected' : ''}`}
            onClick={() => handleChatClick(chat)}
          >
            <img 
              src={otherUser?.profilePicture ? getProfilePictureUrl(otherUser.profilePicture) : profileIcon} 
              alt="avatar" 
              className="inbox-avatar" 
            />
            <div className="inbox-list-info">
              <div className="inbox-list-name">{otherUser ? otherUser.userFirstName + ' ' + otherUser.userLastName : `Chat #${chat.ChatRoom.chatRoomId}`}</div>
              {otherUser && !otherUser.isActive && (
                <div className="inbox-list-status" style={{ color: '#dc3545', fontSize: '0.85rem' }}>Inactive user</div>
              )}
              <div className="inbox-list-last" style={{ color: '#888' }}>{lastMsgContent}</div>
            </div>
            {unread > 0 && (
              <span style={{ background: 'red', color: 'white', borderRadius: '50%', padding: '2px 8px', marginLeft: 8, fontSize: 12 }}>
                {unread}
              </span>
            )}
            <div className="inbox-list-time">&nbsp;</div>
          </div>
        );
      })}
      {pendingChat && (
        <div className="inbox-list-item selected">
          <img src={profileIcon} alt="avatar" className="inbox-avatar" />
          <div className="inbox-list-info">
            <div className="inbox-list-name">{pendingChat.receiverName}</div>
            <div className="inbox-list-last" style={{ color: '#888' }}>(new message)</div>
          </div>
        </div>
      )}
    </div>
  );

  // Render chat window
  const renderChatWindow = () => {
    // If composing a new chat
    if (pendingChat && !selectedChat) {
      return (
        <div className="inbox-chat">
          <div className="inbox-chat-header">
            <img src={profileIcon} alt="avatar" className="inbox-avatar-large" />
            <span className="inbox-chat-username">{pendingChat.receiverName}</span>
          </div>
          <div className="inbox-chat-messages" />
          <div className="inbox-chat-input">
            <input
              type="text"
              placeholder="Write a message here"
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                handleTyping();
              }}
              disabled={sending}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button onClick={handleSend} disabled={sending || !message.trim()}>Send</button>
          </div>
        </div>
      );
    }
    // Existing chat
    if (selectedChat) {
      const otherUser = getOtherUser(selectedChat, userId);
      const isOtherUserInactive = otherUser && !otherUser.isActive;
      
      return (
        <div className="inbox-chat">
          <div className="inbox-chat-header">
            <img 
              src={otherUser?.profilePicture ? getProfilePictureUrl(otherUser.profilePicture) : profileIcon} 
              alt="avatar" 
              className="inbox-avatar-large" 
            />
            <div>
              <span className="inbox-chat-username">{otherUser ? otherUser.userFirstName + ' ' + otherUser.userLastName : `Chat #${selectedChat.ChatRoom.chatRoomId}`}</span>
              {isOtherUserInactive && (
                <div style={{ color: '#dc3545', fontSize: '0.85rem', marginTop: 2 }}>Inactive user</div>
              )}
              <div style={{ fontSize: '0.75rem', marginTop: 2 }}>
                <span style={{ color: isConnected ? '#28a745' : '#dc3545' }}>
                  ● {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <div className="inbox-chat-messages" style={{ overflowY: 'auto' }}>
            {messages.map((msg, idx) => (
              <div
                key={msg.messageId}
                className={`inbox-message${msg.userId === userId ? ' sent' : ' received'}`}
              >
                {msg.userId !== userId && (
                  <img 
                    src={msg.User?.profilePicture ? getProfilePictureUrl(msg.User.profilePicture) : profileIcon} 
                    alt="avatar" 
                    className="inbox-message-avatar" 
                  />
                )}
                <div className="inbox-message-content">
                  {msg.content}
                </div>
              </div>
            ))}
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="inbox-message received">
                <img src={profileIcon} alt="avatar" className="inbox-message-avatar" />
                <div className="inbox-message-content" style={{ fontStyle: 'italic', color: '#666' }}>
                  {Array.from(typingUsers).map(userId => {
                    const user = getOtherUser(selectedChat, userId);
                    return user ? `${user.userFirstName} is typing...` : 'Someone is typing...';
                  }).join(', ')}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {isOtherUserInactive ? (
            <div className="inbox-chat-input" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #dee2e6'
            }}>
              <span style={{ color: '#dc3545' }}>Cannot send messages to inactive users</span>
            </div>
          ) : (
            <div className="inbox-chat-input">
              <input
                type="text"
                placeholder="Write a message here"
                value={message}
                onChange={e => {
                  setMessage(e.target.value);
                  handleTyping();
                }}
                disabled={sending}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button onClick={handleSend} disabled={sending || !message.trim()}>Send</button>
            </div>
          )}
        </div>
      );
    }
    // No chat selected
    return <div className="inbox-chat" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>Select a chat to start messaging.</div>;
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingTop: "48px" }}>
      <div className="inbox-container">
        {renderChatList()}
        {renderChatWindow()}
      </div>
    </div>
  );
};

export default Inbox; 