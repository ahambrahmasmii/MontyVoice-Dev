// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import Login from "./components/login-signup/Login.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import { setUser, clearUser } from './store/userSlice.js';
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { isLoggedIn, user_email } = useSelector((state) => state.user);

  useEffect(() => {
    // Check if user is logged in on component mount
    const storedUserId = localStorage.getItem("user_id");
    const storedUserEmail = localStorage.getItem("user_email");
    const storedToken = localStorage.getItem("token");
    if (storedUserId && storedUserEmail && storedToken) {
      dispatch(setUser({
        user_id: storedUserId,
        user_email: storedUserEmail,
        usertoken: storedToken,
      }));
    }
  }, [dispatch]);

  const handleLogin = (id, email, token) => {
    dispatch(setUser({
      user_id: id,
      user_email: email,
      usertoken: token,
    }));

    localStorage.setItem("user_id", id);
    localStorage.setItem("user_email", email);
    localStorage.setItem("token", token);
  };

  const handleLogout = () => {
    dispatch(clearUser());
    
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_email");
    localStorage.removeItem("token");
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Dashboard onLogout={handleLogout} />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;