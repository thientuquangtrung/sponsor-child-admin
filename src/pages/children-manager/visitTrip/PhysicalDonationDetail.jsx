import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { bankName, giftDeliveryMethod, giftStatus } from '@/config/combobox';
import { useGetPhysicalDonationByIdQuery, useUpdatePhysicalDonationMutation } from '@/redux/physicalDonations/physicalDonationApi';
import LoadingScreen from '@/components/common/LoadingScreen';
import { UPLOAD_FOLDER, UPLOAD_NAME, uploadFile } from '@/lib/cloudinary';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { useCalculateRefundVisitQuery } from '@/redux/visitTripRegistration/visitTripRegistrationApi';

const getMethodDisplay = (method) => {
    const methodItem = giftDeliveryMethod.find(item => item.value === method);
    return {
        displayMethod: methodItem?.label || 'Không xác định',
        colorClass: 'bg-blue-100 text-blue-600',
    };
};

const getStatusDisplay = (status) => {
    const statusItem = giftStatus.find(item => item.value === status);
    const colorClasses = {
        0: 'bg-gray-100 text-gray-600',
        1: 'bg-yellow-100 text-yellow-600',
        2: 'bg-green-100 text-green-600',
        3: 'bg-red-100 text-red-600',
        4: 'bg-purple-100 text-purple-600',
        5: 'bg-orange-100 text-orange-600',
    };
    return {
        displayStatus: statusItem?.label || 'Không xác định',
        colorClass: colorClasses[status],
    };
};

const InfoRow = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b">
        <div className="text-lg font-medium text-gray-700">{label}</div>
        <div className="col-span-2 text-lg text-gray-900">{value}</div>
    </div>
);

const PhysicalDonationDetail = () => {
    const { id } = useParams();
    const { data: donation, isLoading, error, refetch } = useGetPhysicalDonationByIdQuery(id);
    const shouldFetchRefund = donation?.giftStatus === 4 && donation?.userID && donation?.visitID;

    const { data: refundData } = useCalculateRefundVisitQuery(
        shouldFetchRefund
            ? {
                userId: donation.userID,
                visitId: donation.visitID
            }
            : undefined,
        {
            skip: !shouldFetchRefund
        }
    );

    const [updatePhysicalDonation] = useUpdatePhysicalDonationMutation();
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

    useEffect(() => {
        if (donation?.proofOfDonation || donation?.transferProofImageUrl) {
            setFileUrl(donation.proofOfDonation || donation.transferProofImageUrl);
        }
    }, [donation]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setConfirmLoading(true);
            let updateData = {};

            switch (newStatus) {
                case 2:
                    if (!file && !donation?.proofOfDonation) {
                        toast.error('Vui lòng tải lên minh chứng nhận quà');
                        return;
                    }

                    if (file) {
                        setUploading(true);
                        const eventID = donation?.visit?.id;

                        const uploadResult = await uploadFile({
                            file,
                            folder: UPLOAD_FOLDER.getVisitDonationProofFolder(eventID),
                            customFilename: `${UPLOAD_NAME.DONATION_PROOF_IMAGE}_${id}`,
                        });

                        if (!uploadResult?.secure_url) {
                            throw new Error('Không nhận được link tải lên.');
                        }

                        updateData.proofOfDonation = uploadResult.secure_url;
                    }
                    updateData.giftStatus = newStatus;
                    break;

                case 3:
                    updateData.giftStatus = newStatus;
                    break;

                case 6:
                    if (!file) {
                        toast.error('Vui lòng tải lên minh chứng hoàn tiền');
                        return;
                    }

                    setUploading(true);
                    const eventID = donation?.visit?.id;

                    const uploadResult = await uploadFile({
                        file,
                        folder: UPLOAD_FOLDER.getVisitTransferProofFolder(eventID),
                        customFilename: `${UPLOAD_NAME.REFUND_PROOF_IMAGE}_${id}`,
                    });
                    if (!uploadResult?.secure_url) {
                        throw new Error('Không nhận được link tải lên.');
                    }

                    updateData = {
                        giftStatus: newStatus,
                        transferProofImageUrl: uploadResult.secure_url
                    };
                    break;
            }

            await updatePhysicalDonation({ id, ...updateData }).unwrap();
            toast.success('Cập nhật trạng thái thành công!');
            await refetch();
            setIsUploadDialogOpen(false);
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Cập nhật thất bại, vui lòng thử lại.');
        } finally {
            setUploading(false);
            setConfirmLoading(false);
        }
    };
    // const handleStatusUpdate = async (newStatus) => {
    //     try {
    //         setConfirmLoading(true);
    //         let updateData = {};

    //         switch (newStatus) {
    //             case 2:
    //                 if (!file && !donation?.proofOfDonation) {
    //                     toast.error('Vui lòng tải lên minh chứng nhận quà');
    //                     return;
    //                 }

    //                 if (file) {
    //                     setUploading(true);

    //                     const formData = new FormData();
    //                     formData.append('file', file);
    //                     formData.append('upload_preset', 'sponsor_child_uploads');
    //                     formData.append('cloud_name', 'dnrs0dvt4');

    //                     const response = await fetch(
    //                         'https://api.cloudinary.com/v1_1/dnrs0dvt4/upload',
    //                         {
    //                             method: 'POST',
    //                             body: formData,
    //                         }
    //                     );

    //                     const uploadResult = await response.json();

    //                     if (!uploadResult?.secure_url) {
    //                         throw new Error('Không nhận được link tải lên.');
    //                     }

    //                     updateData.proofOfDonation = uploadResult.secure_url;
    //                 }

    //                 updateData.giftStatus = newStatus;
    //                 break;

    //             case 3:
    //                 updateData.giftStatus = newStatus;
    //                 break;

    //             case 6:
    //                 if (!file) {
    //                     toast.error('Vui lòng tải lên minh chứng hoàn tiền');
    //                     return;
    //                 }

    //                 setUploading(true);

    //                 const formData = new FormData();
    //                 formData.append('file', file);
    //                 formData.append('upload_preset', 'sponsor_child_uploads');
    //                 formData.append('cloud_name', 'dnrs0dvt4');

    //                 const response = await fetch(
    //                     'https://api.cloudinary.com/v1_1/dnrs0dvt4/upload',
    //                     {
    //                         method: 'POST',
    //                         body: formData,
    //                     }
    //                 );

    //                 const uploadResult = await response.json();

    //                 if (!uploadResult?.secure_url) {
    //                     throw new Error('Không nhận được link tải lên.');
    //                 }

    //                 updateData = {
    //                     giftStatus: newStatus,
    //                     transferProofImageUrl: uploadResult.secure_url,
    //                 };
    //                 break;
    //         }

    //         await updatePhysicalDonation({ id, ...updateData }).unwrap();
    //         toast.success('Cập nhật trạng thái thành công!');
    //         await refetch();
    //         setIsUploadDialogOpen(false);
    //     } catch (error) {
    //         console.error('Update failed:', error);
    //         toast.error('Cập nhật thất bại, vui lòng thử lại.');
    //     } finally {
    //         setUploading(false);
    //         setConfirmLoading(false);
    //     }
    // };


    if (isLoading) return <LoadingScreen />;
    if (error) return <div className="p-4 text-red-500">Có lỗi xảy ra khi tải thông tin quyên góp</div>;
    if (!donation) return <div className="p-4">Không tìm thấy thông tin quyên góp</div>;

    const { displayMethod, colorClass: methodColorClass } = getMethodDisplay(donation.giftDeliveryMethod);
    const { displayStatus, colorClass: statusColorClass } = getStatusDisplay(donation.giftStatus);

    const renderActionButtons = () => {
        if (donation.giftStatus === 4) {
            return (
                <div className="flex justify-end space-x-4">

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className="bg-teal-600 hover:bg-teal-700 text-white"
                                disabled={confirmLoading}
                            >
                                {confirmLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    'Tải minh chứng hoàn tiền'
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tải lên minh chứng hoàn tiền</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Vui lòng tải lên hình ảnh minh chứng chuyển khoản
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="p-4">
                                <div
                                    className="relative w-full h-40 border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                                    onClick={() => document.getElementById('refundProofUpload').click()}
                                >
                                    {fileUrl ? (
                                        <img
                                            src={fileUrl}
                                            alt="Refund Proof"
                                            className="h-full w-full object-contain rounded-lg"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload className="h-8 w-8 text-gray-400" />
                                            <span className="mt-2 text-sm text-gray-500">
                                                Click để chọn ảnh hoặc kéo thả vào đây
                                            </span>
                                        </div>
                                    )}
                                    <Input
                                        type="file"
                                        id="refundProofUpload"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                    setFileUrl(null);
                                    setFile(null);
                                }}>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleStatusUpdate(6)}
                                    disabled={uploading || (!fileUrl) || confirmLoading}
                                    className="bg-teal-600 hover:bg-teal-700"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang tải...
                                        </>
                                    ) : confirmLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : 'Xác nhận'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );
        }

        return (
            <div className="flex justify-end space-x-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            className="bg-teal-600 hover:bg-teal-700 text-white"
                            disabled={confirmLoading}
                        >
                            {confirmLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Xác nhận nhận quà'
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Tải lên ảnh xác nhận đã nhận quà</AlertDialogTitle>
                            <AlertDialogDescription>
                                Vui lòng tải lên hình ảnh minh chứng để xác nhận đã nhận quà
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="p-4">
                            <div
                                className="relative w-full h-40 border-dashed border-2 border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                                onClick={() => document.getElementById('proofUpload').click()}
                            >
                                {fileUrl ? (
                                    <img
                                        src={fileUrl}
                                        alt="Proof"
                                        className="h-full w-full object-contain rounded-lg"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Upload className="h-8 w-8 text-gray-400" />
                                        <span className="mt-2 text-sm text-gray-500">
                                            Click để chọn ảnh hoặc kéo thả vào đây
                                        </span>
                                    </div>
                                )}
                                <Input
                                    type="file"
                                    id="proofUpload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setFileUrl(null);
                                setFile(null);
                            }}>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleStatusUpdate(2)}
                                disabled={uploading || (!fileUrl && !donation.proofOfDonation) || confirmLoading}
                                className="bg-teal-600 hover:bg-teal-700"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang tải...
                                    </>
                                ) : confirmLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : 'Xác nhận'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            disabled={confirmLoading}
                        >
                            {confirmLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Hủy
                                </>
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Xác nhận hủy</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bạn có chắc chắn muốn hủy quyên góp này? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Không</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleStatusUpdate(3)}
                                disabled={confirmLoading}
                                className="bg-red-500 hover:bg-red-700"
                            >
                                {confirmLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : 'Xác nhận hủy'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        );
    };
    const renderBankInformation = () => {
        if (donation.giftStatus === 4 && refundData) {
            const bankInfo = refundData.physicalDonations[0];
            const bankNameObj = bankName.find(bank => bank.value === bankInfo.bankName);

            return (
                <Card className="shadow-lg border-0 mt-6">
                    <CardHeader className="bg-teal-600 text-white">
                        <CardTitle className="text-2xl font-semibold">Thông tin hoàn tiền</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        <InfoRow
                            label="Tổng số tiền hoàn"
                            value={`${refundData.totalRefundAmount.toLocaleString()} VNĐ`}
                        />
                        <InfoRow
                            label="Tên tài khoản"
                            value={bankInfo.bankAccountName}
                        />
                        <InfoRow
                            label="Số tài khoản"
                            value={bankInfo.bankAccountNumber}
                        />
                        <InfoRow
                            label="Ngân hàng"
                            value={bankNameObj ? bankNameObj.label : 'Không xác định'}
                        />
                    </CardContent>
                </Card>
            );
        }

        if (donation.giftStatus === 6 && donation) {
            const bankNameObj = bankName.find(bank => bank.value === donation.bankName);
            console.log(donation);

            return (
                <Card className="shadow-lg border-0 mt-6">
                    <CardHeader className="bg-teal-600 text-white">
                        <CardTitle className="text-2xl font-semibold">Thông tin hoàn tiền</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                        {/* <InfoRow
                            label="Tổng số tiền hoàn"
                            value={`${donation.refundAmount.toLocaleString()} VNĐ`}
                        /> */}
                        <InfoRow
                            label="Tên tài khoản"
                            value={donation.bankAccountName}
                        />
                        <InfoRow
                            label="Số tài khoản"
                            value={donation.bankAccountNumber}
                        />
                        <InfoRow
                            label="Ngân hàng"
                            value={bankNameObj ? bankNameObj.label : 'Không xác định'}
                        />
                    </CardContent>
                </Card>
            );
        }

        return null;
    };
    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-teal-600 text-white">
                    <CardTitle className="text-2xl font-semibold">Thông tin người quyên góp</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-4">
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Họ và tên:</Label>
                                <Input value={donation.user.fullname} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Email:</Label>
                                <Input value={donation.user.email} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-lg font-medium text-gray-700">Số điện thoại:</Label>
                                <Input value={donation.user.phone} readOnly className="h-12 text-lg bg-gray-50" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
                <CardHeader className="bg-teal-600 text-white">
                    <CardTitle className="text-2xl font-semibold">Thông tin chuyến thăm</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    <div className="md:col-span-2">
                        <InfoRow label="Tiêu đề" value={donation.visit.title} />
                    </div>
                    <InfoRow label="Địa điểm" value={donation.visit.province} />
                    <InfoRow
                        label="Thời gian"
                        value={`${format(new Date(donation.visit.startDate), 'dd/MM/yyyy')} - ${format(new Date(donation.visit.endDate), 'dd/MM/yyyy')}`}
                    />
                </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
                <CardHeader className="bg-teal-600 text-white">
                    <CardTitle className="text-2xl font-semibold">Thông tin quà tặng</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    <InfoRow label="Loại quà tặng" value={donation.giftType} />
                    <InfoRow label="Số lượng" value={`${donation?.amount} ${donation.unit}`} />
                    <InfoRow label="Kích thước" value={`${donation?.length || 0}cm x ${donation?.width || 0}cm x ${donation?.height || 0}cm`} />
                    <InfoRow label="Cân nặng" value={`${donation.giftWeight} kg`} />
                    <div className="space-y-2">
                        <Label className="text-lg font-medium text-gray-700">Phương thức giao:</Label>
                        <div className="h-12 flex items-center">
                            <Badge className={methodColorClass}>{displayMethod}</Badge>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-lg font-medium text-gray-700">Trạng thái:</Label>
                        <div className="h-12 flex items-center">
                            <Badge className={statusColorClass}>{displayStatus}</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {renderBankInformation()}
            {(donation.transferProofImageUrl || donation.proofOfDonation) && (
                <Card className="shadow-lg border-0 md:col-span-2">
                    <CardHeader className="bg-teal-600 text-white">
                        <CardTitle className="text-2xl font-semibold">
                            {donation.giftStatus === 4 || donation.giftStatus === 6 ? 'Ảnh minh chứng hoàn tiền:' : 'Ảnh xác nhận đã nhận quà:'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex justify-center items-center mt-2">
                            <img
                                src={donation.transferProofImageUrl || donation.proofOfDonation}
                                alt={donation.giftStatus === 4 ? "Refund Proof" : "Proof of donation"}
                                className="max-w-xs rounded-lg"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex flex-col space-y-4">
                {donation.giftStatus !== 2 &&
                    donation.giftStatus !== 3 &&
                    donation.giftStatus !== 5 &&
                    donation.giftStatus !== 1 &&
                    donation.giftStatus !== 6 &&
                    renderActionButtons()}
            </div>
        </div>
    );
};

export default PhysicalDonationDetail;