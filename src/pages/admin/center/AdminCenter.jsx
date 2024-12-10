import React from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, FileSignature, UserCheck } from 'lucide-react';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { useGetAdminSummaryQuery } from '@/redux/admin/adminApi';
import { useGetNotificationsByUserIdQuery } from '@/redux/notification/notificationApi';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useSelector } from 'react-redux';

const StatusCard = ({ title, count, icon, color, to }) => (
    <Link to={to}>
        <Card className={`${color} text-white cursor-pointer transition-colors duration-200`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">
                    {title}
                </CardTitle>
                {React.cloneElement(icon, { className: "h-6 w-6" })}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-extrabold">{count}</div>
                <p className="text-sm">đang chờ xử lý</p>
            </CardContent>
        </Card>
    </Link>
);

const RecentNotification = ({ icon, title, description, date }) => (
    <Card className="mb-4">
        <CardHeader className="flex flex-row items-center space-y-0">
            {icon}
            <div className="ml-4 flex-1">
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
            <div className="text-sm text-gray-500">{date}</div>
        </CardHeader>
    </Card>
);

const AdminCenter = () => {
    const { user } = useSelector((state) => state.auth);
    const { data: summaryData, isLoading: isSummaryLoading, error: summaryError } = useGetAdminSummaryQuery();
    const {
        data: notifications = [],
        isLoading: isNotificationsLoading,
        error: notificationsError
    } = useGetNotificationsByUserIdQuery(user?.userID, {
        skip: !user?.userID,
    });

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Trung tâm Quản trị', path: null },
    ];

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'report':
                return <FileText className="h-6 w-6 text-blue-500" />;
            case 'guarantee-requests':
                return <UserCheck className="h-6 w-6 text-green-500" />;
            case 'contract':
                return <FileSignature className="h-6 w-6 text-purple-500" />;
            default:
                return <FileText className="h-6 w-6 text-gray-500" />;
        }
    };

    if (isSummaryLoading || isNotificationsLoading) {
        return (
            <div>
                <LoadingScreen />
            </div>
        );
    }

    if (summaryError || notificationsError) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <div className="text-lg text-red-500">
                    Đã có lỗi xảy ra khi tải dữ liệu
                </div>
            </div>
        );
    }

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="w-full space-y-4 mx-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatusCard
                        title="Yêu cầu giải ngân"
                        count={summaryData?.requestedDisbursementCount ?? 0}
                        icon={<FileText />}
                        color="bg-[#54C392] hover:bg-green-600"
                        to="/disbursement-requests"
                    />
                    <StatusCard
                        title="Yêu cầu trở thành Bảo lãnh"
                        count={summaryData?.pendingUsersCount ?? 0}
                        icon={<UserCheck />}
                        color="bg-[#4aba75] hover:bg-green-600"
                        to="guarantee-requests"
                    />
                    <StatusCard
                        title="Hợp đồng"
                        count={summaryData?.waitingContractsCount ?? 0}
                        icon={<FileSignature />}
                        color="bg-[#1b8048] hover:bg-green-600"
                        to="contracts"
                    />
                </div>

                <h2 className="text-xl font-semibold mb-4">Thông báo gần đây</h2>
                <ScrollArea className="h-[400px] pr-4">
                    {notifications.length > 0 ? (
                        notifications.map(notification => (
                            <RecentNotification
                                key={notification.id}
                                icon={getNotificationIcon(notification.type)}
                                title={notification.title}
                                description={notification.message}
                                date={notification.time}
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-500 italic">
                            Không có thông báo mới
                        </div>
                    )}
                </ScrollArea>
            </div>
        </>
    );
};

export default AdminCenter;