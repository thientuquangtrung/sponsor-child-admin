import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { disbursementStageStatus, activityStatus, disbursementRequestStatus } from '@/config/combobox';
import { Inbox } from 'lucide-react';

const stageStatusColorMap = {
    0: 'bg-blue-100 text-blue-800',     // Đã lên lịch
    1: 'bg-yellow-100 text-yellow-800', // Đang tiến hành
    2: 'bg-green-100 text-green-800',   // Đã hoàn thành
    3: 'bg-red-100 text-red-800',       // Thất bại
    4: 'bg-gray-100 text-gray-800',     // Đã hủy
    5: 'bg-purple-100 text-purple-800'  // Đã thay thế
};

const requestStatusColorMap = {
    0: 'bg-blue-100 text-blue-800',     // Đã yêu cầu
    1: 'bg-green-100 text-green-800',   // Đã duyệt
    2: 'bg-red-100 text-red-800',       // Từ chối
    3: 'bg-yellow-100 text-yellow-800', // Yêu cầu chỉnh sửa
    4: 'bg-purple-100 text-purple-800', // Yêu cầu báo cáo
    5: 'bg-green-100 text-green-800'    // Hoàn thành
};

const activityStatusColorMap = {
    0: 'bg-blue-100 text-blue-800',     // Đã lên lịch
    1: 'bg-yellow-100 text-yellow-800', // Đang tiến hành
    2: 'bg-green-100 text-green-800',   // Đã hoàn thành
    3: 'bg-red-100 text-red-800'        // Đã hủy
};

const getStatusStyles = (status, statusConfig, colorMap) => {
    const statusItem = statusConfig.find(item => item.value === status);
    return {
        className: `px-2 py-1 text-xs rounded-full ${colorMap[status] || 'bg-gray-100 text-gray-800'}`,
        label: statusItem ? statusItem.label : 'Không xác định'
    };
};

const EmptyState = () => (
    <Card className="shadow-lg border-0 mb-6">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-teal-50 p-4 rounded-full mb-4">
                <Inbox className="w-12 h-12 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có kế hoạch giải ngân
            </h3>
            <p className="text-gray-600">
                (｡•́︿•̀｡) Hiện tại chưa có kế hoạch và hoạt động dự kiến giải ngân.
                Hãy quay lại sau nhé! ✨
            </p>
        </CardContent>
    </Card>
);

const DetailDisbursementPlan = ({ disbursementPlans }) => {
    if (!disbursementPlans || disbursementPlans.length === 0) {
        return <EmptyState />;
    }

    return (
        <>
            <Card className="shadow-lg border-0 mb-6">
                <CardHeader className="bg-teal-600 text-white">
                    <CardTitle className="text-2xl font-semibold">Kế hoạch giải ngân</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {disbursementPlans.map((plan, index) => (
                        <div key={index} className="mb-8">
                            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-teal-50 p-4 rounded-lg">
                                    <p className="text-sm text-teal-600 font-medium">Ngày bắt đầu</p>
                                    <p className="text-lg font-semibold">
                                        {new Date(plan.plannedStartDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>

                                <div className="bg-teal-50 p-4 rounded-lg">
                                    <p className="text-sm text-teal-600 font-medium">Ngày kết thúc dự kiến</p>
                                    <p className="text-lg font-semibold">
                                        {new Date(plan.plannedEndDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>

                                <div className="bg-teal-50 p-4 rounded-lg">
                                    <p className="text-sm text-teal-600 font-medium">Trạng thái</p>
                                    <p className="text-lg font-semibold">
                                        {plan.isCurrent ? 'Đang thực hiện' : 'Đã hoàn thành'}
                                    </p>
                                </div>

                                <div className="bg-teal-50 p-4 rounded-lg">
                                    <p className="text-sm text-teal-600 font-medium">Tổng số tiền</p>
                                    <p className="text-lg font-semibold">
                                        {plan.totalPlannedAmount.toLocaleString()} VNĐ
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Giai đoạn</TableHead>
                                            <TableHead>Số tiền giải ngân</TableHead>
                                            <TableHead>Ngày dự kiến</TableHead>
                                            <TableHead>Hoạt động</TableHead>
                                            <TableHead>Ngày giải ngân thực tế</TableHead>
                                            <TableHead>Thông tin yêu cầu</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {plan.simplifiedStages &&
                                            [...plan.simplifiedStages]
                                                .sort((a, b) => a.stageNumber - b.stageNumber)
                                                .map((stage) => (
                                                    <TableRow key={stage.stageID}>
                                                        <TableCell>Giai đoạn {stage.stageNumber}</TableCell>
                                                        <TableCell>{stage.disbursementAmount.toLocaleString()} VNĐ</TableCell>
                                                        <TableCell>
                                                            {new Date(stage.scheduledDate).toLocaleDateString('vi-VN')}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{stage.stageActivity.description}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {new Date(stage.stageActivity.activityDate).toLocaleDateString('vi-VN')}
                                                                </p>
                                                                <span className={getStatusStyles(stage.stageActivity.status, activityStatus, activityStatusColorMap).className}>
                                                                    {getStatusStyles(stage.stageActivity.status, activityStatus, activityStatusColorMap).label}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {stage.actualDisbursementDate ? (
                                                                <div>
                                                                    <p>{new Date(stage.actualDisbursementDate).toLocaleDateString('vi-VN')}</p>
                                                                    {stage.actualDisbursementAmount && (
                                                                        <p className="text-sm text-gray-500">
                                                                            {stage.actualDisbursementAmount.toLocaleString()} VNĐ
                                                                        </p>
                                                                    )}
                                                                    {stage.transferReceiptUrl && (
                                                                        <a
                                                                            href={stage.transferReceiptUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:underline text-sm"
                                                                        >
                                                                            Xem biên lai
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ) : '---'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {stage.latestDisbursementRequest && (
                                                                <div className="text-sm">
                                                                    <p><span className="font-medium">Ngày yêu cầu:</span> {new Date(stage.latestDisbursementRequest.requestDate).toLocaleDateString('vi-VN')}</p>
                                                                    <p><span className="font-medium">Ngân hàng:</span> {stage.latestDisbursementRequest.bankName}</p>
                                                                    <p><span className="font-medium">Tài khoản:</span> {stage.latestDisbursementRequest.bankAccountName}</p>
                                                                    <p><span className="font-medium">Số TK:</span> {stage.latestDisbursementRequest.bankAccountNumber}</p>
                                                                    <span className={getStatusStyles(stage.latestDisbursementRequest.requestStatus, disbursementRequestStatus, requestStatusColorMap).className}>
                                                                        {getStatusStyles(stage.latestDisbursementRequest.requestStatus, disbursementRequestStatus, requestStatusColorMap).label}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className={getStatusStyles(stage.status, disbursementStageStatus, stageStatusColorMap).className}>
                                                                {getStatusStyles(stage.status, disbursementStageStatus, stageStatusColorMap).label}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="shadow-lg border-0 mb-6">
                <CardHeader className="bg-teal-600 text-white">
                    <CardTitle className="text-2xl font-semibold">Hoạt động Dự Kiến</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ngày thực hiện</TableHead>
                                    <TableHead>Mô tả hoạt động</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {disbursementPlans.flatMap(plan =>
                                    plan.simplifiedStages.map(stage => stage.stageActivity))
                                    .sort((a, b) => new Date(a.activityDate) - new Date(b.activityDate))
                                    .map((activity) => (
                                        <TableRow key={activity.activityID}>
                                            <TableCell>
                                                {new Date(activity.activityDate).toLocaleDateString('vi-VN')}
                                            </TableCell>
                                            <TableCell>{activity.description}</TableCell>
                                            <TableCell>
                                                <span className={getStatusStyles(activity.status, activityStatus, activityStatusColorMap).className}>
                                                    {getStatusStyles(activity.status, activityStatus, activityStatusColorMap).label}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default DetailDisbursementPlan;