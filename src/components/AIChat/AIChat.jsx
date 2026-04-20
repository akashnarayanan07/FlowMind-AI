import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Cpu, User } from 'lucide-react';
import { getDecisionGuidance, getContextAwareGuidance } from '../../services/aiService';
import { getCurrentVenueContext, getCurrentStadiumContext } from '../../services/dataService';
import { useVenueContext } from '../../context/VenueContext';
import './AIChat.css';

const AIChat = () => {
  const { selectedStadium, activeCategory } = useVenueContext();
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: `Hi! I'm FlowMind, your venue assistant at **Stadium ${selectedStadium[0] || 'A'}**. Ask me where to eat, which washroom to use, or the best exit!` }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (userText) => {
    const text = userText || input;
    if (!text.trim()) return;

    if (!userText) setInput('');
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text }]);
    setIsLoading(true);

    // Use context-aware guidance (stadium + category aware)
    const context = getCurrentStadiumContext(selectedStadium);
    const response = await getContextAwareGuidance(text, context, selectedStadium, activeCategory);

    setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: response }]);
    setIsLoading(false);
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support Voice Input. Please use Chrome or Edge.");
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
    
    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Convert markdown bold to JSX for AI
  const formatText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="ai-highlight">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="chat-container glass animate-fade-in">
      <div className="chat-header">
        <Cpu className="ai-icon" />
        <h2>FlowMind AI Concierge</h2>
        <div className="status-dot"></div>
      </div>
      
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
            {msg.sender === 'ai' && <div className="avatar ai"><Cpu size={16}/></div>}
            <div className={`message-bubble ${msg.sender}`}>
              {msg.sender === 'ai' ? formatText(msg.text) : msg.text}
            </div>
            {msg.sender === 'user' && <div className="avatar user"><User size={16}/></div>}
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper ai">
            <div className="avatar ai"><Cpu size={16}/></div>
            <div className="message-bubble loading">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <button 
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleVoiceInput}
          title="Hold to speak"
        >
          {isListening ? <Mic className="pulse" /> : <MicOff />}
        </button>
        <input 
          type="text" 
          placeholder="Ask me anything..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="send-btn" onClick={() => handleSend()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default AIChat;
