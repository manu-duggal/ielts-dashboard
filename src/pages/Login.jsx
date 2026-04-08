import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Invalid credentials");
      return;
    }

    setUser(data.user);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: isMobile ? "flex-start" : "center",
        alignItems: "center",
        paddingTop: isMobile ? 60 : 0,
        paddingLeft: 15,
        paddingRight: 15,
        background: "linear-gradient(135deg, #667eea, #764ba2)",
      }}
    >

      {/* BRAND */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 25 : 30 }}>
        <h1
          style={{
            color: "#fff",
            fontSize: isMobile ? 32 : 40,
            margin: 0,
            letterSpacing: 1,
          }}
        >
          LeadFlow
        </h1>

        <p
          style={{
            color: "#e0e0e0",
            marginTop: 5,
            fontSize: isMobile ? 13 : 14,
          }}
        >
          Smart Lead Management System
        </p>
      </div>

      {/* LOGIN CARD */}
      <div
        style={{
          background: "#fff",
          padding: isMobile ? 20 : 40,
          borderRadius: 12,
          width: isMobile ? "100%" : 340,
          maxWidth: 340,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        }}
      >

        <h3 style={{ marginBottom: 20, textAlign: "center" }}>
          Sign in to your dashboard
        </h3>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: isMobile ? 12 : 10,
            fontSize: isMobile ? 16 : 14,
            marginBottom: 15,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: isMobile ? 12 : 10,
            fontSize: isMobile ? 16 : 14,
            marginBottom: 20,
            borderRadius: 6,
            border: "1px solid #ccc",
          }}
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: isMobile ? "12px" : "10px",
            fontSize: isMobile ? 15 : 14,
            background: "#667eea",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Login
        </button>

      </div>
    </div>
  );
}