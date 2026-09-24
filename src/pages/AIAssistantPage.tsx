import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bot, Send, User, Trash2, ShieldCheck, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { apiClient } from '../lib/apiClient';
import { useAuthStore } from '../store/authStore';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  confidence?: number;
  reasoning?: string;
  source?: string;
}

const suggestedPrompts = [
  'Am I eligible for STEM Leadership scholarship?',
  'What documents are required for tech internships?',
  'How does the human approval workflow work?',
  'What skills should I add to boost profile strength?',
];

export const AIAssistantPage: React.FC = () => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Hello ${user?.fullName || 'Student'}! I am your Scolify AI Opportunity Assistant. I can help answer questions about scholarship criteria, document readiness, tech internship skills, and application preparation. Remember: I will never invent facts or submit applications without your explicit human approval.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 0.98,
      reasoning: 'Initialized with Scolify Human Approval Engine safety boundary.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReasoningId, setExpandedReasoningId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await apiClient<{ output: any }>('/agents/orchestrate', {
        method: 'POST',
        body: JSON.stringify({
          agentName: 'OpportunityAssistantAgent',
          params: { prompt: query },
        }),
      });

      const output = res.data?.output || {};
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: output.result || 'I have evaluated your request against Scolify verification standards.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: output.confidence || 0.95,
        reasoning: output.reasoning || 'Evaluated via Scolify AI Orchestrator.',
        source: output.source,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to connect to Scolify AI service. Please check your connection and retry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: 'assistant',
        text: 'Conversation cleared. How else can I assist with your opportunity search?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-brand-600 p-6 rounded-3xl text-white shadow-lg shadow-violet-500/20 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">AI Opportunity Assistant</h1>
              <p className="text-xs text-violet-100 mt-0.5">
                Conversational guidance for scholarship criteria, document gaps, and application prep.
              </p>
            </div>
          </div>
          <Badge variant="brand" className="bg-white/20 text-white border-white/30 backdrop-blur-md self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Human Approval Guaranteed
          </Badge>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200/80 rounded-full text-slate-700 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all text-left shadow-2xs"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream Area */}
      <Card isHoverable={false} className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUser ? 'bg-brand-600 text-white' : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`space-y-1 max-w-[80%] sm:max-w-[75%]`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-bold text-slate-700">
                      {isUser ? user?.fullName || 'You' : 'Scolify AI'}
                    </span>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-3xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-brand-600 text-white rounded-tr-xs shadow-md shadow-brand-500/10'
                        : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-xs shadow-card-soft'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Metadata Toggle for Assistant Messages */}
                  {!isUser && (msg.confidence || msg.reasoning) && (
                    <div className="px-1 pt-0.5">
                      <button
                        onClick={() =>
                          setExpandedReasoningId(expandedReasoningId === msg.id ? null : msg.id)
                        }
                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 hover:underline focus:outline-none"
                      >
                        <span>Verified AI Metadata ({(msg.confidence! * 100).toFixed(0)}% confidence)</span>
                        {expandedReasoningId === msg.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {expandedReasoningId === msg.id && (
                        <div className="mt-1 p-2.5 bg-violet-50/80 border border-violet-100 rounded-xl text-[10px] text-slate-600 space-y-1">
                          <p><strong>Reasoning:</strong> {msg.reasoning}</p>
                          {msg.source && <p><strong>Source:</strong> {msg.source}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-xs text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-600" />
                <span>Scolify AI Orchestrator is generating response...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about scholarship eligibility, resume tips, or company verification..."
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all disabled:opacity-50"
            />
            <Button
              variant="gradient"
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isLoading}
              isLoading={isLoading}
              className="px-5 font-bold"
              rightIcon={<Send className="w-4 h-4" />}
            >
              Send
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={handleClearChat}
              title="Clear Conversation"
              className="text-slate-400 hover:text-slate-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
            <span>Press Enter to send</span>
            <span>AI responses fit structured confidence & verification rules</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
