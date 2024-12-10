import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Undo2, Landmark } from 'lucide-react';
import { UPLOAD_FOLDER, UPLOAD_NAME, uploadFile } from '@/lib/cloudinary';
import {
    useUpdateVisitTripRegistrationMutation,
    useCalculateRefundVisitQuery
} from '@/redux/visitTripRegistration/visitTripRegistrationApi';
import { bankName, visitRegistrationStatus } from '@/config/combobox';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useSelector } from 'react-redux';

const VisitRefundProof = () => {
    const { userID, visitID } = useParams();
    const navigate = useNavigate();
    const { data: refundData, isLoading, refetch } = useCalculateRefundVisitQuery({
        userId: userID,
        visitId: visitID
    });
    const [updateVisitTripRegistration] = useUpdateVisitTripRegistrationMutation();

    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [showBackButton, setShowBackButton] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (refundData?.visitTripRegistration?.transferProofImageUrl) {
            setFileUrl(refundData.visitTripRegistration.transferProofImageUrl);
            setIsSubmitted(true);
            setShowBackButton(true);
        }
    }, [refundData]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadError(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadError('Vui lòng chọn một tệp để tải lên.');
            return;
        }
        setUploading(true);
        setUploadError(null);
        setUploadSuccess(null);

        try {
            const eventID = refundData?.visitTripRegistration?.visitID;
            const uploadResult = await uploadFile({
                file,
                folder: UPLOAD_FOLDER.getVisitTransferProofFolder(eventID),
                customFilename: `${UPLOAD_NAME.REFUND_PROOF_IMAGE}_${refundData.visitTripRegistration.id}`,
            });

            if (!uploadResult) {
                throw new Error('Không nhận được link tải lên.');
            }

            const updateStatus = refundData?.visitTrip?.status === 5 ? 5 : 3;
            await updateVisitTripRegistration({
                id: refundData.visitTripRegistration.id,
                status: updateStatus,
                transferProofImageUrl: uploadResult.secure_url,
            }).unwrap();

            setUploadSuccess('Gửi minh chứng hoàn tiền thành công!');
            toast.success('Gửi minh chứng hoàn tiền thành công!');
            setShowBackButton(true);
            setIsSubmitted(true);
            refetch();
        } catch (error) {
            setUploadError('Tải lên hoặc cập nhật thất bại, vui lòng thử lại.');
            console.error('Upload or update failed:', error);
        } finally {
            setUploading(false);
        }
    };
    // const handleUpload = async () => {
    //     if (!file) {
    //         setUploadError('Vui lòng chọn một tệp để tải lên.');
    //         return;
    //     }
    //     setUploading(true);
    //     setUploadError(null);
    //     setUploadSuccess(null);

    //     try {
    //         const formData = new FormData();
    //         formData.append('file', file);
    //         formData.append('upload_preset', 'sponsor_child_uploads');
    //         formData.append('cloud_name', 'dnrs0dvt4');

    //         const response = await fetch(
    //             'https://api.cloudinary.com/v1_1/dnrs0dvt4/upload',
    //             {
    //                 method: 'POST',
    //                 body: formData,
    //             }
    //         );

    //         const data = await response.json();

    //         if (!response.ok || !data.secure_url) {
    //             throw new Error('Không nhận được link tải lên.');
    //         }

    //         const updateStatus = refundData?.visitTrip?.status === 5 ? 5 : 3;
    //         await updateVisitTripRegistration({
    //             id: refundData.visitTripRegistration.id,
    //             status: updateStatus,
    //             transferProofImageUrl: data.secure_url,
    //         }).unwrap();

    //         setUploadSuccess('Gửi minh chứng hoàn tiền thành công!');
    //         toast.success('Gửi minh chứng hoàn tiền thành công!');
    //         setShowBackButton(true);
    //         setIsSubmitted(true);
    //         refetch();
    //     } catch (error) {
    //         setUploadError('Tải lên hoặc cập nhật thất bại, vui lòng thử lại.');
    //         console.error('Upload or update failed:', error);
    //     } finally {
    //         setUploading(false);
    //     }
    // };



    if (isLoading) return <div><LoadingScreen /></div>;
    if (!refundData) return null;

    const registration = refundData.visitTripRegistration;
    const physicalDonations = refundData.physicalDonations || [];
    const bankInfo = bankName.find(bank => bank.value === registration.bankName);

    return (
        <div className="rounded-lg p-6 flex flex-col items-center max-w-7xl min-h-screen mx-auto">
            <div className="text-teal-600 font-semibold italic mb-4">
                Vui lòng tải lên minh chứng hoàn tiền cho chuyến thăm!
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
                                <span className="text-gray-700 pl-2">{registration.visitTitle}</span>
                            </div>
                            <div className="grid grid-cols-[180px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Trạng thái đăng ký:</span>
                                <span className="text-gray-700 pl-2">
                                    {visitRegistrationStatus.find(status => status.value === registration.status)?.label}
                                </span>
                            </div>
                            <div className="grid grid-cols-[180px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Lý do hủy:</span>
                                <span className="text-gray-700 pl-2">{registration.cancellationReason}</span>
                            </div>
                            <div className="grid grid-cols-[180px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Số tiền hoàn chuyến thăm:</span>
                                <span className="text-gray-700 pl-2">
                                    {registration?.refundAmount?.toLocaleString('vi-VN')} VNĐ
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
                                <span className="text-gray-700 pl-2">{registration?.bankAccountName}</span>
                            </div>
                            <div className="grid grid-cols-[140px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Số tài khoản:</span>
                                <span className="text-gray-700 pl-2">{registration?.bankAccountNumber}</span>
                            </div>
                            <div className="grid grid-cols-[140px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Ngân hàng:</span>
                                <span className="text-gray-700 pl-2">{bankInfo?.label}</span>
                            </div>
                            <div className="grid grid-cols-[140px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">Tên người dùng:</span>
                                <span className="text-gray-700 pl-2">{registration?.userName}</span>
                            </div>
                            <div className="grid grid-cols-[140px,1fr] gap-2 items-center">
                                <span className="font-medium text-teal-700 whitespace-nowrap">SĐT:</span>
                                <span className="text-gray-700 pl-2">{registration?.phoneNumber}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {physicalDonations.length > 0 && (
                <div className="w-full mt-6 p-6 bg-teal-50 rounded-lg border border-teal-100">
                    <h2 className="text-lg font-semibold text-teal-700 mb-4">Quà tặng đã đóng góp</h2>
                    {physicalDonations.map((donation) => (
                        <div key={donation.id} className="grid grid-cols-[2fr,1fr] gap-2 items-center mb-2">
                            <span className="font-medium text-teal-700">
                                {donation.giftType} ({donation.amount} {donation.unit}):
                            </span>
                            <span className="text-gray-700 text-right">
                                {donation?.refundAmount?.toLocaleString('vi-VN')} VNĐ
                            </span>
                        </div>
                    ))}

                </div>
            )}
            <div className="w-full mt-6 p-4 bg-teal-100 rounded-lg text-center">
                <h3 className="text-xl font-bold text-teal-800">
                    Tổng số tiền hoàn: {refundData?.totalRefundAmount.toLocaleString('vi-VN')} VNĐ
                </h3>
            </div>
            {user.role !== 'ChildManager' && (
                <>
                    <Label htmlFor="upload" className="mt-4 font-medium">
                        {isSubmitted ? 'Minh chứng đã tải lên:' : 'Tải ảnh chuyển khoản:'}
                    </Label>
                    <div
                        className="relative w-full h-[200px] md:w-[300px] mt-2 border-dashed border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center"
                        onClick={() => !isSubmitted && document.getElementById('upload').click()}
                    >
                        {fileUrl ? (
                            <img
                                src={fileUrl}
                                alt="Selected"
                                className="absolute inset-0 object-cover rounded-lg w-full h-full"
                            />
                        ) : (
                            <div className="flex items-center hover:cursor-pointer">
                                <Upload className="text-gray-600 h-8 w-8" />
                                <span className="ml-2">{file ? file.name : 'Chọn tệp...'}</span>
                            </div>
                        )}
                        {!isSubmitted && (
                            <Input
                                type="file"
                                id="upload"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        )}
                    </div>

                    {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
                    {uploadSuccess && <p className="text-green-500 mt-2">{uploadSuccess}</p>}

                    {!isSubmitted && (
                        <Button
                            className={`mt-4 bg-teal-600 text-white font-semibold py-2 px-4 rounded hover:bg-teal-700 transition duration-200 ${uploading || !file ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={handleUpload}
                            disabled={uploading || !file}
                        >
                            {uploading ? 'Đang tải...' : 'Gửi minh chứng'}
                        </Button>
                    )}
                </>
            )}
            {showBackButton && (
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="mt-4 text-teal-600 border-teal-600 hover:bg-normal hover:text-teal-600"
                >
                    <Undo2 className="mr-2 h-4 w-4" />
                    Trở lại
                </Button>
            )}
        </div>
    );
};

export default VisitRefundProof;