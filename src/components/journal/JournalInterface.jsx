import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Save, CalendarIcon, Edit, BarChart, X } from 'lucide-react'; // Changed Calendar to CalendarIcon
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Import your prompts arrays here
const journalPrompts = [
    {
      id: 'emotionalState',
      question: "How are you feeling emotionally right now?",
      type: 'mood-selector',
      options: [
        'Calm', 'Anxious', 'Happy', 'Sad', 'Angry', 
        'Overwhelmed', 'Content', 'Frustrated', 'Hopeful'
      ],
      subQuestion: "What do you think triggered these feelings?"
    },
    {
      id: 'dayReflection',
      question: "Let's reflect on your day. What moment or situation had the strongest emotional impact on you?",
      type: 'text',
      placeholder: "Describe the situation and how it made you feel..."
    },
    {
      id: 'copingStrategies',
      question: "How did you handle difficult moments today?",
      type: 'multiSelect',
      options: [
        'Talked to someone', 
        'Took deep breaths',
        'Went for a walk',
        'Listened to music',
        'Practiced mindfulness',
        'Took a break',
        'Journaled',
        'Exercise',
        'Other'
      ],
      followUp: "Which strategy worked best for you?"
    },
    {
      id: 'thoughtPatterns',
      question: "Did you notice any recurring thoughts today?",
      type: 'text',
      placeholder: "What thoughts kept coming back to your mind?",
      helpText: "Understanding our thought patterns helps us manage them better"
    },
    {
      id: 'selfCare',
      question: "How did you take care of yourself today?",
      type: 'checklist',
      options: [
        'Got enough sleep',
        'Ate regular meals',
        'Moved my body',
        'Took breaks',
        'Connected with others',
        'Made time for things I enjoy',
        'Set boundaries'
      ]
    },
    {
      id: 'support',
      question: "Do you feel you have the support you need right now?",
      type: 'scale',
      options: ['Not at all', 'Somewhat', 'Mostly', 'Yes, definitely'],
      followUp: "What kind of support would be most helpful?"
    },
    {
      id: 'tomorrow',
      question: "Looking ahead to tomorrow, what's one small thing you can do to support your emotional wellbeing?",
      type: 'text',
      placeholder: "It could be as simple as taking a 5-minute break or sending a message to a friend"
    },
    {
      id: 'gratitude',
      question: "Even on difficult days, can you identify something positive, no matter how small?",
      type: 'text',
      placeholder: "This helps train our brain to notice positive aspects alongside challenges"
    }
  ];
  
  const anxietyPrompts = [
    {
      id: 'anxietyTriggers',
      question: "Were there specific situations that triggered anxiety today?",
      followUp: "How intense was the anxiety on a scale of 1-10?"
    },
    {
      id: 'bodilySensations',
      question: "What physical sensations did you notice during anxious moments?",
      type: 'multiSelect',
      options: [
        'Racing heart',
        'Tight chest',
        'Sweating',
        'Nausea',
        'Muscle tension',
        'Shallow breathing',
        'Other'
      ]
    }
  ];
  
  const moodPrompts = [
    {
      id: 'energyLevels',
      question: "How were your energy levels today?",
      type: 'scale',
      options: ['Very low', 'Low', 'Moderate', 'Good', 'High']
    },
    {
      id: 'activities',
      question: "Were you able to engage in any activities you usually enjoy?",
      followUp: "How did these activities make you feel?"
    }
  ];

const JournalInterface = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showMoodStats, setShowMoodStats] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  // Add these with your other state variables
  const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);
    const [deletedEntries, setDeletedEntries] = useState([]);
    const [showUndoToast, setShowUndoToast] = useState(false);
    const [isSaving, setIsSaving] = useState(false);               

  // Load entries on mount
  // Update the useEffect hook
// Keep your existing useEffect for loading entries
useEffect(() => {
    try {
      const savedEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      console.log('Loaded entries:', savedEntries); // Debug line
      setEntries(savedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
      setEntries([]);
    }
  }, []);

// Add this new useEffect for persisting responses
useEffect(() => {
  // Save responses to localStorage whenever they change
  if (Object.keys(responses).length > 0) {
    localStorage.setItem('draftResponses', JSON.stringify({
      responses,
      selectedMood,
      currentStep
    }));
  }
}, [responses, selectedMood, currentStep]);

// And add this useEffect to load saved responses on mount
useEffect(() => {
  const savedDraft = localStorage.getItem('draftResponses');
  if (savedDraft) {
    const { responses: savedResponses, selectedMood: savedMood, currentStep: savedStep } = JSON.parse(savedDraft);
    setResponses(savedResponses);
    setSelectedMood(savedMood);
    setCurrentStep(savedStep);
  }
}, []);

  // Get appropriate prompts based on mood
  const getPrompts = () => {
    let prompts = [...journalPrompts];
    if (selectedMood === 'Anxious') {
      prompts = [...prompts, ...anxietyPrompts];
    }
    if (['Sad', 'Overwhelmed'].includes(selectedMood)) {
      prompts = [...prompts, ...moodPrompts];
    }
    return prompts;
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < getPrompts().length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResponse = (value, promptId, type = 'main') => {
    // Keep track of previous responses
    const updatedResponses = {
      ...responses,
      [promptId]: value,
      ...(type === 'sub' && { [`${promptId}_sub`]: value }),
      ...(type === 'followup' && { [`${promptId}_followup`]: value })
    };
    
    setResponses(updatedResponses);
  
    // If this is the mood selection, update selectedMood
    if (promptId === 'emotionalState') {
      setSelectedMood(value);
    }
  
    // Log to verify state updates
    console.log('Updated responses:', updatedResponses);
  };



// Replace your existing handleSave with this version
const handleSave = async () => {
    if (!selectedMood) {
      alert('Please select your mood before saving');
      return;
    }
  
    try {
      setIsSaving(true);
  
      // Generate AI summary
      const summary = await generateSummary(responses, selectedMood);
  
      const journalEntry = {
        id: editingEntry?.id || Date.now().toString(),
        date: selectedDate.toISOString(),
        timestamp: new Date().toISOString(),
        responses: responses,
        mood: selectedMood,
        summary: summary
      };
  
      const updatedEntries = editingEntry
        ? entries.map(e => e.id === editingEntry.id ? journalEntry : e)
        : [journalEntry, ...entries];
  
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      
      // Clear the draft after successful save
      localStorage.removeItem('draftResponses');
      
      // Reset form
      setResponses({});
      setCurrentStep(0);
      setSelectedMood(null);
      setEditingEntry(null);
  
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
const generateSummary = async (responses, mood) => {
    try {
      // Format the journal data into a clear prompt
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
          message: prompt,  // Send the prompt as message
          conversationId: 'journal-summary'
        })
      });
  
      const data = await response.json();
      return data.message;  // Now matches the backend response format
  
    } catch (error) {
      console.error('Error generating summary:', error);
      return `Today you're feeling ${mood}. ${responses.dayReflection || ''}`;
    }
  };
    
      // Get mood statistics for visualization
      const getMoodStats = () => {
        const moodCounts = entries.reduce((acc, entry) => {
          if (entry.mood) {
            acc[entry.mood] = (acc[entry.mood] || 0) + 1;
          }
          return acc;
        }, {});
    
        return {
          labels: Object.keys(moodCounts),
          datasets: [{
            label: 'Mood Distribution',
            data: Object.values(moodCounts),
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ]
          }]
        };
      };
    
// Add from line 255 to line 307
  // Update handleDelete to show modal instead of immediate deletion
  const handleDelete = (entryId, event) => {
    event.stopPropagation();
    const entryToDelete = entries.find(entry => entry.id === entryId);
    setEntryToDelete(entryToDelete);
    setShowDeleteModal(true);
  };

  // Add new function to handle the actual deletion
  const confirmDelete = () => {
    if (!entryToDelete) return;

    try {
      // Store the deleted entry for potential undo
      setDeletedEntries(prev => [...prev, entryToDelete]);
      
      // Filter out the entry
      const updatedEntries = entries.filter(entry => entry.id !== entryToDelete.id);
      
      // Update localStorage and state
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
      
      // Reset form if we're currently editing this entry
      if (editingEntry?.id === entryToDelete.id) {
        setResponses({});
        setCurrentStep(0);
        setSelectedMood(null);
        setEditingEntry(null);
      }

      // Show undo toast
      setShowUndoToast(true);
      
      // Hide undo toast after 5 seconds
      setTimeout(() => {
        setShowUndoToast(false);
      }, 5000);
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error deleting entry. Please try again.');
    }
    
    setShowDeleteModal(false);
    setEntryToDelete(null);
  };

  // Add undo function
  const handleUndo = () => {
    const lastDeleted = deletedEntries[deletedEntries.length - 1];
    if (!lastDeleted) return;

    // Add the entry back
    const updatedEntries = [...entries, lastDeleted];
    updatedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Update localStorage and state
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
    
    // Remove from deletedEntries
    setDeletedEntries(prev => prev.slice(0, -1));
    setShowUndoToast(false);
  };
      // Render input based on prompt type
      const renderPromptInput = (prompt) => {
        switch (prompt.type) {
            case 'mood-selector':
                return (
                  <div className="grid grid-cols-3 gap-3">
                    {prompt.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleResponse(option, prompt.id)}
                        className={`p-3 rounded-lg border transition-colors ${
                          responses[prompt.id] === option 
                            ? 'bg-blue-100 border-blue-500 text-blue-700' 
                            : 'border-gray-200 hover:border-blue-500'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                );
    
                case 'multiSelect':
                    return (
                      <div className="space-y-3">
                        {prompt.options.map((option) => (
                          <label key={option} className="flex items-center space-x-3">
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
                              className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    );
    
          case 'scale':
            return (
              <div className="flex justify-between gap-3">
                {prompt.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleResponse(option, prompt.id)}
                    className={`p-3 rounded-lg border ${
                      responses[prompt.id] === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            );
    
          case 'checklist':
            return (
              <div className="space-y-3">
                {prompt.options.map((option) => (
                  <label key={option} className="flex items-center space-x-3">
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
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            );
    
          default:
            return (
              <textarea
                value={responses[prompt.id] || ''}
                onChange={(e) => handleResponse(e.target.value, prompt.id)}
                placeholder={prompt.placeholder}
                className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 min-h-[120px]"
              />
            );
        }
      };
    
      // Render complete prompt with sub-questions and follow-ups
      const renderPrompt = (prompt) => {
        return (
          <div className="space-y-6">
            {/* Main question */}
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                {prompt.question}
              </h3>
              {prompt.helpText && (
                <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg">
                  {prompt.helpText}
                </p>
              )}
              {renderPromptInput(prompt)}
            </div>
    
            {/* Sub question */}
            {prompt.subQuestion && responses[prompt.id] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-md font-medium text-gray-700 mb-2">
                  {prompt.subQuestion}
                </h4>
                <textarea
                  value={responses[`${prompt.id}_sub`] || ''}
                  onChange={(e) => handleResponse(e.target.value, prompt.id, 'sub')}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 min-h-[80px]"
                />
              </div>
            )}
    
            {/* Follow-up question */}
            {prompt.followUp && responses[prompt.id] && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-md font-medium text-gray-700 mb-2">
                  {prompt.followUp}
                </h4>
                <textarea
                  value={responses[`${prompt.id}_followup`] || ''}
                  onChange={(e) => handleResponse(e.target.value, prompt.id, 'followup')}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 min-h-[80px]"
                />
              </div>
            )}
          </div>
        );
      };
    
      // Main render method
      return (
        <div className="flex h-screen bg-gray-50">
          {/* Main journaling area */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-2xl mx-auto">
              {/* Date selector */}
              <div className="mb-6 flex items-center justify-between">
                <input
                  type="date"
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="p-2 border border-gray-200 rounded-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCalendar(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowMoodStats(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <BarChart className="h-5 w-5" />
                  </button>
                </div>
              </div>
    
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Question {currentStep + 1} of {getPrompts().length}
                  </span>
                  <span className="text-sm text-gray-600">
                    {Math.round(((currentStep + 1) / getPrompts().length) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / getPrompts().length) * 100}%` }}
                  />
                </div>
              </div>
    
              {/* Current prompt */}
              {renderPrompt(getPrompts()[currentStep])}
    
              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
    
                {currentStep === getPrompts().length - 1 ? (
                    <button
                     onClick={handleSave}
                     disabled={isSaving}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                 >
                    {isSaving ? (
                    <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Generating Summary...
                    </>
                ) : (
                    <>
                    <Save className="h-4 w-4" />
                    Save Entry
                    </>
                )}
                </button>
            ) : (
                <button
    onClick={handleNext}
    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700"
  >
    Next
    <ChevronRight className="h-4 w-4" />
  </button>
    )}
              </div>
            </div>
          </div>
    
{/* Sidebar */}
{showSidebar && (
  <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-auto">
    <h2 className="text-lg font-semibold mb-4">Previous Entries</h2>
    <div className="space-y-4">
      {entries.map((entry) => (
        <div 
          key={entry.id} 
          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer relative group"
          onClick={() => handleEdit(entry)}
        >
          <div className="text-sm text-gray-600">
            {format(new Date(entry.date), 'MMM d, yyyy')}
          </div>
          <div className="font-medium text-gray-800 mt-1">
            Mood: {entry.mood}
          </div>
          {/* Add this section to display the summary */}
          {entry.summary && (
            <div className="text-sm text-gray-600 mt-2 line-clamp-3">
              {entry.summary}
            </div>
          )}
          <button
            onClick={(e) => handleDelete(entry.id, e)}
            className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete entry"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
)}
    
          {/* Calendar Modal */}
          {showCalendar && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Select Date</h2>
                  <button
                    onClick={() => setShowCalendar(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <Calendar
                  onChange={(date) => {
                    setSelectedDate(date);
                    setShowCalendar(false);
                  }}
                  value={selectedDate}
                  tileContent={({ date }) => {
                    const entry = entries.find(
                      e => e.date.split('T')[0] === date.toISOString().split('T')[0]
                    );
                    return entry ? (
                      <div className="h-2 w-2 bg-blue-500 rounded-full mx-auto mt-1" />
                    ) : null;
                  }}
                />
              </div>
            </div>
          )}
        
                    {/* Mood Stats Modal */}
                    {showMoodStats && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Mood Distribution</h2>
                  <button
                    onClick={() => setShowMoodStats(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="h-96">
                  <Bar
                    data={getMoodStats()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in">
                <h2 className="text-lg font-semibold mb-4">Delete Entry</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this journal entry from {format(new Date(entryToDelete.date), 'MMMM d, yyyy')}?
                  This action can be undone for 5 seconds after deletion.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Undo Toast */}
          {showUndoToast && (
            <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up">
              <span>Entry deleted</span>
              <button
                onClick={handleUndo}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Undo
              </button>
            </div>
          )}
        </div>
      );
    };
    
    export default JournalInterface;