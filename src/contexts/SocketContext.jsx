import { createContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { socket, connectSocket } from '@/lib/socket';
import { NewNotification } from '@/redux/notification/notificationActionCreators';

export const SocketContext = createContext({
    socket: null,
});

export function SocketProvider({ children }) {
    const { user, accessToken } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (user) {
            // logged in
            if (!socket) {
                connectSocket(user.userID, accessToken);
            }

            socket.on('NOTIFICATION', (newNotification) => {
                dispatch(NewNotification(newNotification));
            });

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
            socket?.off('NOTIFICATION');

            // remove error listener
            socket?.off('error');
            socket?.off('connect_error');
        };
    }, [user]);

    return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}
