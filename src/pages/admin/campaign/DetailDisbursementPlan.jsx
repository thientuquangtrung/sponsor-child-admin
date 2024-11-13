import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { activityStatus } from '@/config/combobox';
import { Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DisbursementPlanTabs from '@/pages/admin/campaign/DisbursementPlanTabs';

const activityStatusColorMap = {
    0: 'bg-blue-100 text-blue-800',
    1: 'bg-yellow-100 text-yellow-800',
    2: 'bg-green-100 text-green-800',
    3: 'bg-red-100 text-red-800'
};

const getStatusStyles = (status, statusConfig, colorMap) => {
    const statusItem = statusConfig?.find(item => item.value === status);
    return {
        className: `px-2 py-1 text-xs rounded-full ${colorMap[status] || 'bg-gray-100 text-gray-800'}`,
        label: statusItem ? statusItem.label : 'Không xác định'
    };
};

const EmptyState = ({ message }) => (
    <Card className="border-0 mb-6">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-teal-50 p-4 rounded-full mb-4">
                <Inbox className="w-12 h-12 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {message}
            </h3>
            <p className="text-gray-600">
                (｡•́︿•̀｡) Hãy quay lại sau nhé! ✨
            </p>
        </CardContent>
    </Card>
);

const formatDate = (dateString) => {
    if (!dateString) return '---';
    try {
        return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
        return '---';
    }
};

const formatAmount = (amount) => {
    if (typeof amount !== 'number') return '---';
    return amount.toLocaleString() + ' VNĐ';
};

const DetailDisbursementPlan = ({ disbursementPlans }) => {
    const navigate = useNavigate();

    if (!disbursementPlans || !Array.isArray(disbursementPlans) || disbursementPlans.length === 0) {
        return <EmptyState message="Chưa có kế hoạch giải ngân" />;
    }


    const allActivities = disbursementPlans
        .filter(plan => plan?.simplifiedStages)
        .flatMap(plan =>
            plan.simplifiedStages
                .filter(stage => stage?.stageActivity ||
                    (stage?.latestDisbursementRequest?.simplifiedDisbursementReports?.length > 0))
                .map(stage => ({
                    ...stage.stageActivity,
                    reportDetails: stage.latestDisbursementRequest?.simplifiedDisbursementReports?.[0]?.disbursementReportDetails || []
                }))
        )
        .filter(activity => activity)
        .sort((a, b) => {
            const dateA = new Date(a.activityDate || 0);
            const dateB = new Date(b.activityDate || 0);
            return dateA - dateB;
        });


    const renderActivityWithReports = (activity) => {
        return (
            <div>
                <p className="font-medium">{activity.description || 'Chưa có mô tả'}</p>
                <p className="text-sm text-gray-500">
                    {formatDate(activity.activityDate)}
                </p>
                {activity.reportDetails && activity.reportDetails.length > 0 && (
                    <div className="mt-2 space-y-2">
                        <p className="font-medium text-sm text-gray-700">Chi tiết báo cáo:</p>
                        {activity.reportDetails.map((detail, index) => (
                            <div key={detail.id} className="pl-4 border-l-2 border-teal-200">
                                <p className="text-sm">{detail.itemDescription}</p>
                                <p className="text-xs text-gray-600">
                                    Dự kiến: {formatAmount(detail.amountSpent)}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Thực tế: {formatAmount(detail.actualAmountSpent)}
                                </p>
                                {detail.receiptUrl && (
                                    <a
                                        href={detail.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-xs"
                                    >
                                        Xem biên lai
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                {typeof activity.status !== 'undefined' && (
                    <span className={getStatusStyles(activity.status, activityStatus, activityStatusColorMap).className}>
                        {getStatusStyles(activity.status, activityStatus, activityStatusColorMap).label}
                    </span>
                )}
            </div>
        );
    };
    return (
        <>

            <DisbursementPlanTabs
                disbursementPlans={disbursementPlans}
                navigate={navigate}
            />

            {/* <Card className="shadow-lg border-0 mb-6">
                <CardHeader className="bg-teal-600 text-white">
                    <CardTitle className="text-2xl font-semibold">Hoạt động chiến dịch</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {allActivities.length === 0 ? (
                        <EmptyState message="Chưa có hoạt động" />
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ngày thực hiện</TableHead>
                                        <TableHead>Thông tin hoạt động</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allActivities.map((activity) => (
                                        <TableRow key={activity.activityID || `activity-${activity.description}`}>
                                            <TableCell>
                                                {formatDate(activity.activityDate)}
                                            </TableCell>
                                            <TableCell>{renderActivityWithReports(activity)}</TableCell>
                                            <TableCell>
                                                {typeof activity.status !== 'undefined' && (
                                                    <span className={getStatusStyles(activity.status, activityStatus, activityStatusColorMap).className}>
                                                        {getStatusStyles(activity.status, activityStatus, activityStatusColorMap).label}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card> */}
        </>
    );
};

export default DetailDisbursementPlan;