'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

export function ChatInterface({ caseId }: { caseId: string }) {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
      { role: 'assistant', content: 'Hello! I can help you analyze your ticket. Have you uploaded the PDF yet?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input }; // Explicitly cast role
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    const newMessages = [...messages, userMsg];

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                caseId, 
                messages: newMessages.map(m => ({ role: m.role, content: m.content })) 
            })
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Error communicating with AI." }]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t mt-auto bg-background">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
