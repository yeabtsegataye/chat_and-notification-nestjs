// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route,  } from 'react-router-dom';
import Login from './login';
import Chat from './caht';

function App() {
  // const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <Router>
      <Routes>
        {/* Route for the login page */}
        <Route path="/login" element={<Login/>} />

        {/* Protected route for the main application */}
        <Route path="/" element={<Chat/>} />
      </Routes>
    </Router>
  );
}

export default App;
