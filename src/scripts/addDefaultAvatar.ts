import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAvatarURLBasedOnName = (
  firstName: string = "",
  lastName: string = ""
) => {
  return `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=F9F5FF&color=7F56D9&bold=true`;
};

async function addDefaultAvatar() {
  try {
    console.log("Starting adding missing avatars...");

    // Fetch all users
    const users = await prisma.user.findMany();

    // Update each conversation's avatar field
    for (const user of users) {
      const avatar = user.avatar;
      if (!avatar) {
        const newAvatar = getAvatarURLBasedOnName(
          user.firstName,
          user.lastName
        );
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: newAvatar },
        });
        console.log(`Updated user ${user.id} with avatar = ${newAvatar}`);
      } else {
        console.log(`No user found ${user.id}, skipping...`);
      }
    }

    console.log("Adding missing avatars completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addDefaultAvatar();
