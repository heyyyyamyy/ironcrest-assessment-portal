import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../services/apiService';
import { Question, QuestionType, QuestionSection, Assessment } from '../../types';
import { Save, Plus, Trash2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const CreateAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);

  // New Question State
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>(QuestionType.MCQ);
  const [qSection, setQSection] = useState<QuestionSection>(QuestionSection.TECHNICAL);
  const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);

  const handleAddQuestion = () => {
    if (!qText.trim()) {
      alert("Question text is required");
      return;
    }

    if (qType === QuestionType.MCQ) {
      if (qOptions.some(opt => !opt.trim())) {
        alert("All 4 options are required for MCQ");
        return;
      }
    }

    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: qText,
      type: qType,
      section: qSection,
      options: qType === QuestionType.MCQ ? [...qOptions] : undefined,
      correctOptionIndex: qType === QuestionType.MCQ ? qCorrect : undefined
    };

    setQuestions([...questions, newQuestion]);
    
    // Reset Form
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
  };

  const handleOptionChange = (idx: number, val: string) => {
    const newOptions = [...qOptions];
    newOptions[idx] = val;
    setQOptions(newOptions);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveAssessment = async () => {
    if (!name.trim()) {
      alert("Assessment Name is required");
      return;
    }
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    try {
      await api.createAssessment({
        name,
        durationMinutes: duration,
        questions
      });
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Failed to save assessment:', error);
      alert('Failed to save assessment. Please try again.');
    }
  };

  return (
    <Layout title="Create Assessment">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-4">
            <button 
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all text-slate-500 hover:text-brand-600"
            >
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">New Assessment Paper</h1>
                <p className="text-slate-500 text-sm">Design your technical evaluation structure.</p>
            </div>
        </div>

        {/* Basic Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assessment Name</label>
                <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Senior Civil Engineer Exam"
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duration (Minutes)</label>
                <input 
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                    min="1"
                />
            </div>
        </div>

        {/* Added Questions List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Questions ({questions.length})</h3>
                <span className="text-xs text-slate-500 font-medium">Preview Mode</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto bg-white">
                {questions.length === 0 && (
                    <div className="p-12 text-center text-slate-400 italic">
                        No questions added yet. Use the form below to add one.
                    </div>
                )}
                {questions.map((q, idx) => (
                    <div key={q.id} className="p-6 hover:bg-slate-50 flex gap-4 group transition-colors">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                        <div className="flex-grow">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-slate-900">{q.text}</p>
                                <span className="text-[10px] uppercase bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded font-bold">{q.section}</span>
                            </div>
                            {q.type === QuestionType.MCQ && (
                                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm text-slate-600">
                                    {q.options?.map((opt, i) => (
                                        <li key={i} className={`flex items-center gap-2 p-1.5 rounded ${i === q.correctOptionIndex ? 'bg-green-50 text-green-700 ring-1 ring-green-100' : ''}`}>
                                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${i === q.correctOptionIndex ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300'}`}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            {opt}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button 
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-2"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Add New Question Form */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-5">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className="bg-slate-900 text-white rounded p-1"><Plus size={16}/></div> 
                Add New Question
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Question Text</label>
                    <textarea
                        value={qText}
                        onChange={(e) => setQText(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white transition-all shadow-sm"
                        rows={2}
                        placeholder="Type question here..."
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Question Type</label>
                    <select
                        value={qType}
                        onChange={(e) => setQType(e.target.value as QuestionType)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white shadow-sm"
                    >
                        {Object.values(QuestionType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Section</label>
                    <select
                        value={qSection}
                        onChange={(e) => setQSection(e.target.value as QuestionSection)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white shadow-sm"
                    >
                        {Object.values(QuestionSection).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>
            </div>

            {qType === QuestionType.MCQ && (
                <div className="bg-white p-5 rounded-lg border border-slate-200 space-y-4 shadow-sm">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Options & Correct Answer</label>
                    {qOptions.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                             <div className="relative flex items-center">
                                <input 
                                    type="radio" 
                                    name="correct_opt" 
                                    checked={qCorrect === idx}
                                    onChange={() => setQCorrect(idx)}
                                    className="peer w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer appearance-none border-2 border-slate-300 rounded-full checked:border-green-500 checked:bg-green-50"
                                    title="Select as correct answer"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 peer-checked:opacity-100 text-green-600">
                                    <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                                </div>
                             </div>
                             
                             <input 
                                value={opt}
                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                className={`flex-grow px-3 py-2 border rounded-lg text-sm outline-none transition-all ${
                                    qCorrect === idx 
                                    ? 'border-green-500 bg-green-50/30 ring-1 ring-green-500' 
                                    : 'border-slate-200 focus:border-brand-500'
                                }`}
                                placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                             />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end pt-2">
                <button 
                    onClick={handleAddQuestion}
                    className="bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-900 font-medium text-sm transition-all shadow-md active:transform active:translate-y-0.5"
                >
                    Add to List
                </button>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 flex justify-end gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
             <button 
                onClick={() => navigate('/admin/dashboard')}
                className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
             >
                Discard
             </button>
             <button 
                onClick={handleSaveAssessment}
                className="flex items-center gap-2 bg-brand-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all hover:-translate-y-0.5"
             >
                <Save size={18} />
                Save Assessment
             </button>
        </div>
        <div className="h-20"></div> {/* Spacer for fixed footer */}
      </div>
    </Layout>
  );
};

export default CreateAssessment;
