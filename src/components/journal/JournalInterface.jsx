import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../common/Layout';
import { ThemeToggle } from '../common/ThemeToggle';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, Save, CalendarIcon, 
  Edit, BarChart, X, AlertTriangle, Heart, 
  Clock, Check, ArrowRight 
} from 'lucide-react';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './JournalInterface.css';  // At the top with other imports
import { Bar, Line } from 'react-chartjs-2';  // Make sure there's no duplicate Bar import
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';



// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);
// Styles and Animations
const gradientStyles = {
  primary: "bg-gradient-to-r from-blue-600 to-blue-700",
  secondary: "bg-gradient-to-r from-purple-600 to-blue-600",
  subtle: "bg-gradient-to-r from-blue-50 to-blue-100/50"
};
const calendarStyles = {
    tile: {
      base: "relative flex items-center justify-center h-10 hover:bg-blue-50 rounded-lg transition-colors",
      hasEntry: "font-medium",
      today: "bg-blue-50",
      selected: "bg-blue-600 text-white hover:bg-blue-700"
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: '#1e293b',
        bodyColor: '#475569',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            const percentage = (context.raw / entries.length * 100).toFixed(1);
            return `${context.raw} entries (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.05)',
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        }
      }
    }
  };

const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  },
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.2 }
  }
};

// Utility Functions
const getMoodColor = (mood) => {
  const moodColors = {
    'Happy': 'bg-green-400',
    'Calm': 'bg-blue-400',
    'Anxious': 'bg-yellow-400',
    'Sad': 'bg-indigo-400',
    'Angry': 'bg-red-400',
    'Overwhelmed': 'bg-purple-400',
    'Content': 'bg-teal-400',
    'Frustrated': 'bg-orange-400',
    'Hopeful': 'bg-cyan-400'
  };
  return moodColors[mood] || 'bg-gray-400';
};
const getMostFrequentMood = () => {
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
};

const getMoodFrequency = (mood) => {
  const count = entries.filter(entry => entry.mood === mood).length;
  return ((count / entries.length) * 100).toFixed(1);
};

const getLongestStreak = () => {
  if (entries.length === 0) return 0;
  let maxStreak = 1;
  let currentStreak = 1;
  
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i-1].date);
    const currDate = new Date(sortedEntries[i].date);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

const getCurrentStreak = () => {
  if (entries.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === i) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const getWeeklyTrends = () => {
  const weeklyData = entries.reduce((acc, entry) => {
    const week = format(new Date(entry.date), 'MMM d');
    if (!acc[week]) {
      acc[week] = { count: 0, moods: {} };
    }
    acc[week].count++;
    acc[week].moods[entry.mood] = (acc[week].moods[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(weeklyData).slice(-7); // Last 7 weeks
  const moodTypes = ['Happy', 'Calm', 'Anxious', 'Sad', 'Angry', 'Overwhelmed'];
  
  const datasets = moodTypes.map(mood => ({
    label: mood,
    data: labels.map(week => (weeklyData[week]?.moods[mood] || 0)),
    borderColor: getMoodColor(mood).replace('bg-', 'rgb('),
    backgroundColor: getMoodColor(mood).replace('bg-', 'rgba(').replace(')', ', 0.5)'),
    tension: 0.4
  }));

  return { labels, datasets };
};

const getTopCopingStrategies = () => {
  const strategies = entries.flatMap(entry => 
    Array.isArray(entry.responses.copingStrategies) ? 
    entry.responses.copingStrategies : []
  );
  
  return Object.entries(strategies.reduce((acc, strategy) => {
    acc[strategy] = (acc[strategy] || 0) + 1;
    return acc;
  }, {}))
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
};

const getTopSelfCareActivities = () => {
  const activities = entries.flatMap(entry => 
    Array.isArray(entry.responses.selfCare) ? 
    entry.responses.selfCare : []
  );
  
  return Object.entries(activities.reduce((acc, activity) => {
    acc[activity] = (acc[activity] || 0) + 1;
    return acc;
  }, {}))
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
};

const getMaxCopingCount = () => {
  const counts = getTopCopingStrategies().map(([,count]) => count);
  return Math.max(...counts);
};

const getMaxSelfCareCount = () => {
  const counts = getTopSelfCareActivities().map(([,count]) => count);
  return Math.max(...counts);
};

// Add these chart options
const weeklyTrendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top'
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'white',
      titleColor: '#1e293b',
      bodyColor: '#475569',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(0,0,0,0.05)',
        drawBorder: false
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};
// Generate AI Summary Function
const generateSummary = async(responses, mood) => {
  try {
    const journalContext = `
      Today's Journal Entry:
      - Current Mood: ${mood}
      - Daily Reflection: ${responses.dayReflection || 'Not provided'}
      - Coping Strategies Used: ${Array.isArray(responses.copingStrategies) ? responses.copingStrategies.join(', ') : 'None'}
      - Self-Care Activities: ${Array.isArray(responses.selfCare) ? responses.selfCare.join(', ') : 'None'}
      - Thought Patterns: ${responses.thoughtPatterns || 'Not provided'}
      - Gratitude: ${responses.gratitude || 'Not provided'}
      - Plans for Tomorrow: ${responses.tomorrow || 'Not provided'}
    `;

    const prompt = `
      You are a compassionate journaling assistant. Please create a brief, coherent summary of this journal entry.
      
      Requirements:
      1. Write in a natural, conversational tone
      2. Focus on the key emotional insights and activities
      3. Create clear, grammatically correct sentences
      4. Keep the summary concise (3-4 sentences maximum)
      5. Avoid repeating "you" at the start of each sentence
      6. Connect ideas smoothly using transitions
      7. Fix any typos or grammatical errors from the original entries
      8. Maintain a supportive and understanding tone

      Journal Entry to Summarize:
      ${journalContext}
    `;

    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        conversationId: 'journal-summary'
      })
    });

    const data = await response.json();
    return data.message;

  } catch (error) {
    console.error('Error generating summary:', error);
    return `Today you're feeling ${mood}. ${responses.dayReflection || ''}`;
  }
};

// Journal Prompts
const journalPrompts = [
    {
      id: 'emotionalState',
      type: 'mood-selector',
      question: 'How are you feeling right now?',
      options: ['Happy', 'Calm', 'Anxious', 'Sad', 'Angry', 'Overwhelmed', 'Content', 'Frustrated', 'Hopeful']
    },
    {
      id: 'dayReflection',
      type: 'text',
      question: 'Reflect on your day. What stands out?',
      placeholder: 'Share your thoughts about today...',
      helpText: 'Consider both challenges and positive moments'
    },
    {
      id: 'copingStrategies',
      type: 'multiSelect',
      question: 'What coping strategies did you use today?',
      options: [
        'Deep breathing',
        'Exercise',
        'Meditation',
        'Talking to someone',
        'Taking a break',
        'Journaling',
        'Creative activities',
        'Nature walk',
        'Mindfulness'
      ]
    },
    {
      id: 'selfCare',
      type: 'checklist',
      question: 'Which self-care activities did you engage in?',
      options: [
        'Adequate sleep',
        'Healthy eating',
        'Physical activity',
        'Social connection',
        'Relaxation',
        'Hobby/Interest',
        'Setting boundaries',
        'Personal hygiene',
        'Screen time limits'
      ]
    },
    {
      id: 'thoughtPatterns',
      type: 'text',
      question: 'Notice any recurring thoughts or patterns?',
      placeholder: 'Describe any thoughts that kept coming up...',
      helpText: 'Both positive and challenging patterns are worth noting'
    },
    {
      id: 'gratitude',
      type: 'text',
      question: 'What are you grateful for today?',
      placeholder: 'List 3 things you appreciate...',
      helpText: 'Big or small, all forms of gratitude matter'
    },
    {
      id: 'tomorrow',
      type: 'text',
      question: 'What would you like tomorrow to look like?',
      placeholder: 'Share your hopes or plans for tomorrow...',
      helpText: 'Consider both practical tasks and emotional goals'
    }
  ];
  
  const JournalInterface = () => {
    // State Management
    const [currentStep, setCurrentStep] = useState(0);
    const [responses, setResponses] = useState({});
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [entries, setEntries] = useState([]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [showMoodStats, setShowMoodStats] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [showUndoToast, setShowUndoToast] = useState(false);
    const [deletedEntries, setDeletedEntries] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
    // Chart configuration
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              family: "'Inter', sans-serif",
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'white',
          titleColor: '#1e293b',
          bodyColor: '#475569',
          borderColor: '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw} entries`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            font: {
              family: "'Inter', sans-serif"
            }
          },
          grid: {
            color: 'rgba(0,0,0,0.05)'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: "'Inter', sans-serif"
            }
          }
        }
      }
    };
  
    // Effects
    useEffect(() => {
      const handleResize = () => {
        const isMobileView = window.innerWidth < 768;
        setIsMobile(isMobileView);
        if (isMobileView && showSidebar) {
          setShowSidebar(false);
        }
      };
  
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, [showSidebar]);
  
    useEffect(() => {
      const savedEntries = localStorage.getItem('journalEntries');
      if (savedEntries) {
        try {
          setEntries(JSON.parse(savedEntries));
        } catch (error) {
          console.error('Error loading entries:', error);
        }
      }
    }, []);
  
    useEffect(() => {
      if (entries.length > 0) {
        localStorage.setItem('journalEntries', JSON.stringify(entries));
      }
    }, [entries]);

      // Handler Functions
  const handleResponse = (value, promptId) => {
    setResponses(prev => ({
      ...prev,
      [promptId]: value
    }));
  };

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, journalPrompts.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const summary = await generateSummary(responses, responses.emotionalState);
      
      const newEntry = {
        id: Date.now(),
        date: selectedDate.toISOString(),
        mood: responses.emotionalState || 'Unknown',
        responses,
        summary
      };

      if (editingEntry) {
        setEntries(prev => prev.map(entry => 
          entry.id === editingEntry.id ? newEntry : entry
        ));
        setEditingEntry(null);
      } else {
        setEntries(prev => [newEntry, ...prev]);
      }

      // Reset form
      setResponses({});
      setCurrentStep(0);
      
      // Show success animation
      motion.animate(".save-success", 
        { scale: [1, 1.2, 1], opacity: [0, 1, 0] },
        { duration: 1.5 }
      );

      if (isMobile) {
        setShowSidebar(true);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (entry, e) => {
    if (e) e.stopPropagation();
    setEditingEntry(entry);
    setResponses(entry.responses);
    setSelectedDate(new Date(entry.date));
    setCurrentStep(0);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleDelete = (entryId, e) => {
    if (e) e.stopPropagation();
    const entry = entries.find(e => e.id === entryId);
    setEntryToDelete(entry);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setDeletedEntries([entryToDelete]);
    setEntries(prev => prev.filter(e => e.id !== entryToDelete.id));
    setShowDeleteModal(false);
    setShowUndoToast(true);
    
    // Hide undo toast after 5 seconds
    setTimeout(() => {
      setShowUndoToast(false);
      setDeletedEntries([]);
    }, 5000);
  };

  const handleUndo = () => {
    if (deletedEntries.length > 0) {
      setEntries(prev => [...deletedEntries, ...prev]);
      setDeletedEntries([]);
      setShowUndoToast(false);
    }
  };

const getMoodStats = () => {
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  return {
    labels: Object.keys(moodCounts),
    datasets: [
      {
        label: 'Mood Distribution',
        data: Object.values(moodCounts),
        backgroundColor: Object.keys(moodCounts).map(mood => {
          const colorClass = getMoodColor(mood);
          // Convert Tailwind classes to RGB values
          const colorMap = {
            'bg-green-400': 'rgb(74, 222, 128)',
            'bg-blue-400': 'rgb(96, 165, 250)',
            'bg-yellow-400': 'rgb(250, 204, 21)',
            'bg-indigo-400': 'rgb(129, 140, 248)',
            'bg-red-400': 'rgb(248, 113, 113)',
            'bg-purple-400': 'rgb(192, 132, 252)',
            'bg-teal-400': 'rgb(45, 212, 191)',
            'bg-orange-400': 'rgb(251, 146, 60)',
            'bg-cyan-400': 'rgb(34, 211, 238)',
          };
          return colorMap[colorClass] || 'rgb(148, 163, 184)';
        }),
        borderRadius: 8,
        hoverOffset: 4
      }
    ]
  };
};

const getMostFrequentMood = () => {
  if (entries.length === 0) return 'No entries';
  const moodCounts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
};

const getMoodFrequency = (mood) => {
  if (entries.length === 0) return '0';
  const count = entries.filter(entry => entry.mood === mood).length;
  return ((count / entries.length) * 100).toFixed(1);
};

const getLongestStreak = () => {
  if (entries.length === 0) return 0;
  let maxStreak = 1;
  let currentStreak = 1;
  
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 1; i < sortedEntries.length; i++) {
    const prevDate = new Date(sortedEntries[i-1].date);
    const currDate = new Date(sortedEntries[i].date);
    const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
};

const getCurrentStreak = () => {
  if (entries.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entryDate = new Date(sortedEntries[i].date);
    const diffDays = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === i) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

const getWeeklyTrends = () => {
  if (entries.length === 0) return { labels: [], datasets: [] };

  const weeklyData = entries.reduce((acc, entry) => {
    const week = format(new Date(entry.date), 'MMM d');
    if (!acc[week]) {
      acc[week] = { count: 0, moods: {} };
    }
    acc[week].count++;
    acc[week].moods[entry.mood] = (acc[week].moods[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(weeklyData).slice(-7);
  const moodTypes = ['Happy', 'Calm', 'Anxious', 'Sad', 'Angry', 'Overwhelmed'];
  
  const datasets = moodTypes.map(mood => ({
    label: mood,
    data: labels.map(week => (weeklyData[week]?.moods[mood] || 0)),
    borderColor: getMoodColor(mood).replace('bg-', 'rgb('),
    backgroundColor: getMoodColor(mood).replace('bg-', 'rgba(').replace(')', ', 0.5)'),
    tension: 0.4,
    fill: false
  }));

  return { labels, datasets };
};

const getTopCopingStrategies = () => {
  if (!entries.length) return [];
  const strategies = entries.flatMap(entry => 
    entry.responses?.copingStrategies || []
  ).filter(Boolean);
  
  return Object.entries(strategies.reduce((acc, strategy) => {
    acc[strategy] = (acc[strategy] || 0) + 1;
    return acc;
  }, {}))
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
};

const getTopSelfCareActivities = () => {
  if (!entries.length) return [];
  const activities = entries.flatMap(entry => 
    entry.responses?.selfCare || []
  ).filter(Boolean);
  
  return Object.entries(activities.reduce((acc, activity) => {
    acc[activity] = (acc[activity] || 0) + 1;
    return acc;
  }, {}))
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
};

const getMaxCopingCount = () => {
  const counts = getTopCopingStrategies().map(([,count]) => count);
  return Math.max(...counts, 1);
};

const getMaxSelfCareCount = () => {
  const counts = getTopSelfCareActivities().map(([,count]) => count);
  return Math.max(...counts, 1);
};

const weeklyTrendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        font: {
          family: "'Inter', sans-serif",
          size: 12
        }
      }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'white',
      titleColor: '#1e293b',
      bodyColor: '#475569',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        font: {
          family: "'Inter', sans-serif",
          size: 12
        }
      },
      grid: {
        color: 'rgba(0,0,0,0.05)',
        drawBorder: false
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          family: "'Inter', sans-serif",
          size: 12
        }
      }
    }
  }
};

  // Render Functions
  const renderPromptInput = (prompt) => {
    switch (prompt.type) {
      case 'mood-selector':
        return (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
            variants={animations.fadeIn}
          >
            {prompt.options.map((option) => (
              <motion.button
                key={option}
                onClick={() => handleResponse(option, prompt.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl transition-all duration-300 shadow-sm ${
                  responses[prompt.id] === option 
                    ? `${gradientStyles.primary} text-white shadow-lg shadow-blue-500/25` 
                    : 'bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <span className="text-lg">{option}</span>
              </motion.button>
            ))}
          </motion.div>
        );

      case 'multiSelect':
        return (
          <motion.div 
            className="space-y-3"
            variants={animations.fadeIn}
          >
            {prompt.options.map((option) => (
              <label
                key={option}
                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-400 transition-all bg-white hover:shadow-md cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={responses[prompt.id]?.includes(option)}
                  onChange={(e) => {
                    const current = responses[prompt.id] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter(item => item !== option);
                    handleResponse(updated, prompt.id);
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded-md"
                />
                <span className="ml-3 group-hover:text-blue-600 transition-colors">
                  {option}
                </span>
              </label>
            ))}
          </motion.div>
        );

      case 'checklist':
        return (
          <motion.div 
            className="space-y-3"
            variants={animations.fadeIn}
          >
            {prompt.options.map((option) => (
              <label
                key={option}
                className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-blue-400 transition-all bg-white hover:shadow-md cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={responses[prompt.id]?.includes(option)}
                  onChange={(e) => {
                    const current = responses[prompt.id] || [];
                    const updated = e.target.checked
                      ? [...current, option]
                      : current.filter(item => item !== option);
                    handleResponse(updated, prompt.id);
                  }}
                  className="form-checkbox h-5 w-5 text-blue-600 rounded-md"
                />
                <span className="ml-3 group-hover:text-blue-600 transition-colors">
                  {option}
                </span>
              </label>
            ))}
          </motion.div>
        );

      default:
        return (
          <motion.div 
            className="space-y-2"
            variants={animations.fadeIn}
          >
            <textarea
              value={responses[prompt.id] || ''}
              onChange={(e) => handleResponse(e.target.value, prompt.id)}
              placeholder={prompt.placeholder}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 min-h-[150px] transition-all"
            />
            {prompt.helpText && (
              <p className="text-sm text-gray-500 italic">
                {prompt.helpText}
              </p>
            )}
          </motion.div>
        );
    }
  };

// Main Render
return (
  <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 
    dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 
            dark:from-blue-400 dark:to-blue-500 text-transparent bg-clip-text">
            Journal Entry
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 
                text-gray-600 dark:text-gray-300 transition-colors"
            >
              {showSidebar ? <X className="h-5 w-5" /> : <BarChart className="h-5 w-5" />}
            </button>
            <ThemeToggle />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className={`flex-1 ${showSidebar && isMobile ? 'hidden' : ''}`}>
          {/* Date and Controls */}
          <div className="mb-6 flex items-center justify-between bg-white dark:bg-gray-800 
            rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="p-2 border border-gray-200 dark:border-gray-600 
                  rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 
                  dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={() => setShowCalendar(true)}
                className="p-2.5 text-gray-600 dark:text-gray-300 
                  hover:text-blue-600 dark:hover:text-blue-400 
                  rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
              >
                <CalendarIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMoodStats(true)}
                className="p-2.5 text-gray-600 dark:text-gray-300 
                  hover:text-blue-600 dark:hover:text-blue-400 
                  rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-all"
              >
                <BarChart className="h-5 w-5" />
              </button>
              {!isMobile && <ThemeToggle />}
            </div>
          </div>
    
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Step {currentStep + 1} of {journalPrompts.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(((currentStep + 1) / journalPrompts.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-2 ${gradientStyles.primary} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((currentStep + 1) / journalPrompts.length) * 100}%` 
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
    
                {/* Current Prompt */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-2xl p-8 shadow-lg mb-6"
                  >
                    <h2 className="text-2xl font-semibold mb-6">
                      {journalPrompts[currentStep].question}
                    </h2>
                    {renderPromptInput(journalPrompts[currentStep])}
                  </motion.div>
                </AnimatePresence>
    
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:hover:text-gray-600 transition-colors rounded-xl hover:bg-blue-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                    Previous
                  </button>
    
                  {currentStep === journalPrompts.length - 1 ? (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`${gradientStyles.primary} flex items-center gap-2 px-6 py-3 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5`}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                          Generating Summary...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5" />
                          Save Entry
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 text-blue-600 hover:text-blue-700 rounded-xl hover:bg-blue-50 transition-colors"
                    >
                      Next
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
    
              {/* Sidebar */}
              <AnimatePresence>
                {showSidebar && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`${
                      isMobile ? 'fixed inset-0 bg-white z-50' : 'w-80 border-l border-gray-200'
                    } bg-white p-6 overflow-auto`}
                  >
                                    {/* Sidebar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                    Previous Entries
                  </h2>
                  {isMobile && (
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Entries List */}
                <div className="space-y-4">
                  {entries.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-3">
                        <Edit className="h-12 w-12 mx-auto" />
                      </div>
                      <p className="text-gray-600">No journal entries yet</p>
                      <p className="text-sm text-gray-500">
                        Start writing to see your entries here
                      </p>
                    </div>
                  ) : (
                    entries.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 border border-gray-200 rounded-xl hover:border-blue-200 bg-white hover:bg-blue-50/50 cursor-pointer relative group transition-all duration-300 hover:shadow-md"
                        onClick={() => handleEdit(entry)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            {format(new Date(entry.date), 'MMM d, yyyy')}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleEdit(entry, e)}
                              className="p-1 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all"
                              title="Edit entry"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(entry.id, e)}
                              className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete entry"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="font-medium text-gray-800 flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${getMoodColor(entry.mood)}`} />
                          {entry.mood}
                        </div>
                        
                        {entry.summary && (
                          <div className="text-sm text-gray-600 mt-2 line-clamp-3 group-hover:line-clamp-none transition-all">
                            {entry.summary}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Calendar Modal */}
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCalendar(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                  Select Date
                </h2>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <Calendar
                onChange={date => {
                  setSelectedDate(date);
                  setShowCalendar(false);
                }}
                value={selectedDate}
                className="custom-calendar"
                tileClassName={({ date }) => {
                  const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  const hasEntry = entries.some(e => 
                    format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  );
                  
                  return `${calendarStyles.tile.base} ${hasEntry ? calendarStyles.tile.hasEntry : ''} ${
                    isToday ? calendarStyles.tile.today : ''
                  } ${isSelected ? calendarStyles.tile.selected : ''}`;
                }}
                tileContent={({ date }) => {
                  const entry = entries.find(
                    e => format(new Date(e.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  );
                  return entry ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full ${getMoodColor(entry.mood)}`}
                    />
                  ) : null;
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Mood Stats Modal */}
        {showMoodStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowMoodStats(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-5xl w-full shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-3">
                    <BarChart className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">No Entries Yet</h3>
                  <p className="text-gray-600">Start journaling to see your mood analytics</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                        Mood Insights
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Analysis of {entries.length} journal entries
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMoodStats(false)}
                      className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">Most Common Mood</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getMoodColor(getMostFrequentMood())}`} />
                        <span className="text-xl font-semibold text-gray-900">{getMostFrequentMood()}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {getMoodFrequency(getMostFrequentMood())}% of entries
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4">
                      <div className="text-sm text-purple-600 font-medium mb-1">Longest Streak</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {getLongestStreak()} days
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Consecutive journal entries
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4">
                      <div className="text-sm text-green-600 font-medium mb-1">Current Streak</div>
                      <div className="text-xl font-semibold text-gray-900">
                        {getCurrentStreak()} days
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Keep the momentum going!
                      </div>
                    </div>
                  </div>

                  {/* Mood Distribution */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Mood Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                      {Object.entries(getMoodStats().datasets[0].data).map(([mood, count], index) => (
                        <div key={mood} 
                          className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                        >
                          <div className={`w-3 h-3 rounded-full ${getMoodColor(getMoodStats().labels[index])}`} />
                          <div>
                            <div className="font-medium">{getMoodStats().labels[index]}</div>
                            <div className="text-sm text-gray-500">
                              {count} entries ({((count / entries.length) * 100).toFixed(1)}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="h-[300px]">
                      <Bar data={getMoodStats()} options={chartOptions} />
                    </div>
                  </div>

                  {/* Weekly Trends */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Mood Trends</h3>
                    <div className="h-[250px]">
                      <Line 
                        data={getWeeklyTrends()} 
                        options={weeklyTrendOptions} 
                      />
                    </div>
                  </div>

                  {/* Common Patterns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Coping Strategies</h3>
                      <div className="space-y-3">
                        {getTopCopingStrategies().map(([strategy, count]) => (
                          <div key={strategy} className="flex items-center justify-between">
                            <span className="text-gray-700">{strategy}</span>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-gray-500">{count} times</div>
                              <div 
                                className="h-2 bg-blue-200 rounded-full" 
                                style={{ 
                                  width: `${(count / getMaxCopingCount()) * 100}px` 
                                }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Self-Care Activities</h3>
                      <div className="space-y-3">
                        {getTopSelfCareActivities().map(([activity, count]) => (
                          <div key={activity} className="flex items-center justify-between">
                            <span className="text-gray-700">{activity}</span>
                            <div className="flex items-center gap-2">
                              <div className="text-sm text-gray-500">{count} times</div>
                              <div 
                                className="h-2 bg-purple-200 rounded-full" 
                                style={{ 
                                  width: `${(count / getMaxSelfCareCount()) * 100}px` 
                                }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Entry
                  </h3>
                  <p className="text-gray-600">
                    Are you sure you want to delete this journal entry? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {showUndoToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-3"
          >
            <Check className="h-5 w-5 text-blue-600" />
            <span>Entry deleted</span>
            <button
              onClick={handleUndo}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalInterface;