import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your CuraVision AI clinical guide. Ask me questions about foot risk levels, uploading, or generating PDFs.' }
  ]);
  const [input, setInput] = useState('');

  const questions = [
    { q: "How do I start a screening?", a: "Go to the 'Inference Upload' module in the sidebar, select or register a patient profile, then drag & drop the plantar photograph of the foot." },
    { q: "What is Grad-CAM?", a: "Grad-CAM generates coarse localization heatmaps highlighting pixels that the neural network (MobileNetV2) focused on to classify tissue ulcer risk." },
    { q: "How do I download a report?", a: "When prediction completes, click 'Generate Report' on the workstation details page. You can then print or save as a HIPAA-compliant PDF." }
  ];

  const handleSend = (text) => {
    if (!text.trim()) return;
    
    const userMsg = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Find if it matches standard questions
    setTimeout(() => {
      const match = questions.find(item => item.q.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(item.q.toLowerCase()));
      const replyText = match 
        ? match.a 
        : "I'm currently configured for clinical workflow navigation. Try clicking one of the quick guide questions below.";
      
      setMessages(prev => [...prev, { sender: 'bot', text: replyText }]);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      {/* Trigger Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="btn btn-primary animate-pulse-ai"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            padding: 0,
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
            backgroundColor: 'var(--color-ai-accent)'
          }}
        >
          <Sparkles size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="card" style={{
          width: '350px',
          height: '460px',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          backgroundColor: 'var(--color-card-bg)'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--color-dark-navy)',
            color: 'var(--color-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={20} style={{ color: 'var(--color-secondary)' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '14px' }}>CuraVision Copilot</strong>
                <span style={{ fontSize: '10px', color: '#94A3B8' }}>Clinical Assistant Active</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Feed */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '13px'
          }}>
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{
                  alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
                  backgroundColor: msg.sender === 'bot' ? 'var(--color-bg)' : 'var(--color-hover-bg)',
                  color: 'var(--color-text-primary)',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'bot' ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                  maxWidth: '85%',
                  lineHeight: 1.4,
                  border: '1px solid var(--color-border)'
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Suggestions list */}
          <div style={{ padding: '8px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--color-border)' }}>
            {questions.map((item, i) => (
              <button 
                key={i}
                onClick={() => handleSend(item.q)}
                style={{
                  fontSize: '11px',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  textAlign: 'left'
                }}
              >
                {item.q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Ask about workspace features..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              style={{ height: '36px', fontSize: '13px', padding: '0 12px' }}
            />
            <button 
              onClick={() => handleSend(input)}
              className="btn btn-primary"
              style={{ width: '36px', height: '36px', padding: 0, flexShrink: 0 }}
            >
              <Send size={14} />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default AIAssistant;
