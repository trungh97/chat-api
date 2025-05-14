import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateLastMessageAt() {
  try {
    console.log("Starting migration for lastMessageAt...");

    // Fetch all conversations
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1, // Get the last message for each conversation
        },
      },
    });

    // Update each conversation's lastMessageAt field
    for (const conversation of conversations) {
      const lastMessage = conversation.messages[0];
      if (lastMessage) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { lastMessageAt: lastMessage.createdAt },
        });
        console.log(
          `Updated conversation ${conversation.id} with lastMessageAt = ${lastMessage.createdAt}`
        );
      } else {
        console.log(
          `No messages found for conversation ${conversation.id}, skipping...`
        );
      }
    }

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateLastMessageAt();
