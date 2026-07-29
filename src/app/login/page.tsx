"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordHash, setPasswordHash] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields!");
      return;
    }

    if (!validateEmail(email)) {
      alert("Please enter a valid email address!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long!");
      return;
    }

    setLoading(true);
    try {
      // Store password temporarily in state (will be sent with OTP verification)
      setPasswordHash(password);

      // Send OTP
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to send verification code");
        setPasswordHash("");
        return;
      }

      setIsOtpStep(true);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
      setPasswordHash("");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit code!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code: otp,
          name,
          password: passwordHash,
          job: "",
          annualWage: 0,
          businessName: "",
          selectedBanks: [],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to verify code");
        return;
      }

      // Clear signup state and go to onboarding
      setIsOtpStep(false);
      setIsSignUp(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setOtp("");
      router.push("/onboarding");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    if (email && password) {
      // For now, just navigate to dashboard
      // Later this will verify credentials
      router.push("/");
    } else {
      alert("Please enter email and password!");
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    if (newDarkMode) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#0f172a" : "#dbeafe"
      }}
    >
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-6 right-6 p-3 rounded-full transition transform hover:scale-110"
        style={{
          backgroundColor: isDark ? "#1e293b" : "#cbd5e1"
        }}
        title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? "☀️" : "🌙"}
      </button>

      <div className="w-full max-w-4xl">
        {/* Header */}
        <div
          className="text-center py-8 px-6 rounded-t-2xl shadow-lg transition-colors duration-300 mb-0"
          style={{
            backgroundColor: isDark ? "#0f172a" : "#dbeafe"
          }}
        >
          <h1
            className="text-6xl font-black tracking-tight"
            style={{
              color: isDark ? "#3b82f6" : "#2563eb"
            }}
          >
            Katalyst Finances
          </h1>
        </div>

        {/* Main Login Card */}
        <div
          className="flex rounded-b-2xl shadow-2xl overflow-hidden transition-colors duration-300"
          style={{
            backgroundColor: isDark ? "#1e293b" : "#ffffff"
          }}
        >
          {/* Left Side - Sign In/Up Form */}
          <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center text-center">
            <h1
              className="text-5xl font-black mb-3 tracking-tight"
              style={{
                color: isDark ? "#ffffff" : "#0f172a"
              }}
            >
              {isOtpStep ? "VERIFY\nEMAIL" : isSignUp ? "CREATE\nACCOUNT" : "SIGN\nIN"}
            </h1>
            <p
              className="mb-12 text-sm"
              style={{
                color: isDark ? "#cbd5e1" : "#475569"
              }}
            >
              {isOtpStep ? `We sent a code to ${email}` : isSignUp ? "or use your email for registration" : "or use your account"}
            </p>

            {/* OTP Verification Form */}
            {isOtpStep ? (
              <>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-4 mb-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base transition-colors duration-300 text-center text-2xl letter-spacing tracking-widest"
                  style={{
                    backgroundColor: isDark ? "#334155" : "#f1f5f9",
                    color: isDark ? "#ffffff" : "#0f172a",
                    fontFamily: "monospace",
                    fontWeight: "bold"
                  }}
                />
                <p
                  className="text-xs mb-6"
                  style={{
                    color: isDark ? "#cbd5e1" : "#475569"
                  }}
                >
                  Didn't receive the code? Check your spam folder.
                </p>
              </>
            ) : (
              <>
                {/* Name Input - Sign Up Only */}
                {isSignUp && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-4 mb-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base transition-colors duration-300"
                    style={{
                      backgroundColor: isDark ? "#334155" : "#f1f5f9",
                      color: isDark ? "#ffffff" : "#0f172a"
                    }}
                  />
                )}

                {/* Email Input */}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 mb-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base transition-colors duration-300"
                  style={{
                    backgroundColor: isDark ? "#334155" : "#f1f5f9",
                    color: isDark ? "#ffffff" : "#0f172a"
                  }}
                />

                {/* Password Input */}
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 mb-4 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base transition-colors duration-300"
                  style={{
                    backgroundColor: isDark ? "#334155" : "#f1f5f9",
                    color: isDark ? "#ffffff" : "#0f172a"
                  }}
                />

                {/* Confirm Password - Sign Up Only */}
                {isSignUp && (
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-4 mb-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-base transition-colors duration-300"
                    style={{
                      backgroundColor: isDark ? "#334155" : "#f1f5f9",
                      color: isDark ? "#ffffff" : "#0f172a"
                    }}
                  />
                )}

                {!isSignUp && (
                  <button
                    className="text-right text-sm mb-8 transition font-medium hover:opacity-80"
                    style={{
                      color: isDark ? "#cbd5e1" : "#475569"
                    }}
                  >
                    Forgot your password?
                  </button>
                )}
              </>
            )}

            {/* Sign In/Up or Verify OTP Button - BOLD & PROMINENT */}
            <button
              onClick={isOtpStep ? handleOtpSubmit : isSignUp ? handleSignUp : handleSignIn}
              disabled={loading}
              className="w-full text-white font-black py-4 px-6 rounded-full text-lg transition mb-6 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isDark ? "#1e40af" : "#2563eb"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = isDark ? "#1e3a8a" : "#1d4ed8";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = isDark ? "#1e40af" : "#2563eb";
                }
              }}
            >
              {loading ? "Loading..." : isOtpStep ? "VERIFY CODE" : isSignUp ? "SIGN UP" : "SIGN IN"}
            </button>

            {/* Back Button or Toggle */}
            <div
              className="text-center text-sm"
              style={{
                color: isDark ? "#cbd5e1" : "#475569"
              }}
            >
              {isOtpStep ? (
                <button
                  onClick={() => {
                    setIsOtpStep(false);
                    setOtp("");
                  }}
                  className="font-bold hover:opacity-80 transition"
                  style={{
                    color: isDark ? "#3b82f6" : "#2563eb"
                  }}
                >
                  Back to sign up
                </button>
              ) : (
                <>
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="font-bold hover:opacity-80 transition"
                    style={{
                      color: isDark ? "#3b82f6" : "#2563eb"
                    }}
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Welcome Message */}
          <div
            className="hidden md:flex w-1/2 flex-col items-center justify-center p-12 text-white text-center transition-colors duration-300"
            style={{
              backgroundColor: isDark ? "#1e3a8a" : "#2563eb"
            }}
          >
            <h2 className="text-5xl font-black mb-4">
              {isOtpStep ? "Check Your Email" : isSignUp ? "Welcome!" : "Hello, Friend!"}
            </h2>
            <p
              className="text-lg mb-8"
              style={{
                color: isDark ? "#dbeafe" : "#dbeafe"
              }}
            >
              {isOtpStep
                ? "We sent a verification code to your email. Enter it below to verify your account."
                : isSignUp
                ? "Join us today and start managing your finances together"
                : "Enter your personal details and start your financial journey with us"}
            </p>
            {!isOtpStep && (
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="border-4 border-white text-white font-black py-3 px-12 rounded-full text-lg transition transform hover:scale-105 active:scale-95"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.color = isDark ? "#1e3a8a" : "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "white";
                }}
              >
                {isSignUp ? "SIGN IN" : "SIGN UP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
