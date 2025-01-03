const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Crisis keywords for enhanced detection
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'want to die',
  'no point living', 'better off dead', 'harm myself'
];

// Mood patterns for detection
const MOOD_PATTERNS = {
  distressed: ['hopeless', 'cant go on', 'helpless', 'desperate'],
  anxious: ['anxiety', 'worried', 'panic', 'stress', 'overwhelm'],
  depressed: ['depressed', 'sad', 'lonely', 'worthless', 'empty'],
  angry: ['angry', 'mad', 'furious', 'rage', 'hate'],
  happy: ['happy', 'good', 'great', 'wonderful', 'blessed'],
  neutral: ['okay', 'fine', 'alright', 'normal']
};

// Detect user's mood from message
const detectMood = (text) => {
  for (const [mood, patterns] of Object.entries(MOOD_PATTERNS)) {
    if (patterns.some(pattern => text.toLowerCase().includes(pattern))) {
      return mood;
    }
  }
  return 'neutral';
};

// Check for crisis signals
const isCrisis = (text) => {
  return CRISIS_KEYWORDS.some(keyword => text.toLowerCase().includes(keyword));
};

app.post('/api/chat', async (req, res) => {
  try {
    const { message, messages, conversationId } = req.body;
    console.log('Received request:', { conversationId, messageType: message ? 'summary' : 'chat' });

    // Handle journal summary request
    if (conversationId === 'journal-summary' && message) {
      console.log('Processing journal summary request');
      
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: message
          }
        ]
      });

      console.log('Summary generated successfully');
      return res.json({ 
        message: response.content[0].text
      });
    }

    // Handle regular chat request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Invalid messages format for chat request');
    }

    const latestMessage = messages[messages.length - 1].content;
    const currentMood = detectMood(latestMessage);
    const crisisDetected = isCrisis(latestMessage);

    // Construct appropriate system prompt based on context
    let systemPrompt = `You are an experienced, empathetic therapist. Current context:
    - User's detected mood: ${currentMood}
    - Crisis status: ${crisisDetected ? 'POTENTIAL CRISIS' : 'Normal'}

    Your approach should be:
    1. Show deep empathy and understanding
    2. Help explore and process emotions safely
    3. Validate feelings while maintaining professional boundaries
    4. Keep responses concise but meaningful (2-3 sentences)
    
    ${crisisDetected ? `CRITICAL: User may be in crisis. Always:
    - Express immediate concern for their safety
    - Provide crisis resources (988 Lifeline, Crisis Text Line: 741741)
    - Encourage professional help
    - Maintain calm, supportive presence` : ''}

    ${currentMood === 'distressed' || currentMood === 'depressed' ? 
    'Note: User shows signs of distress. Focus on emotional support and coping strategies.' : ''}`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages
    });

    // If crisis detected, append resources to response
    let finalResponse = response.content[0].text;
    if (crisisDetected) {
      finalResponse += "\n\nImportant Resources:\n" +
        "🚨 Emergency: 911\n" +
        "🆘 24/7 Crisis Support: 988\n" +
        "💭 Crisis Text Line: Text HOME to 741741";
    }

    res.json({ 
      content: finalResponse,
      mood: currentMood,
      isCrisis: crisisDetected
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Crisis detection: Enabled');
  console.log('Mood detection: Enabled');
});