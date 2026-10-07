import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ChatPage, INITIAL_GREETING } from './pages/ChatPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';
import { analyzeMessage, checkBackendHealth, ApiError } from './services/api';
import { saveHistoryEntry } from './utils/historyStorage';

const INITIAL_FORM = {
  sender_email: '',
  subject: '',
  body: '',
  has_external_form: false,
  has_payment_request: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessages, setChatMessages] = useState([INITIAL_GREETING]);
  const [prefilledPrompt, setPrefilledPrompt] = useState('');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [lastAnalyzedString, setLastAnalyzedString] = useState('');

  // Backend Health Status
  const [backendHealth, setBackendHealth] = useState({ online: false, message: 'Checking...' });
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const performHealthCheck = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const status = await checkBackendHealth();
      setBackendHealth(status);
    } catch {
      setBackendHealth({ online: false, message: 'Offline' });
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  // Initial health check and interval polling
  useEffect(() => {
    let isMounted = true;
    checkBackendHealth().then((status) => {
      if (isMounted) setBackendHealth(status);
    });

    const timer = setInterval(() => {
      checkBackendHealth().then((status) => {
        if (isMounted) setBackendHealth(status);
      });
    }, 45000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Check if user modified the form after an analysis completed
  const currentFormString = `${formData.sender_email}||${formData.subject}||${formData.body}||${formData.has_external_form}||${formData.has_payment_request}`;
  const isFormDirty = Boolean(result && lastAnalyzedString && currentFormString !== lastAnalyzedString);

  // Form Analysis Action
  const handleAnalyze = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const analysisData = await analyzeMessage(formData);
      setResult(analysisData);
      setLastAnalyzedString(currentFormString);

      // Save to local browser history
      saveHistoryEntry({
        sender_email: formData.sender_email,
        subject: formData.subject,
        body: formData.body,
        has_external_form: formData.has_external_form,
        has_payment_request: formData.has_payment_request,
        analysisResult: analysisData,
      });

      // Update backend health to true since request succeeded
      setBackendHealth({ online: true, message: 'Server online' });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(new ApiError('An unexpected error occurred while analyzing the message.'));
      }
      // If network failure, update status indicator
      if (err?.status === 'NETWORK_ERROR') {
        setBackendHealth({ online: false, message: 'Server offline' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and current result
  const handleClear = () => {
    setFormData(INITIAL_FORM);
    setResult(null);
    setError(null);
    setLastAnalyzedString('');
  };

  // Load a record from History tab into Analyzer
  const handleLoadFromHistory = (item) => {
    setFormData({
      sender_email: item.sender_email || '',
      subject: item.subject || '',
      body: item.body_snippet || '',
      has_external_form: Boolean(item.has_external_form),
      has_payment_request: Boolean(item.has_payment_request),
    });

    setResult({
      prediction: item.prediction,
      phishing_probability: item.phishing_probability,
      risk_score: item.risk_score,
      risk_level: item.risk_level,
      reasons: item.reasons || [],
      recommendation: item.recommendation || '',
    });

    const loadedFormString = `${item.sender_email || ''}||${item.subject || ''}||${item.body_snippet || ''}||${Boolean(item.has_external_form)}||${Boolean(item.has_payment_request)}`;
    setLastAnalyzedString(loadedFormString);
    setError(null);
    setActiveTab('analyze');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Chat with context from Analysis result
  const handleAskAssistantForResult = (analysisResult) => {
    if (!analysisResult) return;
    const prompt = `I ran an analysis on a message (Risk Score: ${analysisResult.risk_score}/100, Risk Level: ${analysisResult.risk_level}, Prediction: ${analysisResult.prediction}). What should I do next to protect myself?`;
    setPrefilledPrompt(prompt);
    setActiveTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ErrorBoundary>
      <div className="app-shell">
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          backendHealth={backendHealth}
          onCheckHealth={performHealthCheck}
          isCheckingHealth={isCheckingHealth}
        />

        <main className="main-content">
          {activeTab === 'chat' && (
            <ChatPage
              messages={chatMessages}
              setMessages={setChatMessages}
              onNavigateToAnalyze={() => {
                setActiveTab('analyze');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              prefilledPrompt={prefilledPrompt}
              onClearPrefilledPrompt={() => setPrefilledPrompt('')}
            />
          )}

          {activeTab === 'analyze' && (
            <AnalyzePage
              formData={formData}
              onFormChange={setFormData}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
              isLoading={isLoading}
              error={error}
              onErrorDismiss={() => setError(null)}
              result={result}
              isFormDirty={isFormDirty}
              onAskAssistant={handleAskAssistantForResult}
            />
          )}

          {activeTab === 'history' && (
            <HistoryPage onLoadIntoAnalyzer={handleLoadFromHistory} />
          )}

          {activeTab === 'about' && <AboutPage />}
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}
