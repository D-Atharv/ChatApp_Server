import { Server } from "socket.io";

interface Message {
    groupId: string;
    userId: string;
    content: string;
}
export const IncomingMessage = (io: Server, message: Message) => {

    if (!message.groupId || !message.userId || !message.content) {
        console.error('Invalid message format');
        return;
    }

    // Broadcast the message to the specific group
    io.to(message.groupId).emit('receive_message', {
        userId: message.userId,
        content: message.content
    });
}