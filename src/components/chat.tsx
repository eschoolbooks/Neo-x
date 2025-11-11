"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, LoaderCircle, Bot } from 'lucide-react';
import Textarea from 'react-textarea-autosize';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'model';
  content: string;
};

type ChatProps = {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isSending: boolean;
  title?: string;
  description?: string;
  logoUrl?: string;
};

export function Chat({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isSending,
  title = "Chat",
  description,
  logoUrl,
}: ChatProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A hack to make scrollarea scroll to the bottom
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [messages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 md:inset-auto md:right-0 md:bottom-0 md:top-0 w-full h-full md:w-1/2 z-50 flex flex-col"
        >
          <div className="bg-card text-card-foreground md:rounded-l-lg shadow-2xl border-border/50 flex flex-col h-full">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    {logoUrl && <Image src={logoUrl} alt="Logo" width={32} height={32}/>}
                    <div>
                        <h2 className="font-bold text-lg">{title}</h2>
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    </div>
                </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </header>

            {/* Messages */}
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="p-4 space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-start gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'model' && (
                        <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-5 w-5"/>
                        </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-xl px-4 py-2.5 whitespace-pre-wrap',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex items-start gap-3 justify-start">
                     <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5"/>
                    </div>
                    <div className="bg-muted text-muted-foreground rounded-xl px-4 py-3 flex items-center">
                        <LoaderCircle className="h-5 w-5 animate-spin"/>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <footer className="p-4 border-t border-border/50">
              <div className="relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="w-full resize-none rounded-lg border border-input bg-background pr-20 py-2.5 pl-4 text-sm"
                  minRows={1}
                  maxRows={5}
                />
                <Button
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-10"
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
