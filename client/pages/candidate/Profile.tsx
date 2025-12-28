import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { api } from '../../services/apiService';
import { Candidate, AssessmentStatus, UserRole } from '../../types';
import { Upload, AlertCircle, ArrowRight, Check, Shield, MapPin, Phone, GraduationCap, Link as LinkIcon } from 'lucide-react';

const CandidateProfile: React.FC = () => {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  
  // Form States
  const [experience, setExperience] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [qualification, setQualification] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    api.getProfile()
      .then((profile: any) => {
        const normalized: Candidate = {
          ...profile,
          role: UserRole.CANDIDATE,
          profileCompleted: Boolean(profile.profileCompleted),
          assignedAssessmentId: profile.assignedAssessmentId ?? null,
        };

        setCandidate(normalized);
        if (normalized.experience) setExperience(normalized.experience);
        if (normalized.phone) setPhone(normalized.phone);
        if (normalized.location) setLocation(normalized.location);
        if (normalized.qualification) setQualification(normalized.qualification);
        if (normalized.portfolioUrl) setPortfolio(normalized.portfolioUrl);
      })
      .catch(() => {
        api.logout();
        navigate('/');
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const readFileAsDataUrl = (inputFile: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(inputFile);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate) return;
    if (!file && !candidate.idProofUrl) {
      alert("Please upload ID proof");
      return;
    }

    const idProofUrl = file ? await readFileAsDataUrl(file) : candidate.idProofUrl;

    const updated = await api.updateProfile({
      experience,
      phone,
      location,
      qualification,
      portfolioUrl: portfolio,
      idProofUrl,
    });

    setCandidate(prev =>
      prev
        ? {
            ...prev,
            ...updated,
            role: UserRole.CANDIDATE,
            profileCompleted: true,
            assignedAssessmentId: updated.assignedAssessmentId ?? prev.assignedAssessmentId,
          }
        : prev
    );

    navigate('/candidate/assessment');
  };

  if (!candidate) return <div>Loading...</div>;

  const isTerminated = candidate.assessmentStatus === AssessmentStatus.TERMINATED;
  const isCompleted = candidate.assessmentStatus === AssessmentStatus.COMPLETED;

  if (isTerminated || isCompleted) {
      return (
          <Layout title="Assessment Status">
              <div className="max-w-2xl mx-auto text-center mt-12 bg-white p-12 rounded-2xl shadow-xl border border-slate-100">
                  {isTerminated ? (
                      <>
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Access Revoked</h2>
                        <p className="text-slate-600 text-lg mb-8">Your assessment was terminated due to a violation of exam rules (tab switching or page exit).</p>
                        <button onClick={() => { api.logout(); navigate('/'); }} className="text-slate-500 hover:text-slate-800 underline">Sign Out</button>
                      </>
                  ) : (
                      <>
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Assessment Submitted</h2>
                        <p className="text-slate-600 text-lg mb-8">Thank you for completing the assessment. Your responses have been recorded successfully. You may close this tab.</p>
                        <button onClick={() => { api.logout(); navigate('/'); }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium transition-colors">Sign Out</button>
                      </>
                  )}
              </div>
          </Layout>
      );
  }

  return (
    <Layout title="Profile Setup">
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield size={100} color="white" />
            </div>
            <h1 className="text-2xl font-bold text-white relative z-10">Candidate Profile</h1>
            <p className="text-slate-300 relative z-10 mt-1">Complete your professional details to unlock the assessment.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Read-Only Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                    <p className="font-bold text-slate-800">{candidate.name}</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Designation</label>
                    <p className="font-bold text-slate-800">{candidate.designation}</p>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
                    <p className="font-bold text-slate-800">{candidate.email}</p>
                </div>
            </div>

            {/* Editable Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <Phone size={14} /> Phone Number <span className="text-red-500">*</span>
                </label>
                <input 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} /> Current Location <span className="text-red-500">*</span>
                </label>
                <input 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap size={14} /> Highest Qualification <span className="text-red-500">*</span>
                </label>
                <input 
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.Tech in Civil Engineering"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                     <Shield size={14} /> Years of Experience <span className="text-red-500">*</span>
                </label>
                <input 
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 3 years"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                     <LinkIcon size={14} /> LinkedIn / Portfolio URL
                </label>
                <input 
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              
              <div className="md:col-span-2 space-y-2 pt-4">
                 <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">ID Verification <span className="text-red-500">*</span></label>
                 <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                     file || candidate.idProofUrl 
                     ? 'border-green-300 bg-green-50' 
                     : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
                 }`}>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden" 
                        id="id-upload"
                        required={!candidate.idProofUrl}
                    />
                    <label htmlFor="id-upload" className="cursor-pointer flex flex-col items-center">
                        {file || candidate.idProofUrl ? (
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                                <Check size={24} />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
                                <Upload size={24} />
                            </div>
                        )}
                        <span className={`font-bold ${file || candidate.idProofUrl ? 'text-green-700' : 'text-slate-700'}`}>
                            {file ? file.name : (candidate.idProofUrl ? 'ID Proof Uploaded' : 'Click to upload Government ID')}
                        </span>
                        {!file && !candidate.idProofUrl && <span className="text-xs text-slate-400 mt-2">Supports JPG, PNG (Max 5MB)</span>}
                    </label>
                 </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                    type="submit"
                    className="flex items-center gap-2 bg-brand-600 text-white px-8 py-3.5 rounded-xl hover:bg-brand-700 transition-all font-bold shadow-lg shadow-brand-500/30 hover:-translate-y-0.5 active:translate-y-0"
                >
                    Proceed to Assessment <ArrowRight size={20} />
                </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default CandidateProfile;
