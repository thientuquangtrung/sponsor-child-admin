import React, { useState } from 'react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import {
    useGetDisbursementRequestByIdQuery,
    useUpdateDisbursementRequestMutation,
} from '@/redux/guarantee/disbursementRequestApi';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import {
    Calendar,
    CalendarDays,
    CircleDollarSign,
    CircleUser,
    CreditCard,
    Landmark,
    PieChart,
    Pill,
    User,
} from 'lucide-react';
import DisbursementApproval from './DisbursementApproval';

export default function DisbursementRequestDetail() {
    const { id } = useParams();
    const [reason, setReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const { data: disbursementRequest, isLoading, error, refetch } = useGetDisbursementRequestByIdQuery(id);
    const [updateDisbursementRequest] = useUpdateDisbursementRequestMutation();

    if (isLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">Đã có lỗi khi tải dữ liệu</div>;
    }

    const handleAction = async (actionType) => {
        try {
            const approvalDate = new Date().toISOString();
            const requestStatus = actionType === 'approve' ? 1 : 2;
            await updateDisbursementRequest({
                id,
                body: {
                    requestStatus: requestStatus,
                    approvalDate: approvalDate,
                    rejectionReason: actionType === 'reject' ? reason : '',
                },
            }).unwrap();
            toast.success(actionType === 'approve' ? 'Yêu cầu đã được phê duyệt!' : 'Yêu cầu đã bị từ chối!');
            refetch();
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu cầu:', error);
            toast.error('Có lỗi xảy ra khi cập nhật yêu cầu.');
        }
    };

    const getPlanStatus = (status) => {
        switch (status) {
            case 0:
                return 'Đã lên lịch';
            case 1:
                return 'Đang xử lý';
            case 2:
                return 'Đã hoàn thành';
            case 3:
                return 'Thất bại';
            case 4:
                return 'Đã hủy';
            case 5:
                return 'Đã thay thế';
            default:
                return 'Không xác định';
        }
    };

    const getStageStatus = (status) => {
        switch (status) {
            case 0:
                return 'Đã lên lịch';
            case 1:
                return 'Đang xử lý';
            case 2:
                return 'Đã hoàn thành';
            case 3:
                return 'Thất bại';
            case 4:
                return 'Đã hủy';
            case 5:
                return 'Đã thay thế';
            default:
                return 'Không xác định';
        }
    };

    const getActivityStatus = (status) => {
        switch (status) {
            case 0:
                return 'Đã gửi yêu cầu';
            case 1:
                return 'Đang tiến hành';
            case 2:
                return 'Đã hoàn thành';
            case 3:
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-4xl py-4 font-bold text-center bg-gradient-to-l from-teal-500 to-rose-400 text-transparent bg-clip-text">
                    Kế hoạch giải ngân cho dự án {disbursementRequest.campaign.title}
                </h2>
                <h3 className="flex items-center justify-end">
                    <CircleUser name="icon-name" className="mr-2" />
                    Nhà Bảo Lãnh:{' '}
                    <span className="text-teal-500 ml-2 font-semibold">
                        {disbursementRequest.campaign.guaranteeName}
                    </span>
                </h3>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h3 className="py-6 text-3xl font-semibold text-center">Lịch trình dự kiến các đợt giải ngân</h3>
                <div className="relative mt-4">
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-gray-300"></div>

                    {disbursementRequest.campaign.disbursementPlans[0].stages
                        ?.slice()
                        .sort((a, b) => a.stageNumber - b.stageNumber)
                        .map((stage, index) => (
                            <div
                                key={stage.stageNumber}
                                className={`flex justify-between items-center w-full mb-8 ${
                                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                                }`}
                            >
                                <div className="w-5/12">
                                    <div className="bg-white p-6 rounded shadow-lg">
                                        <h3 className="text-lg font-semibold text-black">
                                            Đợt giải ngân {stage.stageNumber} - Ngày{' '}
                                            {new Date(stage.scheduledDate).toLocaleDateString('vi-VN')}
                                        </h3>
                                        <p className="mt-2 text-gray-600 font-semibold">
                                            Số tiền giải ngân:
                                            <span className="mt-2 ml-2 text-md font-bold text-rose-400">
                                                {stage.disbursementAmount.toLocaleString('vi-VN')} VND
                                            </span>
                                        </p>

                                        <p className="mt-2 text-black">
                                            Trạng thái:{' '}
                                            <span
                                                className={`font-semibold ${
                                                    stage.status === 0
                                                        ? 'text-yellow-500'
                                                        : stage.status === 1
                                                        ? 'text-blue-500'
                                                        : stage.status === 2
                                                        ? 'text-green-600'
                                                        : stage.status === 3
                                                        ? 'text-red-500'
                                                        : stage.status === 4
                                                        ? 'text-gray-500'
                                                        : stage.status === 5
                                                        ? 'text-purple-500'
                                                        : 'text-black'
                                                }`}
                                            >
                                                {getPlanStatus(stage.status)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute w-8 h-8 bg-yellow-500 rounded-full left-1/2 transform -translate-x-1/2"></div>
                                </div>
                                <div className="w-5/12"></div>
                            </div>
                        ))}
                </div>
            </div>

            <div>
                <div className="my-10 border rounded-lg shadow-sm bg-gray-50">
                    {disbursementRequest.requestStatus === 1 ? (
                        <h3 className="text-2xl text-center bg-gradient-to-l from-rose-200 to-teal-100 py-4 font-semibold text-gray-800 rounded-tl-lg rounded-tr-lg">
                            Đợt giải ngân đã được phê duyệt
                        </h3>
                    ) : disbursementRequest.requestStatus === 2 ? (
                        <h3 className="text-2xl text-center bg-gradient-to-l from-rose-200 to-teal-100 py-4 font-semibold text-gray-800 rounded-tl-lg rounded-tr-lg">
                            Đợt giải ngân đã bị từ chối
                        </h3>
                    ) : (
                        <h3 className="text-2xl text-center bg-gradient-to-l from-rose-200 to-teal-100 py-4 font-semibold text-gray-800 rounded-tl-lg rounded-tr-lg">
                            Đợt giải ngân đang chờ phê duyệt
                        </h3>
                    )}

                    <div className="grid grid-cols-2 gap-8 p-4 bg-white rounded-lg shadow-lg">
                        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                            <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                                Đợt {disbursementRequest.disbursementStage.stageNumber} - Ngày{' '}
                                {new Date(disbursementRequest.disbursementStage.scheduledDate).toLocaleDateString(
                                    'vi-VN',
                                )}
                            </h4>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <p className="text-gray-700 font-medium flex items-center w-1/2">
                                        <Landmark className="mr-2 h-5 w-5 text-teal-500" />
                                        Ngân hàng:
                                    </p>
                                    <p className="text-teal-500 font-medium w-1/2">{disbursementRequest.bankName}</p>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-gray-700 font-medium flex items-center w-1/2">
                                        <CreditCard className="mr-2 h-5 w-5 text-teal-500" />
                                        Số tài khoản ngân hàng:
                                    </p>
                                    <p className="text-teal-500 font-medium w-1/2">
                                        {disbursementRequest.bankAccountNumber}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-gray-700 font-medium flex items-center w-1/2">
                                        <User className="mr-2 h-5 w-5 text-teal-500" />
                                        Tên tài khoản ngân hàng:
                                    </p>
                                    <p className="text-teal-500 font-medium w-1/2">
                                        {disbursementRequest.bankAccountName}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-gray-700 font-medium flex items-center w-1/2">
                                        <Calendar className="mr-2 h-5 w-5 text-teal-500" />
                                        Ngày yêu cầu:
                                    </p>
                                    <p className="text-teal-500 font-medium w-1/2">
                                        {new Date(disbursementRequest.requestDate).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-gray-700 font-medium flex items-center w-1/2">
                                        <CircleDollarSign className="mr-2 h-5 w-5 text-teal-500" />
                                        Số tiền giải ngân:
                                    </p>
                                    <p className="text-teal-500 font-medium w-1/2">
                                        {disbursementRequest.disbursementStage.disbursementAmount.toLocaleString(
                                            'vi-VN',
                                        )}{' '}
                                        VND
                                    </p>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-gray-700 font-medium flex items-center w-1/2">
                                        <PieChart className="mr-2 h-5 w-5 text-teal-500" />
                                        Trạng thái:
                                    </p>
                                    <p className="w-1/2 font-medium">
                                        <span
                                            className={
                                                disbursementRequest.disbursementStage.status === 0
                                                    ? 'text-yellow-500'
                                                    : disbursementRequest.disbursementStage.status === 1
                                                    ? 'text-blue-500'
                                                    : disbursementRequest.disbursementStage.status === 2
                                                    ? 'text-green-600'
                                                    : disbursementRequest.disbursementStage.status === 3
                                                    ? 'text-red-500'
                                                    : disbursementRequest.disbursementStage.status === 4
                                                    ? 'text-gray-500'
                                                    : disbursementRequest.disbursementStage.status === 5
                                                    ? 'text-purple-500'
                                                    : 'text-black'
                                            }
                                        >
                                            {getStageStatus(disbursementRequest.disbursementStage.status)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                            <h4 className="text-2xl text-center font-semibold text-gray-900 mb-4">
                                Hoạt động cho đợt {disbursementRequest.disbursementStage.stageNumber}
                            </h4>
                            <div>
                                {disbursementRequest.activities.map((activity, index) => (
                                    <div
                                        key={index}
                                        className="p-4 space-y-4 bg-white rounded-lg shadow border border-gray-200"
                                    >
                                        <div className="flex items-center mb-2">
                                            <p className="text-gray-700 font-medium flex items-center w-1/2">
                                                <Pill className="mr-2 h-5 w-5 text-teal-500" /> Mục đích sử dụng:
                                            </p>
                                            <p className="text-teal-500 font-medium w-1/2">{activity.description}</p>
                                        </div>
                                        <div className="flex items-center mb-2">
                                            <p className="text-gray-700 font-medium flex items-center w-1/2">
                                                <CalendarDays className="mr-2 h-5 w-5 text-teal-500" /> Ngày hoạt động:
                                            </p>
                                            <p className="text-teal-500 font-medium w-1/2">
                                                {new Date(activity.activityDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="flex items-center font-medium">
                                            <p className="text-gray-700  flex items-center w-1/2">
                                                <PieChart className="mr-2 h-5 w-5 text-teal-500" /> Trạng thái:
                                            </p>
                                            <p
                                                className={
                                                    activity.status === 0
                                                        ? 'text-yellow-500'
                                                        : activity.status === 1
                                                        ? 'text-blue-500'
                                                        : activity.status === 2
                                                        ? 'text-teal-500'
                                                        : activity.status === 3
                                                        ? 'text-red-500'
                                                        : 'text-gray-500'
                                                }
                                            >
                                                {getActivityStatus(activity.status)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    {disbursementRequest.requestStatus === 1 ? (
                        disbursementRequest.disbursementStage.transferReceiptUrl ? (
                            <div className="my-4 border rounded-lg shadow-sm bg-gray-50">
                                <h4 className="text-2xl text-center bg-gradient-to-l from-rose-200 to-teal-100 py-4 font-semibold text-gray-800 rounded-tl-lg rounded-tr-lg">
                                    Minh chứng giải ngân
                                </h4>
                                <div className="p-4 space-y-4  text-center">
                                    <div className="flex flex-row items-center justify-center">
                                        <p className="text-gray-700 font-medium flex items-center">
                                            <CircleDollarSign className="mr-2 h-5 w-5 text-teal-500" />
                                            Số tiền đã giải ngân:
                                        </p>
                                        <p className="text-teal-500 font-medium ml-4">
                                            {disbursementRequest.disbursementStage.actualDisbursementAmount.toLocaleString(
                                                'vi-VN',
                                            )}{' '}
                                            VND
                                        </p>
                                    </div>

                                    <div className='text-md'>
                                        Xem minh chứng giải ngân
                                        <a
                                            href={disbursementRequest.disbursementStage.transferReceiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 underline ml-2"
                                        >tại đây</a>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <DisbursementApproval disbursementRequest={disbursementRequest} />
                        )
                    ) : disbursementRequest.requestStatus === 2 ? (
                        <div className="text-red-500 font-semibold">Yêu cầu giải ngân đã bị từ chối!</div>
                    ) : (
                        <div className="flex space-x-4 justify-end">
                            <Button
                                variant="danger"
                                onClick={() => setIsRejectDialogOpen(true)}
                                className="bg-red-500 text-white hover:bg-red-600"
                            >
                                Từ chối
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => setIsApproveDialogOpen(true)}
                                className="bg-teal-500 text-white hover:bg-teal-600"
                            >
                                Đồng ý giải ngân
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lý do từ chối yêu cầu giải ngân</DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <div>
                        <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Nhập lý do từ chối..."
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectDialogOpen(false)}
                            className="hover:bg-gray-100"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={async () => {
                                setIsRejectDialogOpen(false);
                                await handleAction('reject');
                            }}
                        >
                            Từ chối yêu cầu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận giải ngân</DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <div className="text-gray-600">
                        Bạn chắc chắn muốn phê duyệt yêu cầu giải ngân này? Hành động này không thể hoàn tác.
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsApproveDialogOpen(false)}
                            className="hover:bg-gray-100"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="success"
                            onClick={async () => {
                                setIsApproveDialogOpen(false);
                                await handleAction('approve');
                            }}
                            className="bg-teal-500 text-white hover:bg-teal-600"
                        >
                            Đồng ý
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
