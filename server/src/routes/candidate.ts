import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { requireRole } from '../middleware/auth';

const router = express.Router();

// Apply role check to all candidate routes
router.use(requireRole('CANDIDATE'));

// Get current candidate profile
router.get('/me', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const candidate = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        designation: true,
        email: true,
        experience: true,
        phone: true,
        location: true,
        qualification: true,
        portfolioUrl: true,
        idProofUrl: true,
        profileCompleted: true,
        assignedAssessmentId: true,
        assessmentStatus: true,
        scorePercentage: true
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update candidate profile
router.put('/profile', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const updates = req.body;

    const candidate = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updates,
        profileCompleted: true
      },
      select: {
        id: true,
        name: true,
        designation: true,
        email: true,
        experience: true,
        phone: true,
        location: true,
        qualification: true,
        portfolioUrl: true,
        idProofUrl: true,
        profileCompleted: true
      }
    });

    res.json(candidate);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get assessment questions
router.get('/assessment', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const candidate = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        assignedAssessmentId: true,
        assessmentStatus: true
      }
    });

    if (!candidate || candidate.assessmentStatus === 'COMPLETED' || candidate.assessmentStatus === 'TERMINATED') {
      return res.status(403).json({ error: 'Assessment not available' });
    }

    if (!candidate.assignedAssessmentId) {
      return res.status(404).json({ error: 'No assessment assigned' });
    }

    if (candidate.assessmentStatus === 'PENDING') {
      await prisma.user.update({
        where: { id: userId },
        data: { assessmentStatus: 'IN_PROGRESS' }
      });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: candidate.assignedAssessmentId },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            section: true,
            options: true
          }
        }
      }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json({
      id: assessment.id,
      name: assessment.name,
      durationMinutes: assessment.durationMinutes,
      questions: assessment.questions.map(q => ({
        ...q,
        options: JSON.parse(q.options)
      }))
    });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Submit assessment
router.post('/submit', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { answers } = req.body;

    const candidate = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        assignedAssessmentId: true,
        assessmentStatus: true
      }
    });

    if (!candidate || !['IN_PROGRESS', 'PENDING'].includes(candidate.assessmentStatus)) {
      return res.status(403).json({ error: 'Cannot submit assessment' });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: candidate.assignedAssessmentId! },
      include: { questions: true }
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Calculate score
    let correctCount = 0;
    let totalMCQ = 0;

    assessment.questions.forEach(q => {
      if (q.type === 'MCQ') {
        totalMCQ++;
        if (answers[q.id] === q.correctOptionIndex) {
          correctCount++;
        }
      }
    });

    const percentage = totalMCQ > 0 ? (correctCount / totalMCQ) * 100 : 0;

    await prisma.user.update({
      where: { id: userId },
      data: {
        assessmentStatus: 'COMPLETED',
        scorePercentage: percentage
      }
    });

    res.json({ scorePercentage: percentage });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
});

// Terminate assessment
router.post('/terminate', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    await prisma.user.update({
      where: { id: userId },
      data: { assessmentStatus: 'TERMINATED' }
    });

    res.json({ message: 'Assessment terminated' });
  } catch (error) {
    console.error('Terminate assessment error:', error);
    res.status(500).json({ error: 'Failed to terminate assessment' });
  }
});

export default router;
