import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

var socket;

function Chat() {
  const token = localStorage.getItem('access_token');
  const { access_token } = JSON.parse(token);

  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [notification, setNotification] = useState([]);
  const [notificationCount, setNotificationCount] = useState(2); // Initial notification count
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
  const dropdownRef = useRef(null); // Ref for the dropdown element

  useEffect(() => {
    socket = io('http://localhost:3000/', {
      extraHeaders: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  
    socket.on('notification', (data)=>{
      setNotification([data])
      setNotificationCount(data.length); // Update notification count dynamically
    });
  
    socket.on('sendMessage', (message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    console.log(user.id, "user id")
    try {
      const tokens = JSON.parse(localStorage.getItem('access_token'));
      console.log(tokens.id,"token id")
      const response = await axios.post('http://localhost:3000/chat', {
        sender: tokens.id,
        receiver: user.id,
      });
           console.log(response)

      const c_id = response.data.id;
      socket.emit('joinRoom', c_id);
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:3000/user/', {
        params: {
          query: searchQuery,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleNotificationClick = () => {
    // Reset notification count when clicked
    setNotificationCount(0);
    // Toggle dropdown visibility
    setShowDropdown(!showDropdown);
  };

  const handleSendMessage = () => {
    if (!selectedUser) return; // Check if a user is selected
    socket.emit('sendMessage', { userId: selectedUser.id, message });
    setMessage('');
  };

  const handleClickOutside = (event) => {
    // Close dropdown when clicking outside
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    // Attach click event listener to the document
    document.addEventListener('click', handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Users</span>
              {/* Notification button */}
              <div className="dropdown">
                <button className="btn btn-link" id="notification-tab" onClick={handleNotificationClick}>
                  {/* Notification icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-bell" viewBox="0 0 16 16">
                    <path d="M8 16a1.5 1.5 0 0 0 1.5-1.5h-3A1.5 1.5 0 0 0 8 16z"/>
                    <path fillRule="evenodd" d="M8 1.5A2.5 2.5 0 0 0 5.5 4V5H3.495a.5.5 0 0 0-.36.843l1.935 1.89v5.428a1 1 0 0 0 1 1h3.13a2.501 2.501 0 0 0 4.75 0h3.131a1 1 0 0 0 1-1V7.733l1.935-1.89a.5.5 0 0 0-.36-.843H13V4a2.5 2.5 0 0 0-2.5-2.5h-3zm.5 11.5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-5.142L1.698 5.152A.5.5 0 0 1 2.06 4h11.88a.5.5 0 0 1 .362.152L8.5 8.857v5.143z"/>
                  </svg>
                  {/* Notification count */}
                  {notificationCount > 0 && <span className="badge bg-danger">{notificationCount}</span>}
                </button>
                <ul className={`dropdown-menu dropdown-menu-end ${showDropdown ? 'show' : ''}`} aria-labelledby="notification-tab" ref={dropdownRef}>
                  {notification && notification.map((n, index) => (
                    <li key={index}><a className="dropdown-item" href="#">{n}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="card-body">
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
              <ul className="list-group">
                {users.map((user, index) => (
                  <li
                    className={`list-group-item ${selectedUser && selectedUser.id === user.id ? 'active' : ''}`}
                    key={index}
                    onClick={() => handleUserClick(user)}
                  >
                    {user.email}
                  </li>
                ))}
              </ul>
              {selectedUser === null && <p className="text-center mt-3">Select a user</p>}
            </div>
          </div>
        </div>
        <div className="col-md-8">
          {/* Right Side - Chat Box */}
          <div className="card">
            <div className="card-header">Chat</div>
            <div className="card-body chat-box" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {/* Display messages */}
              {messages.map((msg, index) => (
                <div className="message" key={index}>
                  <p>{msg}</p>
                </div>
              ))}
            </div>
            {/* Input field for sending messages */}
            {selectedUser && (
              <div className="card-footer">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    aria-label="Type your message"
                    aria-describedby="button-addon2"
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    id="button-addon2"
                    onClick={handleSendMessage}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
