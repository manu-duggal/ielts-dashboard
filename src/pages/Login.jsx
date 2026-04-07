import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
      }}
    >

      {/* BRAND OUTSIDE */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <h1
          style={{
            color: "#fff",
            fontSize: 40,
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
            fontSize: 14,
          }}
        >
          Smart Lead Management System
        </p>
      </div>

      {/* LOGIN CARD */}
      <div
        style={{
          background: "#fff",
          padding: 40,
          borderRadius: 12,
          width: 340,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)", // subtle effect
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
            padding: 10,
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
            padding: 10,
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
            padding: 10,
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