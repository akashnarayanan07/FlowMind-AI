/**
 * AIChat.jsx
 * Conversational AI interface for FlowMind AI.
 *
 * Features:
 *  - Multi-turn chat with Gemini conversation history
 *  - Suggested quick-action prompts
 *  - Voice input via Web Speech API
 *  - Text-to-Speech output toggle
 *  - Rich markdown rendering (bold, bullets)
 *  - Full ARIA accessibility support
 *  - Message timestamps and copy-to-clipboard
 */
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Mic, MicOff, Send, Cpu, User, Volume2, VolumeX, Copy, Check } from 'lucide-react';
import { getContextAwareGuidance } from '../../services/aiService';
import { getCurrentStadiumContext } from '../../services/dataService';
import { useVenueContext } from '../../context/VenueContext';
import { parseMarkdown } from '../../utils/formatters';
import './AIChat.css';

/** Suggested prompt chips shown at the start and when chat is empty. */
const QUICK_PROMPTS = [
  { label: '🍔 Where to eat?', text: 'Where should I eat right now?', category: 'food' },
  { label: '🚻 Best washroom?', text: 'Which washroom has the shortest queue?', category: 'washrooms' },
  { label: '🚪 Fastest exit?', text: 'What is the fastest way out?', category: 'exits' },
  { label: '📋 Full overview', text: 'Give me a full venue overview', category: null },
];

/**
 * Renders a single AI/user message bubble with rich markdown support.
 * @param {{ msg: object, onCopy: function }} props
 */
const MessageBubble = memo(({ msg, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(msg.text);
    });
  };

  /** Renders parsed markdown tokens to JSX */
  const renderContent = (text) => {
    const tokens = parseMarkdown(text);
    return tokens.map((token, i) => {
      if (token.type === 'break') return <br key={i} />;
      if (token.type === 'bullet') {
        return (
          <li key={i} className="ai-bullet">
            {token.content}
          </li>
        );
      }
      if (token.type === 'line') {
        return (
          <span key={i} className="ai-line">
            {token.parts.map((part, j) =>
              part.bold
                ? <strong key={j} className="ai-highlight">{part.text}</strong>
                : <span key={j}>{part.text}</span>
            )}
          </span>
        );
      }
      return null;
    });
  };

  const timeLabel = msg.timestamp
    ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      className={`message-wrapper ${msg.sender}`}
      role={msg.sender === 'ai' ? 'log' : undefined}
      aria-label={msg.sender === 'ai' ? 'AI response' : 'Your message'}
    >
      {msg.sender === 'ai' && (
        <div className="avatar ai" aria-hidden="true">
          <Cpu size={16} />
        </div>
      )}

      <div className="bubble-group">
        <div
          className={`message-bubble ${msg.sender}`}
          aria-live={msg.sender === 'ai' ? 'polite' : undefined}
        >
          {msg.sender === 'ai' ? (
            <ul className="ai-content-list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {renderContent(msg.text)}
            </ul>
          ) : (
            msg.text
          )}
        </div>

        {/* Timestamp + copy button for AI messages */}
        {msg.sender === 'ai' && (
          <div className="message-meta">
            {timeLabel && <span className="msg-time">{timeLabel}</span>}
            <button
              className="copy-btn"
              onClick={handleCopy}
              aria-label="Copy this response to clipboard"
              title="Copy response"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </div>

      {msg.sender === 'user' && (
        <div className="avatar user" aria-hidden="true">
          <User size={16} />
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

// ─── Main AIChat Component ────────────────────────────────────────────────────

const AIChat = () => {
  const { selectedStadium, activeCategory, setActiveCategory } = useVenueContext();

  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hi! I'm **FlowMind**, your venue assistant at **Stadium ${selectedStadium}**. Ask me where to eat, which washroom to use, or the best exit right now!`,
      timestamp: Date.now(),
    },
  ]);

  // Gemini multi-turn chat history (role/parts format)
  const [chatHistory, setChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Reset chat history when stadium changes
  useEffect(() => {
    setChatHistory([]);
    setMessages([
      {
        id: `init-${selectedStadium}`,
        sender: 'ai',
        text: `Switched to **Stadium ${selectedStadium}**! Ask me about food, washrooms, or exits here.`,
        timestamp: Date.now(),
      },
    ]);
  }, [selectedStadium]);

  /**
   * Speaks text aloud using the Web Speech API when TTS is enabled.
   * @param {string} text
   */
  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      text.replace(/\*\*/g, '') // Strip markdown for TTS
    );
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  /**
   * Sends a message to the AI and handles the response.
   * @param {string} [overrideText] - Optional pre-filled text (from quick prompts or voice)
   * @param {string|null} [categoryOverride] - Optional category to set active before querying
   */
  const handleSend = useCallback(async (overrideText, categoryOverride) => {
    const text = overrideText || input;
    if (!text.trim() || isLoading) return;

    if (!overrideText) setInput('');

    // Switch category if a quick prompt specifies one
    if (categoryOverride !== undefined) {
      setActiveCategory(categoryOverride);
    }

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Capture the current context snapshot
    const context = getCurrentStadiumContext(selectedStadium);
    const activeCat = categoryOverride !== undefined ? categoryOverride : activeCategory;

    try {
      const response = await getContextAwareGuidance(
        text,
        context,
        selectedStadium,
        activeCat,
        chatHistory
      );

      const aiMsg = { id: `a-${Date.now()}`, sender: 'ai', text: response, timestamp: Date.now() };
      setMessages(prev => [...prev, aiMsg]);

      // Append to Gemini chat history for multi-turn context
      setChatHistory(prev => [
        ...prev,
        { role: 'user', parts: [{ text }] },
        { role: 'model', parts: [{ text: response }] },
      ]);

      speak(response);
    } catch (err) {
      console.error('[AIChat] Error getting guidance:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: 'Sorry, I encountered an issue. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, selectedStadium, activeCategory, chatHistory, speak, setActiveCategory]);

  /**
   * Toggles voice input using the Web Speech API.
   */
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice Input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (event) => {
      console.warn('[AIChat] Speech error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const showQuickPrompts = messages.length <= 2;

  return (
    <section
      className="chat-container glass animate-fade-in"
      aria-label="FlowMind AI Concierge chat"
      aria-live="off"
    >
      {/* Header */}
      <header className="chat-header" role="banner">
        <Cpu className="ai-icon" aria-hidden="true" />
        <h2 id="chat-title">FlowMind AI Concierge</h2>
        <div
          className="status-dot"
          role="status"
          aria-label="AI online"
          title="AI Online"
        />
        {/* TTS Toggle */}
        <button
          className={`tts-btn ${ttsEnabled ? 'tts-active' : ''}`}
          onClick={() => setTtsEnabled(v => !v)}
          aria-label={ttsEnabled ? 'Disable text-to-speech' : 'Enable text-to-speech'}
          aria-pressed={ttsEnabled}
          title={ttsEnabled ? 'Mute AI voice' : 'Enable AI voice'}
        >
          {ttsEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>
      </header>

      {/* Message List */}
      <div
        className="chat-messages"
        role="log"
        aria-label="Conversation messages"
        aria-relevant="additions"
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="message-wrapper ai" role="status" aria-label="AI is thinking">
            <div className="avatar ai" aria-hidden="true"><Cpu size={16} /></div>
            <div className="message-bubble loading" aria-label="Loading response">
              <span className="dot" aria-hidden="true" />
              <span className="dot" aria-hidden="true" />
              <span className="dot" aria-hidden="true" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* Quick Prompt Chips */}
      {showQuickPrompts && (
        <nav
          className="quick-prompts"
          aria-label="Suggested questions"
        >
          {QUICK_PROMPTS.map(qp => (
            <button
              key={qp.label}
              className="quick-chip"
              onClick={() => handleSend(qp.text, qp.category)}
              aria-label={`Ask: ${qp.text}`}
              disabled={isLoading}
            >
              {qp.label}
            </button>
          ))}
        </nav>
      )}

      {/* Input Area */}
      <div className="chat-input-area" role="group" aria-label="Message input">
        <button
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleVoiceInput}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          aria-pressed={isListening}
          title={isListening ? 'Stop listening' : 'Speak your question'}
        >
          {isListening ? <Mic aria-hidden="true" /> : <MicOff aria-hidden="true" />}
        </button>

        <input
          ref={inputRef}
          id="chat-input"
          type="text"
          placeholder="Ask about food, washrooms or exits…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          aria-label="Type your question"
          aria-controls="chat-title"
          disabled={isLoading}
          maxLength={500}
          autoComplete="off"
        />

        <button
          className="send-btn"
          onClick={() => handleSend()}
          aria-label="Send message"
          disabled={isLoading || !input.trim()}
          title="Send"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export default AIChat;
