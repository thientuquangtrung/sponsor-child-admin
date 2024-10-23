// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import Breadcrumb from '@/pages/admin/Breadcrumb';
// import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { ZoomIn, ZoomOut } from "lucide-react";

// const GuaranteeRequestsDetail = () => {
//     const { id } = useParams();
//     const [requestData, setRequestData] = useState(null);
//     const [imageScale, setImageScale] = useState(1);
//     const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
//     const [rejectReason, setRejectReason] = useState('');
//     const breadcrumbs = [
//         { name: 'Trung tâm Quản trị', path: '/center' },
//         { name: 'Đơn đăng ký bảo lãnh', path: '/center/guarantee-requests' },
//         { name: 'Chi tiết yêu cầu bảo lãnh', path: null },
//     ];

//     useEffect(() => {
//         const mockData = {
//             id: 'gr001',
//             name: 'Nguyễn Văn A',
//             birthDate: '01/01/1990',
//             phone: '0123456789',
//             email: 'nguyenvana@gmail.com',
//             socialMedia: 'facebook.com/nguyenvana',
//             address: '123 , Quận 5, TP. Hồ Chí Minh',
//             role: 'Sáng lập',
//             groupName: 'CLB Tình Nguyện A',
//             logo: 'https://doanthanhnien.vn/Uploads/logo.jpg',
//             sponsoringOrg: 'Tổ chức A',
//             links: {
//                 facebook: 'https://facebook.com/clbtinhnguyen',
//                 website: 'https://clbtinhnguyen.com',
//                 youtube: 'https://youtube.com/clbtinhnguyen',
//                 instagram: 'https://instagram.com/clbtinhnguyen',
//                 tiktok: 'https://tiktok.com/@clbtinhnguyen',
//             },
//             description: 'CLB Tình Nguyện A ...',
//             achievements: 'achievements.pdf',
//         };
//         setRequestData(mockData);
//     }, [id]);

//     const handleZoomIn = () => {
//         setImageScale(prevScale => Math.min(prevScale + 0.1, 3));
//     };

//     const handleZoomOut = () => {
//         setImageScale(prevScale => Math.max(prevScale - 0.1, 0.5));
//     };

//     const handleAccept = () => {
//     };

//     const handleReject = () => {
//         setIsRejectDialogOpen(true);
//     };

//     const handleRejectConfirm = () => {
//         if (rejectReason.trim() === '') {
//             alert("Vui lòng nhập lý do từ chối.");
//             return;
//         }
//         setIsRejectDialogOpen(false);
//         setRejectReason('');
//     };

//     if (!requestData) return null;

//     return (
//         <>
//             <Breadcrumb breadcrumbs={breadcrumbs} />

//             <div className="w-full space-y-4 mx-3">
//                 <div className="container mx-auto px-4 py-6">
//                     <div className="space-y-6">
//                         <Card className="shadow-lg border-0">
//                             <CardHeader className="bg-teal-600 text-white rounded-t-lg">
//                                 <CardTitle className="text-2xl font-semibold">Thông tin cá nhân</CardTitle>
//                             </CardHeader>

//                             <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
//                                 <div className="space-y-2">
//                                     <Label htmlFor="name" className="text-lg font-medium text-gray-700">Họ và Tên:</Label>
//                                     <Input id="name" value={requestData.name} readOnly className="h-12 text-lg bg-gray-50" />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="birthDate" className="text-lg font-medium text-gray-700">Ngày/tháng/năm sinh:</Label>
//                                     <Input id="birthDate" value={requestData.birthDate} readOnly className="h-12 text-lg bg-gray-50" />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="phone" className="text-lg font-medium text-gray-700">Điện thoại:</Label>
//                                     <Input id="phone" value={requestData.phone} readOnly className="h-12 text-lg bg-gray-50" />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="email" className="text-lg font-medium text-gray-700">Email:</Label>
//                                     <Input id="email" value={requestData.email} readOnly className="h-12 text-lg bg-gray-50" />
//                                 </div>
//                                 <div className="space-y-2">
//                                     <Label htmlFor="address" className="text-lg font-medium text-gray-700">Địa chỉ thường trú:</Label>
//                                     <Input id="address" value={requestData.address} readOnly className="h-12 text-lg bg-gray-50" />
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <Card className="shadow-lg border-0">
//                             <CardHeader className="bg-teal-600 text-white rounded-t-lg">
//                                 <CardTitle className="text-2xl font-semibold">Thông tin CLB/Đội/Nhóm</CardTitle>
//                             </CardHeader>

//                             <CardContent className="p-6">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                     <div className="space-y-2">
//                                         <Label htmlFor="groupName" className="text-lg font-medium text-gray-700">Tên CLB/Đội/Nhóm:</Label>
//                                         <Input id="groupName" value={requestData.groupName} readOnly className="h-12 text-lg bg-gray-50" />
//                                     </div>
//                                     <div className="space-y-2">
//                                         <Label htmlFor="role" className="text-lg font-medium text-gray-700">Vai trò:</Label>
//                                         <Input id="role" value={requestData.role} readOnly className="h-12 text-lg bg-gray-50" />
//                                     </div>
//                                 </div>

//                                 <div className="mt-6">
//                                     <Label className="text-lg font-medium text-gray-700 mb-2 block">Logo:</Label>
//                                     <Dialog>
//                                         <DialogTrigger asChild>
//                                             <div className="relative w-48 h-48 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
//                                                 <img src={requestData.logo} alt="Logo" className="w-full h-full object-cover" />
//                                             </div>
//                                         </DialogTrigger>
//                                         <DialogContent className="max-w-4xl">
//                                             <div className="flex flex-col items-center p-4">
//                                                 <div className="max-w-full max-h-[80vh] overflow-auto">
//                                                     <img
//                                                         src={requestData.logo}
//                                                         alt="Logo"
//                                                         style={{ transform: `scale(${imageScale})`, transition: 'transform 0.2s' }}
//                                                         className="object-contain"
//                                                     />
//                                                 </div>
//                                                 <div className="flex gap-4 mt-6">
//                                                     <Button onClick={handleZoomOut} className="bg-teal-600 hover:bg-teal-700">
//                                                         <ZoomOut size={24} />
//                                                     </Button>
//                                                     <Button onClick={handleZoomIn} className="bg-teal-600 hover:bg-teal-700">
//                                                         <ZoomIn size={24} />
//                                                     </Button>
//                                                 </div>
//                                             </div>
//                                         </DialogContent>
//                                     </Dialog>
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <Card className="shadow-lg border-0">
//                             <CardHeader className="bg-teal-600 text-white rounded-t-lg">
//                                 <CardTitle className="text-2xl font-semibold">Liên kết mạng xã hội</CardTitle>
//                             </CardHeader>

//                             <CardContent className="p-6">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                                     {Object.entries(requestData.links).map(([key, value]) => (
//                                         <div key={key} className="space-y-2">
//                                             <Label htmlFor={key} className="text-lg font-medium text-gray-700 capitalize">
//                                                 {key}
//                                             </Label>
//                                             <Input
//                                                 id={key}
//                                                 value={value}
//                                                 readOnly
//                                                 className="h-12 text-lg bg-gray-50 hover:bg-gray-100 cursor-pointer"
//                                             />
//                                         </div>
//                                     ))}
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <Card className="shadow-lg border-0">
//                             <CardHeader className="bg-teal-600 text-white rounded-t-lg">
//                                 <CardTitle className="text-2xl font-semibold">Mô tả</CardTitle>
//                             </CardHeader>

//                             <CardContent className="p-6">
//                                 <Textarea
//                                     value={requestData.description}
//                                     readOnly
//                                     className="min-h-[200px] text-lg bg-gray-50 leading-relaxed p-4"
//                                 />
//                             </CardContent>
//                         </Card>

//                         <Card className="shadow-lg border-0">
//                             <CardHeader className="bg-teal-600 text-white rounded-t-lg">
//                                 <CardTitle className="text-2xl font-semibold">Thành tích và Khen thưởng</CardTitle>
//                             </CardHeader>

//                             <CardContent className="p-6">
//                                 <div className="space-y-4">
//                                     <Label className="text-lg font-medium text-gray-700">Tệp đính kèm</Label>
//                                     <a href={requestData.achievements} target="_blank" rel="noopener noreferrer" className="ml-2 text-green-700 hover:underline">
//                                         Xem tệp thành tích
//                                     </a>
//                                 </div>
//                             </CardContent>
//                         </Card>

//                         <div className="mt-6 flex justify-end space-x-4">
//                             <Button onClick={handleAccept} className="bg-teal-600 hover:bg-green-700 text-white">
//                                 Chấp nhận đơn
//                             </Button>
//                             <Button onClick={handleReject} className="bg-gray-800 hover:bg-gray-900 text-white">
//                                 Từ chối yêu cầu
//                             </Button>
//                         </div>

//                         <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
//                             <DialogContent>
//                                 <DialogHeader>
//                                     <DialogTitle>Lý do từ chối</DialogTitle>
//                                 </DialogHeader>
//                                 <Textarea
//                                     value={rejectReason}
//                                     onChange={(e) => setRejectReason(e.target.value)}
//                                     placeholder="Nhập lý do từ chối..."
//                                     className="min-h-[100px]"
//                                 />
//                                 <DialogFooter>
//                                     <Button onClick={() => setIsRejectDialogOpen(false)} variant="outline">
//                                         Hủy
//                                     </Button>
//                                     <Button onClick={handleRejectConfirm} className="bg-gray-800 hover:bg-gray-900 text-white">
//                                         Xác nhận từ chối
//                                     </Button>
//                                 </DialogFooter>
//                             </DialogContent>
//                         </Dialog>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default GuaranteeRequestsDetail;

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
import { guaranteeTypes, organizationTypes } from '@/config/combobox';
import LoadingScreen from '@/components/common/LoadingScreen';

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
            alert('Vui lòng nhập lý do từ chối.');
            return;
        }
        try {
            await updateStatus({ userId: id, status: 2, rejectionReason: rejectReason });
            setIsRejectDialogOpen(false);
            setRejectReason('');
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
                        {requestData.guaranteeType === '1' ? (
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
                                            <Label htmlFor="position" className="text-lg font-medium text-gray-700">
                                                Chức vụ:
                                            </Label>
                                            <Input
                                                id="position"
                                                value={requestData.position}
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
                                                value={requestData.bankName}
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
                                                value={requestData.bankName}
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
