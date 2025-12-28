import express from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { requireRole } from '../middleware/auth';

const router = express.Router();

// Apply role check to all admin routes
router.use(requireRole('ADMIN'));

// Get all candidates
router.get('/candidates', async (req, res) => {
  try {
    const candidates = await prisma.user.findMany({
      where: { role: 'CANDIDATE' },
      select: {
        id: true,
        name: true,
        email: true,
        designation: true,
        role: true,
        experience: true,
        phone: true,
        location: true,
        qualification: true,
        portfolioUrl: true,
        idProofUrl: true,
        profileCompleted: true,
        assignedAssessmentId: true,
        assessmentStatus: true,
        scorePercentage: true,
        createdAt: true
      }
    });
    res.json(candidates);
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Create new candidate
router.post('/candidates', async (req, res) => {
  try {
    const { name, designation, assessmentId } = req.body;

    if (!name || !designation || !assessmentId) {
      return res.status(400).json({ error: 'Name, designation, and assessmentId are required' });
    }

    // Verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      return res.status(400).json({ error: 'Invalid assessment ID' });
    }

    // Generate credentials
    const cleanName = name.toLowerCase().replace(/\s+/g, '');
    const email = `${cleanName}@ironcrestdevelopers.com`;
    const userId = `IC-${Math.floor(1000 + Math.random() * 9000)}`;
    const password = Math.random().toString(36).slice(-8);

    const candidate = await prisma.user.create({
      data: {
        id: userId,
        name,
        designation,
        email,
        password: await bcrypt.hash(password, 10),
        role: 'CANDIDATE',
        assignedAssessmentId: assessmentId,
        assessmentStatus: 'PENDING'
      }
    });

    res.json({
      id: candidate.id,
      password // Return plain password for admin to share
    });
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

// Get all assessments
router.get('/assessments', async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        questions: true
      }
    });
    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

// Create new assessment
router.post('/assessments', async (req, res) => {
  try {
    const { name, durationMinutes, questions } = req.body;

    if (!name || !durationMinutes || !questions) {
      return res.status(400).json({ error: 'Name, duration, and questions are required' });
    }

    const assessment = await prisma.assessment.create({
      data: {
        name,
        durationMinutes,
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            type: q.type,
            section: q.section,
            options: JSON.stringify(q.options || []),
            correctOptionIndex: q.correctOptionIndex
          }))
        }
      },
      include: {
        questions: true
      }
    });

    res.json(assessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

export default router;
