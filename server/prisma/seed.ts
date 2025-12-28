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

  // Create sample assessment
  const assessment = await prisma.assessment.upsert({
    where: { id: 'assess_civil_001' },
    update: {
      name: 'Ironcrest Recruitment Assessment Round'
    },
    create: {
      id: 'assess_civil_001',
      name: 'Ironcrest Recruitment Assessment Round',
      durationMinutes: 90,
      questions: {
        create: [
          // Reasoning questions
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
          // Add more questions here as needed...
          // For brevity, I'll add just a few more
          {
            id: 'a1',
            text: 'A slab of 180 m² area and 150 mm thickness requires how much concrete?',
            type: 'MCQ',
            section: 'Aptitude',
            options: JSON.stringify(['22.5 m³', '25.5 m³', '27 m³', '30 m³']),
            correctOptionIndex: 2
          },
          {
            id: 't1',
            text: 'What is the primary cause of segregation in concrete?',
            type: 'MCQ',
            section: 'Technical',
            options: JSON.stringify(['Low water content', 'Excess vibration', 'Poor curing', 'High cement content']),
            correctOptionIndex: 1
          },
          // Written questions
          {
            id: 'w1',
            text: 'Explain how you would manage a construction project that is delayed due to labour shortage and material price fluctuation. Mention practical steps and risk mitigation.',
            type: 'WRITTEN',
            section: 'Written Experience',
            options: JSON.stringify([])
          }
        ]
      }
    }
  });

  console.log('Created assessment:', assessment.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
