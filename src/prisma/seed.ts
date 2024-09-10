import {prisma} from "../database/prisma";
import { hash } from 'bcryptjs';
import 'dotenv/config';

async function main() {
  const hashedPassword = await hash('securepassword', 10);

  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      username: 'alice',
      password: hashedPassword,
      photoUrl: 'https://example.com/photo/alice.jpg',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      username: 'bob',
      password: hashedPassword,
      photoUrl: 'https://example.com/photo/bob.jpg',
    },
  });

  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: user1.id },
          { userId: user2.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        content: 'Hello Bob!',
        senderId: user1.id,
        conversationId: conversation.id,
      },
      {
        content: 'Hi Alice!',
        senderId: user2.id,
        conversationId: conversation.id,
      },
    ],
  });

  await prisma.userMetadata.createMany({
    data: [
      {
        userId: user1.id,
        targetUserId: user2.id,
        nickname: 'Bobster',
      },
      {
        userId: user2.id,
        targetUserId: user1.id,
        nickname: 'Alice',
      },
    ],
  });

  console.log('Database seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
