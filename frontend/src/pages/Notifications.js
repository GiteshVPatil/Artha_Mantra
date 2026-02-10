import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'trade',
      title: 'Trade Executed Successfully',
      message: 'Your BUY order for 10 shares of AAPL has been executed at $227.70',
      time: '2 minutes ago',
      read: false,
      icon: '✅'
    },
    {
      id: 2,
      type: 'alert',
      title: 'Price Alert',
      message: 'TSLA has reached your target price of $250.00',
      time: '1 hour ago',
      read: false,
      icon: '🔔'
    },
    {
      id: 3,
      type: 'portfolio',
      title: 'Portfolio Update',
      message: 'Your portfolio gained +$1,247.30 today (+0.98%)',
      time: '3 hours ago',
      read: true,
      icon: '📈'
    },
    {
      id: 4,
      type: 'news',
      title: 'Market News',
      message: 'Apple announces new quarterly earnings results',
      time: '1 day ago',
      read: true,
      icon: '📰'
    }
  ]);

  const [filter, setFilter] = useState('all');

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'trades') return notif.type === 'trade';
    if (filter === 'alerts') return notif.type === 'alert';
    return true;
  });

  const containerStyle = {
    padding: '30px 20px',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  };

  const titleStyle = {
    fontSize: '2.5rem',
    color: '#202124',
    margin: 0
  };

  const filterStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px'
  };

  const filterButtonStyle = {
    padding: '8px 16px',
    border: '1px solid #dadce0',
    borderRadius: '20px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s'
  };

  const activeFilterStyle = {
    ...filterButtonStyle,
    backgroundColor: '#1a73e8',
    color: 'white',
    borderColor: '#1a73e8'
  };

  const notificationStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    border: '1px solid #f1f3f4',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const unreadNotificationStyle = {
    ...notificationStyle,
    borderLeft: '4px solid #1a73e8',
    backgroundColor: '#f8f9ff'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🔔 Notifications</h1>
        <button
          onClick={markAllAsRead}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Mark All Read
        </button>
      </div>

      <div style={filterStyle}>
        {['all', 'unread', 'trades', 'alerts'].map(filterType => (
          <button
            key={filterType}
            style={filter === filterType ? activeFilterStyle : filterButtonStyle}
            onClick={() => setFilter(filterType)}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              style={notification.read ? notificationStyle : unreadNotificationStyle}
              onClick={() => markAsRead(notification.id)}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '15px' }}>
                <div style={{ fontSize: '24px' }}>{notification.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                      {notification.title}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#5f6368' }}>
                      {notification.time}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0 0', color: '#5f6368', fontSize: '14px' }}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px',
            color: '#5f6368'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔕</div>
            <h3>No notifications found</h3>
            <p>You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
