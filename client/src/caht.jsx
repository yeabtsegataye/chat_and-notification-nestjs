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
  const [hoveredIcons, setHoveredIcons] = useState([]);
  const chatBoxRef = useRef(null); // Ref for the chat box element

  const handleMouseEnter = (index) => {
    setHoveredIcons((prevIcons) => {
      const newIcons = [...prevIcons];
      newIcons[index] = true;
      return newIcons;
    });
  };
  /////////////////
  const handleMouseLeave = (index) => {
    setHoveredIcons((prevIcons) => {
      const newIcons = [...prevIcons];
      newIcons[index] = false;
      return newIcons;
    });
  };
  //////////////
  useEffect(() => {
    socket = io("http://localhost:3000/", {
      extraHeaders: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    getnotif();

    // Add event listener for 'message' event only if it's not already added
    socket.on("message", (message) => {
      console.log(message, "ebent");
      setMessages((prevMessages) => [...prevMessages, message]);
      // Scroll the chat box to the bottom
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    });
    socket.on("Gnotification", (data) => {
      setNotification((prevNotifications) => [...prevNotifications, data]);
      setNotificationCount((prevCount) => {
        const newCount = prevCount + 1;
        return newCount;
      });
    });

    return () => {
      socket.off("Gnotification");
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
      // console.log(get_notif.data, " get");
      // console.log(get_notif.data.length, "length")
      setNotificationCount(get_notif.data.length);
      setNotification(get_notif.data);
      // console.log(notification, "notification");
    } catch (error) {
      console.log(error, "errossss");
    }
  };
  ///////////////
  const handleUserClick = async (user) => {
    // console.log(user, "11");
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
      console.log(msg.data, "fetched");
      setMessages(msg.data);
    } catch (error) {
      console.log("error while sending message", error);
    }
  };
  //////////////
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
      // const data = msg.data;
      // socket.emit("sendMessage", { roomId, message: data });
      setMessage("");
      const notif = await axios.post("http://localhost:3000/notification/add", {
        message,
        sender: token.id,
        receiver: selectedUser.id,
      });
      // console.log(notif.data, "add, notif");
      socket.emit("notification", { message: notif.data });
    } catch (error) {
      console.log("error while sending message", error);
    }
  };
  /////////////////////
  const handle_delete = async (id) => {
    const Dnotif = await axios.delete(
      `http://localhost:3000/notification/${id}`
    );
    if (Dnotif) {
      const N = notification.filter((item) => id !== item.id);
      setNotification(N);
    }
  };
  ////////////////////
  const handle_goTo_notif = async (user) => {
    // console.log(user, "uses");
    // console.log(users, "exist user");
    const find_user = users.filter((index) => index.id === user.N_sender);
    // console.log(find_user[0], "find user");
    handleUserClick(find_user[0]);
  };
  ////////////////
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
              <div className="dropdown">
                <a
                  className="dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={() => setNotificationCount("")}
                >
                  <a href="" className="text-dark d-flex align-items-center">
                    <i className="fa-solid fa-bell mr-2"></i>
                    <span className="badge rounded-pill badge-notification bg-danger">
                      {notificationCount}
                    </span>
                  </a>
                </a>
                <ul className="dropdown-menu">
                  {notification &&
                    notification.map((notif, index) => (
                      <li
                        key={notif.id}
                        onClick={() => handle_goTo_notif(notif)}
                      >
                        <a className="dropdown-item d-flex justify-content-between align-items-center">
                          <span>new {notif.message}</span>
                          <i
                            className="fa-solid fa-xmark delete-icon"
                            style={{
                              color: hoveredIcons[index] ? "red" : "black",
                            }}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={() => handleMouseLeave(index)}
                            onClick={() => handle_delete(notif.id)}
                          ></i>
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
  <div
    className="card"
    style={{
      maxHeight: "60vh",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    }}
    ref={chatBoxRef}
  >
    <div className="card-header">Chat</div>
    <div className="card-body chat-box" style={{ flex: "1", overflowY: "auto" }}>
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
