"use client";

import { useState, useRef, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { isAgentOrAdmin } from "../constants/roles";

// N8N Chatbot URL - should be configured via environment variable
const N8N_CHATBOT_URL =
  process.env.REACT_APP_N8N_CHATBOT_URL || "http://localhost:5678/webhook/chat";

const initialMessages = [
  {
    id: "m-0",
    text: "Hi! How can I help you today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

// 🔹 Function to generate or get persistent sessionId
const getSessionId = () => {
  if (typeof window === "undefined") return null;

  let sessionId = localStorage.getItem("chat_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("chat_session_id", sessionId);
  }
  return sessionId;
};

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowChatbot, setShouldShowChatbot] = useState(true);

  // Ref to automatically scroll to the bottom of the chat window
  const messagesEndRef = useRef(null);

  // Ref to store sessionId
  const sessionIdRef = useRef(null);

  // Check if user is agent or admin - hide chatbot if they are
  useEffect(() => {
    const checkUserRole = () => {
      try {
        const token = localStorage.getItem("token");

        // If no token, show chatbot (for guests/regular users)
        if (!token) {
          setShouldShowChatbot(true);
          return;
        }

        // Try to get roles from JWT token
        try {
          const decodedToken = jwtDecode(token);
          const userRoles = decodedToken.roles || [];

          // Hide chatbot if user is agent or admin
          if (isAgentOrAdmin(userRoles)) {
            setShouldShowChatbot(false);
            return;
          }
        } catch (decodeError) {
          // If JWT decode fails, try localStorage user data
          const userData = localStorage.getItem("user");
          if (userData) {
            try {
              const user = JSON.parse(userData);
              // Check if user has roles in localStorage
              if (user.roles && isAgentOrAdmin(user.roles)) {
                setShouldShowChatbot(false);
                return;
              }
              // Also check isAdmin flag (legacy support)
              if (user.isAdmin || user.isAgent) {
                setShouldShowChatbot(false);
                return;
              }
            } catch (parseError) {
              console.error("Error parsing user data:", parseError);
            }
          }
        }

        // If we get here, user is a regular user - show chatbot
        setShouldShowChatbot(true);
      } catch (error) {
        console.error("Error checking user role:", error);
        // On error, default to showing chatbot
        setShouldShowChatbot(true);
      }
    };

    checkUserRole();

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        checkUserRole();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (e.g., when user logs in/out in same tab)
    const handleAuthChange = () => {
      checkUserRole();
    };

    window.addEventListener("user-login", handleAuthChange);
    window.addEventListener("user-logout", handleAuthChange);

    // Fallback: Check periodically (every 10 seconds) in case events aren't fired
    // This ensures the chatbot visibility updates even if auth happens without events
    const intervalId = setInterval(checkUserRole, 10000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-login", handleAuthChange);
      window.removeEventListener("user-logout", handleAuthChange);
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  // Effect to scroll to bottom whenever messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Don't render chatbot if user is agent or admin
  if (!shouldShowChatbot) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userMessage = userInput.trim();
    if (!userMessage) return;

    // Add user message to state
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: Date.now(),
        text: userMessage,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    setUserInput("");
    setIsLoading(true);

    // Add 'thinking' placeholder
    const thinkingMessage = {
      text: "Thinking...",
      sender: "bot",
      id: Date.now() + 1,
      isLoading: true,
    };
    setMessages((prevMessages) => [...prevMessages, thinkingMessage]);

    try {
      const response = await fetch(N8N_CHATBOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      // n8n response received successfully
      const botReply = data.output;

      // Remove 'thinking' message and add real reply
      setMessages((prevMessages) => {
        const newMessages = prevMessages.filter(
          (msg) => msg.id !== thinkingMessage.id
        );
        return [
          ...newMessages,
          {
            id: Date.now() + 2,
            text: botReply,
            sender: "bot",
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      console.error("Error communicating with n8n:", error);
      setMessages((prevMessages) => {
        const newMessages = prevMessages.filter(
          (msg) => msg.id !== thinkingMessage.id
        );
        return [
          ...newMessages,
          {
            id: Date.now() + 3,
            text: "Sorry, connection error.",
            sender: "bot",
            error: true,
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat toggle button */}
      <div className="fixed bottom-6 right-6 z-[999999]">
        <button
          onClick={() => setOpen((s) => !s)}
          aria-label={open ? "Close chat" : "Open chat"}
          className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-xl hover:scale-110 active:scale-95"
        >
          {open ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.66 0-3.22-.332-4.5-.92L3 21l1.92-4.5C4.332 14.22 4 12.66 4 11c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 w-96 max-h-[500px] max-w-[330px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 transform z-[999998] ${
          open
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="px-4 py-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-sm font-bold">
              ✈
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">
                TripLink
              </div>
              <div className="text-xs opacity-90">Your travel companion</div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/80 hover:text-white/100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9.293l4.146-4.147a1 1 0 111.414 1.414L11.414 10.707l4.146 4.146a1 1 0 01-1.414 1.414L10 12.121l-4.146 4.146a1 1 0 01-1.414-1.414L8.586 10.707 4.44 6.56A1 1 0 115.854 5.146L10 9.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="p-4 flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl transition-all ${
                  msg.sender === "user"
                    ? "bg-indigo-500 text-white rounded-br-none shadow-sm"
                    : msg.error
                    ? "bg-red-50 text-red-900 rounded-bl-none border border-red-200"
                    : msg.isLoading
                    ? "bg-slate-100 text-slate-600 rounded-bl-none"
                    : "bg-slate-100 text-slate-900 rounded-bl-none"
                }`}
              >
                <div
                  className={`text-sm ${
                    msg.sender === "user" ? "text-white" : "text-slate-500"
                  } text-xs mb-0.5 opacity-70`}
                >
                  {msg.sender === "user" ? "You" : "TripLink"}
                </div>
                <div
                  className={`text-sm leading-relaxed ${
                    msg.isLoading ? "flex items-center gap-1" : ""
                  }`}
                >
                  {msg.isLoading ? (
                    <>
                      <span className="inline-block w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                      <span
                        className="inline-block w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                      <span
                        className="inline-block w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></span>
                    </>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-slate-200 bg-white"
        >
          <div className="flex gap-2">
            <input
              className="flex-1 px-4 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all placeholder-slate-400"
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about destinations..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-sm hover:shadow-md active:scale-95"
            >
              {isLoading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default Chatbot;
