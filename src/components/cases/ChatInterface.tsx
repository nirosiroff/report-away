'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    createdAt?: Date;
}

export function ChatInterface({ caseId, initialHistory = [] }: { caseId: string, initialHistory?: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialHistory.length > 0 ? initialHistory : [
      { role: 'assistant', content: 'Hello! I can help you analyze your ticket. Ask me anything about the strategy.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if(scrollRef.current) {
         scrollRef.current.scrollIntoView({ behavior: 'smooth' });
     }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { role: 'user', content: input, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                caseId, 
                content: userMsg.content // Send only the new message content, server handles history
            })
        });

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();
        setMessages(prev => [...prev, { ...data.message, createdAt: new Date() }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to the AI." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === 'user' ? 'justify-end' : 'justify-start')}>
              {m.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                  </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted/80 backdrop-blur border rounded-bl-none'
                )}
              >
                {m.role === 'assistant' ? (
                    <div className="prose dark:prose-invert prose-sm max-w-none leading-relaxed">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                ) : (
                    <p>{m.content}</p>
                )}
              </div>

              {m.role === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-white" />
                  </div>
              )}
            </div>
          ))}
          {isLoading && (
              <div className="flex gap-3 justify-start">
                   <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-bl-none px-4 py-3 flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
              </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background/80 backdrop-blur p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex space-x-2 relative"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your case strategy..."
            className="flex-1 pr-12 bg-muted/50 border-input/60 focus-visible:ring-primary/20"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="absolute right-1 top-1 h-8 w-8 rounded-md transition-all">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
