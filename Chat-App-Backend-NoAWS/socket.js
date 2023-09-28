// socket.js

// Import necessary modules
// ...
import io from "socket.io-client";
// Function to handle audio call requests
const handleAudioCallRequest = (socket) => {
    socket.on('audio_call_request', (data) => {
      // Handle the audio call request
      // You can broadcast the request to the intended recipient or handle it according to your application's logic
  
      // For example, emit the request to the recipient
      socket.to(data.recipientId).emit('audio_call_request', {
        callerId: data.callerId,
      });
    });
  };
  
  const connectSocket = (user_id) => {
    socket = io("http://localhost:3001", {
      query: `user_id=${user_id}`,
    });
  
    // Call the function to handle audio call requests
    handleAudioCallRequest(socket);
  };
  
  export { socket, connectSocket };
  