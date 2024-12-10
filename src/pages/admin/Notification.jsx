import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Ellipsis, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import notification from '@/assets/images/notification.jpg';
import { useSelector, useDispatch } from 'react-redux';
import { MarkAllAsRead, MarkAsRead, SetNotifications } from '@/redux/notification/notificationActionCreators';
import {
    useGetNotificationsByUserIdQuery,
    useMarkAllAsReadMutation,
    useMarkAsReadMutation,
} from '@/redux/notification/notificationApi';

const Notification = () => {
    const { user } = useSelector((state) => state.auth);
    const { notifications } = useSelector((state) => state.notification);
    const {
        data = [],
        isLoading,
        isError,
    } = useGetNotificationsByUserIdQuery(user?.userID, {
        skip: !user?.userID,
    });

    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();

    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (data?.length > 0) {
            dispatch(SetNotifications(data));
        }
    }, [data, dispatch]);

    const notificationCount = notifications.filter((notification) => !notification.isRead).length;

    const toggleDialog = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = (event, id) => {
        event.stopPropagation();
        dispatch(MarkAsRead(id));
        markAsRead(id);
    };

    const handleMarkAllAsRead = () => {
        dispatch(MarkAllAsRead());
        markAllAsRead(user?.userID);
    };

    return (
        <div className="relative">
            <div className="relative">
                <Bell className="text-gray-700 cursor-pointer" onClick={toggleDialog} size={26} />
                {notificationCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full hover:bg-normal">
                        {notificationCount}
                    </Badge>
                )}
            </div>

            {isOpen && (
                <div className="absolute right-0 top-10 bg-white shadow-lg rounded-lg p-4 w-[420px] max-h-[500px] overflow-y-auto border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-semibold text-gray-800">Thông báo</h2>
                        <button className="text-teal-500 text-sm hover:underline" onClick={handleMarkAllAsRead}>
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>

                    {notifications.length > 0 ? (
                        <ul className="space-y-3">
                            {notifications.map((notification) => (
                                <li
                                    key={notification.id}
                                    className={`flex items-start p-3 rounded-lg ${notification.isRead ? 'bg-white' : 'bg-gray-100'
                                        } hover:bg-gray-200 hover:cursor-pointer transition relative`}
                                >
                                    {/* <img
                                        src={notification.profileImage}
                                        alt={`${notification.name}'s profile`}
                                        className="w-10 h-10 rounded-full mr-3 border border-gray-300"
                                    /> */}
                                    <div className="flex-1">
                                        {/* <p className="text-sm text-gray-700">
                                            <span className="font-semibold text-teal-500">{notification.name}</span>{' '}
                                            {notification.action}
                                        </p> */}
                                        <p className="text-sm text-gray-500">{notification.message}</p>
                                        <span className="text-xs text-gray-400">{notification.time}</span>
                                    </div>
                                    {!notification.isRead && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Ellipsis className="text-gray-500 cursor-pointer hover:text-gray-700" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                side="bottom"
                                                align="end"
                                                className="bg-white border border-gray-200 shadow-md rounded-md"
                                            >
                                                <DropdownMenuItem
                                                    className="flex items-center space-x-2 px-2 py-2 text-sm text-gray-700 cursor-pointer"
                                                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                                                >
                                                    <Check className="w-4 h-4 text-teal-500" />
                                                    <span>Đánh dấu đã đọc</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center py-6">
                            <img src={notification} alt="notification" className="w-full h-full" />
                            <p className="text-gray-500 text-center italic">Hiện bạn chưa có thông báo mới</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Notification;
