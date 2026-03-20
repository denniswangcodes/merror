import { PrismaClient, FeedbackType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 12);

  // Seed 6 users matching the JSX prototype
  const users = await Promise.all([
    prisma.user.upsert({
      where: { username: 'maya_chen' },
      update: {},
      create: {
        email: 'maya@merror.app',
        passwordHash: await hash('Password123!'),
        username: 'maya_chen',
        displayName: 'Maya Chen',
        bio: 'Spreading kindness one day at a time ✨',
        totalPoints: 134,
      },
    }),
    prisma.user.upsert({
      where: { username: 'javi_reyes' },
      update: {},
      create: {
        email: 'javi@merror.app',
        passwordHash: await hash('Password123!'),
        username: 'javi_reyes',
        displayName: 'Javier Reyes',
        bio: 'Coffee lover, community builder.',
        totalPoints: 57,
      },
    }),
    prisma.user.upsert({
      where: { username: 'priya_s' },
      update: {},
      create: {
        email: 'priya@merror.app',
        passwordHash: await hash('Password123!'),
        username: 'priya_s',
        displayName: 'Priya Singh',
        bio: 'Making the world a little warmer.',
        totalPoints: 89,
      },
    }),
    prisma.user.upsert({
      where: { username: 'tom_okafor' },
      update: {},
      create: {
        email: 'tom@merror.app',
        passwordHash: await hash('Password123!'),
        username: 'tom_okafor',
        displayName: 'Tom Okafor',
        bio: 'Friend to all, enemy to none.',
        totalPoints: 22,
      },
    }),
    prisma.user.upsert({
      where: { username: 'lena_bauer' },
      update: {},
      create: {
        email: 'lena@merror.app',
        passwordHash: await hash('Password123!'),
        username: 'lena_bauer',
        displayName: 'Lena Bauer',
        bio: 'Art, empathy, and a good laugh.',
        totalPoints: 8,
      },
    }),
    prisma.user.upsert({
      where: { username: 'alex_rivera' },
      update: {},
      create: {
        email: 'alex@merror.app',
        passwordHash: await hash('Password123!'),
        username: 'alex_rivera',
        displayName: 'Alex Rivera',
        bio: 'Just here to make someone\'s day.',
        totalPoints: 41,
      },
    }),
  ]);

  const [maya, javi, priya, tom, lena, alex] = users;

  // Seed initial feedback
  const feedItems = [
    { giverId: maya.id, receiverId: javi.id, type: 'COMPLIMENT' as FeedbackType, message: "Javi always knows the right words to say when someone's having a rough day. Genuinely one of the most emotionally intelligent people I know." },
    { giverId: priya.id, receiverId: maya.id, type: 'HELPFUL_ACT' as FeedbackType, message: 'Maya helped me move an entire apartment last Saturday without even being asked. She just showed up with coffee and boxes. I was speechless.' },
    { giverId: tom.id, receiverId: priya.id, type: 'MEMORY' as FeedbackType, message: 'Remember that rainy afternoon we got stuck in that tiny bookshop and ended up reading to each other for two hours? One of my favourite memories ever.' },
    { giverId: javi.id, receiverId: lena.id, type: 'COMPLIMENT' as FeedbackType, message: "Lena's art installations at the community centre completely transformed the space. People kept stopping just to stare and smile." },
    { giverId: lena.id, receiverId: tom.id, type: 'HELPFUL_ACT' as FeedbackType, message: 'Tom spent his entire lunch break helping me fix my bike chain even though he had a meeting right after. The kindest thing.' },
  ];

  for (const item of feedItems) {
    const exists = await prisma.feedback.findFirst({
      where: { giverId: item.giverId, receiverId: item.receiverId, message: item.message },
    });
    if (!exists) await prisma.feedback.create({ data: item });
  }

  console.log('✅ Seed complete. Users:', users.map((u: { username: string }) => u.username).join(', '));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
