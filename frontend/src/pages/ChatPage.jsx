import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  Bot,
  User,
  Send,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Info,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Paperclip,
  X
} from 'lucide-react';
import { sendChatMessage, ApiError } from '../services/api';

const DEFAULT_SUGGESTIONS = [
  'Is this placement offer a scam?',
  'How do I identify phishing?',
  'Someone asked for my OTP. What should I do?',
  'How can I protect my college account?',
  'What should I do if I clicked a suspicious link?',
];

const INITIAL_GREETING = {
  id: 'greeting',
  role: 'assistant',
  content:
    "Hi! I'm CampusShield. I can help you with phishing, scams, fake placement offers, suspicious messages, account security, and other campus cybersecurity concerns.\n\nAsk me anything below or pick a suggested topic to get started.",
  timestamp: new Date().toISOString(),
};

/**
 * Helper to render formatted assistant text (handles bold, bullet points, headers, paragraphs)
 */
function FormattedMessage({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentList = [];

  const flushList = (key) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={key} className="chat-markdown-list">
          {currentList.map((item, idx) => (
            <li key={idx} className="chat-markdown-list-item">
              <span className="chat-bullet-dot" />
              <span>{formatInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const formatInline = (str) => {
    // Parse **bold text**
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-cyan-200 font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Empty line: flush list
    if (!trimmed) {
      flushList(`list-before-${index}`);
      return;
    }

    // Bullet point (- or * or numbered like 1.)
    if (/^[-*•]\s+/.test(trimmed)) {
      currentList.push(trimmed.replace(/^[-*•]\s+/, ''));
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      currentList.push(trimmed.replace(/^\d+\.\s+/, ''));
      return;
    }

    // Normal line: flush any accumulated list first
    flushList(`list-before-${index}`);

    // Header styling for lines starting with ### or ##
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
      const headerText = trimmed.replace(/^#+\s*/, '');
      elements.push(
        <h4 key={`header-${index}`} className="chat-content-subheading">
          {formatInline(headerText)}
        </h4>
      );
      return;
    }

    elements.push(
      <p key={`p-${index}`} className="chat-content-paragraph">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList('final-list');

  return <div className="chat-message-formatted">{elements}</div>;
}

export function ChatPage({
  messages,
  setMessages,
  onNavigateToAnalyze,
  prefilledPrompt,
  onClearPrefilledPrompt,
}) {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [chatError, setChatError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle prefilled prompts when navigating from "Ask CampusShield about this result"
  useEffect(() => {
    if (prefilledPrompt) {
      setInputText(prefilledPrompt);
      if (onClearPrefilledPrompt) onClearPrefilledPrompt();
      inputRef.current?.focus();
    }
  }, [prefilledPrompt, onClearPrefilledPrompt]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format (.jpg, .jpeg, .png)
    const validMimes = ['image/jpeg', 'image/jpg', 'image/png'];
    const hasValidExt = /\.(jpe?g|png)$/i.test(file.name);
    if (!validMimes.includes(file.type.toLowerCase()) && !hasValidExt) {
      setChatError('Unsupported image type. Please upload a JPG or PNG image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (10 MB maximum)
    const MAX_SIZE_BYTES = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setChatError('Image is too large. Please upload an image smaller than 10 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setChatError(null);
    setSelectedImage(file);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (textToSend) => {
    const rawText = textToSend !== undefined ? textToSend : inputText;
    const messageContent = (rawText || '').trim();

    // If neither text nor image is provided, ignore
    if ((!messageContent && !selectedImage) || isLoading) return;

    const currentImageFile = selectedImage;
    const currentPreviewUrl = imagePreview;
    const displayPrompt = messageContent || 'Analyze this screenshot for phishing or cybersecurity red flags.';

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: displayPrompt,
      imagePreviewUrl: currentPreviewUrl,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setChatError(null);
    setIsLoading(true);
    setIsAnalyzingImage(Boolean(currentImageFile));

    try {
      const { response } = await sendChatMessage(displayPrompt, currentImageFile);
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      if (err instanceof ApiError) {
        setChatError(err.message);
      } else {
        setChatError(
          currentImageFile
            ? 'Unable to analyze the image right now. Please try again.'
            : 'Failed to communicate with CampusShield assistant. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
      setIsAnalyzingImage(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="chat-page-container">
      {/* Hero / Header Section */}
      <section className="chat-hero-section">
        <div className="hero-badge">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
          <span>AI Campus Cybersecurity Assistant</span>
        </div>
        <h1 className="hero-title">
          Campus<span className="hero-title-accent">Shield</span> Chat
        </h1>
        <p className="hero-tagline">
          Real-time AI cybersecurity guidance for students & campus life
        </p>
      </section>

      {/* Cross-Feature Bridge Card to Message Analyzer */}
      <div className="chat-analyzer-bridge-banner">
        <div className="bridge-text-wrap">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="bridge-title">Have a specific email or placement message?</p>
            <p className="bridge-subtitle">
              Use our fine-tuned <strong>Machine Learning Analyzer</strong> to get an exact 0–100 risk score and observable signal breakdown.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNavigateToAnalyze}
          className="btn-bridge-navigate"
        >
          <span>Open Analyzer</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Main Chat Interface Box */}
      <div className="chat-window-card">
        {/* Chat Header Status */}
        <div className="chat-window-header">
          <div className="chat-assistant-meta">
            <div className="chat-avatar-shield">
              <Shield className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="chat-bot-name">CampusShield Assistant</div>
              <div className="chat-bot-model">Powered by Grok • Specialized Campus Safety</div>
            </div>
          </div>
          <div className="chat-security-badge">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mr-1" />
            <span>Zero-Credential Safe Zone</span>
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="chat-messages-area" role="log" aria-live="polite">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`chat-bubble-row ${isUser ? 'row-user' : 'row-assistant'}`}
              >
                {!isUser && (
                  <div className="bubble-avatar assistant-avatar" aria-hidden="true">
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                )}

                <div className={`chat-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}>
                  <div className="bubble-sender-name">
                    {isUser ? 'You' : 'CampusShield'}
                  </div>

                  {isUser ? (
                    <>
                      {msg.imagePreviewUrl && (
                        <div className="chat-bubble-image-wrapper">
                          <img
                            src={msg.imagePreviewUrl}
                            alt="Uploaded screenshot"
                            className="chat-bubble-image"
                          />
                        </div>
                      )}
                      <p className="chat-user-text">{msg.content}</p>
                    </>
                  ) : (
                    <FormattedMessage text={msg.content} />
                  )}
                </div>

                {isUser && (
                  <div className="bubble-avatar user-avatar" aria-hidden="true">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Assistant Loading Animation */}
          {isLoading && (
            <div className="chat-bubble-row row-assistant animate-fade-in">
              <div className="bubble-avatar assistant-avatar">
                <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div className="chat-bubble bubble-assistant bubble-loading">
                <div className="loading-dots-wave">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
                <span className="loading-subtext">
                  {isAnalyzingImage
                    ? 'CampusShield is analyzing the image...'
                    : 'CampusShield is thinking...'}
                </span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {chatError && (
            <div className="chat-error-banner" role="alert">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Unable to generate response</p>
                <p className="text-xs text-rose-300/90 mt-0.5">{chatError}</p>
              </div>
              <button
                type="button"
                onClick={() => handleSendMessage()}
                className="chat-error-retry-btn"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Topic Chips */}
        <div className="chat-suggestions-shelf">
          <span className="suggestions-label">
            <Sparkles className="w-3 h-3 text-cyan-400 mr-1" />
            Quick questions:
          </span>
          <div className="suggestions-scroll">
            {DEFAULT_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Controls */}
        <div className="chat-input-bar">
          {imagePreview && (
            <div className="chat-image-preview-card">
              <div className="chat-image-thumb-wrapper">
                <img
                  src={imagePreview}
                  alt="Selected screenshot"
                  className="chat-image-thumb"
                />
                <div className="chat-image-info">
                  <span className="chat-image-name">{selectedImage?.name}</span>
                  <span className="chat-image-size">
                    {(selectedImage?.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="chat-image-remove-btn"
                aria-label="Remove image"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="chat-input-wrapper">
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              id="chat-file-input"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="chat-attach-btn"
              title="Attach screenshot or image (.jpg, .png, max 10MB)"
              aria-label="Attach screenshot or image"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              ref={inputRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedImage
                  ? 'Ask a question about this image (or press Enter to analyze)...'
                  : 'Ask CampusShield about any suspicious message, offer, or campus threat...'
              }
              disabled={isLoading}
              className="chat-textarea"
              aria-label="Ask CampusShield a cybersecurity question"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="chat-send-btn"
              aria-label="Send message"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="chat-input-footer-note">
            <span>Press <strong>Enter</strong> to send • Attach screenshot (.jpg, .png) • Never share passwords or OTPs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export { INITIAL_GREETING };
