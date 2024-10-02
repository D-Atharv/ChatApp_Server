import { Server,Socket } from "socket.io";
import { prisma } from "../database/prisma";

interface Message {
    groupId: string;
    userId: string;
    content: string;
}
export const IncomingMessageFromClient = async (io: Server, socket: Socket, data: Message) => {

    const { userId, groupId, content } = data;

    if (!content) {
        socket.emit("error", "Content is missing.");
        return;
    }

    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
        });

        if (!group) {
            socket.emit("error", "Group not found");
            return;
        }

        const isMember = await prisma.groupUsers.findFirst({
            where: {
                groupId,
                userId,
            },
        });

        if (!isMember) {
            socket.emit("error", "User is not associated with this group");
            return;
        }

        const isBlocked = await prisma.block.findFirst({
            where: {
                OR: [
                    { blockerId: userId, blockedId: group.creatorId },
                    { blockedId: userId, blockerId: group.creatorId },
                ],
            },
        });

        if (isBlocked) {
            socket.emit("error", "Unable to send message due to a block");
            return;
        }

        const message = await prisma.message.create({
            data: {
                content,
                senderId: userId,
                groupId,
            },
        });

        io.to(groupId).emit("new_message", message); // Broadcasts the message to the group
    } catch (error) {
        console.error("Error sending message: ", error);
        socket.emit("error", "Error in sending message");
    }
}