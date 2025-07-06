import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CornerDownLeft } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';


const AIAssistant = ({ contextFiles }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');

  useEffect(() => {
    const models = [];
    if (localStorage.getItem('GEMINI_API_KEY')) models.push('Gemini');
    if (localStorage.getItem('CLAUDE_API_KEY')) models.push('Claude');
    if (localStorage.getItem('DEEPSEEK_API_KEY')) models.push('DeepSeek');
    setAvailableModels(models);
    if (models.length > 0) {
      setSelectedModel(models[0]);
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const fileContents = await Promise.all(
        contextFiles.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({ name: file.name, content: e.target.result });
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
          });
        })
      );

      const combinedContent = fileContents.map(fc => 
        `--- START OF FILE: ${fc.name} ---\n${fc.content}\n--- END OF FILE: ${fc.name} ---`
      ).join('\n\n');

      let fullPrompt = `Based on the following file(s), please answer the user's question.\n\n${combinedContent}\n\nUser Question: ${input}`;

      const is850File = contextFiles.some(file => file.name.includes('850'));
      if (is850File) {
        fullPrompt += `

---

**IMPORTANT ANALYSIS TASK:**
One of the provided files is an EDI 850 Purchase Order. Please generate a detailed, story-style summary of this transaction, intended for a business user. The summary MUST follow the structure, tone, and markdown formatting of the example below.

**EXAMPLE SUMMARY FORMAT:**

### 📝 Story Summary of Your EDI 850 Transaction

On [Date from ISA segment], the company identified as [Sender ID from ISA] sent a Purchase Order (PO) to their trading partner, [Receiver ID from ISA].

This order was electronically structured using the EDI X12 850 format, ensuring both parties could automatically process and understand the document.

**📦 Purchase Order Details:**
- **PO Number:** [Value from BEG03]
- **Order Type:** [Description for code in BEG02]
- **Order Date:** [Date from BEG05]
- **Requested Delivery Date:** [Date from DTM*002 segment]

**🧑‍💼 Buyer Contact:**
- **Name:** [Name from PER*BD segment]
- **Contact:** [Number from PER*TE segment]

**🚚 Shipping Terms:**
- **FOB:** [Description for code in FOB01 segment]

**💰 Payment Terms:**
- **Details:** [Describe terms from ITD segment, e.g., 'Payment due in 45 days']

**🏬 Ship-To Location:**
- **Name/Location:** [Name from N1*ST segment]
- **Address:** [Address from N3 segment]
- **City, State, Zip:** [Location details from N4 segment]

**📦 Ordered Items:**
*For each item in a PO1 loop:*
- **Item:** [Product description from PID segment]
- **SKU/Vendor PN:** [Value from PO107]
- **UPC:** [Value from PO111]
- **Quantity:** [Value from PO102] [Unit from PO103]
- **Unit Price:** $[Value from PO104]

**📊 Totals:**
- **Total Line Items:** [Value from CTT01]

**✅ Technical Flow:**
- The message is a valid 850 Purchase Order, starting with ISA/GS/ST headers and properly concluding with SE/GE/IEA footers.

**Please analyze the provided EDI 850 data and populate the template above with the correct values from the file.**`
      }

      const apiKey = localStorage.getItem(`${selectedModel.toUpperCase()}_API_KEY`);
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const apiUrl = `${apiBase}/api/${selectedModel.toLowerCase()}/chat`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.detail}`);
      }

      const data = await response.json();
      const aiMessage = { role: 'ai', content: data.text };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage = { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle>AI Assistant</CardTitle>
        {availableModels.length > 0 && (
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="border rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-900"
          >
            {availableModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        )}
      </CardHeader>
      <CardFooter className="p-4 border-y">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the selected files..."
            disabled={isLoading || contextFiles.length === 0}
          />
          <Button type="submit" disabled={isLoading || !input.trim() || contextFiles.length === 0} size="icon">
            <CornerDownLeft className="w-4 h-4" />
          </Button>
        </form>
      </CardFooter>
      <CardContent className="flex-grow overflow-y-auto">
        <div className="space-y-4 pt-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground p-8 animate-slide-in-fade-in">
              <p>Hello! I'm your EDI assistant.</p>
              <p>Select up to 5 files and ask me anything about them.</p>
            </div>
          )}
          {isLoading && (
            <div className="flex items-start gap-3 animate-slide-in-fade-in">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-foreground rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-foreground rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
          {messages.slice().reverse().map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 animate-slide-in-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            <div className={`p-4 rounded-xl max-w-[85%] shadow-md text-base ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {/* Render AI reply as styled markdown with color-coded headers and segment codes */}
                <MarkdownRenderer content={msg.content} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
