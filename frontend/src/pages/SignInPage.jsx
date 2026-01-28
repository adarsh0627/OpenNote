import React, { useState } from "react";
import { Link } from "react-router-dom";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signInHandler = (e) => {
    e.preventDefault();

    console.log({
      email,
      password,
    });

    // reset only on successful login (mock for now)
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md border border-dashed rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">
          Welcome Back
        </h1>

        <form onSubmit={signInHandler} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-gray-700 font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-700 font-medium">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold py-2 rounded-lg mt-2"
          >
            Sign In
          </button>

          <p className="text-sm text-gray-600 text-center mt-2">
            Don’t have an account?{" "}
            <Link
              to="/sign-up"
              className="text-indigo-600 hover:underline font-medium"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
