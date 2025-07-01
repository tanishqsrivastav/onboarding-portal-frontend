import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { useDispatch } from "react-redux";
import { login } from "../redux/slices/userSlice";

import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post("https://localhost:7264/Onboarding/login", {
        username: formData.username,
        password: formData.password,
      });

      if (res.status === 200 && res.data.token) {
        const decoded = jwtDecode(res.data.token);

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("employeeId", decoded.userId);
        localStorage.setItem("role", res.data.role); 

        dispatch(login(formData.username));
        navigate("/HRDashboard");
      } else {
        setErrorMessage("Login failed.");
      }
    } catch (err) {
      setErrorMessage("Invalid username or password.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            name="username"
            placeholder="Username"
            required
            className="input-field"
            onChange={handleChange}
            value={formData.username}
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              className="input-field"
              onChange={handleChange}
              value={formData.password}
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
}

export default Login;
