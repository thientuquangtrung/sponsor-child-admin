import React, { useState } from 'react';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import {
    useGetDisbursementRequestByIdQuery,
    useUpdateDisbursementRequestMutation,
} from '@/redux/guarantee/disbursementRequestApi';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Calendar, CircleUser, CreditCard, Landmark, Undo2, User } from 'lucide-react';

export default function DisbursementRequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [reason, setReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const { data: disbursementRequest, isLoading, error } = useGetDisbursementRequestByIdQuery(id);

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
            navigate('/disbursement-requests');
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
                return 'Đã gửi yêu cầu';
            case 1:
                return 'Đã phê duyệt';
            case 2:
                return 'Đã từ chối';
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

            <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="py-4 text-4xl font-semibold text-center text-teal-600">
                    Thông tin chi tiết yêu cầu giải ngân đợt {disbursementRequest.disbursementStage.stageNumber}
                </h3>

                <div className="my-6 p-6 border rounded-lg shadow-sm bg-gray-50 space-y-4">
                    <p className="text-gray-700 font-semibold flex items-center">
                        <Landmark className="mr-2 h-5 w-5 text-teal-500" />
                        Ngân hàng: {disbursementRequest.bankName}
                    </p>
                    <p className="text-gray-700 font-semibold flex items-center">
                        <CreditCard className="mr-2 h-5 w-5 text-teal-500" />
                        Số tài khoản ngân hàng: {disbursementRequest.bankAccountNumber}
                    </p>
                    <p className="text-gray-700 font-semibold flex items-center">
                        <User className="mr-2 h-5 w-5 text-teal-500" />
                        Tên tài khoản ngân hàng: {disbursementRequest.bankAccountName}
                    </p>

                    <p className="text-gray-700 font-semibold flex items-center">
                        <Calendar className="mr-2 h-5 w-5 text-teal-500" />
                        Ngày yêu cầu: {new Date(disbursementRequest.requestDate).toLocaleDateString('vi-VN')}
                    </p>
                </div>

                <div className="my-4 border rounded-lg shadow-sm bg-gray-50">
                    <h3 className="text-2xl text-center bg-gradient-to-l from-rose-200 to-teal-100 py-4 font-semibold text-gray-800 rounded-tl-lg rounded-tr-lg">
                        Đợt giải ngân đang chờ phê duyệt
                    </h3>

                    <div className="p-4">
                        <h4 className="text-xl font-semibold text-gray-900">
                            Đợt {disbursementRequest.disbursementStage.stageNumber} - Ngày{' '}
                            {new Date(disbursementRequest.disbursementStage.scheduledDate).toLocaleDateString('vi-VN')}
                        </h4>
                        <p className="mt-2 text-gray-700 font-semibold">
                            Số tiền giải ngân:{' '}
                            {disbursementRequest.disbursementStage.disbursementAmount.toLocaleString('vi-VN')} VND
                        </p>
                        <p className="mt-2 text-gray-700 font-semibold">
                            Trạng thái:{' '}
                            <span
                                className={
                                    disbursementRequest.disbursementStage.status === 0
                                        ? 'text-yellow-500'
                                        : disbursementRequest.disbursementStage.status === 1
                                        ? 'text-teal-500'
                                        : disbursementRequest.disbursementStage.status === 2
                                        ? 'text-red-500'
                                        : 'text-gray-500'
                                }
                            >
                                {getStageStatus(disbursementRequest.disbursementStage.status)}
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/disbursement-requests`)}
                        className="text-teal-600 border-teal-600 hover:bg-normal hover:text-teal-600"
                    >
                        <Undo2 className="mr-2 h-4 w-4" />
                        Trở lại
                    </Button>

                    {disbursementRequest.requestStatus === 1 ? (
                        <div className="text-teal-600 font-semibold italic">Yêu cầu giải ngân đã được phê duyệt!</div>
                    ) : disbursementRequest.requestStatus === 2 ? (
                        <div className="text-red-500 font-semibold">Yêu cầu giải ngân đã bị từ chối!</div>
                    ) : (
                        <div className="flex space-x-4">
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
