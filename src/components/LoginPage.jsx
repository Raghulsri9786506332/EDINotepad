import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, ExternalLink, CheckCircle } from 'lucide-react';
import ediHeader from '../assets/edi-header.jpg';

const API_KEY_HELP = 'https://makersuite.google.com/app/apikey';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || '');
  const [selectedModel, setSelectedModel] = useState('Gemini');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Autofocus first empty input
    if (!email) {
      document.getElementById('email-input')?.focus();
    } else if (!apiKey) {
      document.getElementById('apikey-input')?.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedKey = apiKey.trim();

    if (!email || !trimmedKey) {
      setError('Please provide your email and an API key for the selected model.');
      return;
    }
    setIsLoading(true);
    try {
      setTimeout(() => {
        localStorage.setItem('userEmail', email);
        if (selectedModel === 'Gemini') localStorage.setItem('GEMINI_API_KEY', trimmedKey);
        if (selectedModel === 'Claude') localStorage.setItem('CLAUDE_API_KEY', trimmedKey);
        if (selectedModel === 'DeepSeek') localStorage.setItem('DEEPSEEK_API_KEY', trimmedKey);
        setError(null);
        onLogin({ email, [`${selectedModel.toLowerCase()}ApiKey`]: trimmedKey });
      }, 500);
    } catch (err) {
      setError('Failed to log in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-blue-50 to-gray-50">
      {/* Left / form panel */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8 space-y-6">
        <div className="text-center space-y-2">
          <img src={ediHeader} alt="EDI Header" className="w-16 h-16 mx-auto mb-2 rounded shadow" />
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Aptean EDI Notepad
            </h1>
          </div>
          <p className="text-muted-foreground">Streamline your EDI document management</p>
        </div>

        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-semibold mb-6 text-center">Welcome back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email-input" className="text-sm font-medium text-gray-700">Work email</label>
              <Input 
                id="email-input" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="name@company.com"
                className="h-10"
                required 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="model-select" className="text-sm font-medium text-gray-700">Select Model</label>
              <select
                id="model-select"
                value={selectedModel}
                onChange={e => {
                  setSelectedModel(e.target.value);
                  setApiKey('');
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Gemini">Gemini</option>
                <option value="Claude">Claude</option>
                <option value="DeepSeek">DeepSeek</option>
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="apikey-input" className="text-sm font-medium text-gray-700">
                  {selectedModel} API key
                </label>
                <a
                  href={
                    selectedModel === 'Gemini'
                      ? API_KEY_HELP
                      : selectedModel === 'Claude'
                        ? 'https://console.anthropic.com/settings/keys'
                        : 'https://platform.deepseek.com/api_keys'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  Get API key <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Input
                id="apikey-input"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={`Enter your ${selectedModel} API key`}
                className="h-10 font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</p>}

            <Button 
              type="submit" 
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right / hero panel */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-800/80" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white max-w-md space-y-6 z-10">
            <h2 className="text-3xl font-bold">EDI Document Management</h2>
            <p className="text-blue-100 leading-relaxed">
              Streamline your EDI document workflow with AI-powered tools for parsing, validating, and transforming your business documents.
            </p>
            <ul className="space-y-2 text-blue-100">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>AI-powered EDI parsing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Real-time document validation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Secure document storage</span>
              </li>
            </ul>
          </div>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1533090161767-a6bede912b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
          alt="EDI and logistics" 
          className="object-cover w-full h-full opacity-70" 
        />
      </div>
    </div>
  );
}

export default LoginPage;
