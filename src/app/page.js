"use client";
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      alert("Invalid username or password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        
        {/* Logo / Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-red-800">Nyama System 🥩</h1>
          <p className="text-gray-500 text-sm mt-1">
            Meat Sales & Payment Tracking
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 bg-white
                        focus:border-red-700 focus:ring-2 focus:ring-red-200 outline-none"
              placeholder="Enter username"
              onChange={(e) => setUsername(e.target.value)}
            />

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
           <input
              type="password"
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 bg-white
                        focus:border-red-700 focus:ring-2 focus:ring-red-200 outline-none"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />

          </div>

          <button
            disabled={loading}
            className="w-full bg-red-800 hover:bg-red-700 text-white
                       font-semibold py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Nyama System
        </p>
      </div>
    </div>
  );
}
