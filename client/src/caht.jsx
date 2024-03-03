import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
var socket;
const token = JSON.parse(localStorage.getItem("access_token"));

function Chat() {
  const { access_token } = token;

  const [roomId, setRoomId] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [notification, setNotification] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0); // Initial notification count
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility
  const dropdownRef = useRef(null); // Ref for the dropdown element

  useEffect(() => {
    socket = io("http://localhost:3000/", {
      extraHeaders: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    getnotif();

    // Add event listener for 'message' event only if it's not already added
    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      // socket.off("notification");
      socket.off("message");
    };
  }, []);
  //////////////
  const getnotif = async () => {
    try {
      const get_notif = await axios.post(
        "http://localhost:3000/notification/get",
        {
          id: token.id,
        }
      );
      console.log(get_notif.data, " get");
      // console.log(get_notif.data.length, "length")
      setNotificationCount(get_notif.data.length);
      setNotification((prevNotif) => [...prevNotif, get_notif.data]);
    } catch (error) {
      console.log(error, "errossss");
    }
  };
  /////////////////
  useEffect(() => {
    socket.on("Gnotification", (data) => {
      console.log(data, "the data");
      setNotification((prevNotifications) => [...prevNotifications, data]);
    });
  }, []);
  ///////////////
  const handleUserClick = async (user) => {
    setSelectedUser(user);
    try {
      const response = await axios.post("http://localhost:3000/chat", {
        sender: token.id,
        receiver: user.id,
      });
      const c_id = response.data.id;
      setRoomId(c_id);
      socket.emit("joinRoom", c_id);
    } catch (error) {
      console.error("Error creating chat room:", error);
    }
    try {
      // console.log(message, token.id ,selectedUser.id)
      const msg = await axios.post("http://localhost:3000/message/get", {
        sender: token.id,
        receiver: user.id,
      });
      setMessages(msg.data);
    } catch (error) {
      console.log("error while sending message", error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get("http://localhost:3000/user/", {
        params: {
          query: searchQuery,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  ////////////
  const handleNotificationClick = () => {
    // Reset notification count when clicked
    setNotificationCount(0);
    // Toggle dropdown visibility
    setShowDropdown(!showDropdown);
  };
  ////////////
  useEffect(() => {
    // Attach click event listener to the document
    document.addEventListener("click", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  /////////
  const handleClickOutside = (event) => {
    // Close dropdown when clicking outside
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  };
  ///////////
  const handleSendMessage = async () => {
    if (!selectedUser) return; // Check if a user is selected

    try {
      // console.log(message, token.id ,selectedUser.id)
      const msg = await axios.post("http://localhost:3000/message/add", {
        message,
        sender: token.id,
        receiver: selectedUser.id,
      });
      const data = msg.data;
      socket.emit("sendMessage", { roomId, message: data });
      setMessage("");
      const notif = await axios.post("http://localhost:3000/notification/add", {
        message,
        sender: token.id,
        receiver: selectedUser.id,
      });
      console.log(notif.data, "add, notif");
      socket.emit("notification", { message: notif.data });
    } catch (error) {
      console.log("error while sending message", error);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div
          className="col-md-4"
          style={{ maxHeight: "80vh", overflowY: "auto" }}
        >
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>{token.id}</span>
              {/* Notification button */}
              <div className="dropdown d-inline-block">
                <button
                  className="btn btn-link"
                  id="notification-tab"
                  onClick={handleNotificationClick}
                >
                  {/* Notification icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    className="bi bi-bell"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 16a1.5 1.5 0 0 0 1.5-1.5h-3A1.5 1.5 0 0 0 8 16z" />
                    <path
                      fillRule="evenodd"
                      d="M8 1.5A2.5 2.5 0 0 0 5.5 4V5H3.495a.5.5 0 0 0-.36.843l1.935 1.89v5.428a1 1 0 0 0 1 1h3.13a2.501 2.501 0 0 0 4.75 0h3.131a1 1 0 0 0 1-1V7.733l1.935-1.89a.5.5 0 0 0-.36-.843H13V4a2.5 2.5 0 0 0-2.5-2.5h-3zm.5 11.5a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-5.142L1.698 5.152A.5.5 0 0 1 2.06 4h11.88a.5.5 0 0 1 .362.152L8.5 8.857v5.143z"
                    />
                  </svg>
                  {/* Notification count */}
                  {notificationCount > 0 && (
                    <span className="badge bg-danger">{notificationCount}</span>
                  )}
                </button>
                <ul
                  className={`dropdown-menu dropdown-menu-end ${
                    showDropdown ? "show" : ""
                  }`}
                  aria-labelledby="notification-tab"
                  ref={dropdownRef}
                >
                  {notification.map((notif) => (
                    <li key={notif.id}>
                      <a className="dropdown-item" href="#">
                        {notif.message}
                      </a>
                    </li>
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
                    className={`list-group-item ${
                      selectedUser && selectedUser.id === user.id
                        ? "active"
                        : ""
                    }`}
                    key={index}
                    onClick={() => handleUserClick(user)}
                  >
                    {user.email}
                  </li>
                ))}
              </ul>
              {selectedUser === null && (
                <p className="text-center mt-3">Select a user</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-8">
          {/* Right Side - Chat Box */}
          <div className="card">
            <div className="card-header">Chat</div>
            <div
              className="card-body chat-box"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
            >
              {/* Display messages */}
              {messages.map((msg) => (
                <div
                  className="message"
                  key={msg.id}
                  style={{
                    textAlign: msg.sender === token.id ? "right" : "left",
                    color: msg.sender === token.id ? "blue" : "green",
                  }}
                >
                  <p>{msg.message}</p>
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
