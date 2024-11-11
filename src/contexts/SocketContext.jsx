import { createContext, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { socket, connectSocket } from '@/lib/socket';

const SocketContext = createContext({
    socket: null,
});

export const useSocket = () => {
    return useContext(SocketContext);
};

export function SocketProvider({ children }) {
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            // logged in
            if (!socket) {
                connectSocket(user.id, user.token);
            }

            socket.on('error', (data) => {
                // dispatch(showSnackbar({ severity: 'error', message: data.message }));
            });

            socket.on('connect_error', (err) => {
                // dispatch(revertAll());
                // dispatch(showSnackbar({ severity: 'error', message: err.message }));
            });
        }

        // Remove event listener on component unmount
        return () => {
            socket?.off('error');
            socket?.off('connect_error');
        };
    }, [user]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}
