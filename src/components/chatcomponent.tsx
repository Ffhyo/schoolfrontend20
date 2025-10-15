import { useState, useRef, useEffect } from 'react';

// Type definitions
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

interface ApiRequest {
  message: string;
}

interface ApiResponse {
  reply: string;
  error?: string;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      isLoading: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick responses for common questions
  const quickResponses = [
    "What can you help me with?",
    "Tell me about yourself",
    "How does this work?",
    "What are your features?"
  ];

  // Your custom API call function
  const callCustomAPI = async (userMessage: string): Promise<string> => {
    try {
      const requestBody: ApiRequest = {
        message: userMessage
      };

      const response = await fetch('http://localhost:8000/api/chat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status: ${response.status}. ${errorText}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.reply;

    } catch (error) {
      console.error('Custom API Error:', error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      isLoading: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now() + 1,
      text: "",
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, loadingMessage]);

    try {
      const botResponse = await callCustomAPI(inputMessage);
      
      // Remove loading message and add actual response
      setMessages(prev => 
        prev.filter(msg => !msg.isLoading).concat({
          id: Date.now() + 2,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date(),
          isLoading: false
        })
      );

    } catch (error) {
      console.error('Error getting bot response:', error);
      
      // Remove loading message and add error response
      setMessages(prev => 
        prev.filter(msg => !msg.isLoading).concat({
          id: Date.now() + 2,
          text: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
          sender: 'bot',
          timestamp: new Date(),
          isLoading: false
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickResponse = (response: string) => {
    setInputMessage(response);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const clearChat = (): void => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        isLoading: false
      }
    ]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  // Calculate unread messages count (messages since last user message)
  const unreadCount = messages.filter(msg => 
    msg.sender === 'bot' && 
    msg.id > Math.max(...messages.filter(m => m.sender === 'user').map(m => m.id), 0)
  ).length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button with Notification Badge */}
      {!isOpen && (
        <button 
          className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 group"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <span className="text-2xl transition-transform group-hover:scale-110" role="img" aria-label="chat">💬</span>
          
          {/* Notification badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center animate-pulse border-2 border-gray-900">
              {unreadCount}
            </span>
          )}
          
          {/* Hover tooltip */}
          <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-sm rounded-lg px-3 py-1 whitespace-nowrap">
            Chat with AI Assistant
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 h-[600px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-700 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center border-b border-blue-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-400/30 backdrop-blur-sm">
                <span className="text-lg" role="img" aria-label="robot">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-white">AI Assistant</h3>
                <p className="text-blue-100 text-xs flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {isLoading ? 'Thinking...' : 'Online & ready to help'}
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={clearChat}
                className="p-2 hover:bg-blue-500/30 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 group"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <span className="text-lg group-hover:scale-110 transition-transform" role="img" aria-label="clear">🗑️</span>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 hover:bg-blue-500/30 rounded-lg transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50 group"
                aria-label="Close chat"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">×</span>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-gray-800">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 backdrop-blur-sm ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md shadow-lg border border-blue-500/30'
                      : 'bg-gray-800/80 text-gray-100 border border-gray-600/30 rounded-bl-md shadow-lg'
                  } ${message.isLoading ? 'opacity-80' : ''} transition-all duration-200 hover:shadow-xl`}
                >
                  {message.isLoading ? (
                    <div className="flex space-x-2 items-center" aria-label="Loading">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <span className="text-sm text-blue-300 ml-2">Thinking...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message.text}
                      </div>
                      <div className={`text-xs mt-2 flex justify-between items-center ${
                        message.sender === 'user' ? 'text-blue-200/80' : 'text-gray-400'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        <span className="text-xs opacity-70">
                          {message.sender === 'user' ? 'You' : 'Assistant'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Responses */}
          {messages.length <= 2 && (
            <div className="px-4 pt-2 border-t border-gray-700/50 bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-2 font-medium">QUICK QUESTIONS</p>
              <div className="flex flex-wrap gap-2">
                {quickResponses.map((response, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickResponse(response)}
                    className="text-xs bg-gray-700/50 hover:bg-blue-600/30 text-gray-300 hover:text-white px-3 py-2 rounded-full border border-gray-600/50 hover:border-blue-500/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                  >
                    {response}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700/50 bg-gray-800/80 backdrop-blur-sm">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full bg-gray-700/50 border border-gray-600/50 text-white placeholder-gray-400 rounded-2xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 disabled:bg-gray-700/30 disabled:cursor-not-allowed backdrop-blur-sm transition-all duration-200"
                  rows={1}
                  disabled={isLoading}
                  aria-label="Type your message"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs">
                  ↵
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-2xl px-6 py-3 transition-all duration-200 font-medium disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-800 whitespace-nowrap shadow-lg disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Send'
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs border border-gray-600">Enter</kbd> to send • 
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs border border-gray-600 mx-1">Shift</kbd> + 
              <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs border border-gray-600 ml-1">Enter</kbd> for new line
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;