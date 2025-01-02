import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Calendar, Lock, AlertTriangle } from 'lucide-react';

// Therapeutic system prompt
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
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMessage = (timestamp) => {
    messageRefs.current[timestamp]?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    const isCrisis = crisisKeywords.some(word => 
      text.toLowerCase().includes(word)
    );

    if (isCrisis) {
      return `I'm very concerned about what you're sharing. Your life matters and help is available:

      - Emergency: Call 911
      - 24/7 Crisis Support: Call 988
      - Crisis Text Line: Text HOME to 741741
      
      Would you like to talk about what's bringing up these thoughts?`;
    }
    return null;
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setMessages([]);
      localStorage.removeItem('chatHistory');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      mood: detectMood(input)
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check for crisis first
      const crisisResponse = handleCrisis(input);
      if (crisisResponse) {
        const aiMessage = {
          type: 'assistant',
          content: crisisResponse,
          timestamp: new Date().toISOString(),
          isCrisis: true
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

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const aiMessage = {
        type: 'assistant',
        content: data.content,
        timestamp: new Date().toISOString(),
        mood: userMessage.mood
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const groupConversations = (messages) => {
    let conversations = [];
    let currentConvo = [];
    let lastTimestamp = null;

    messages.forEach(message => {
      const messageTime = new Date(message.timestamp);
      if (lastTimestamp && (messageTime - new Date(lastTimestamp)) > 30 * 60 * 1000) {
        conversations.push({
          title: currentConvo[0].content.slice(0, 50) + '...',
          messages: currentConvo,
          timestamp: currentConvo[0].timestamp,
          mood: currentConvo[0].mood
        });
        currentConvo = [];
      }
      currentConvo.push(message);
      lastTimestamp = message.timestamp;
    });

    if (currentConvo.length > 0) {
      conversations.push({
        title: currentConvo[0].content.slice(0, 50) + '...',
        messages: currentConvo,
        timestamp: currentConvo[0].timestamp,
        mood: currentConvo[0].mood
      });
    }

    return conversations.reverse();
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      distressed: '😰',
      anxious: '😟',
      depressed: '😢',
      angry: '😠',
      happy: '😊',
      neutral: '😐'
    };
    return moodEmojis[mood] || '😐';
  };

  return (
    <div className="flex h-screen bg-gray-50 p-4">
      {/* Main Chat Area */}
      <div className="w-2/3 mr-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-800">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Confide.ai</span>
            <span className="ml-auto flex items-center text-sm text-gray-500">
              <Lock className="h-4 w-4 mr-1" />
              End-to-end encrypted
            </span>
          </div>
        </div>
        
        <div className="p-4 flex flex-col h-[calc(100vh-8rem)]">
          <div className="flex-grow mb-4 overflow-auto">
            <div className="space-y-4">
              {groupConversations(messages).map((conversation, index) => (
                <div key={index}>
                  {conversation.messages.map((message, msgIndex) => (
                    <div
                      key={msgIndex}
                      ref={el => messageRefs.current[message.timestamp] = el}
                      className={`p-4 rounded-lg mb-2 ${
                        message.type === 'user'
                          ? 'bg-blue-50 ml-12 border border-blue-100'
                          : 'bg-white mr-12 border border-gray-200'
                      } ${message.isCrisis ? 'border-red-300 bg-red-50' : ''}`}
                    >
                      {message.isCrisis && (
                        <div className="flex items-center gap-2 text-red-500 mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Crisis Response</span>
                        </div>
                      )}
                      {message.mood && message.type === 'user' && (
                        <div className="text-xs text-gray-500 mb-1">
                          {getMoodEmoji(message.mood)} Detected mood: {message.mood}
                        </div>
                      )}
                      <p className="text-gray-800 whitespace-pre-line leading-relaxed">
  {message.type === 'assistant' 
    ? message.content.split('-').map((point, i) => 
        point.trim() ? (
          <span key={i} className="block">
            {i > 0 ? '• ' : ''}{point.trim()}
            {i < message.content.split('-').length - 1 && point.trim() ? '\n\n' : ''}
          </span>
        ) : null
      )
    : message.content
  }
</p>
<p className="text-xs text-gray-500 mt-1">
  {new Date(message.timestamp).toLocaleTimeString()}
</p>
                    </div>
                  ))}
                </div>
              ))}
              {isLoading && (
                <div className="bg-white p-4 rounded-lg mr-12 border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-end space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Share what's on your mind..."
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 min-h-24 resize-none"
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
                className="p-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-1/3 bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-800">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Recents</span>
            <button
              onClick={clearHistory}
              className="ml-auto text-sm text-red-500 hover:text-red-600"
            >
              Clear History
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {groupConversations(messages).map((conversation, index) => (
            <div
              key={index}
              onClick={() => scrollToMessage(conversation.messages[0].timestamp)}
              className="mb-4 cursor-pointer"
            >
              <div className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg">
                <div className="mt-1">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base text-gray-800 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                    {conversation.mood && getMoodEmoji(conversation.mood)} {conversation.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(conversation.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <div className="text-center p-8">
              <p className="text-gray-500">
                Your conversations will appear here
              </p>
              <p className="text-sm text-gray-400 mt-2">
                All entries are securely encrypted
              </p>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => scrollToBottom()}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            View all →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;