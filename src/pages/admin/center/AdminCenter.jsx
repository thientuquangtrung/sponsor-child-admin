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
    const recentNotifications = [
        { id: 1, type: 'report', title: 'Báo cáo mới từ Quản lý trẻ em', description: 'Báo cáo hàng tháng về tình trạng trẻ em', date: '1 giờ trước' },
        { id: 2, type: 'guarantee-requests', title: 'Yêu cầu trở thành Người bảo lãnh', description: 'Nguyễn Văn A đã gửi yêu cầu', date: '3 giờ trước' },
        { id: 3, type: 'contract', title: 'Hợp đồng mới cần duyệt', description: 'Hợp đồng giải ngân cho dự án A', date: '1 ngày trước' },
        { id: 4, type: 'report', title: 'Báo cáo Giải ngân của Người bảo lãnh', description: 'Báo cáo chi tiết về việc giải ngân tháng 9', date: '2 ngày trước' },
    ];
    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/' },
        { name: 'Trung tâm Quản trị', path: null },
    ];

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="w-full space-y-4 mx-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatusCard
                        title="Báo cáo"
                        count={3}
                        icon={<FileText />}
                        color="bg-[#54C392] hover:bg-green-600"
                        to="reports"
                    />
                    <StatusCard
                        title="Yêu cầu"
                        count={5}
                        icon={<UserCheck />}
                        color="bg-[#4aba75] hover:bg-green-600"
                        to="guarantee-requests"
                    />
                    <StatusCard
                        title="Hợp đồng"
                        count={4}
                        icon={<FileSignature />}
                        color="bg-[#1b8048] hover:bg-green-600"
                        to="contracts"
                    />
                </div>

                <h2 className="text-xl font-semibold mb-4">Thông báo gần đây</h2>
                <ScrollArea className="h-[400px] pr-4">
                    {recentNotifications.map(notification => (
                        <RecentNotification
                            key={notification.id}
                            icon={
                                notification.type === 'report' ? <FileText className="h-6 w-6 text-blue-500" /> :
                                    notification.type === 'guarantee-requests' ? <UserCheck className="h-6 w-6 text-green-500" /> :
                                        <FileSignature className="h-6 w-6 text-purple-500" />
                            }
                            title={notification.title}
                            description={notification.description}
                            date={notification.date}
                        />
                    ))}
                </ScrollArea>
            </div>
        </>
    );
};

export default AdminCenter;