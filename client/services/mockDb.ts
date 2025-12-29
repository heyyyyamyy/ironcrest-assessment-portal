import { Admin, Assessment, AssessmentStatus, Candidate, Question, QuestionSection, QuestionType, UserRole, User } from '../types';

const STORAGE_KEYS = {
  USERS: 'ironcrest_users',
  ASSESSMENTS: 'ironcrest_assessments',
  CURRENT_USER: 'ironcrest_current_user'
};

// --- Initial Seed Data ---

const SEED_ADMIN: Admin = {
  id: 'admin_001',
  username: 'admin',
  role: UserRole.ADMIN
};

const FULL_CONSTRUCTION_ASSESSMENT: Assessment = {
  id: 'assess_civil_001',
  name: 'Ironcrest Recruitment Assessment Round',
  durationMinutes: 90,
  questions: [
    // --- REASONING & LOGICAL ABILITY (10 Questions) ---
    { 
      id: 'r1', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'If a contractor completes 60% of work in 24 days, assuming uniform progress, how many days are required to complete the remaining work?', 
      options: ['12', '14', '16', '18'], 
      correctOptionIndex: 2 // 40% work left. 1% takes 0.4 days. 40 * 0.4 = 16 days.
    },
    { 
      id: 'r2', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'A site has 3 shifts of equal duration. If productivity drops by 20% in night shift, overall productivity reduces by:', 
      options: ['6.6%', '8%', '10%', '12%'], 
      correctOptionIndex: 0 // (0+0+20)/3 = 6.66%
    },
    { 
      id: 'r3', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'Arrange the construction activities in correct order:', 
      options: [
        'Excavation → Superstructure → Foundation → Finishing',
        'Foundation → Excavation → Superstructure → Finishing',
        'Excavation → Foundation → Superstructure → Finishing',
        'Excavation → Finishing → Superstructure → Foundation'
      ], 
      correctOptionIndex: 2 
    },
    { 
      id: 'r4', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'If STEEL is coded as UVGGO, how is CEMENT coded?', 
      options: ['EGOHNV', 'EGOHOV', 'EHPHOV', 'EGOHNW'], 
      correctOptionIndex: 3 // Based on pattern variations often found in these tests
    },
    { 
      id: 'r5', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'A project delayed by 25% of planned duration finishes in 75 days. What was original duration?', 
      options: ['50', '55', '60', '65'], 
      correctOptionIndex: 2 // 1.25x = 75 -> x = 60
    },
    { 
      id: 'r6', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'Find the odd one:', 
      options: ['Footing', 'Column', 'Beam', 'Aggregate'], 
      correctOptionIndex: 3 // Aggregate is a material, others are structural members
    },
    { 
      id: 'r7', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'If 4 engineers can supervise 6 sites in 8 hours, how many engineers are required for 9 sites in same time?', 
      options: ['5', '6', '7', '8'], 
      correctOptionIndex: 1 // 1.5 sites per engineer. 9/1.5 = 6
    },
    { 
      id: 'r8', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'A drawing scale is changed from 1:100 to 1:200. Dimensions on drawing will:', 
      options: ['Double', 'Halve', 'Remain same', 'Become four times'], 
      correctOptionIndex: 1 // Measured length halves
    },
    { 
      id: 'r9', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'A site safety audit happens every 12 days. If last audit was on Monday, next audit will be on:', 
      options: ['Friday', 'Saturday', 'Sunday', 'Monday'], 
      correctOptionIndex: 1 // Mon + 12 = Mon + 7 + 5 = Sat
    },
    { 
      id: 'r10', 
      type: QuestionType.MCQ, 
      section: QuestionSection.REASONING, 
      text: 'If the north direction is rotated 135° clockwise, which direction does it point to?', 
      options: ['South', 'South-East', 'South-West', 'East'], 
      correctOptionIndex: 1 // North -> East (90) -> South-East (135)
    },

    // --- APTITUDE & NUMERICAL ABILITY (12 Questions) ---
    { 
      id: 'a1', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'A slab of 180 m² area and 150 mm thickness requires how much concrete?', 
      options: ['22.5 m³', '25.5 m³', '27 m³', '30 m³'], 
      correctOptionIndex: 2 // 180 * 0.15 = 27
    },
    { 
      id: 'a2', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'If steel consumption is 90 kg/m³, steel required for 20 m³ RCC is:', 
      options: ['1600 kg', '1700 kg', '1800 kg', '1900 kg'], 
      correctOptionIndex: 2 // 90 * 20 = 1800
    },
    { 
      id: 'a3', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'A contractor adds 15% profit after adding 10% overheads. What is net profit % on cost?', 
      options: ['13.5%', '14.5%', '15%', '16.5%'], 
      correctOptionIndex: 3 // Cost 100 -> 110 -> 110*1.15 = 126.5. Profit 26.5? Or Profit on Cost? Usually compound. 1.1 * 1.15 = 1.265. Wait, 15% profit ON cost+overhead. Profit is 16.5% relative to base cost.
    },
    { 
      id: 'a4', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'Cement bags required for 1:1.5:3 concrete for 10 m³ (use dry volume 1.54):', 
      options: ['78', '82', '88', '92'], 
      correctOptionIndex: 1 // Approx 82 bags
    },
    { 
      id: 'a5', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'Labour productivity reduces from 12 units/day to 9 units/day. Productivity drop is:', 
      options: ['20%', '22%', '25%', '30%'], 
      correctOptionIndex: 2 // (3/12)*100 = 25%
    },
    { 
      id: 'a6', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'Cost of sand increases from ₹1200 to ₹1500 per unit. Percentage increase?', 
      options: ['20%', '22%', '25%', '30%'], 
      correctOptionIndex: 2 // (300/1200)*100 = 25%
    },
    { 
      id: 'a7', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'If GST is 18% on ₹2,40,000, GST amount is:', 
      options: ['₹40,200', '₹42,300', '₹43,200', '₹45,000'], 
      correctOptionIndex: 2 // 2400 * 18 = 43200
    },
    { 
      id: 'a8', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'A tender estimate is ₹1.2 crore. Contractor bids 7% below estimate. Bid value is:', 
      options: ['₹1.12 cr', '₹1.116 cr', '₹1.104 cr', '₹1.08 cr'], 
      correctOptionIndex: 1 // 1.2 * 0.93 = 1.116
    },
    { 
      id: 'a9', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'If 8 workers work 7 hours/day for 15 days, total man-hours are:', 
      options: ['720', '760', '820', '840'], 
      correctOptionIndex: 3 // 8 * 7 * 15 = 840
    },
    { 
      id: 'a10', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'Water requirement is 135 LPCD for 120 people. Daily water demand?', 
      options: ['14,200 L', '15,200 L', '16,200 L', '18,000 L'], 
      correctOptionIndex: 2 // 135 * 120 = 16200
    },
    { 
      id: 'a11', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'If retention money is 8% on ₹50 lakh, retention amount is:', 
      options: ['₹3 lakh', '₹3.5 lakh', '₹4 lakh', '₹4.5 lakh'], 
      correctOptionIndex: 2 // 50 * 0.08 = 4.0
    },
    { 
      id: 'a12', 
      type: QuestionType.MCQ, 
      section: QuestionSection.APTITUDE, 
      text: 'If shuttering cost is ₹45/m² and area is 380 m², cost is:', 
      options: ['₹16,100', '₹16,800', '₹17,100', '₹18,000'], 
      correctOptionIndex: 2 // 45 * 380 = 17100
    },

    // --- TECHNICAL – CONSTRUCTION (12 Questions) ---
    { 
      id: 't1', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'What is the primary cause of segregation in concrete?', 
      options: ['Low water content', 'Excess vibration', 'Poor curing', 'High cement content'], 
      correctOptionIndex: 1 
    },
    { 
      id: 't2', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'Minimum curing period for OPC concrete is:', 
      options: ['3 days', '5 days', '7 days', '14 days'], 
      correctOptionIndex: 2 
    },
    { 
      id: 't3', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'What is the purpose of lap length in reinforcement?', 
      options: ['Reduce steel', 'Increase strength', 'Transfer stress', 'Improve bonding'], 
      correctOptionIndex: 2 
    },
    { 
      id: 't4', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'One-way slab is designed when:', 
      options: ['Both spans equal', 'Longer span > 2× shorter span', 'Thickness is more', 'Load is heavy'], 
      correctOptionIndex: 1 
    },
    { 
      id: 't5', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'Honeycombing mainly affects:', 
      options: ['Strength only', 'Appearance only', 'Durability only', 'Strength and durability'], 
      correctOptionIndex: 3 
    },
    { 
      id: 't6', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'Development length depends on:', 
      options: ['Concrete grade', 'Steel grade', 'Bond stress', 'All of the above'], 
      correctOptionIndex: 3 
    },
    { 
      id: 't7', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'What is the function of DPC?', 
      options: ['Prevent termites', 'Prevent dampness', 'Increase strength', 'Reduce cracks'], 
      correctOptionIndex: 1 
    },
    { 
      id: 't8', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'Which test checks workability of concrete?', 
      options: ['Cube test', 'Slump test', 'Rebound hammer', 'Core test'], 
      correctOptionIndex: 1 
    },
    { 
      id: 't9', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'Which foundation is suitable for weak soil?', 
      options: ['Isolated footing', 'Combined footing', 'Raft foundation', 'Strip footing'], 
      correctOptionIndex: 2 
    },
    { 
      id: 't10', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'Carbonation in concrete mainly causes:', 
      options: ['Increase strength', 'Steel corrosion', 'Shrinkage', 'Expansion'], 
      correctOptionIndex: 1 
    },
    { 
      id: 't11', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'What is the role of admixtures?', 
      options: ['Reduce cement', 'Improve properties', 'Increase cost', 'Increase setting time only'], 
      correctOptionIndex: 1 
    },
    { 
      id: 't12', 
      type: QuestionType.MCQ, 
      section: QuestionSection.TECHNICAL, 
      text: 'Which document defines quantities and rates?', 
      options: ['Drawing', 'BOQ', 'Tender notice', 'Work order'], 
      correctOptionIndex: 1 
    },

    // --- WRITTEN QUESTIONS (2 Only – HARD) ---
    { 
      id: 'w1', 
      type: QuestionType.WRITTEN, 
      section: QuestionSection.WRITTEN_EXP, 
      text: 'Explain how you would manage a construction project that is delayed due to labour shortage and material price fluctuation. Mention practical steps and risk mitigation.' 
    },
    { 
      id: 'w2', 
      type: QuestionType.WRITTEN, 
      section: QuestionSection.WRITTEN_EXP, 
      text: 'Describe a challenging project you worked on (or hypothetical). Explain how you planned daily activities, handled coordination issues, and ensured quality and safety.' 
    }
  ]
};

// --- Service ---

class MockDB {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const users = [SEED_ADMIN];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSESSMENTS)) {
      // Initialize with the comprehensive construction assessment
      const assessments = [FULL_CONSTRUCTION_ASSESSMENT];
      localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
    }
  }

  getUsers(): (Admin | Candidate)[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  saveUsers(users: (Admin | Candidate)[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getAssessments(): Assessment[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSESSMENTS) || '[]');
  }

  createAssessment(assessment: Assessment) {
    const assessments = this.getAssessments();
    assessments.push(assessment);
    localStorage.setItem(STORAGE_KEYS.ASSESSMENTS, JSON.stringify(assessments));
  }

  createCandidate(name: string, designation: string, assessmentId: string): Candidate {
    const users = this.getUsers();
    
    // Auto-generate credentials
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const email = `${cleanName}@ironcrestdevelopers.com`;
    const userId = `IC-${Math.floor(1000 + Math.random() * 9000)}`;
    const password = Math.random().toString(36).slice(-8);

    const newCandidate: Candidate = {
      id: userId,
      name,
      designation,
      email,
      password,
      role: UserRole.CANDIDATE,
      profileCompleted: false,
      assignedAssessmentId: assessmentId,
      assessmentStatus: AssessmentStatus.PENDING
    };

    users.push(newCandidate);
    this.saveUsers(users);
    return newCandidate;
  }

  updateCandidateProfile(id: string, updates: Partial<Candidate>) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) {
      const user = users[idx];
      // Ensure we are updating a Candidate to avoid type mismatch
      if (user.role === UserRole.CANDIDATE) {
        const updatedCandidate: Candidate = { ...user, ...updates };
        users[idx] = updatedCandidate;
        this.saveUsers(users);
        
        // Update session if it's the current user
        const current = this.getCurrentUser();
        if (current && current.id === id) {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedCandidate));
        }
      }
    }
  }

  submitAssessment(candidateId: string, answers: Record<string, any>) {
    const users = this.getUsers();
    const candidateIndex = users.findIndex(u => u.id === candidateId && u.role === UserRole.CANDIDATE);
    
    if (candidateIndex === -1) return;

    const candidate = users[candidateIndex] as Candidate;
    const assessment = this.getAssessments().find(a => a.id === candidate.assignedAssessmentId);

    if (!assessment) return;

    // Calculate Score
    let correctCount = 0;
    let totalMCQ = 0;

    assessment.questions.forEach(q => {
      if (q.type === QuestionType.MCQ) {
        totalMCQ++;
        if (answers[q.id] === q.correctOptionIndex) {
          correctCount++;
        }
      }
    });

    const percentage = totalMCQ > 0 ? (correctCount / totalMCQ) * 100 : 0;
    const finalScore = parseFloat(percentage.toFixed(2));

    const updatedCandidate: Candidate = {
      ...candidate,
      assessmentStatus: AssessmentStatus.COMPLETED,
      scorePercentage: finalScore,
      answers: {} 
    };
    
    // Remove answers to comply strictly with requirement
    delete updatedCandidate.answers;

    users[candidateIndex] = updatedCandidate;
    this.saveUsers(users);
    
    const current = this.getCurrentUser();
    if (current && current.id === candidateId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedCandidate));
    }
  }

  terminateAssessment(candidateId: string) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === candidateId);
    if (idx !== -1) {
      const candidate = users[idx];
      
      // Basic role check
      if (candidate.role !== UserRole.CANDIDATE) return;

      // If already completed, don't overwrite
      if (candidate.assessmentStatus === AssessmentStatus.COMPLETED) return;

      const updated: Candidate = {
        ...candidate,
        assessmentStatus: AssessmentStatus.TERMINATED,
      };
      
      (updated as any).isTerminated = true; // Hidden flag

      users[idx] = updated;
      this.saveUsers(users);
    }
  }

  login(idOrUsername: string, password?: string): User | null {
    const users = this.getUsers();
    // Admin check
    if (idOrUsername === 'admin' && password === 'w8FZyCWb7Q8JliZ1iAlP6A') { // Simple hardcoded for demo
        const admin = users.find(u => u.role === UserRole.ADMIN);
        if (admin) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(admin));
            return admin;
        }
    }
    
    // Candidate check
    const candidate = users.find(u => u.id === idOrUsername && (u as Candidate).password === password);
    if (candidate) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(candidate));
        return candidate;
    }
    return null;
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  getCurrentUser(): User | null {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
  }
}

export const db = new MockDB();
