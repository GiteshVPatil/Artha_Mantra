import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  const containerStyle = {
    padding: '30px 20px',
    maxWidth: '800px',
    margin: '0 auto'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    marginBottom: '40px',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
  };

  const avatarStyle = {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#1a73e8',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px'
  };

  const cardTitleStyle = {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#202124',
    marginBottom: '20px'
  };

  const fieldStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f1f3f4'
  };

  const labelStyle = {
    fontWeight: '500',
    color: '#5f6368'
  };

  const valueStyle = {
    color: '#202124'
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={avatarStyle}>
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '5px', color: '#202124' }}>
            {user?.firstName} {user?.lastName}
          </h1>
          <p style={{ color: '#5f6368', fontSize: '1.1rem', marginBottom: '5px' }}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </p>
          <p style={{ color: '#5f6368' }}>{user?.email}</p>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>Profile Information</h3>

        <div style={fieldStyle}>
          <span style={labelStyle}>First Name</span>
          <span style={valueStyle}>{user?.firstName}</span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>Last Name</span>
          <span style={valueStyle}>{user?.lastName}</span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>Email</span>
          <span style={valueStyle}>{user?.email}</span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>Role</span>
          <span style={valueStyle}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>Member Since</span>
          <span style={valueStyle}>
            {user?.statistics?.joinedDate ? 
              new Date(user.statistics.joinedDate).toLocaleDateString() : 
              'Recently'
            }
          </span>
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={cardTitleStyle}>Trading Statistics</h3>

        <div style={fieldStyle}>
          <span style={labelStyle}>Total Trades</span>
          <span style={valueStyle}>{user?.statistics?.totalTrades || 0}</span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>Successful Trades</span>
          <span style={valueStyle}>{user?.statistics?.successfulTrades || 0}</span>
        </div>

        <div style={fieldStyle}>
          <span style={labelStyle}>Total Profit/Loss</span>
          <span style={{
            ...valueStyle,
            color: (user?.statistics?.totalProfit || 0) >= 0 ? '#137333' : '#d93025',
            fontWeight: '600'
          }}>
            ${(user?.statistics?.totalProfit || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Profile;
