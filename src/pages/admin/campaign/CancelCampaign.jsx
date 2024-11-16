import React, { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from 'sonner';
import { useCancelCampaignMutation } from '@/redux/campaign/campaignApi';
import { UPLOAD_FOLDER, UPLOAD_NAME, uploadFile } from '@/lib/cloudinary';

const CancelCampaign = ({ campaignId, userId, onCancel, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [cancelCampaign] = useCancelCampaignMutation();
    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        evidenceImageUrl: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileClick = () => {
        if (!fileUrl) {
            document.getElementById('evidence-upload').click();
        }
    };

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

    const handleRemoveImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setFile(null);
        setFileUrl(null);
        const fileInput = document.getElementById('evidence-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            let evidenceImageUrl = '';

            if (file) {
                setUploading(true);
                const uploadResult = await uploadFile({
                    file,
                    folder: UPLOAD_FOLDER.getCampaignFolder(campaignId),
                    customFilename: `${UPLOAD_NAME.EVIDENCE_IMAGE}`,
                });

                if (!uploadResult) {
                    throw new Error('Không nhận được link tải lên.');
                }
                evidenceImageUrl = uploadResult.secure_url;
            }

            const response = await cancelCampaign({
                campaignId,
                data: {
                    userID: userId,
                    description: formData.description,
                    evidenceImageUrl: evidenceImageUrl
                }
            }).unwrap();

            toast.success('Hủy chiến dịch thành công');
            onSuccess?.();
        } catch (error) {
            console.error('Error canceling campaign:', error);
            toast.error('Có lỗi xảy ra khi hủy chiến dịch');
            setUploadError('Tải lên hoặc cập nhật thất bại, vui lòng thử lại.');
        } finally {
            setIsLoading(false);
            setUploading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={uploading}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải lên...
                        </>
                    ) : (
                        'Hủy chiến dịch'
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận hủy chiến dịch</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p className="text-yellow-600 font-medium">
                            Lưu ý: Khi chiến dịch bị hủy, toàn bộ số tiền sẽ được chuyển vào quỹ chung của hệ thống.
                        </p>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 my-4">
                    <div className="space-y-2">
                        <Label htmlFor="description">Lý do hủy chiến dịch</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Nhập lý do hủy..."
                            value={formData.description}
                            onChange={handleInputChange}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Ảnh xác minh (nếu có)</Label>
                        <div
                            className="relative w-full h-[200px] border-dashed border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center"
                            onClick={handleFileClick}
                        >
                            {fileUrl ? (
                                <>
                                    <img
                                        src={fileUrl}
                                        alt="Selected"
                                        className="absolute inset-0 object-cover rounded-lg w-full h-full"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 p-1 h-8 w-8 rounded-full bg-red-500 hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4 text-white" />
                                    </Button>
                                </>
                            ) : (
                                <div className="flex items-center hover:cursor-pointer">
                                    <Upload className="text-gray-600" style={{ fontSize: '2rem' }} />
                                    <span className="ml-2">Chọn tệp...</span>
                                </div>
                            )}
                            <Input
                                type="file"
                                id="evidence-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}
                        className="bg-gray-700 hover:bg-gray-800 hover:text-white text-white">
                        Không</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        disabled={isLoading || !formData.description.trim()}
                        className="bg-red-500 hover:bg-red-600 text-white"

                    >
                        {isLoading || uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý
                            </>
                        ) : (
                            'Xác nhận hủy'
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CancelCampaign;