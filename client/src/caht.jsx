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
              <div class="dropdown">
                <a
                  class=" dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={() => setNotificationCount(0)}
                >
                  <a href="" class="text-dark">
                    <i class="fa-solid fa-bell"></i>
                    <span class="badge rounded-pill badge-notification bg-danger">
                      {notificationCount}
                    </span>
                  </a>
                </a>
                <ul class="dropdown-menu">
                  {notification &&
                    notification.map((notif) => (
                      <li key={notif.id}>
                        <a class="dropdown-item" href="#">
                          new {notif.message}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
              {/* notifiaction end */}
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
