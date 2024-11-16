import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const DropdownNotification = () => {
    const [notifying, setNotifying] = useState(true);

    const notifications = [
        {
            title: "Chỉnh sửa thông tin chiến dịch của bạn trong tích tắc",
            description: "Cập nhật thông tin chiến dịch nhanh chóng và dễ dàng để thu hút nhiều người tham gia hơn.",
            date: "12 Tháng 5, 2025"
        },
        {
            title: "Đây là một thực tế phổ biến",
            description: "rằng sự rõ ràng và minh bạch là yếu tố thu hút mạnh mẽ người ủng hộ.",
            date: "24 Tháng 2, 2025"
        },
        {
            title: "Nhiều hình thức khác nhau",
            description: "của các chiến dịch từ thiện có thể tạo sự khác biệt, nhưng sự minh bạch luôn là chìa khóa.",
            date: "04 Tháng 1, 2025"
        },
        {
            title: "Các hình thức hỗ trợ đa dạng",
            description: "giúp chiến dịch của bạn dễ dàng tiếp cận nhiều người ủng hộ và đồng hành.",
            date: "01 Tháng 12, 2024"
        }

    ];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="relative h-10 w-10 rounded-full"
                    onClick={() => setNotifying(false)}
                >
                    <Bell className="h-4 w-4" />
                    {notifying && (
                        <span className="absolute -top-1 -right-1 h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80">
                <div className="px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Thông báo
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.map((notification, index) => (
                        <DropdownMenuItem key={index} className="flex flex-col items-start p-4">
                            <div className="text-sm font-semibold">{notification.title}</div>
                            <div className="text-sm text-gray-500">{notification.description}</div>
                            <div className="text-xs text-gray-400 mt-1">{notification.date}</div>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default DropdownNotification;