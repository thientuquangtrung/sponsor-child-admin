import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { disbursementStageStatus, activityStatus, disbursementRequestStatus } from '@/config/combobox';

const stageStatusColorMap = {
    0: 'bg-blue-100 text-blue-800',
    1: 'bg-yellow-100 text-yellow-800',
    2: 'bg-green-100 text-green-800',
    3: 'bg-red-100 text-red-800',
    4: 'bg-gray-100 text-gray-800',
    5: 'bg-purple-100 text-purple-800'
};

const requestStatusColorMap = {
    0: 'bg-blue-100 text-blue-800',
    1: 'bg-green-100 text-green-800',
    2: 'bg-red-100 text-red-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-purple-100 text-purple-800',
    5: 'bg-green-100 text-green-800'
};

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
const formatPlanName = (plannedStartDate) => {
    if (!plannedStartDate) return 'KH_';
    try {
        const date = new Date(plannedStartDate);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `KH_${day}/${month}/${year}`;
    } catch {
        return 'KH_';
    }
};
const formatAmount = (amount) => {
    if (typeof amount !== 'number') return '---';
    return amount.toLocaleString() + ' VNĐ';
};

const DisbursementPlanContent = ({ plan, navigate }) => {
    const renderStageActivity = (stageActivity) => {
        if (!stageActivity) return <div className="text-gray-500">Chưa có thông tin hoạt động</div>;

        return (
            <div>
                <p className="font-medium">{stageActivity.description || 'Chưa có mô tả'}</p>
                <p className="text-sm text-gray-500">
                    {formatDate(stageActivity.activityDate)}
                </p>
                {typeof stageActivity.status !== 'undefined' && (
                    <span className={getStatusStyles(stageActivity.status, activityStatus, activityStatusColorMap).className}>
                        {getStatusStyles(stageActivity.status, activityStatus, activityStatusColorMap).label}
                    </span>
                )}
            </div>
        );
    };

    const renderDisbursementInfo = (stage) => {
        if (!stage.actualDisbursementDate) return '---';

        return (
            <div>
                <p>{formatDate(stage.actualDisbursementDate)}</p>
                {stage.actualDisbursementAmount && (
                    <p className="text-sm text-gray-500">
                        {formatAmount(stage.actualDisbursementAmount)}
                    </p>
                )}
                {stage.transferReceiptUrl && (
                    <a
                        href={stage.transferReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                    >
                        Xem biên lai giải ngân
                    </a>
                )}
            </div>
        );
    };

    const renderDisbursementRequest = (request) => {
        if (!request) return null;

        return (
            <div className="text-sm">
                <p><span className="font-medium">Ngày yêu cầu:</span> {formatDate(request.requestDate)}</p>
                <p><span className="font-medium">Ngân hàng:</span> {request.bankName || '---'}</p>
                <p><span className="font-medium">Tài khoản:</span> {request.bankAccountName || '---'}</p>
                <p><span className="font-medium">Số TK:</span> {request.bankAccountNumber || '---'}</p>
                {typeof request.requestStatus !== 'undefined' && (
                    <span className={getStatusStyles(request.requestStatus, disbursementRequestStatus, requestStatusColorMap).className}>
                        {getStatusStyles(request.requestStatus, disbursementRequestStatus, requestStatusColorMap).label}
                    </span>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate(`/disbursement-requests/${request.id}`)}
                >
                    <ExternalLink className="w-4 h-4" />
                </Button>
            </div>
        );
    };

    return (
        <div className="mb-8">
            <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                    <p className="text-sm text-teal-600 font-medium">Ngày bắt đầu</p>
                    <p className="text-lg font-semibold">
                        {formatDate(plan.plannedStartDate)}
                    </p>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                    <p className="text-sm text-teal-600 font-medium">Ngày kết thúc dự kiến</p>
                    <p className="text-lg font-semibold">
                        {formatDate(plan.plannedEndDate)}
                    </p>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                    <p className="text-sm text-teal-600 font-medium">Trạng thái</p>
                    <p className="text-lg font-semibold">
                        {plan.isCurrent ? 'Đang thực hiện' : 'Kế hoạch cũ'}
                    </p>
                </div>

                <div className="bg-teal-50 p-4 rounded-lg">
                    <p className="text-sm text-teal-600 font-medium">Tổng số tiền</p>
                    <p className="text-lg font-semibold">
                        {formatAmount(plan.totalPlannedAmount)}
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
                        {plan.simplifiedStages && Array.isArray(plan.simplifiedStages) &&
                            [...plan.simplifiedStages]
                                .sort((a, b) => (a?.stageNumber || 0) - (b?.stageNumber || 0))
                                .map((stage) => {
                                    if (!stage) return null;

                                    return (
                                        <TableRow key={stage.stageID || `stage-${stage.stageNumber}`}>
                                            <TableCell>Giai đoạn {stage.stageNumber || '---'}</TableCell>
                                            <TableCell>{formatAmount(stage.disbursementAmount)}</TableCell>
                                            <TableCell>{formatDate(stage.scheduledDate)}</TableCell>
                                            <TableCell>{renderStageActivity(stage.stageActivity)}</TableCell>
                                            <TableCell>{renderDisbursementInfo(stage)}</TableCell>
                                            <TableCell>{renderDisbursementRequest(stage.latestDisbursementRequest)}</TableCell>
                                            <TableCell>
                                                {typeof stage.status !== 'undefined' && (
                                                    <span className={getStatusStyles(stage.status, disbursementStageStatus, stageStatusColorMap).className}>
                                                        {getStatusStyles(stage.status, disbursementStageStatus, stageStatusColorMap).label}
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

const DisbursementPlanTabs = ({ disbursementPlans, navigate }) => {
    if (!disbursementPlans || !Array.isArray(disbursementPlans) || disbursementPlans.length === 0) {
        return <EmptyState message="Chưa có kế hoạch giải ngân" />;
    }

    const currentPlan = disbursementPlans.find(plan => plan.isCurrent);
    const oldPlans = disbursementPlans.filter(plan => !plan.isCurrent)
        .sort((a, b) => new Date(b.plannedStartDate) - new Date(a.plannedStartDate));

    const allPlans = [currentPlan, ...oldPlans].filter(Boolean);
    return (
        <Card className="shadow-lg border-0 mb-6">
            <CardHeader className="bg-teal-600 text-white">
                <CardTitle className="text-2xl font-semibold">Kế hoạch giải ngân</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <Tabs
                    defaultValue={currentPlan ? formatPlanName(currentPlan.plannedStartDate) : ''}
                    className="w-full"
                >

                    <TabsList className="flex max-w-[800px]  bg-transparent justify-start" style={{
                        gridTemplateColumns: `repeat(${allPlans.length}, minmax(0, 1fr))`
                    }}>
                        {allPlans.map((plan) => (
                            <TabsTrigger
                                key={plan.plannedStartDate}
                                value={formatPlanName(plan.plannedStartDate)}
                                className="relative px-4 py-2 rounded-none transition-colors duration-200
                                data-[state=active]:bg-transparent
                                data-[state=active]:text-teal-500
                                hover:text-teal-500
                                after:content-['']
                                after:absolute
                                after:bottom-0
                                after:left-0
                                after:w-full
                                after:h-0.5
                                after:bg-teal-500
                                after:scale-x-0
                                data-[state=active]:after:scale-x-100
                                after:transition-transform
                                after:duration-300
                                whitespace-nowrap"
                            >
                                {formatPlanName(plan.plannedStartDate)}
                                {plan.isCurrent && (
                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                                        Hiện tại
                                    </span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {allPlans.map((plan) => (
                        <TabsContent
                            key={plan.plannedStartDate}
                            value={formatPlanName(plan.plannedStartDate)}
                        >
                            <DisbursementPlanContent plan={plan} navigate={navigate} />
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
};



export default DisbursementPlanTabs;