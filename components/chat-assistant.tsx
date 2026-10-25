import React, { useEffect, useRef, useState } from "react";
import { TranslateTree } from "../i18n";
import {
  ArrowUp,
  Bot,
  HelpCircle,
  MessageCircle,
  RefreshCw,
  X,
} from "lucide-react";
export const SUGGESTED_QUESTIONS = [
  "Why did my risk level change?",
  "What information is missing?",
  "What patterns appear in my logs?",
  "Summarize my week.",
];

export interface ChatAssistantProps {
  messages: Message[];
  onSend: (question: string) => Promise<void>;
  onReset: () => Promise<void>;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function formatAssistantText(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (keyPrefix: string) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`${keyPrefix}-list`} className="chat-bullet-list">
          {currentList.map((item, idx) => (
            <li key={idx}>{renderInline(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const renderInline = (str: string) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`flush-${index}`);
      return;
    }

    if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      currentList.push(trimmed.slice(2));
    } else {
      flushList(`nonlist-${index}`);
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4 key={index} className="chat-heading">
            {renderInline(trimmed.slice(4))}
          </h4>
        );
      } else {
        elements.push(
          <p key={index} className="chat-paragraph">
            {renderInline(trimmed)}
          </p>
        );
      }
    }
  });

  flushList("final");
  return elements;
}

export function ChatAssistant(props: ChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageError, setMessageError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const welcome: Message = {
    id: "welcome",
    role: "assistant",
    content: "Hi! Ask me about the records saved in your account.",
    timestamp: "",
  };
  const messages = props.messages.length ? props.messages : [welcome];

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior, block: "end" }), 50);
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (suggestedQuestion?: string) => {
    const query = (suggestedQuestion ?? input).trim();
    if (!query || loading) return;
    setInput("");
    setMessageError("");
    setLoading(true);
    scrollToBottom("smooth");
    try {
      await props.onSend(query);
    } catch {
      setMessageError("Could not send that message. Try again.");
    } finally {
      setLoading(false);
      scrollToBottom("smooth");
    }
  };

  const handleReset = async () => {
    setMessageError("");
    try {
      await props.onReset();
    } catch {
      setMessageError("Could not clear this conversation. Try again.");
    }
  };

  const handleSampleClick = (question: string) => void handleSend(question);

  // Sample questions only appear on the initial chat prompt (no user messages yet)
  const hasUserMessages = messages.some((m) => m.role === "user");

  return (
    <TranslateTree>
    <>
      {!isOpen && <button
        type="button"
        className="chat-floating-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
        title="Chat about your data"
      >
        <MessageCircle size={22} />
      </button>}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="chat-window-backdrop" onClick={() => setIsOpen(false)}>
          <div
            className="chat-floating-window"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-window-title"
          >
            {/* Header */}
            <div className="chat-window-header">
              <div className="chat-header-title-group">
                <div className="chat-header-avatar">
                  <MessageCircle size={15} />
                </div>
                <div>
                  <h3 id="chat-window-title">Ask about your data</h3>
                </div>
              </div>

              <div className="chat-header-actions">
                <button
                  type="button"
                  className="chat-header-btn"
                  onClick={handleReset}
                  title="Reset conversation"
                  aria-label="Reset conversation"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  type="button"
                  className="chat-header-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Messages Area */}
            <div className="chat-window-messages">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`chat-message-row ${m.role === "user" ? "is-user" : "is-assistant"
                    }`}
                >
                  {m.role === "assistant" && (
                    <div className="chat-msg-avatar">
                      <Bot size={14} />
                    </div>
                  )}

                  <div className="chat-msg-bubble">
                    <div className="chat-msg-body">
                      {m.role === "assistant"
                        ? formatAssistantText(m.content)
                        : m.content}
                    </div>

                    <div className="chat-msg-meta">
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Sample Questions ONLY appear on initial chat prompt, hidden once user asks */}
              {!hasUserMessages && (
                <div className="chat-sample-section">
                  <div className="chat-sample-header">
                    <HelpCircle size={13} />
                    <span>Try asking:</span>
                  </div>
                  <div className="chat-sample-chips">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        disabled={loading}
                        className="chat-sample-chip"
                        onClick={() => handleSampleClick(q)}
                      >
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {hasUserMessages && !loading && (
                <div className="chat-followups" aria-label="Suggested follow-up questions">
                  {["Show my recent readings", "What's missing?", "Summarize my week"].map((q) => (
                    <button key={q} type="button" className="chat-followup" onClick={() => handleSampleClick(q)}>{q}</button>
                  ))}
                </div>
              )}

              {/* Loading indicator */}
              {loading && (
                <div className="chat-message-row is-assistant is-loading">
                  <div className="chat-msg-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="chat-msg-bubble loading-bubble">
                    <div className="chat-typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="chat-loading-label">
                      Checking your saved records...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              className="chat-window-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                className="chat-text-input"
                placeholder="Type your question about your logs..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="chat-send-btn"
                disabled={!input.trim() || loading}
                aria-label="Send question"
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
    </TranslateTree>
  );
}
