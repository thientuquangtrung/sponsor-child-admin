import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Undo2 } from 'lucide-react';
import { UPLOAD_FOLDER, UPLOAD_NAME, uploadFile } from '@/lib/cloudinary';
import { useUpdateVisitTripRegistrationMutation } from '@/redux/visitTripRegistration/visitTripRegistrationApi';

const VisitRefundProof = () => {
    const { id } = useParams();
    console.log(id);

    const navigate = useNavigate();
    const [updateVisitTripRegistration] = useUpdateVisitTripRegistrationMutation();

    const [file, setFile] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const [showBackButton, setShowBackButton] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

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
            const uploadResult = await uploadFile({
                file,
                folder: UPLOAD_FOLDER.getVisitTransferProofFolder(id),
                customFilename: `${UPLOAD_NAME.TRANSFER_PROOF_IMAGE}_${id}`,
            });

            if (!uploadResult) {
                throw new Error('Không nhận được link tải lên.');
            }

            await updateVisitTripRegistration({
                id: id,
                status: 3,
                transferProofImageUrl: uploadResult.secure_url,
            }).unwrap();

            setUploadSuccess('Gửi minh chứng hoàn tiền thành công!');
            toast.success('Gửi minh chứng hoàn tiền thành công!');
            setShowBackButton(true);
            setIsSubmitted(true);
        } catch (error) {
            setUploadError('Tải lên hoặc cập nhật thất bại, vui lòng thử lại.');
            console.error('Upload or update failed:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="text-teal-600 font-semibold italic mb-4">
                Vui lòng tải lên minh chứng hoàn tiền cho chuyến thăm!
            </div>

            <Label htmlFor="upload" className="mt-4 font-medium">
                Tải ảnh chuyển khoản:
            </Label>
            <div
                className="relative w-full h-[200px] md:w-[300px] mt-2 border-dashed border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center"
                onClick={() => document.getElementById('upload').click()}
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
                <Input
                    type="file"
                    id="upload"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
            {uploadSuccess && <p className="text-green-500 mt-2">{uploadSuccess}</p>}

            {!isSubmitted && (
                <Button
                    className={`mt-4 bg-teal-600 text-white font-semibold py-2 px-4 rounded hover:bg-teal-700 transition duration-200 ${uploading || !file ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    onClick={handleUpload}
                    disabled={uploading || !file}
                >
                    {uploading ? 'Đang tải...' : 'Gửi minh chứng'}
                </Button>
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