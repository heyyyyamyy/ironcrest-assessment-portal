import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('Created admin user:', admin.username);

  await prisma.question.deleteMany({
    where: { assessmentId: 'assess_civil_001' }
  });

  await prisma.assessment.deleteMany({
    where: { id: 'assess_civil_001' }
  });

  const assessment = await prisma.assessment.create({
    data: {
      id: 'assess_civil_001',
      name: 'Ironcrest Recruitment Assessment Round',
      durationMinutes: 90,
      questions: {
        create: [
          // --- REASONING & LOGICAL ABILITY (10 Questions) ---
          {
            id: 'r1',
            text: 'If a contractor completes 60% of work in 24 days, assuming uniform progress, how many days are required to complete the remaining work?',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify(['12', '14', '16', '18']),
            correctOptionIndex: 2
          },
          {
            id: 'r2',
            text: 'A site has 3 shifts of equal duration. If productivity drops by 20% in night shift, overall productivity reduces by:',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify(['6.6%', '8%', '10%', '12%']),
            correctOptionIndex: 0
          },
          {
            id: 'r3',
            text: 'Arrange the construction activities in correct order:',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify([
              'Excavation -> Superstructure -> Foundation -> Finishing',
              'Foundation -> Excavation -> Superstructure -> Finishing',
              'Excavation -> Foundation -> Superstructure -> Finishing',
              'Excavation -> Finishing -> Superstructure -> Foundation'
            ]),
            correctOptionIndex: 2
          },
          {
            id: 'r4',
            text: 'If STEEL is coded as UVGGO, how is CEMENT coded?',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify(['EGOHNV', 'EGOHOV', 'EHPHOV', 'EGOHNW']),
            correctOptionIndex: 3
          },
          {
            id: 'r5',
            text: 'A project delayed by 25% of planned duration finishes in 75 days. What was original duration?',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify(['50', '55', '60', '65']),
            correctOptionIndex: 2
          },
          {
            id: 'r6',
            text: 'Find the odd one:',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify(['Footing', 'Column', 'Beam', 'Aggregate']),
            correctOptionIndex: 3
          },
          {
            id: 'r7',
            text: 'If 4 engineers can supervise 6 sites in 8 hours, how many engineers are required for 9 sites in same time?',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify(['5', '6', '7', '8']),
            correctOptionIndex: 1
          },
          {
            id: 'r8',
            text: 'A drawing scale is changed from 1:100 to 1:200. Dimensions on drawing will:',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify(['Double', 'Halve', 'Remain same', 'Become four times']),
            correctOptionIndex: 1
          },
          {
            id: 'r9',
            text: 'A site safety audit happens every 12 days. If last audit was on Monday, next audit will be on:',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify(['Friday', 'Saturday', 'Sunday', 'Monday']),
            correctOptionIndex: 1
          },
          {
            id: 'r10',
            text: 'If the north direction is rotated 135 degrees clockwise, which direction does it point to?',
            type: 'MCQ',
            section: 'Reasoning',
            options: JSON.stringify(['South', 'South-East', 'South-West', 'East']),
            correctOptionIndex: 1
          },

          // --- APTITUDE & NUMERICAL ABILITY (12 Questions) ---
          {
            id: 'a1',
            text: 'A slab of 180 m2 area and 150 mm thickness requires how much concrete?',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['22.5 m3', '25.5 m3', '27 m3', '30 m3']),
            correctOptionIndex: 2
          },
          {
            id: 'a2',
            text: 'If steel consumption is 90 kg/m3, steel required for 20 m3 RCC is:',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['1600 kg', '1700 kg', '1800 kg', '1900 kg']),
            correctOptionIndex: 2
          },
          {
            id: 'a3',
            text: 'A contractor adds 15% profit after adding 10% overheads. What is net profit % on cost?',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['13.5%', '14.5%', '15%', '16.5%']),
            correctOptionIndex: 3
          },
          {
            id: 'a4',
            text: 'Cement bags required for 1:1.5:3 concrete for 10 m3 (use dry volume 1.54):',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['78', '82', '88', '92']),
            correctOptionIndex: 1
          },
          {
            id: 'a5',
            text: 'Labour productivity reduces from 12 units/day to 9 units/day. Productivity drop is:',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['20%', '22%', '25%', '30%']),
            correctOptionIndex: 2
          },
          {
            id: 'a6',
            text: 'Cost of sand increases from Rs.1200 to Rs.1500 per unit. Percentage increase?',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['20%', '22%', '25%', '30%']),
            correctOptionIndex: 2
          },
          {
            id: 'a7',
            text: 'If GST is 18% on Rs.2,40,000, GST amount is:',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['Rs.40,200', 'Rs.42,300', 'Rs.43,200', 'Rs.45,000']),
            correctOptionIndex: 2
          },
          {
            id: 'a8',
            text: 'A tender estimate is Rs.1.2 crore. Contractor bids 7% below estimate. Bid value is:',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['Rs.1.12 cr', 'Rs.1.116 cr', 'Rs.1.104 cr', 'Rs.1.08 cr']),
            correctOptionIndex: 1
          },
          {
            id: 'a9',
            text: 'If 8 workers work 7 hours/day for 15 days, total man-hours are:',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['720', '760', '820', '840']),
            correctOptionIndex: 3
          },
          {
            id: 'a10',
            text: 'Water requirement is 135 LPCD for 120 people. Daily water demand?',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['14,200 L', '15,200 L', '16,200 L', '18,000 L']),
            correctOptionIndex: 2
          },
          {
            id: 'a11',
            text: 'If retention money is 8% on Rs.50 lakh, retention amount is:',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['Rs.3 lakh', 'Rs.3.5 lakh', 'Rs.4 lakh', 'Rs.4.5 lakh']),
            correctOptionIndex: 2
          },
          {
            id: 'a12',
            text: 'If shuttering cost is Rs.45/m2 and area is 380 m2, cost is:',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['Rs.16,100', 'Rs.16,800', 'Rs.17,100', 'Rs.18,000']),
            correctOptionIndex: 2
          },

          // --- TECHNICAL - CONSTRUCTION (12 Questions) ---
          {
            id: 't1',
            text: 'What is the primary cause of segregation in concrete?',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Low water content', 'Excess vibration', 'Poor curing', 'High cement content']),
            correctOptionIndex: 1
          },
          {
            id: 't2',
            text: 'Minimum curing period for OPC concrete is:',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['3 days', '5 days', '7 days', '14 days']),
            correctOptionIndex: 2
          },
          {
            id: 't3',
            text: 'What is the purpose of lap length in reinforcement?',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Reduce steel', 'Increase strength', 'Transfer stress', 'Improve bonding']),
            correctOptionIndex: 2
          },
          {
            id: 't4',
            text: 'One-way slab is designed when:',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Both spans equal', 'Longer span > 2x shorter span', 'Thickness is more', 'Load is heavy']),
            correctOptionIndex: 1
          },
          {
            id: 't5',
            text: 'Honeycombing mainly affects:',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Strength only', 'Appearance only', 'Durability only', 'Strength and durability']),
            correctOptionIndex: 3
          },
          {
            id: 't6',
            text: 'Development length depends on:',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Concrete grade', 'Steel grade', 'Bond stress', 'All of the above']),
            correctOptionIndex: 3
          },
          {
            id: 't7',
            text: 'What is the function of DPC?',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Prevent termites', 'Prevent dampness', 'Increase strength', 'Reduce cracks']),
            correctOptionIndex: 1
          },
          {
            id: 't8',
            text: 'Which test checks workability of concrete?',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Cube test', 'Slump test', 'Rebound hammer', 'Core test']),
            correctOptionIndex: 1
          },
          {
            id: 't9',
            text: 'Which foundation is suitable for weak soil?',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Isolated footing', 'Combined footing', 'Raft foundation', 'Strip footing']),
            correctOptionIndex: 2
          },
          {
            id: 't10',
            text: 'Carbonation in concrete mainly causes:',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Increase strength', 'Steel corrosion', 'Shrinkage', 'Expansion']),
            correctOptionIndex: 1
          },
          {
            id: 't11',
            text: 'What is the role of admixtures?',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Reduce cement', 'Improve properties', 'Increase cost', 'Increase setting time only']),
            correctOptionIndex: 1
          },
          {
            id: 't12',
            text: 'Which document defines quantities and rates?',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Drawing', 'BOQ', 'Tender notice', 'Work order']),
            correctOptionIndex: 1
          },

          // --- WRITTEN QUESTIONS (2 Questions) ---
          {
            id: 'w1',
            text: 'Explain how you would manage a construction project that is delayed due to labour shortage and material price fluctuation. Mention practical steps and risk mitigation.',
            type: 'WRITTEN',
            section: 'Written Experience',
            options: JSON.stringify([])
          },
          {
            id: 'w2',
            text: 'Describe a challenging project you worked on (or hypothetical). Explain how you planned daily activities, handled coordination issues, and ensured quality and safety.',
            type: 'WRITTEN',
            section: 'Written Experience',
            options: JSON.stringify([])
          }
        ]
      }
    }
  });

  console.log('Created assessment:', assessment.name, 'with all 36 questions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
