import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Toaster, toast } from 'sonner';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { contractStatus, contractPartyType, contractType } from '@/config/combobox';
import { useGetContractByIdQuery, useUpdateContractMutation } from '@/redux/contract/contractApi';
import LoadingScreen from '@/components/common/LoadingScreen';
import ContractSign from '@/pages/admin/center/ContractSign';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, Loader2, Upload } from 'lucide-react';
import { z } from 'zod';
import { UPLOAD_FOLDER, UPLOAD_NAME, uploadFile } from '@/lib/cloudinary';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ['application/pdf'];

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const fileSchema = z.object({
    file: z
        .instanceof(File)
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `File không được vượt quá ${formatFileSize(MAX_FILE_SIZE)}`,
        })
        .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
            message: 'Chỉ chấp nhận file PDF',
        }),
});

const ContractDetail = () => {
    const { id } = useParams();
    const { data: contract, error, isLoading } = useGetContractByIdQuery(id);
    const [numPages, setNumPages] = useState(null);
    const [isUploadingHardContract, setIsUploadingHardContract] = useState(false);
    const [hardContractFile, setHardContractFile] = useState(null);
    const [updateContract] = useUpdateContractMutation();

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/center' },
        { name: 'Quản lý hợp đồng', path: '/center/contracts' },
        { name: 'Chi tiết hợp đồng', path: null },
    ];

    const getContractTypeString = (type) => {
        return contractType.find((t) => t.value === type)?.label || 'Không xác định';
    };

    const getContractStatusString = (status) => {
        return contractStatus.find((s) => s.value === status)?.label || 'Không xác định';
    };

    const getPartyTypeString = (type) => {
        return contractPartyType.find((t) => t.value === type)?.label || 'Không xác định';
    };

    const validateFile = (file) => {
        try {
            fileSchema.parse({ file });
            return {
                success: true,
                fileSize: formatFileSize(file.size),
            };
        } catch (error) {
            return {
                success: false,
                error: error.errors[0]?.message || 'Lỗi validate file',
            };
        }
    };

    const handleHardContractUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validation = validateFile(file);

        if (!validation.success) {
            toast.error(validation.error);
            event.target.value = null;
            setHardContractFile(null);
            return;
        }

        setHardContractFile(file);
    };

    const handleUploadHardContract = async () => {
        if (!hardContractFile) {
            toast.error('Vui lòng chọn file PDF trước khi tải lên.');
            return;
        }

        const validation = validateFile(hardContractFile);
        if (!validation.success) {
            toast.error(validation.error);
            setHardContractFile(null);
            return;
        }

        setIsUploadingHardContract(true);
        try {
            // Upload hard contract
            const hardContractData = await uploadFile({
                file: hardContractFile,
                folder:
                    contract.contractType === 0
                        ? UPLOAD_FOLDER.getGuaranteeContractFolder(contract.partyBID)
                        : UPLOAD_FOLDER.getCampaignDocumentFolder(contract.campaignID),
                customFilename:
                    contract.contractType === 0
                        ? UPLOAD_NAME.REGISTRATION_CONTRACT_HARD
                        : `${contract.contractID}_${UPLOAD_NAME.CAMPAIGN_CONTRACT_HARD}`,
                resourceType: 'raw',
            });

            const updateResponse = await updateContract({
                contractId: contract.contractID,
                contractType: contract.contractType,
                partyAType: contract.partyAType,
                campaignID: contract.campaignID,
                partyAID: contract.partyAID,
                partyBType: contract.partyBType,
                partyBID: contract.partyBID,
                signDate: contract.signDate,
                softContractUrl: contract.softContractUrl,
                status: 2,
                partyBSignatureUrl: contract.signatureUrl,
                hardContractUrl: hardContractData.secure_url,
            });

            if (updateResponse.error) {
                throw new Error('Failed to update contract');
            }

            toast.success('Bản cứng hợp đồng đã được tải lên thành công.');
            setHardContractFile(null);
            const fileInput = document.getElementById('hard-contract-upload');
            if (fileInput) fileInput.value = null;
        } catch (error) {
            console.error('Error uploading hard contract:', error);
            toast.error(`Đã xảy ra lỗi khi tải lên bản cứng: ${error.message}`);
        } finally {
            setIsUploadingHardContract(false);
        }
    };

    const handleViewHardContract = () => {
        if (contract.hardContractUrl) {
            window.open(contract.hardContractUrl, '_blank');
        } else {
            toast.error('Không tìm thấy file hợp đồng cứng');
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    if (isLoading)
        return (
            <div>
                <LoadingScreen />
            </div>
        );
    if (error) return <div className="flex justify-center items-center h-screen">Lỗi: {error.message}</div>;
    if (!contract) return <div className="flex justify-center items-center h-screen">Không tìm thấy hợp đồng</div>;

    return (
        <div className="bg-gray-100 min-h-screen">
            <Toaster richColors />
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <div className="container mx-auto p-4">
                <Card className="mb-6">
                    <CardHeader className="bg-teal-600 text-white">
                        <CardTitle className="text-2xl">Chi tiết hợp đồng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableHead className="font-semibold">Loại hợp đồng</TableHead>
                                    <TableCell>{getContractTypeString(contract.contractType)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="font-semibold">Bên A</TableHead>
                                    <TableCell>
                                        {contract.partyAName} ({getPartyTypeString(contract.partyAType)})
                                    </TableCell>
                                    <TableHead className="font-semibold">Bên B</TableHead>
                                    <TableCell>
                                        {contract.partyBName} ({getPartyTypeString(contract.partyBType)})
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="font-semibold">Ngày ký</TableHead>
                                    <TableCell>{new Date(contract.signDate).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold ${contract.status === 2
                                                ? 'bg-green-200 text-green-800'
                                                : contract.status === 0 || contract.status === 1
                                                    ? 'bg-yellow-200 text-yellow-800'
                                                    : 'bg-purple-200 text-purple-800'
                                                }`}
                                        >
                                            {getContractStatusString(contract.status)}
                                        </span>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="font-semibold">Ngày bắt đầu</TableHead>
                                    <TableCell>{new Date(contract.startDate).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableHead className="font-semibold">Ngày kết thúc</TableHead>
                                    <TableCell>{new Date(contract.endDate).toLocaleDateString('vi-VN')}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>

                        {contract.status === 4 && contract.rejectionReason && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <h3 className="text-red-700 font-semibold mb-2">Lý do từ chối:</h3>
                                <p className="text-red-600">{contract.rejectionReason}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {contract.status === 1 ? (
                    <ContractSign contractID={contract.contractID} />
                ) : (
                    <div className="flex space-x-4">
                        <Card className="w-2/3">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl">Nội dung hợp đồng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-white">
                                    <Document
                                        file={contract.softContractUrl}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        loading={<div>Đang tải PDF...</div>}
                                        error={<div>Lỗi khi tải PDF. Vui lòng thử lại.</div>}
                                    >
                                        {Array.from(new Array(numPages), (el, index) => (
                                            <Page
                                                key={`page_${index + 1}`}
                                                pageNumber={index + 1}
                                                width={740}
                                                renderAnnotationLayer={false}
                                                renderTextLayer={false}
                                            />
                                        ))}
                                    </Document>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card className="w-1/3">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl">
                                    {contract.status === 2 ? 'Trạng thái hợp đồng' : 'Upload bản cứng hợp đồng'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {contract.status === 2 ? (
                                    <div className="space-y-6 py-4">
                                        <div className="flex items-center justify-center space-x-2 text-green-600 my-10">
                                            <CheckCircle className="h-8 w-8" />
                                            <span className="text-lg font-medium">
                                                Hợp đồng đã được ký kết thành công
                                            </span>
                                        </div>

                                        <div className="flex flex-col items-center space-y-4 my-6">
                                            <Button
                                                onClick={handleViewHardContract}
                                                className="bg-yellow-400 hover:bg-yellow-500"
                                            >
                                                <FileText className="h-4 w-4 mr-2" />
                                                Xem bản cứng hợp đồng
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    contract.status === 6 && (
                                        <div className="my-8 space-y-4">
                                            <h3 className="text-base font-medium">
                                                Click chọn file hợp đồng cần tải lên!
                                            </h3>

                                            {hardContractFile && (
                                                <span className="block text-sm text-gray-600 truncate max-w-[200px] mb-2">
                                                    {hardContractFile.name}
                                                </span>
                                            )}
                                            <div className="flex justify-center items-center gap-4 pt-4">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={handleHardContractUpload}
                                                        className="hidden"
                                                        id="hard-contract-upload"
                                                    />
                                                    <label
                                                        htmlFor="hard-contract-upload"
                                                        className="cursor-pointer"
                                                        onClick={() =>
                                                            document.getElementById('hard-contract-upload').click()
                                                        }
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="border-teal-600 text-teal-600 hover:bg-teal-50 min-w-[120px]"
                                                            disabled={isUploadingHardContract}
                                                        >
                                                            Chọn file PDF
                                                        </Button>
                                                    </label>
                                                </div>

                                                <Button
                                                    onClick={handleUploadHardContract}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white min-w-[160px]"
                                                    disabled={!hardContractFile || isUploadingHardContract}
                                                >
                                                    {isUploadingHardContract ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            Đang tải lên...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            Tải lên hợp đồng
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractDetail;
