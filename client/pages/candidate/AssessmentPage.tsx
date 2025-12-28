import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiService';
import { Candidate, Assessment, AssessmentStatus, QuestionSection, QuestionType, Question, UserRole } from '../../types';
import { Clock, AlertTriangle, Video, Eye, ChevronRight, Check } from 'lucide-react';

const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); 
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  useEffect(() => {
    (async () => {
      try {
        const profile: any = await api.getProfile();
        const normalized: Candidate = {
          ...profile,
          role: UserRole.CANDIDATE,
          profileCompleted: Boolean(profile.profileCompleted),
          assignedAssessmentId: profile.assignedAssessmentId ?? null,
        };

        if (!normalized.profileCompleted) {
          navigate('/candidate/profile');
          return;
        }

        if (
          normalized.assessmentStatus === AssessmentStatus.COMPLETED ||
          normalized.assessmentStatus === AssessmentStatus.TERMINATED
        ) {
          navigate('/candidate/profile');
          return;
        }

        setCandidate(normalized);

        const assess: any = await api.getAssessment();
        setAssessment(assess);
        setTimeLeft(Number(assess.durationMinutes) * 60);
      } catch (e) {
        api.logout();
        navigate('/');
      }
    })();
  }, [navigate]);

  useEffect(() => {
    if (!hasStarted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleVisibilityChange = () => {
        if (document.hidden) {
            handleViolation();
        }
    };
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
        return 'Assessment will be over if you leave this page.';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasStarted]);

  const handleViolation = () => {
      if (!candidate) return;
      api.terminateAssessment().finally(() => {
        alert("Violation Detected: Tab Switch. Exam Terminated.");
        navigate('/candidate/profile');
      });
  };

  const startCamera = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
          setCameraPermission('granted');
      } catch (err) {
          setCameraPermission('denied');
      }
  };

  const handleStart = async () => {
      await startCamera();
      try { await document.documentElement.requestFullscreen(); } catch (e) {}
      setHasStarted(true);
  };

  const handleSubmit = (auto = false) => {
      if (!candidate) return;
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      api.submitAssessment(answers).finally(() => {
        navigate('/candidate/profile');
      });
  };

  const handleAnswerChange = (qId: string, val: string | number) => {
      setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!assessment || !candidate) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading Assessment...</div>;

  if (!hasStarted) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
              <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="bg-brand-600 p-8 text-white text-center">
                      <h1 className="text-3xl font-bold mb-2">{assessment.name}</h1>
                      <div className="flex items-center justify-center gap-2 opacity-90 text-sm font-medium">
                        <Clock size={16} /> Duration: {assessment.durationMinutes} Minutes
                      </div>
                  </div>
                  <div className="p-8 space-y-8">
                      <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl">
                          <h3 className="font-bold flex items-center gap-2 mb-3 text-amber-800"><AlertTriangle size={20}/> Examination Rules</h3>
                          <ul className="space-y-2 text-sm text-amber-900 list-inside marker:text-amber-500">
                              <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-500 flex-shrink-0"></div> The timer starts immediately and cannot be paused.</li>
                              <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-500 flex-shrink-0"></div> <strong>Do not switch tabs</strong> or minimize the window. This will terminate your session.</li>
                              <li className="flex gap-2"><div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-500 flex-shrink-0"></div> Ensure your camera remains unblocked for proctoring.</li>
                          </ul>
                      </div>
                      
                      <button 
                        onClick={handleStart}
                        className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transform hover:-translate-y-1"
                      >
                          Start Assessment
                      </button>
                      <p className="text-center text-xs text-slate-400">By starting, you agree to the Ironcrest Recruitment Assessment Round Terms.</p>
                  </div>
              </div>
          </div>
      );
  }

  // --- Exam UI ---

  const sections = Object.values(QuestionSection);
  const questionsBySection = sections.reduce((acc, sec) => {
      const qs = assessment.questions.filter(q => q.section === sec);
      if (qs.length > 0) acc[sec] = qs;
      return acc;
  }, {} as Record<string, Question[]>);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="font-bold text-lg text-slate-800 tracking-tight">Ironcrest Recruitment Assessment Round</div>
            </div>
            <div className={`flex items-center gap-2 font-mono text-xl font-bold px-4 py-1.5 rounded-lg border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                <Clock size={20} />
                {formatTime(timeLeft)}
            </div>
        </div>

        <div className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
            {/* Main Question Area */}
            <div className="flex-grow space-y-8 pb-24">
                {Object.entries(questionsBySection).map(([section, qs]) => (
                    <div key={section} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-8 py-4 border-b border-slate-100">
                            <h2 className="font-bold text-slate-500 uppercase tracking-wider text-xs">{section}</h2>
                        </div>
                        <div className="p-8 space-y-10">
                            {qs.map((q, idx) => (
                                <div key={q.id} className="space-y-4">
                                    <p className="font-medium text-lg text-slate-900 leading-relaxed">
                                        <span className="font-bold text-brand-600 mr-2 text-xl">{idx + 1}.</span> 
                                        {q.text}
                                    </p>
                                    
                                    {q.type === QuestionType.MCQ && q.options && (
                                        <div className="space-y-3 pl-8">
                                            {q.options.map((opt, optIdx) => (
                                                <label key={optIdx} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all group ${
                                                    answers[q.id] === optIdx 
                                                    ? 'bg-brand-50 border-brand-200 shadow-sm' 
                                                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                                }`}>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                                        answers[q.id] === optIdx ? 'border-brand-600' : 'border-slate-300'
                                                    }`}>
                                                        {answers[q.id] === optIdx && <div className="w-2.5 h-2.5 bg-brand-600 rounded-full" />}
                                                    </div>
                                                    <input 
                                                        type="radio" 
                                                        name={q.id} 
                                                        value={optIdx}
                                                        checked={answers[q.id] === optIdx}
                                                        onChange={() => handleAnswerChange(q.id, optIdx)}
                                                        className="hidden"
                                                    />
                                                    <span className={`text-base ${answers[q.id] === optIdx ? 'text-brand-900 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {q.type === QuestionType.WRITTEN && (
                                        <div className="pl-8">
                                            <textarea 
                                                rows={5}
                                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none bg-slate-50 focus:bg-white transition-colors text-slate-800"
                                                placeholder="Type your detailed answer here..."
                                                value={answers[q.id] as string || ''}
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                            ></textarea>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar (Camera + Info) - Fixed on Desktop */}
            <div className="hidden lg:block w-72 flex-shrink-0 space-y-6 relative">
                 <div className="sticky top-24 space-y-6">
                    <div className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200">
                        <div className="bg-slate-900 rounded-xl aspect-video flex items-center justify-center overflow-hidden relative">
                            {cameraPermission === 'granted' ? (
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                            ) : (
                                <div className="text-slate-500 text-xs text-center p-2">
                                    <Video className="mx-auto mb-2 opacity-30" size={32}/>
                                    Camera Signal Lost
                                </div>
                            )}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div> REC
                            </div>
                        </div>
                        <div className="mt-3 text-center">
                            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Live Proctoring</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleSubmit()}
                        className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 shadow-xl shadow-brand-500/20 transition-all hover:scale-[1.02]"
                    >
                        Submit Assessment
                    </button>
                    
                    <div className="text-center">
                         <p className="text-xs text-slate-400">Answers are saved automatically.</p>
                    </div>
                 </div>
            </div>
            
            {/* Mobile Submit FAB */}
            <div className="lg:hidden fixed bottom-6 right-6 left-6 z-50">
                 <button 
                    onClick={() => handleSubmit()}
                    className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-2xl"
                >
                    Submit Assessment
                </button>
            </div>
        </div>
    </div>
  );
};

export default AssessmentPage;
