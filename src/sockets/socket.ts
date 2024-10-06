import { Server as SocketIOServer } from 'socket.io';
import { sendMessage } from '../controllers/message_controllers/message_controller'; 

export function setupSocket(server: any) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('send_message', async (data) => {
      try {
        const { content, groupId, senderId } = data;
        const result = await sendMessage(senderId, groupId, content);

        if (result.response === 'success') {
          io.to(groupId).emit('receive_message', result.data.message);
        } else {
          socket.emit('error_message', result.message);
        }
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error_message', 'An error occurred while sending the message.');
      }
    });

    socket.on('join_group', (groupId) => {
      socket.join(groupId);
      console.log(`User ${socket.id} joined group ${groupId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.id);
    });
  });
}
