import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SettingsModal = ({ isOpen, onClose, onSave }) => {
  const [email, setEmail] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEmail(localStorage.getItem('userEmail') || '');
      setGeminiKey(localStorage.getItem('GEMINI_API_KEY') || '');
      setDeepseekKey(localStorage.getItem('DEEPSEEK_API_KEY') || '');
      setClaudeKey(localStorage.getItem('CLAUDE_API_KEY') || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('userEmail', email.trim());
    localStorage.setItem('GEMINI_API_KEY', geminiKey.trim());
    localStorage.setItem('DEEPSEEK_API_KEY', deepseekKey.trim());
    localStorage.setItem('CLAUDE_API_KEY', claudeKey.trim());
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-bold mb-4">Profile & API Keys</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="settings-email">Email</Label>
            <Input
              id="settings-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="settings-gemini">Gemini API Key</Label>
            <Input
              id="settings-gemini"
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="settings-deepseek">DeepSeek API Key</Label>
            <Input
              id="settings-deepseek"
              type="password"
              value={deepseekKey}
              onChange={(e) => setDeepseekKey(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="settings-claude">Claude API Key</Label>
            <Input
              id="settings-claude"
              type="password"
              value={claudeKey}
              onChange={(e) => setClaudeKey(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
