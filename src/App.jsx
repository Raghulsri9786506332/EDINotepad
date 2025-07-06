import React, { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { LogOut, Settings } from 'lucide-react';
import SettingsDrawer from './components/SettingsDrawer';
import SettingsModal from './components/SettingsModal';
import logo from './assets/logo.jpg';

import FileSidebar from './components/FileSidebar';
import EDIPanel from './components/EDIPanel';
import AIAssistant from './components/AIAssistant';

function App() {
  // Settings state
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize') ?? 1));
  const [highlightSeg, setHighlightSeg] = useState(() => localStorage.getItem('highlightSeg') === 'true');
  const [autoExplain, setAutoExplain] = useState(() => localStorage.getItem('autoExplain') === 'true');

  const [viewedFile, setViewedFile] = useState(null);
  const [viewedFileContent, setViewedFileContent] = useState('');
  const [contextFiles, setContextFiles] = useState([]);
  const [ediFormat, setEdiFormat] = useState('pretty'); // 'pretty' or 'compact'
  const [showSettings, setShowSettings] = useState(false);

  const handleViewFile = (file) => {
  console.log('File clicked:', file);
    setViewedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Normalize to pretty format on load, handling both tilde-separated and newline-separated inputs
        const rawContent = e.target.result;
        const normalizedContent = rawContent.replace(/~\s*/g, "~\n").replace(/\n+/g, '\n').trim();
        setViewedFileContent(normalizedContent);
        console.log('File content loaded:', normalizedContent);
      };
      reader.readAsText(file);
    } else {
      setViewedFileContent('');
    }
  };

  const handleSelectionChange = (selectedFiles) => {
    setContextFiles(selectedFiles);
  };

  const handleFormatToggle = () => {
    setEdiFormat(prev => (prev === 'pretty' ? 'compact' : 'pretty'));
  };

  const getFormattedContent = () => {
    if (!viewedFileContent) return '';
    if (ediFormat === 'compact') {
      return viewedFileContent.replace(/~\n/g, "~");
    }
    return viewedFileContent; // Already in 'pretty' format
  };

  const formattedContent = getFormattedContent();

  const handleSignOut = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('GEMINI_API_KEY');
    window.location.reload();
  };

  // Persist settings
  useEffect(() => { localStorage.setItem('fontSize', fontSize); }, [fontSize]);
  useEffect(() => { localStorage.setItem('highlightSeg', highlightSeg); }, [highlightSeg]);
  useEffect(() => { localStorage.setItem('autoExplain', autoExplain); }, [autoExplain]);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <header className="h-14 flex items-center justify-between px-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <SettingsDrawer
            onOpenSettings={() => setShowSettings(true)}
            fontSize={fontSize}
            setFontSize={setFontSize}
            highlightSeg={highlightSeg}
            setHighlightSeg={setHighlightSeg}
            autoExplain={autoExplain}
            setAutoExplain={setAutoExplain}
          />
          <img src={logo} alt="Aptean Logo" className="w-10 h-10 object-contain" />

          <h1 className="text-xl font-bold">Aptean EDI Notepad</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {localStorage.getItem('userEmail')}
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center gap-1">
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Button>

            <ModeToggle />
        </div>
      </header>

      <main className="flex-grow">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <FileSidebar onOpenSettings={() => setShowSettings(true)} 
              onViewFile={handleViewFile}
              onSelectionChange={handleSelectionChange}
              viewedFile={viewedFile}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 pb-2 border-b flex-shrink-0">
                <h2 className="text-lg font-semibold">EDI Viewer</h2>
                {viewedFileContent && (
                  <Button variant="outline" size="sm" onClick={handleFormatToggle}>
                    Switch to {ediFormat === 'pretty' ? 'Compact' : 'Pretty'} View
                  </Button>
                )}
              </div>
              <div className="flex-grow overflow-y-auto p-4">
                <EDIPanel
                  content={formattedContent}
                  fontSize={fontSize}
                  highlightSeg={highlightSeg}
                  autoExplain={autoExplain}
                  provider={localStorage.getItem('AI_PROVIDER') || 'gemini'}
                  apiKey={localStorage.getItem('AI_API_KEY') || ''}
                />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={30} minSize={25}>
            <AIAssistant contextFiles={contextFiles} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSave={() => window.location.reload()}
        />
      )}
    </div>
  )
}

export default App
