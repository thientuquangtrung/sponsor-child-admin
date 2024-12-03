import React, { useState } from 'react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import {
    useGetDisbursementRequestByIdQuery,
    useUpdateDisbursementRequestMutation,
} from '@/redux/guarantee/disbursementRequestApi';
import { useGetCommonFundsQuery } from '@/redux/fund/fundApi';
import { Badge } from '@/components/ui/badge';
import LoadingScreen from '@/components/common/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import {
    AlertCircle,
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
import DisbursementApproval from '@/pages/admin/disbursement/DisbursementApproval';
import { disbursementStageStatus, disbursementRequestStatus, activityStatus } from '@/config/combobox';
import DisbursementReport from '@/pages/admin/disbursement/DisbursementReport';
import { useSelector } from 'react-redux';
import { useGetDisbursementStageByIdQuery } from '@/redux/guarantee/disbursementStageApi';

export default function DisbursementRequestDetail() {
    const { id } = useParams();
    const [reason, setReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
    const [isEditRequestDialogOpen, setIsEditRequestDialogOpen] = useState(false);
    const [isCommonFundDialogOpen, setIsCommonFundDialogOpen] = useState(false);
    const [isReasonEmpty, setIsReasonEmpty] = useState(false);
    const { data: disbursementRequest, isLoading: isRequestLoading, error, refetch } = useGetDisbursementRequestByIdQuery(id);
    const { data: commonFund, isLoading: isFundLoading } = useGetCommonFundsQuery();
    const {
        data: disbursementStage,
        isLoading: isStageLoading
    } = useGetDisbursementStageByIdQuery(
        disbursementRequest?.disbursementStage?.stageID || '',
        {
            skip: !disbursementRequest?.disbursementStage?.stageID
        }
    );
    const [updateDisbursementRequest] = useUpdateDisbursementRequestMutation();
    const { user } = useSelector((state) => state.auth);

    if (isRequestLoading || isStageLoading || isFundLoading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <div className="text-center py-4 text-red-500">Đã có lỗi khi tải dữ liệu</div>;
    }

    const handleAction = async (actionType, isCommonFundApproved = false) => {
        if (actionType === 'reject' || actionType === 'edit') {
            if (!reason.trim()) {
                setIsReasonEmpty(true);
                return;
            }
        }

        try {
            let requestStatus;
            switch (actionType) {
                case 'approve':
                    requestStatus = 1;
                    break;
                case 'reject':
                    requestStatus = 2;
                    break;
                case 'edit':
                    requestStatus = 3;
                    break;
                case 'approveWithoutCommonFund':
                    requestStatus = 1;
                    break;
                default:
                    requestStatus = 0;
            }
            const updateBody = {
                id,
                body: {
                    requestStatus: requestStatus,
                    userID: user.userID,
                    rejectionReason: actionType !== 'approve' && actionType !== 'approveWithoutCommonFund' ? reason : '',
                }
            };

            if (isCommonFundApproved) {
                updateBody.body.isCommonFundApproved = true;
            }

            await updateDisbursementRequest(updateBody).unwrap();

            let successMessage;
            switch (actionType) {
                case 'approve':
                case 'approveWithoutCommonFund':
                    successMessage = isCommonFundApproved
                        ? 'Yêu cầu đã được phê duyệt!'
                        : 'Yêu cầu đã được phê duyệt!';
                    break;
                case 'reject':
                    successMessage = 'Yêu cầu đã bị từ chối!';
                    break;
                case 'edit':
                    successMessage = 'Đã gửi yêu cầu chỉnh sửa!';
                    break;
                default:
                    successMessage = 'Cập nhật thành công!';
            }

            toast.success(successMessage);
            refetch();
            setReason('');
            setIsReasonEmpty(false);
        } catch (error) {
            console.error('Lỗi khi cập nhật yêu cầu:', error);
            toast.error('Có lỗi xảy ra khi cập nhật yêu cầu.');
        }
    };
    const getStatusLabel = (status, options) => {
        const option = options.find(o => o.value === status);
        return option ? option.label : 'Không xác định';
    };

    const getStatusColorClass = (status, type) => {
        switch (type) {
            case 'stage':
                switch (status) {
                    case 0: return 'text-yellow-600';
                    case 1: return 'text-blue-600';
                    case 2: return 'text-green-600';
                    case 3: return 'text-red-600';
                    case 4: return 'text-gray-600';
                    case 5: return 'text-purple-600';
                    default: return 'text-gray-600';
                }
            case 'request':
                switch (status) {
                    case 0: return 'text-yellow-600';
                    case 1: return 'text-green-600';
                    case 2: return 'text-red-600';
                    case 3: return 'text-orange-600';
                    case 4: return 'text-blue-600';
                    case 5: return 'text-teal-600';
                    default: return 'text-gray-600';
                }
            case 'activity':
                switch (status) {
                    case 0: return 'text-yellow-600';
                    case 1: return 'text-blue-600';
                    case 2: return 'text-green-600';
                    case 3: return 'text-red-600';
                    default: return 'text-gray-600';
                }
            default:
                return 'text-gray-600';
        }
    };
    const commonFundAmount = commonFund?.totalAmount || 0;
    const needsCommonFund = disbursementStage?.expectedDisbursementAmount > disbursementStage?.remainingAmount;
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-4xl py-4 font-bold text-center bg-gradient-to-l from-teal-500 to-rose-400 text-transparent bg-clip-text">
                    Kế hoạch giải ngân cho dự án {disbursementRequest.campaigns.title}
                </h2>
                <h3 className="flex items-center justify-end">
                    <CircleUser className="mr-2" />
                    Nhà Bảo Lãnh:{' '}
                    <span className="text-teal-500 ml-2 font-semibold">{disbursementRequest.guarantee?.fullname}</span>
                </h3>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
                <h3 className="py-6 text-3xl font-semibold text-center">Lịch trình dự kiến các đợt giải ngân</h3>
                <div className="relative mt-4">
                    <div className="absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-gray-300"></div>

                    {disbursementRequest.disbursementPlan.disbursementStages
                        .slice()
                        .sort((a, b) => a.stageNumber - b.stageNumber)
                        .map((stage, index) => (
                            <div
                                key={stage.stageID}
                                className={`flex justify-between items-center w-full mb-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
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
                                            <span className={`font-semibold ${getStatusColorClass(stage.status, 'stage')}`}>
                                                {getStatusLabel(stage.status, disbursementStageStatus)}
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
            {disbursementStage?.undisbursedStagesInfo && disbursementStage.undisbursedStagesInfo.length > 0 && (
                <div className="space-y-4 flex flex-col border rounded-lg shadow-lg">
                    <div className="flex space-x-2 justify-center items-center bg-gradient-to-r from-rose-100 to-gray-100 p-2 rounded-t-lg">
                        <h4 className="text-xl font-semibold text-gray-700">Thông tin các đợt giải ngân</h4>
                    </div>
                    <div className="space-y-6 p-6 rounded-b-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Đợt</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Số tiền giải ngân</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày dự kiến</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Số tiền đã giải ngân</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Số tiền chưa giải ngân</th>
                                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {disbursementStage.undisbursedStagesInfo.map((stage) => (
                                        <tr key={stage.stageID} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center">
                                                    <Badge className="w-6 h-6 p-2 text-white bg-teal-500 rounded-full shadow-inner">
                                                        {stage.stageNumber}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {stage.disbursementAmount?.toLocaleString('vi-VN')} VNĐ
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                <div className="flex items-center">
                                                    <Calendar className="mr-2 h-4 w-4 text-teal-400" />
                                                    {new Date(stage.scheduledDate).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {stage.actualDisbursementAmount
                                                    ? `${stage.actualDisbursementAmount.toLocaleString('vi-VN')} VNĐ`
                                                    : 'Chưa giải ngân'}
                                            </td>

                                            <td className="px-4 py-3 text-sm font-medium text-teal-600">
                                                {stage.totalUndisbursedAmount?.toLocaleString('vi-VN')} VNĐ
                                            </td>

                                            <td className="px-4 py-3">
                                                <span className={`text-sm font-medium ${getStatusColorClass(stage.status, 'stage')}`}>
                                                    {getStatusLabel(stage.status, disbursementStageStatus)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}


            <div>
                <div className="my-10 border rounded-lg shadow-sm bg-gray-50">
                    <h3 className="text-2xl text-center bg-gradient-to-l from-rose-200 to-teal-100 py-4 font-semibold text-gray-800 rounded-tl-lg rounded-tr-lg">
                        {disbursementRequest.isEarlyRequest
                            ? `${getStatusLabel(disbursementRequest.requestStatus, disbursementRequestStatus)} (Giải ngân sớm)`
                            : getStatusLabel(disbursementRequest.requestStatus, disbursementRequestStatus)
                        }
                    </h3>

                    {disbursementRequest.isEarlyRequest && (
                        <div className="flex items-center gap-2 bg-yellow-50 p-4 border-b">
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                            <p className="text-sm text-yellow-700">
                                Đây là yêu cầu giải ngân sớm hơn so với ngày dự kiến
                            </p>
                        </div>
                    )}


                    <div className="grid grid-cols-2 gap-8 p-4 bg-white rounded-lg shadow-lg">
                        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                            <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                                Đợt {disbursementRequest.disbursementStage.stageNumber} - Ngày{' '}
                                {new Date(disbursementRequest.disbursementStage.scheduledDate).toLocaleDateString('vi-VN')}
                            </h4>
                            <div className="space-y-4">

                                <div className="flex flex-col gap-4">


                                    <div className="flex items-center">
                                        <div className="flex items-center w-1/2">
                                            <Calendar className="mr-2 h-5 w-5 text-teal-500" />
                                            <p className="text-gray-700 font-medium">Ngày yêu cầu:</p>
                                        </div>
                                        <p className="text-teal-500 font-medium w-1/2">
                                            {new Date(disbursementRequest.requestDate).toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center w-1/2">
                                            <CircleDollarSign className="mr-2 h-5 w-5 text-teal-500" />
                                            <p className="text-gray-700 font-medium">
                                                Số tiền chưa được giải ngân:
                                            </p>
                                        </div>
                                        <p className="text-teal-500 font-medium w-1/2">
                                            {disbursementStage.totalUndisbursedAmount
                                                ? `${disbursementStage.totalUndisbursedAmount.toLocaleString('vi-VN')} VNĐ`
                                                : 'Không có'}                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center w-1/2">
                                            <CircleDollarSign className="mr-2 h-5 w-5 text-teal-500" />
                                            <p className="text-gray-700 font-medium">
                                                Số tiền giải ngân đợt {disbursementRequest?.disbursementStage?.stageNumber}:
                                            </p>
                                        </div>
                                        <p className="text-teal-500 font-medium w-1/2">
                                            {disbursementRequest?.disbursementStage?.disbursementAmount?.toLocaleString('vi-VN')} VNĐ
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center w-1/2">
                                            <CircleDollarSign className="mr-2 h-5 w-5 text-teal-500" />
                                            <p className="text-gray-700 font-medium">
                                                Số tiền giải ngân mong đợi:
                                            </p>
                                        </div>
                                        <p className="text-teal-500 font-medium w-1/2">
                                            {disbursementStage?.expectedDisbursementAmount?.toLocaleString('vi-VN')} VNĐ
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center w-1/2">
                                            <CircleDollarSign className="mr-2 h-5 w-5 text-teal-500" />
                                            <p className="text-gray-700 font-medium">
                                                Số tiền còn lại của chiến dịch:
                                            </p>
                                        </div>
                                        <p className="text-teal-500 font-medium w-1/2">
                                            {disbursementStage?.remainingAmount?.toLocaleString('vi-VN')} VNĐ
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="flex items-center w-1/2">
                                            <CircleDollarSign className="mr-2 h-5 w-5 text-orange-500" />
                                            <p className="text-orange-700 font-medium">
                                                Số tiền thực tế có thể giải ngân:
                                            </p>
                                        </div>
                                        <p className="text-orange-500 font-medium w-1/2">
                                            {disbursementRequest?.disbursementStage?.actualDisbursementAmount?.toLocaleString('vi-VN')} VNĐ
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <p className="text-gray-700 font-medium flex items-center w-1/2">
                                        <PieChart className="mr-2 h-5 w-5 text-teal-500" />
                                        Trạng thái:
                                    </p>
                                    <p className={`w-1/2 font-medium ${getStatusColorClass(disbursementRequest.requestStatus, 'request')}`}>
                                        {getStatusLabel(disbursementRequest.requestStatus, disbursementRequestStatus)}
                                    </p>
                                </div>

                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
                            <h4 className="text-2xl text-center font-semibold text-gray-900 mb-4">
                                Hoạt động cho đợt {disbursementRequest.disbursementStage.stageNumber}
                            </h4>
                            <div>
                                {disbursementRequest.disbursementStage.stageActivity ? (
                                    <div className="p-4 space-y-4 bg-white rounded-lg shadow border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <p className="text-gray-700 font-medium flex items-center w-1/2">
                                                <Pill className="mr-2 h-5 w-5 text-teal-500" /> Mục đích sử dụng:
                                            </p>
                                            <p className="text-teal-500 font-medium w-1/2">
                                                {disbursementRequest.disbursementStage.stageActivity.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center mb-2">
                                            <p className="text-gray-700 font-medium flex items-center w-1/2">
                                                <CalendarDays className="mr-2 h-5 w-5 text-teal-500" /> Ngày hoạt động dự kiến:
                                            </p>
                                            <p className="text-teal-500 font-medium w-1/2">
                                                {new Date(disbursementRequest.disbursementStage.stageActivity.activityDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                        <div className="flex items-center font-medium">
                                            <p className="text-gray-700 flex items-center w-1/2">
                                                <PieChart className="mr-2 h-5 w-5 text-teal-500" /> Trạng thái:
                                            </p>
                                            <p className={`w-1/2 ${getStatusColorClass(disbursementRequest.disbursementStage.stageActivity.status, 'activity')}`}>
                                                {getStatusLabel(disbursementRequest.disbursementStage.stageActivity.status, activityStatus)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        Không có hoạt động nào được định nghĩa cho đợt này.
                                    </div>
                                )}
                                <div className="p-4 space-y-4 mt-4 bg-white rounded-lg shadow border border-gray-200">
                                    <div className="flex items-center">
                                        <div className="flex items-center w-1/2">
                                            <CreditCard className="mr-2 h-5 w-5 text-teal-500" />
                                            <p className="text-gray-700 font-medium">Số tài khoản ngân hàng:</p>
                                        </div>
                                        <p className="text-teal-500 font-medium w-1/2">
                                            {disbursementRequest.bankAccountNumber}
                                        </p>
                                    </div>

                                    <div className="flex items-center">
                                        <div className="flex items-center w-1/2">
                                            <User className="mr-2 h-5 w-5 text-teal-500" />
                                            <p className="text-gray-700 font-medium">Tên tài khoản ngân hàng:</p>
                                        </div>
                                        <p className="text-teal-500 font-medium w-1/2">
                                            {disbursementRequest.bankAccountName}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <p className="text-gray-700 font-medium flex items-center w-1/2">
                                            <Landmark className="mr-2 h-5 w-5 text-teal-500" />
                                            Ngân hàng:
                                        </p>
                                        <p className="text-teal-500 font-medium w-1/2">{disbursementRequest.bankName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    disbursementRequest && (
                        <DisbursementReport
                            disbursementReports={disbursementRequest.disbursementReports}
                        />
                    )
                }
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
                            <DisbursementApproval
                                disbursementRequest={disbursementRequest}
                                parentRefetch={refetch} />
                        )
                    ) : disbursementRequest.requestStatus === 2 ? (
                        <div className="text-red-500 font-semibold">Yêu cầu giải ngân đã bị từ chối!</div>
                    ) : disbursementRequest.requestStatus !== 3 && disbursementRequest.requestStatus !== 4 && disbursementRequest.requestStatus !== 5 ? (
                        <div className="flex space-x-4 justify-end pt-5">
                            <Button
                                variant="success"
                                onClick={() => {
                                    if (needsCommonFund) {
                                        setIsCommonFundDialogOpen(true);
                                    } else {
                                        setIsApproveDialogOpen(true);
                                    }
                                }}
                                className="bg-green-500 text-white hover:bg-green-600"
                            >
                                Đồng ý giải ngân
                            </Button>

                            <Button
                                variant="warning"
                                onClick={() => setIsEditRequestDialogOpen(true)}
                                className="bg-yellow-300 text-gray-600 hover:bg-yellow-600"
                            >
                                Yêu cầu chỉnh sửa
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => setIsRejectDialogOpen(true)}
                                className="bg-red-500 text-white hover:bg-red-600"
                            >
                                Từ chối
                            </Button>
                        </div>
                    ) : null}

                </div>
            </div >


            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Lý do từ chối yêu cầu giải ngân</DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <div>
                        <Textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setIsReasonEmpty(false);
                            }}
                            className="w-full p-2 border rounded"
                            placeholder="Nhập lý do từ chối..."
                        />
                        {isReasonEmpty && (
                            <div className="text-red-500 mt-2">Vui lòng nhập lý do từ chối.</div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsRejectDialogOpen(false);
                                setIsReasonEmpty(false);
                            }}
                            className="hover:bg-gray-100"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!reason.trim()) {
                                    setIsReasonEmpty(true);
                                    return;
                                }
                                setIsRejectDialogOpen(false);
                                await handleAction('reject');
                            }}
                            className="bg-red-500 text-white hover:bg-red-600"
                        >
                            Từ chối yêu cầu
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isCommonFundDialogOpen} onOpenChange={setIsCommonFundDialogOpen}>
                <DialogContent className="sm:max-w-[600px] p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="text-2xl font-bold text-gray-800">Xác nhận sử dụng quỹ chung</DialogTitle>
                        <DialogClose />
                    </DialogHeader>

                    <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 text-base">
                            Hiện tại số tiền còn lại trong chiến dịch này nhỏ hơn số tiền mong đợi giải ngân.
                        </p>

                        <div className="space-y-3 bg-white p-4 rounded-md shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Số tiền còn lại trong chiến dịch:</span>
                                <span className="font-semibold text-teal-600 text-lg">
                                    {disbursementStage?.remainingAmount.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Số tiền giải ngân mong đợi:</span>
                                <span className="font-semibold text-rose-600 text-lg">
                                    {disbursementStage?.expectedDisbursementAmount.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Số tiền trong quỹ chung:</span>
                                <span className="font-semibold text-blue-600 text-lg">
                                    {commonFundAmount.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-700 text-base">
                            Bạn có muốn trích tiền từ quỹ chung để bù đắp cho số tiền còn thiếu không?
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCommonFundDialogOpen(false)}
                            className="hover:bg-gray-100 border-2 border-gray-300 rounded-lg"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={async () => {
                                setIsCommonFundDialogOpen(false);
                                await handleAction('approveWithoutCommonFund');
                            }}
                            className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                            Giải ngân không dùng quỹ chung
                        </Button>
                        <Button
                            variant="success"
                            onClick={async () => {
                                setIsCommonFundDialogOpen(false);
                                await handleAction('approve', true);
                            }}
                            className="bg-teal-500 text-white hover:bg-teal-600"
                            disabled={commonFundAmount < (needsCommonFund)}
                        >
                            Đồng ý sử dụng quỹ chung
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isEditRequestDialogOpen} onOpenChange={setIsEditRequestDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yêu cầu chỉnh sửa</DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <div>
                        <Textarea
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                setIsReasonEmpty(false);
                            }}
                            className="w-full p-2 border rounded"
                            placeholder="Nhập nội dung cần chỉnh sửa..."
                        />
                        {isReasonEmpty && (
                            <div className="text-red-500 mt-2">Vui lòng nhập nội dung yêu cầu chỉnh sửa.</div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditRequestDialogOpen(false);
                                setIsReasonEmpty(false);
                            }}
                            className="hover:bg-gray-100"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={async () => {
                                if (!reason.trim()) {
                                    setIsReasonEmpty(true);
                                    return;
                                }
                                setIsEditRequestDialogOpen(false);
                                await handleAction('edit');
                            }}
                            className="bg-orange-500 text-white hover:bg-orange-600"
                        >
                            Gửi yêu cầu chỉnh sửa
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
        </div >
    );
}