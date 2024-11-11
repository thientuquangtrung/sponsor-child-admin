import io from 'socket.io-client';

let socket;

const connectSocket = (user_id, token) => {
    socket = io(import.meta.env.VITE_APP_SERVER_DOMAIN, {
        query: {
            token,
            user_id,
        },
    });
};

export { socket, connectSocket };
