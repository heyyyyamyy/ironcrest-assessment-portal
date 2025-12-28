import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../services/apiService';
import { Candidate, Assessment, AssessmentStatus, UserRole } from '../../types';
import { UserPlus, FileText, CheckCircle, XCircle, PlusCircle, BookOpen, Users, LayoutDashboard, Search, Copy, Check, Eye, X, MapPin, Phone, GraduationCap, Briefcase, Link as LinkIcon, Download } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'assessments'>('pending');

  // Profile View State
  const [selectedProfile, setSelectedProfile] = useState<Candidate | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [createdUserCreds, setCreatedUserCreds] = useState<{id: string, password: string} | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPw, setCopiedPw] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [candidatesData, assessmentsData] = await Promise.all([
        api.getCandidates(),
        api.getAssessments()
      ]);
      setCandidates(candidatesData);
      setAssessments(assessmentsData);
      if (assessmentsData.length > 0) {
        setSelectedAssessment(assessmentsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      alert('Failed to load dashboard data. Please refresh the page.');
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;

    try {
      const result = await api.createCandidate(newName, newDesignation, selectedAssessment);
      setCreatedUserCreds({ id: result.id, password: result.password });
      refreshData();
      // Reset form
      setNewName('');
      setNewDesignation('');
    } catch (error) {
      console.error('Failed to create candidate:', error);
      alert('Failed to create candidate. Please try again.');
    }
  };
  
  const copyToClipboard = (text: string, isId: boolean) => {
    navigator.clipboard.writeText(text);
    if (isId) { setCopiedId(true); setTimeout(() => setCopiedId(false), 2000); }
    else { setCopiedPw(true); setTimeout(() => setCopiedPw(false), 2000); }
  };

  const pendingCandidates = candidates.filter(c => c.assessmentStatus !== AssessmentStatus.COMPLETED);
  const completedCandidates = candidates.filter(c => c.assessmentStatus === AssessmentStatus.COMPLETED);

  // Sidebar Component
  const SidebarItem = ({ id, label, icon: Icon, count }: { id: typeof activeTab, label: string, icon: any, count: number }) => (
    <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 mb-1 ${
            activeTab === id 
            ? 'bg-brand-50 text-brand-700' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
        <div className="flex items-center gap-3">
            <Icon size={18} className={activeTab === id ? 'text-brand-600' : 'text-slate-400'} />
            {label}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === id ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'
        }`}>
            {count}
        </span>
    </button>
  );

  return (
    <Layout title="Dashboard" fullWidth>
      <div className="flex h-[calc(100vh-64px)] bg-slate-50">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col">
            <div className="p-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Overview</h2>
                <nav>
                    <SidebarItem id="pending" label="Pending" icon={Users} count={pendingCandidates.length} />
                    <SidebarItem id="completed" label="Completed" icon={CheckCircle} count={completedCandidates.length} />
                    <SidebarItem id="assessments" label="Question Papers" icon={BookOpen} count={assessments.length} />
                </nav>
            </div>
            
            <div className="mt-auto p-6 border-t border-slate-100">
                <div className="bg-brand-50 rounded-xl p-4 text-center">
                    <p className="text-brand-800 font-medium text-sm mb-3">Action Center</p>
                    <div className="space-y-2">
                        <button 
                            onClick={() => setShowCreateModal(true)}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-brand-200 text-brand-700 px-3 py-2 rounded-lg text-xs font-bold hover:bg-brand-100 transition-colors shadow-sm"
                        >
                            <UserPlus size={14} /> Add Candidate
                        </button>
                        <button 
                            onClick={() => navigate('/admin/create-assessment')}
                            className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors shadow-sm"
                        >
                            <PlusCircle size={14} /> New Assessment
                        </button>
                    </div>
                </div>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-8">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {activeTab === 'pending' && 'Pending Candidates'}
                        {activeTab === 'completed' && 'Assessment Results'}
                        {activeTab === 'assessments' && 'Assessment Papers'}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {activeTab === 'pending' && 'Manage access and view status of assigned exams.'}
                        {activeTab === 'completed' && 'Review scores and performance of finished exams.'}
                        {activeTab === 'assessments' && 'Create and manage technical question papers.'}
                    </p>
                </div>
            </header>

            {/* Tables Container */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ring-1 ring-slate-900/5">
                
                {/* ASSESSMENT TABLE */}
                {activeTab === 'assessments' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assessment Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Questions</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paper ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {assessments.map(a => (
                                    <tr key={a.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
                                                    <BookOpen size={16}/>
                                                </div>
                                                <span className="font-medium text-slate-900">{a.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                {a.questions.length} Items
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 text-sm">{a.durationMinutes} mins</td>
                                        <td className="px-6 py-4 text-slate-400 font-mono text-xs">{a.id}</td>
                                    </tr>
                                ))}
                                {assessments.length === 0 && (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No assessments created yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* CANDIDATE TABLES */}
                {activeTab !== 'assessments' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Profile</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Assessment</th>
                                {activeTab === 'completed' && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>}
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                            {(activeTab === 'pending' ? pendingCandidates : completedCandidates).map(candidate => {
                                const assessName = assessments.find(a => a.id === candidate.assignedAssessmentId)?.name || 'Unknown';
                                const isTerminated = (candidate as any).isTerminated;
                                return (
                                <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900">{candidate.name}</span>
                                            <span className="text-xs text-slate-500">{candidate.designation} • {candidate.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 w-fit">
                                            <FileText size={14} className="text-slate-400"/>
                                            {assessName}
                                        </div>
                                    </td>
                                    {activeTab === 'completed' && (
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full max-w-[80px] h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${candidate.scorePercentage! >= 70 ? 'bg-green-500' : 'bg-amber-500'}`} 
                                                    style={{ width: `${candidate.scorePercentage}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-sm font-bold ${candidate.scorePercentage! >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                                {candidate.scorePercentage}%
                                            </span>
                                        </div>
                                    </td>
                                    )}
                                    <td className="px-6 py-4">
                                    {activeTab === 'completed' ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                            <CheckCircle size={14} /> Completed
                                        </span>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                                            isTerminated 
                                            ? 'bg-red-50 text-red-700 border-red-100' 
                                            : 'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {isTerminated ? <XCircle size={14} /> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>}
                                            {isTerminated ? 'Terminated' : 'Pending'}
                                        </span>
                                    )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => setSelectedProfile(candidate)}
                                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                            title="View Candidate Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                                );
                            })}
                            {(activeTab === 'pending' ? pendingCandidates : completedCandidates).length === 0 && (
                                <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Search size={32} className="mb-2 opacity-50"/>
                                        <p>No candidates found in this view.</p>
                                    </div>
                                </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>

        {/* View Profile Modal */}
        {selectedProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                    <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0">
                        <h3 className="text-lg font-bold text-slate-900">Candidate Profile</h3>
                        <button onClick={() => setSelectedProfile(null)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-50 transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto">
                        <div className="flex items-start gap-6 mb-8">
                            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 flex-shrink-0">
                                <span className="text-2xl font-bold">{selectedProfile.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{selectedProfile.name}</h2>
                                <p className="text-slate-500 font-medium">{selectedProfile.designation}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5"><MapPin size={14}/> {selectedProfile.location || 'Location N/A'}</span>
                                    <span className="flex items-center gap-1.5"><Phone size={14}/> {selectedProfile.phone || 'Phone N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Info</h4>
                                <div className="flex items-center gap-3">
                                    <Briefcase size={16} className="text-slate-400" />
                                    <span className="text-slate-700 font-medium">{selectedProfile.experience || 'Experience not provided'}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <GraduationCap size={16} className="text-slate-400" />
                                    <span className="text-slate-700 font-medium">{selectedProfile.qualification || 'Qualification not provided'}</span>
                                </div>
                                {selectedProfile.portfolioUrl && (
                                    <div className="flex items-center gap-3">
                                        <LinkIcon size={16} className="text-slate-400" />
                                        <a href={selectedProfile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-sm font-medium truncate">
                                            {selectedProfile.portfolioUrl}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Status</h4>
                                <div>
                                    <span className="text-xs text-slate-500">Status</span>
                                    <p className="font-bold text-slate-800">{selectedProfile.assessmentStatus}</p>
                                </div>
                                {selectedProfile.scorePercentage !== undefined && (
                                    <div>
                                        <span className="text-xs text-slate-500">Score</span>
                                        <p className={`font-bold ${selectedProfile.scorePercentage >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                            {selectedProfile.scorePercentage}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6">
                             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ID Verification</h4>
                             {selectedProfile.idProofUrl ? (
                                 <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                     <div className="aspect-[3/2] w-full bg-slate-200 flex items-center justify-center relative group cursor-pointer">
                                         <img src={selectedProfile.idProofUrl} alt="ID Proof" className="w-full h-full object-cover" />
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium">
                                             <Download className="mr-2" size={20} /> Download ID
                                         </div>
                                     </div>
                                 </div>
                             ) : (
                                 <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center text-slate-400 text-sm">
                                     No ID Proof Uploaded
                                 </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Create Candidate Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in ring-1 ring-white/20">
              <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Create New Candidate</h3>
                <button onClick={() => { setShowCreateModal(false); setCreatedUserCreds(null); }} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="p-6">
                {!createdUserCreds ? (
                  <form onSubmit={handleCreateCandidate} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        required
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Designation</label>
                      <input 
                        value={newDesignation}
                        onChange={(e) => setNewDesignation(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                        required
                        placeholder="e.g. Site Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Assign Assessment</label>
                      <select 
                        value={selectedAssessment}
                        onChange={(e) => setSelectedAssessment(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all"
                      >
                        {assessments.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                      <button 
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-5 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-semibold shadow-md shadow-brand-500/20"
                      >
                        Create & Assign
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex items-center justify-center gap-3">
                      <CheckCircle className="w-6 h-6" />
                      <span className="font-bold">Candidate Created Successfully</span>
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4 text-left">
                        <p className="text-xs text-slate-500 text-center mb-2">Share these credentials with the candidate</p>
                        
                        <div className="group relative bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center hover:border-brand-300 transition-colors cursor-pointer" onClick={() => copyToClipboard(createdUserCreds.id, true)}>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">User ID</span>
                                <p className="font-mono text-lg text-slate-900 font-bold">{createdUserCreds.id}</p>
                            </div>
                            <button className="text-slate-400 hover:text-brand-600">
                                {copiedId ? <Check size={18} className="text-green-500"/> : <Copy size={18} />}
                            </button>
                        </div>

                        <div className="group relative bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-center hover:border-brand-300 transition-colors cursor-pointer" onClick={() => copyToClipboard(createdUserCreds.password, false)}>
                             <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Password</span>
                                <p className="font-mono text-lg text-slate-900 font-bold">{createdUserCreds.password}</p>
                            </div>
                            <button className="text-slate-400 hover:text-brand-600">
                                {copiedPw ? <Check size={18} className="text-green-500"/> : <Copy size={18} />}
                            </button>
                        </div>
                    </div>
                    
                    <button 
                      onClick={() => { setCreatedUserCreds(null); setShowCreateModal(false); }}
                      className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 font-bold"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
