
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetGuaranteeProfileQuery, useUpdateGuaranteeStatusMutation } from '@/redux/guarantee/guaranteeApi';
import { guaranteeTypes, organizationTypes, bankName } from '@/config/combobox';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';

const GuaranteeRequestsDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const { data: requestData, isLoading, error } = useGetGuaranteeProfileQuery(id);
    const [updateStatus] = useUpdateGuaranteeStatusMutation();
    const breadcrumbs = [
        { name: 'Trung tâm Quản trị', path: '/center' },
        { name: 'Đơn đăng ký bảo lãnh', path: '/center/guarantee-requests' },
        { name: 'Chi tiết yêu cầu bảo lãnh', path: null },
    ];

    const handleAccept = async () => {
        try {
            await updateStatus({ userId: id, status: 1 });
            toast.success('Chấp nhận yêu cầu thành công');
            navigate('/center/guarantee-requests');
        } catch (error) {
            console.error('Error accepting guarantee:', error);
        }
    };

    const handleReject = () => {
        setIsRejectDialogOpen(true);
    };

    const handleRejectConfirm = async () => {
        if (rejectReason.trim() === '') {
            toast.error('Vui lòng nhập lý do từ chối.');
            return;
        }
        try {
            await updateStatus({ userId: id, status: 3, rejectionReason: rejectReason });
            setIsRejectDialogOpen(false);
            setRejectReason('');
            toast.success('Từ chối yêu cầu thành công');
            navigate('/center/guarantee-requests');
        } catch (error) {
            console.error('Error rejecting guarantee:', error);
        }
    };

    if (isLoading) return <LoadingScreen />;
    if (error) return <div>Đã xảy ra lỗi: {error.message}</div>;
    if (!requestData) return null;

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="w-full space-y-4 mx-3">
                <div className="container mx-auto px-4 py-6">
                    <div className="space-y-6">
                        {requestData.guaranteeType === 1 ? (
                            <>
                                <Card className="shadow-lg border-0">
                                    <CardHeader className="bg-teal-600 text-white rounded-t-lg">
                                        <CardTitle className="text-2xl font-semibold">
                                            Thông tin chung của tổ chức
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="organizationName"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Tên tổ chức:
                                            </Label>
                                            <Input
                                                id="organizationName"
                                                value={requestData.organizationName}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="organizationType"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Loại tổ chức:
                                            </Label>
                                            <Input
                                                id="organizationType"
                                                value={
                                                    organizationTypes.find(
                                                        (t) => t.value === parseInt(requestData.organizationType),
                                                    )?.label || 'Không xác định'
                                                }
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="organizationPhoneNumber"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Số điện thoại tổ chức:
                                            </Label>
                                            <Input
                                                id="organizationPhoneNumber"
                                                value={requestData.organizationPhoneNumber}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="organizationAddress"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Địa chỉ trụ sở chính:
                                            </Label>
                                            <Input
                                                id="organizationAddress"
                                                value={requestData.organizationAddress}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="socialMediaLinks"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Link liên kết mạng xã hội:
                                            </Label>
                                            <Input
                                                id="socialMediaLinks"
                                                value={requestData.socialMediaLinks}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg border-0">
                                    <CardHeader className="bg-teal-600 text-white rounded-t-lg">
                                        <CardTitle className="text-2xl font-semibold">
                                            Thông tin cá nhân người đại diện
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="representativeName"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Tên người đại diện:
                                            </Label>
                                            <Input
                                                id="representativeName"
                                                value={requestData.representativeName}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber" className="text-lg font-medium text-gray-700">
                                                Số điện thoại:
                                            </Label>
                                            <Input
                                                id="phoneNumber"
                                                value={requestData.phoneNumber}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="bankName" className="text-lg font-medium text-gray-700">
                                                Tên ngân hàng:
                                            </Label>
                                            <Input
                                                id="bankName"
                                                value={
                                                    bankName.find(
                                                        (t) => t.value === parseInt(requestData.bankName),
                                                    )?.label || 'Không xác định'
                                                }
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />

                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="bankAccountNumber"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Số tài khoản ngân hàng:
                                            </Label>
                                            <Input
                                                id="bankAccountNumber"
                                                value={requestData.bankAccountNumber}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />

                                        </div>

                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg border-0">
                                    <CardHeader className="bg-teal-600 text-white rounded-t-lg">
                                        <CardTitle className="text-2xl font-semibold">Tài liệu đính kèm</CardTitle>
                                    </CardHeader>

                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-lg font-medium text-gray-700">
                                                    Giấy phép hoạt động:
                                                </Label>
                                                <a
                                                    href={requestData.licenseToOperate}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-blue-600 hover:underline"
                                                >
                                                    Xem tài liệu: {requestData.licenseToOperate}
                                                </a>
                                            </div>
                                            <div>
                                                <Label className="text-lg font-medium text-gray-700">
                                                    Kinh nghiệm tình nguyện:
                                                </Label>
                                                <a
                                                    href={requestData.volunteerExperienceFiles}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-blue-600 hover:underline"
                                                >
                                                    Xem tài liệu: {requestData.volunteerExperienceFiles}
                                                </a>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        ) : (
                            <>
                                <Card className="shadow-lg border-0">
                                    <CardHeader className="bg-teal-600 text-white rounded-t-lg">
                                        <CardTitle className="text-2xl font-semibold">Thông tin cá nhân</CardTitle>
                                    </CardHeader>

                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="fullname" className="text-lg font-medium text-gray-700">
                                                Họ tên:
                                            </Label>
                                            <Input
                                                id="fullname"
                                                value={requestData.fullname}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber" className="text-lg font-medium text-gray-700">
                                                Số điện thoại:
                                            </Label>
                                            <Input
                                                id="phoneNumber"
                                                value={requestData.phoneNumber}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="citizenIdentification"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Số CCCD:
                                            </Label>
                                            <Input
                                                id="citizenIdentification"
                                                value={requestData.citizenIdentification}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-lg font-medium text-gray-700">
                                                Email:
                                            </Label>
                                            <Input
                                                id="email"
                                                value={requestData.email}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="permanentAddress"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Địa chỉ hộ khẩu:
                                            </Label>
                                            <Input
                                                id="permanentAddress"
                                                value={requestData.permanentAddress}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="householdRegistrationAddress"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Địa chỉ hộ khẩu:
                                            </Label>
                                            <Input
                                                id="householdRegistrationAddress"
                                                value={requestData.householdRegistrationAddress}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="bankAccountNumber"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Số tài khoản ngân hàng:
                                            </Label>
                                            <Input
                                                id="bankAccountNumber"
                                                value={requestData.bankAccountNumber}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bankName" className="text-lg font-medium text-gray-700">
                                                Tên ngân hàng:
                                            </Label>
                                            <Input
                                                id="bankName"
                                                value={
                                                    bankName.find(
                                                        (t) => t.value === parseInt(requestData.bankName),
                                                    )?.label || 'Không xác định'
                                                }
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />

                                        </div>
                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="socialMediaLinks"
                                                className="text-lg font-medium text-gray-700"
                                            >
                                                Link MXH:
                                            </Label>
                                            <Input
                                                id="socialMediaLinks"
                                                value={requestData.socialMediaLinks}
                                                readOnly
                                                className="h-12 text-lg bg-gray-50"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-lg border-0">
                                    <CardHeader className="bg-teal-600 text-white rounded-t-lg">
                                        <CardTitle className="text-2xl font-semibold">Tài liệu đính kèm</CardTitle>
                                    </CardHeader>

                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            <div>
                                                <Label className="text-lg font-medium text-gray-700">CCCD:</Label>
                                                <div className="flex items-center justify-between gap-2">
                                                    <img
                                                        src={
                                                            requestData.frontCIImageUrl ||
                                                            'https://placehold.co/600x400'
                                                        }
                                                        alt="CCCD"
                                                        className="max-w-[50%] object-cover"
                                                    />
                                                    <img
                                                        src={
                                                            requestData.backCIImageUrl || 'https://placehold.co/600x400'
                                                        }
                                                        alt="CCCD"
                                                        className="max-w-[50%] object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-lg font-medium text-gray-700">
                                                    Kinh nghiệm tình nguyện:
                                                </Label>
                                                <a
                                                    href={requestData.volunteerExperienceFiles}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-blue-600 hover:underline"
                                                >
                                                    Xem tài liệu: {requestData.volunteerExperienceFiles}
                                                </a>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        <div className="mt-6 flex justify-end space-x-4">
                            <Button onClick={handleAccept} className="bg-teal-600 hover:bg-green-700 text-white">
                                Chấp nhận đơn
                            </Button>
                            <Button onClick={handleReject} className="bg-gray-800 hover:bg-gray-900 text-white">
                                Từ chối yêu cầu
                            </Button>
                        </div>

                        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Lý do từ chối</DialogTitle>
                                </DialogHeader>
                                <Textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối..."
                                    className="min-h-[100px]"
                                />
                                <DialogFooter>
                                    <Button onClick={() => setIsRejectDialogOpen(false)} variant="outline">
                                        Hủy
                                    </Button>
                                    <Button
                                        onClick={handleRejectConfirm}
                                        className="bg-gray-800 hover:bg-gray-900 text-white"
                                    >
                                        Xác nhận từ chối
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GuaranteeRequestsDetail;
