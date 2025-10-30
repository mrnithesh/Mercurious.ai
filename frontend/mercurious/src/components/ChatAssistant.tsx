'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  FaComments,
  FaPaperPlane,
  FaTrash,
  FaRobot,
  FaUser,
  FaSpinner,
  FaWindowMinimize,
  FaWindowMaximize
} from 'react-icons/fa';
import { apiClient, ChatMessage, ChatHistory } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface ChatAssistantProps {
  videoId: string;
  videoContext?: any;
}

export default function ChatAssistant({ videoId, videoContext }: ChatAssistantProps) {
  const { showError } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts or videoId changes
  useEffect(() => {
    loadChatHistory();
    // Set video context when available
    if (videoContext) {
      setVideoContextInBackend();
    }
  }, [videoId, videoContext]);

  const loadChatHistory = async () => {
    try {
      const history = await apiClient.getChatHistory(videoId);
      setMessages(history.messages);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  };

  const setVideoContextInBackend = async () => {
    try {
      await apiClient.setVideoContext(videoId, {
        title: videoContext?.title,
        author: videoContext?.author,
        duration: videoContext?.duration,
        summary: videoContext?.summary,
        main_points: videoContext?.main_points,
        key_concepts: videoContext?.key_concepts
      });
    } catch (err) {
      console.error('Failed to set video context:', err);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);
    setIsLoading(true);

    // Add user message to UI immediately
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now().toString()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await apiClient.sendChatMessage({
        message: userMessage,
        video_id: videoId
      });

      // Add assistant response
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: response.timestamp
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      showError(errorMessage);
      
      // Remove the user message if sending failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = async () => {
    try {
      await apiClient.clearChatHistory(videoId);
      setMessages([]);
      setError(null);
    } catch (err) {
      showError('Failed to clear chat history');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-slate-900 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          aria-label="Open chat assistant"
        >
          <FaComments className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col h-96">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaRobot className="w-5 h-5" />
            <span className="font-semibold">AI Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Clear chat"
              aria-label="Clear chat history"
            >
              <FaTrash className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
              aria-label="Minimize chat window"
            >
              <FaWindowMinimize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="p-3 bg-slate-100 rounded-full w-fit mx-auto mb-4">
                <FaRobot className="w-10 h-10 text-slate-600" />
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">AI Learning Assistant</h4>
              <p className="text-sm text-gray-600 max-w-xs mx-auto leading-relaxed">
                Hi! I'm here to help you understand the video content. 
                Ask me anything about what you've watched, and I'll provide detailed explanations!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaRobot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className={`text-xs opacity-70 mt-1 block ${
                    message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0">
                <FaRobot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaSpinner className="w-4 h-4 animate-spin text-slate-900" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about the video..."
              disabled={isLoading}
              className="flex-1 p-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 text-sm text-slate-900 placeholder-gray-500"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '100px' }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              <FaPaperPlane className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 