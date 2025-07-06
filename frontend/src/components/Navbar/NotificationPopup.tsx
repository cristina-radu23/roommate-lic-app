import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface Notification {
  notificationId: number;
  type: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  userId: number;
  onAnyUnread: (hasUnread: boolean) => void;
  onApplicationModalOpen: (applicationId: number) => void;
  applicationModalOpen?: boolean;
}

const NotificationPopup: React.FC<Props> = ({ open, onClose, userId, onAnyUnread, onApplicationModalOpen }) => {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is on the bell button (notification trigger)
      const target = event.target as Node;
      const bellButton = document.querySelector('[data-notification-bell]');
      
      if (popupRef.current && !popupRef.current.contains(target) && !bellButton?.contains(target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  // Fetch notifications from backend
  useEffect(() => {
    if (!open || !userId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        onAnyUnread(data.some((n: Notification) => !n.read));
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [open, userId, onAnyUnread]);

  // Mark as read in backend
  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification);
    console.log('Notification link:', notification.link);
    console.log('Notification type:', notification.type);
    
    if (!notification.read) {
      fetch(`http://localhost:5000/api/notifications/${userId}/${notification.notificationId}/read`, { method: 'POST' })
        .then(() => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.notificationId === notification.notificationId ? { ...n, read: true } : n
            )
          );
          onAnyUnread(notifications.some((n) => n.notificationId !== notification.notificationId && !n.read));
        });
    }
    
    // Handle application notifications
    if (notification.type === 'application_received' && notification.link) {
      // Extract application ID from link like "/applications/123"
      const applicationId = notification.link.split('/').pop();
      console.log('Extracted applicationId:', applicationId);
      if (applicationId && !isNaN(Number(applicationId))) {
        console.log('Calling onApplicationModalOpen for applicationId:', applicationId);
        onApplicationModalOpen(Number(applicationId));
        onClose();
        return;
      } else {
        console.log('Invalid applicationId extracted:', applicationId);
      }
    }
    
    if (notification.link) {
      console.log('Navigating to:', notification.link);
      // Special handling for application_approved with chatRoomId in link
      if (notification.type === 'application_approved' && notification.link.includes('chatRoomId=')) {
        const url = new URL('http://dummy' + notification.link); // dummy base for parsing
        const chatRoomId = url.searchParams.get('chatRoomId');
        if (chatRoomId) {
          navigate('/inbox', { state: { chatRoomId: Number(chatRoomId) } });
          onClose();
          return;
        }
      }
      navigate(notification.link);
      onClose();
    } else {
      console.log('No link found for notification');
    }
  };

  const filtered = tab === 'all' ? notifications : notifications.filter((n) => !n.read);

  if (!open) return null;

  return (
    <div 
      ref={popupRef}
      style={{
        position: 'absolute',
        top: 50,
        right: 0,
        width: 350,
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        zIndex: 2000,
        padding: 0,
      }}
    >
      <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
        <button
          className={`btn btn-link flex-fill${tab === 'all' ? ' fw-bold' : ''}`}
          style={{ borderRadius: 0, color: tab === 'all' ? '#0d6efd' : '#333' }}
          onClick={() => setTab('all')}
        >
          All
        </button>
        <button
          className={`btn btn-link flex-fill${tab === 'unread' ? ' fw-bold' : ''}`}
          style={{ borderRadius: 0, color: tab === 'unread' ? '#0d6efd' : '#333' }}
          onClick={() => setTab('unread')}
        >
          Unread
        </button>
      </div>
      <div style={{ maxHeight: 350, overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center text-muted p-4">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted p-4">No notifications</div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.notificationId}
              onClick={() => handleNotificationClick(n)}
              style={{
                cursor: 'pointer',
                background: n.read ? '#f8f9fa' : '#e7f1ff',
                padding: '12px 16px',
                borderBottom: '1px solid #f1f1f1',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.read ? 400 : 600, color: '#000' }}>{n.message}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && <span style={{ width: 10, height: 10, background: '#0d6efd', borderRadius: '50%', display: 'inline-block' }} />}
            </div>
          ))
        )}
      </div>
      <div style={{ borderTop: '1px solid #eee', textAlign: 'right', padding: 8 }}>
        <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default NotificationPopup; 