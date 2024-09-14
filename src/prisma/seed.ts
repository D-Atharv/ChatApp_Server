import { prisma } from "../database/prisma";
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  // Create Users
  const userA = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@example.com',
      image: 'https://example.com/alice.jpg',
    },
  });

  const userB = await prisma.user.create({
    data: {
      name: 'Bob',
      email: 'bob@example.com',
      image: 'https://example.com/bob.jpg',
    },
  });

  // Create a Group
  const group = await prisma.group.create({
    data: {
      title: 'Work Team',
      isGroupChat: true,
      creatorId: userA.id,
    },
  });

  // Add Users to the Group
  await prisma.groupUsers.createMany({
    data: [
      { groupId: group.id, userId: userA.id },
      { groupId: group.id, userId: userB.id },
    ],
  });

  // Create a Message
  await prisma.message.create({
    data: {
      content: 'Hello Bob!',
      senderId: userA.id,
      groupId: group.id,
    },
  });

  console.log('Seed data has been added.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
