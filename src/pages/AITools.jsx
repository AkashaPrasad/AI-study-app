import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiFileText, FiHelpCircle, FiGrid, FiSend, FiArrowLeft, FiRefreshCw, FiMessageSquare } from 'react-icons/fi';
import { toast } from 'react-toastify';
import useSubjects from '../hooks/useSubjects';
import { generateSummary, generateQuestions, generateFlashcards, askQuestion } from '../services/aiService';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const AITools = () => {
  const { subjects, topics, getTopicsForSubject } = useSubjects();
  const [activeTool, setActiveTool] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const chatEndRef = useRef(null);

  const subjectTopics = selectedSubject ? getTopicsForSubject(selectedSubject) : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-load cached results when topic or tool changes
  useEffect(() => {
    if (activeTool && activeTool !== 'chat' && selectedSubject && selectedTopic) {
      const subjectName = subjects.find(s => s.id === selectedSubject)?.name || '';
      const topicName = topics.find(t => t.id === selectedTopic)?.name || '';
      const cacheKey = `studyAI_${activeTool}_${subjectName}_${topicName}`;
      
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        if (activeTool === 'flashcards') {
          try {
            setFlashcards(JSON.parse(cached));
            setFlippedCards({});
          } catch { setFlashcards([]); }
          setResult(null);
        } else {
          setResult(cached);
          setFlashcards([]);
        }
      } else {
        setResult(null);
        setFlashcards([]);
      }
    } else if (activeTool && activeTool !== 'chat') {
        setResult(null);
        setFlashcards([]);
    }
  }, [activeTool, selectedSubject, selectedTopic, subjects, topics]);

  const tools = [
    { id: 'summary', icon: <FiFileText />, title: 'Generate Summary', desc: 'Get a concise summary of any topic with key concepts and explanations.', bg: '#ecfdf5', color: '#2ecc71' },
    { id: 'questions', icon: <FiHelpCircle />, title: 'Practice Questions', desc: 'Generate practice questions with answers to test your understanding.', bg: '#eef2ff', color: '#6366f1' },
    { id: 'flashcards', icon: <FiGrid />, title: 'Flashcards', desc: 'Create interactive flashcards for quick revision and memorization.', bg: '#fffbeb', color: '#f59e0b' },
    { id: 'chat', icon: <FiMessageSquare />, title: 'Ask AI', desc: 'Chat with AI about any study topic. Ask questions and get instant answers.', bg: '#fef2f2', color: '#ef4444' }
  ];

  const handleGenerate = async () => {
    if (activeTool !== 'chat' && (!selectedSubject || !selectedTopic)) {
      toast.error('Please select a subject and topic');
      return;
    }

    const subjectName = subjects.find(s => s.id === selectedSubject)?.name || '';
    const topicObj = topics.find(t => t.id === selectedTopic);
    const topicName = topicObj?.name || '';
    const cacheKey = `studyAI_${activeTool}_${subjectName}_${topicName}`;

    setLoading(true);
    setResult(null);
    setFlashcards([]);
    try {
      if (activeTool === 'summary') {
        const data = await generateSummary(topicName, subjectName);
        localStorage.setItem(cacheKey, data);
        setResult(data);
      } else if (activeTool === 'questions') {
        const data = await generateQuestions(topicName, subjectName);
        localStorage.setItem(cacheKey, data);
        setResult(data);
      } else if (activeTool === 'flashcards') {
        const data = await generateFlashcards(topicName, subjectName);
        localStorage.setItem(cacheKey, JSON.stringify(data));
        setFlashcards(data);
        setFlippedCards({});
      }
      toast.success('Generated successfully!');
    } catch (err) {
      toast.error('Failed to generate. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const context = selectedSubject
        ? `${subjects.find(s => s.id === selectedSubject)?.name || ''} - ${topics.find(t => t.id === selectedTopic)?.name || ''}`
        : '';
      const response = await askQuestion(userMsg, context);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const toggleFlip = (i) => setFlippedCards(prev => ({ ...prev, [i]: !prev[i] }));

  const renderContent = () => {
    if (activeTool === 'chat') {
      return (
        <div className="ai-chat">
          <div className="ai-chat-header">
            <h3><FiMessageSquare style={{ marginRight: 8 }} /> AI Study Chat</h3>
            {messages.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setMessages([])}>
                <FiRefreshCw size={14} /> Clear
              </button>
            )}
          </div>
          <div className="ai-chat-body">
            {messages.length === 0 && (
              <div className="empty-state" style={{ padding: 40 }}>
                <FiCpu style={{ fontSize: 36, color: '#ccc' }} />
                <h3>Ask me anything!</h3>
                <p>Type a question about any study topic and I'll help you understand it better.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`ai-message ${msg.role}`}>
                <div className="ai-message-content" dangerouslySetInnerHTML={{
                  __html: msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/\n/g, '<br/>')
                }} />
              </div>
            ))}
            {loading && (
              <div className="ai-message assistant">
                <div className="ai-message-content">
                  <div className="loading-spinner" style={{ padding: 8 }}>
                    <div className="spinner" style={{ width: 20, height: 20 }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="ai-chat-input">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask a study question..."
              onKeyDown={e => e.key === 'Enter' && !loading && handleChat()} disabled={loading} />
            <button className="btn btn-primary" onClick={handleChat} disabled={loading || !chatInput.trim()}>
              <FiSend size={16} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 180, margin: 0 }}>
              <label>Subject</label>
              <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic(''); }}>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            {subjectTopics.length > 0 && (
              <div className="form-group" style={{ flex: 1, minWidth: 180, margin: 0 }}>
                <label>Topic</label>
                <select value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
                  <option value="">Select topic</option>
                  {subjectTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
            <button className="btn btn-primary" onClick={handleGenerate} disabled={loading || !selectedSubject || !selectedTopic} style={{ height: 42 }}>
              {loading ? (
                <div className="spinner" style={{ width: 18, height: 18 }} />
              ) : (
                <><FiCpu /> {(result || flashcards.length > 0) ? 'Regenerate' : 'Generate'}</>
              )}
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading-spinner">
            <div className="spinner" />
          </div>
        )}

        {activeTool === 'flashcards' && flashcards.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Flashcards — Click to flip</h3>
            <div className="flashcard-grid">
              {flashcards.map((card, i) => (
                <motion.div className="flashcard" key={i} onClick={() => toggleFlip(i)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <span className="flashcard-label">{flippedCards[i] ? 'Answer' : 'Question'}</span>
                  <div className={flippedCards[i] ? 'flashcard-back' : 'flashcard-front'}>
                    {flippedCards[i] ? card.back : card.front}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {result && (activeTool === 'summary' || activeTool === 'questions') && (
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="ai-message-content" style={{ maxWidth: '100%', background: 'transparent', padding: 0 }}
              dangerouslySetInnerHTML={{
                __html: result
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
                  .replace(/### (.*?)(\n|$)/g, '<h3>$1</h3>')
                  .replace(/## (.*?)(\n|$)/g, '<h2>$1</h2>')
                  .replace(/# (.*?)(\n|$)/g, '<h1>$1</h1>')
                  .replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
                  .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
                  .replace(/\n/g, '<br/>')
              }}
            />
          </motion.div>
        )}

        {!result && !loading && flashcards.length === 0 && (
          <div className="empty-state">
            <FiCpu />
            <h3>Select a Topic</h3>
            <p>Choose a subject and topic, then click Generate to create {activeTool === 'summary' ? 'a summary' : activeTool === 'questions' ? 'practice questions' : 'flashcards'}.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
      <div className="page-header">
        {activeTool ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn btn-ghost btn-icon" onClick={() => { setActiveTool(null); setResult(null); setFlashcards([]); setMessages([]); }}>
              <FiArrowLeft size={18} />
            </button>
            <div>
              <h1>{tools.find(t => t.id === activeTool)?.title}</h1>
              <p>{tools.find(t => t.id === activeTool)?.desc}</p>
            </div>
          </div>
        ) : (
          <div>
            <h1>AI Study Assistant</h1>
            <p>Use AI-powered tools to enhance your learning</p>
          </div>
        )}
      </div>

      {!activeTool ? (
        <motion.div className="ai-tools-grid" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
          {tools.map(tool => (
            <motion.div className="ai-tool-card" key={tool.id} variants={fadeUp}
              onClick={() => setActiveTool(tool.id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <div className="ai-tool-icon" style={{ background: tool.bg, color: tool.color }}>
                {tool.icon}
              </div>
              <h3>{tool.title}</h3>
              <p>{tool.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeTool} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default AITools;
