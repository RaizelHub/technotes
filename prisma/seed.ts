import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const TRACKS = [
  'IT & Networking',
  'Software Development',
  'AI & Automation',
] as const;

export type Track = (typeof TRACKS)[number];

export const DEFAULT_TRACK_CATEGORIES: Record<Track, string[]> = {
  'IT & Networking': [
    'Technical Support',
    'Networking',
    'Cisco',
    'Windows',
    'Hardware',
    'Troubleshooting',
    'Packet Tracer',
    'Commands',
    'Questions',
  ],
  'Software Development': [
    'Frontend',
    'Backend',
    'Full-Stack',
    'React',
    'Laravel',
    'Node.js',
    'APIs',
    'Databases',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'Authentication',
    'Testing',
    'Git & GitHub',
    'DevOps',
    'Deployment',
    'System Design',
    'Architecture',
    'Programming Concepts',
    'Projects',
  ],
  'AI & Automation': [
    'n8n',
    'AI Automation',
    'AI Agents',
    'OpenAI',
    'Gemini',
    'APIs & Integrations',
    'Webhooks',
    'Workflow Automation',
    'RAG',
    'Prompt Engineering',
    'SaaS Automation',
    'CRM Automation',
    'Lead Automation',
    'Email Automation',
    'Database Automation',
    'Automation Projects',
  ],
};

export async function seedCategoriesOnly() {
  console.log('Ensuring default career track categories exist...');
  for (const track of TRACKS) {
    const categories = DEFAULT_TRACK_CATEGORIES[track];
    for (const catName of categories) {
      await prisma.category.upsert({
        where: {
          name_track: {
            name: catName,
            track: track,
          },
        },
        update: {},
        create: {
          name: catName,
          track: track,
        },
      });
    }
  }
  console.log('All career track categories verified.');
}

export async function clearAllNotes() {
  console.log('Removing all notes from database...');
  await prisma.note.deleteMany({});
  console.log('All notes cleared.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  const isClear = process.argv.includes('--clear');

  const action = isClear ? clearAllNotes() : seedCategoriesOnly();

  action
    .catch((e) => {
      console.error('Database operation error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
