import React, { useState, useRef, useEffect, useContext } from 'react';
import { 
  MessageSquare, Send, AlertTriangle, Plus,
  X, Menu, Moon, Sun, Settings
} from 'lucide-react';
import { ThemeContext } from '../common/Layout';

const therapeuticPrompt = `You are an experienced, empathetic therapist. Your role is to:
- Provide emotional support and understanding
- Help users explore their feelings safely
- Listen actively and validate emotions
- Identify signs of distress or crisis
- Offer appropriate coping strategies

If you detect severe distress, anxiety, or crisis:
- Maintain a calm, supportive presence
- Provide crisis resources
- Encourage professional help when needed`;

const ChatInterface = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(() => Date.now().toString());
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (timestamp) => {
    messageRefs.current[timestamp]?.scrollIntoView({ behavior: 'smooth' });
  };

  const getMoodEmoji = (mood) => ({
    distressed: '😰',
    anxious: '😟',
    depressed: '😢',
    angry: '😠',
    happy: '😊',
    neutral: '😐'
  }[mood] || '😐');

  const detectMood = (text) => {
    const moodPatterns = {
      distressed: ['suicide', 'kill', 'end it', 'hopeless', 'cant go on'],
      anxious: ['anxiety', 'worried', 'panic', 'stress', 'overwhelm'],
      depressed: ['depressed', 'sad', 'lonely', 'worthless', 'empty'],
      angry: ['angry', 'mad', 'furious', 'rage', 'hate'],
      happy: ['happy', 'good', 'great', 'wonderful', 'blessed'],
      neutral: ['okay', 'fine', 'alright', 'normal']
    };

    for (const [mood, patterns] of Object.entries(moodPatterns)) {
      if (patterns.some(pattern => text.toLowerCase().includes(pattern))) {
        return mood;
      }
    }
    return 'neutral';
  };

  const handleCrisis = (text) => {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'want to die',
      'no point living', 'better off dead'
    ];

    if (crisisKeywords.some(word => text.toLowerCase().includes(word))) {
      return `I'm very concerned about what you're sharing. Your life matters and help is available:

      Emergency: Call 911
      24/7 Crisis Support: Call 988
      Crisis Text Line: Text HOME to 741741
      
      Would you like to talk about what's bringing up these thoughts?`;
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      mood: detectMood(input),
      conversationId: activeConversationId
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const crisisResponse = handleCrisis(input);
      if (crisisResponse) {
        const aiMessage = {
          type: 'assistant',
          content: crisisResponse,
          timestamp: new Date().toISOString(),
          isCrisis: true,
          conversationId: activeConversationId
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          systemPrompt: therapeuticPrompt,
          mood: userMessage.mood
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const aiMessage = {
        type: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        mood: userMessage.mood,
        conversationId: activeConversationId
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
        conversationId: activeConversationId
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveConversationId(Date.now().toString());
    setInput('');
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setMessages([]);
      localStorage.removeItem('chatHistory');
      setActiveConversationId(Date.now().toString());
    }
  };

  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    return (
      <div
        key={message.timestamp}
        ref={el => messageRefs.current[message.timestamp] = el}
        className={`max-w-[80%] ${isUser ? 'ml-auto' : 'mr-auto'} mb-4`}
      >
        <div className={`
          p-4 rounded-xl shadow-sm
          ${isUser 
            ? 'bg-blue-600 text-white' 
            : darkMode 
              ? 'bg-gray-800 text-white border border-gray-700' 
              : 'bg-white text-gray-900 border border-gray-200'
          }
          ${message.isCrisis ? 'border-2 border-red-500 bg-red-50 text-gray-900' : ''}
        `}>
          {message.isCrisis && (
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Crisis Response</span>
            </div>
          )}
          {message.mood && isUser && (
            <div className="text-xs text-blue-100 mb-1">
              {getMoodEmoji(message.mood)} Mood: {message.mood}
            </div>
          )}
          <div className="prose dark:prose-invert max-w-none">
            {message.content.split('\n').map((line, i) => (
              <p key={i} className="mb-2 last:mb-0 leading-relaxed">
                {line.trim()}
              </p>
            ))}
          </div>
          <div className={`text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  const groupConversations = (messages) => {
    const conversationMap = messages.reduce((acc, message) => {
      const id = message.conversationId;
      if (!acc[id]) acc[id] = [];
      acc[id].push(message);
      return acc;
    }, {});

    return Object.entries(conversationMap)
      .map(([id, messages]) => ({
        id,
        title: messages[0].content.slice(0, 50) + '...',
        messages,
        timestamp: messages[0].timestamp,
        mood: messages[0].mood
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Conversations
                  </h2>
                  <button
                    onClick={startNewChat}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    New Chat
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Clear History
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {darkMode ? 
                      <Sun className="h-5 w-5 text-gray-100" /> : 
                      <Moon className="h-5 w-5 text-gray-600" />
                    }
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
                {groupConversations(messages).map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setActiveConversationId(conversation.id);
                      scrollToMessage(conversation.messages[0].timestamp);
                    }}
                    className={`
                      p-4 cursor-pointer border-b dark:border-gray-700 transition-colors
                      ${conversation.id === activeConversationId
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                          {getMoodEmoji(conversation.mood)} {conversation.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(conversation.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm h-[calc(100vh-2rem)] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages
                  .filter(msg => msg.conversationId === activeConversationId)
                  .map(renderMessage)}
                {isLoading && (
                  <div className="flex justify-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce [animation-delay:-.3s]" />
                      <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full animate-bounce [animation-delay:-.5s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Share what's on your mind..."
                    className="flex-1 p-3 rounded-lg border border-gray-200 dark:border-gray-700 
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                             min-h-[5rem] resize-none bg-white dark:bg-gray-800 
                             text-gray-900 dark:text-white
                             placeholder-gray-500 dark:placeholder-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button 
                    onClick={handleSendMessage} 
                    disabled={!input.trim() || isLoading}
                    className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;