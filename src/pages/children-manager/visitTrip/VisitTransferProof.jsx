import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Landmark, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { bankName, visitRegistrationStatus } from '@/config/combobox';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useGetVisitTripRegistrationByIdQuery } from '@/redux/visitTripRegistration/visitTripRegistrationApi';

const VisitTransferProof = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: registrationData, isLoading } = useGetVisitTripRegistrationByIdQuery(id);
    if (isLoading) return <div><LoadingScreen /></div>;
    if (!registrationData) return null;
    const bankInfo = bankName.find(bank => bank.value === registrationData.bankName);

    return (
        <div className="rounded-lg p-6 flex flex-col items-center max-w-7xl min-h-screen mx-auto">
            <div className="text-teal-600 font-semibold italic mb-4">
                Chi tiết minh chứng hoàn tiền
            </div>

            <div className="grid md:grid-cols-2 gap-6 w-full">
                <div className="p-6 bg-teal-50 rounded-lg border border-teal-100">
                    <div className='ml-4'>
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-semibold text-teal-700">Thông tin chuyến thăm</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-[180px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Tiêu đề:</span>
                                <span className="text-gray-700 pl-2">{registrationData.visit.title}</span>
                            </div>
                            <div className="grid grid-cols-[180px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Trạng thái đăng ký:</span>
                                <span className="text-gray-700 pl-2">
                                    {visitRegistrationStatus.find(status => status.value === registrationData.status)?.label}
                                </span>
                            </div>
                            <div className="grid grid-cols-[180px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Lý do hủy:</span>
                                <span className="text-gray-700 pl-2">{registrationData.cancellationReason}</span>
                            </div>
                            <div className="grid grid-cols-[180px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Số tiền hoàn chuyến thăm:</span>
                                <span className="text-gray-700 pl-2">
                                    {registrationData.refundAmount.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-teal-50 rounded-lg border border-teal-100">
                    <div className='ml-4'>
                        <div className="flex items-center gap-2 mb-4">
                            <Landmark className="w-5 h-5 text-teal-500" />
                            <h2 className="text-lg font-semibold text-teal-700">Thông tin chuyển khoản</h2>
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-[140px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Tên tài khoản:</span>
                                <span className="text-gray-700 pl-2">{registrationData.bankAccountName}</span>
                            </div>
                            <div className="grid grid-cols-[140px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Số tài khoản:</span>
                                <span className="text-gray-700 pl-2">{registrationData.bankAccountNumber}</span>
                            </div>
                            <div className="grid grid-cols-[140px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Ngân hàng:</span>
                                <span className="text-gray-700 pl-2">{bankInfo?.label}</span>
                            </div>
                            <div className="grid grid-cols-[140px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Tên người dùng:</span>
                                <span className="text-gray-700 pl-2">{registrationData.user.fullname}</span>
                            </div>
                            <div className="grid grid-cols-[140px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">SĐT:</span>
                                <span className="text-gray-700 pl-2">{registrationData.user.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full mt-6 p-4 bg-teal-100 rounded-lg text-center">
                <h3 className="text-xl font-bold text-teal-800">
                    Tổng số tiền hoàn: {registrationData.refundAmount.toLocaleString('vi-VN')} VNĐ
                </h3>
            </div>

            <div className="w-full mt-6">
                <h3 className="text-lg font-semibold text-teal-700 mb-4 text-center">Minh chứng chuyển khoản</h3>
                <div className="flex justify-center">
                    <img
                        src={registrationData.transferProofImageUrl}
                        alt="Minh chứng chuyển khoản"
                        className="max-w-full max-h-[500px] rounded-lg shadow-lg object-contain"
                    />
                </div>
            </div>

            <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mt-6 text-teal-600 border-teal-600 hover:bg-normal hover:text-teal-600"
            >
                <Undo2 className="mr-2 h-4 w-4" />
                Trở lại
            </Button>
        </div>
    );
};

export default VisitTransferProof;