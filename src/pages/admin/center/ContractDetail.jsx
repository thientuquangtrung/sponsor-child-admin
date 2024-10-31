import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2, Upload } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const ContractDetail = () => {
    const { id } = useParams();
    const { data: contract, error, isLoading } = useGetContractByIdQuery(id);
    const [numPages, setNumPages] = useState(null);
    const [isUploadingHardContract, setIsUploadingHardContract] = useState(false);
    const [hardContractFile, setHardContractFile] = useState(null);
    const [updateContract] = useUpdateContractMutation();
    const navigate = useNavigate();

    console.log(contract);

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/center' },
        { name: 'Quản lý hợp đồng', path: '/center/contracts' },
        { name: 'Chi tiết hợp đồng', path: null },
    ];

    const getContractTypeString = (type) => {
        return contractType.find(t => t.value === type)?.label || 'Không xác định';
    };

    const getContractStatusString = (status) => {
        return contractStatus.find(s => s.value === status)?.label || 'Không xác định';
    };

    const getPartyTypeString = (type) => {
        return contractPartyType.find(t => t.value === type)?.label || 'Không xác định';
    };
    const handleHardContractUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setHardContractFile(file);
        } else {
            toast.error('Vui lòng upload file PDF hợp lệ');
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };
    const handleUploadHardContract = async () => {
        if (!hardContractFile) {
            toast.error("Vui lòng chọn file PDF trước khi tải lên.");
            return;
        }

        setIsUploadingHardContract(true);
        try {
            // Upload hard contract
            const hardContractFormData = new FormData();
            hardContractFormData.append('file', hardContractFile);
            hardContractFormData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET_NAME);
            hardContractFormData.append('folder', 'admin/contracts/hard_contract');

            const hardContractResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/raw/upload`,
                {
                    method: 'POST',
                    body: hardContractFormData,
                }
            );

            if (!hardContractResponse.ok) {
                throw new Error('Failed to upload hard contract to Cloudinary');
            }

            const hardContractData = await hardContractResponse.json();

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
        } catch (error) {
            console.error('Error uploading hard contract:', error);
            toast.error(`Đã xảy ra lỗi khi tải lên bản cứng: ${error.message}`);
        } finally {
            setIsUploadingHardContract(false);
        }
    };



    if (isLoading) return <div><LoadingScreen /></div>;
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
                                    <TableCell>{contract.partyAName} ({getPartyTypeString(contract.partyAType)})</TableCell>
                                    <TableHead className="font-semibold">Bên B</TableHead>
                                    <TableCell>{contract.partyBName} ({getPartyTypeString(contract.partyBType)})</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="font-semibold">Ngày ký</TableHead>
                                    <TableCell>{new Date(contract.signDate).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${contract.status === 2 ? 'bg-green-200 text-green-800' :
                                            contract.status === 0 || contract.status === 1 ? 'bg-yellow-200 text-yellow-800' :
                                                'bg-purple-200 text-purple-800'
                                            }`}>
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
                        {contract.status === 6 && (
                            <Card className="w-1/3">
                                <CardHeader className="bg-teal-600 text-white">
                                    <CardTitle className="text-2xl">Upload bản cứng hợp đồng</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="my-4">
                                        <div className="flex items-center space-x-2">
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
                                                onClick={() => document.getElementById('hard-contract-upload').click()}
                                            >
                                                <Button
                                                    variant="outline"
                                                    className="border-teal-600 text-teal-600 hover:bg-teal-50"
                                                    disabled={isUploadingHardContract}
                                                >
                                                    Chọn file PDF
                                                </Button>
                                            </label>
                                            {hardContractFile && (
                                                <span className="text-sm text-gray-600">{hardContractFile.name}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <Button
                                            onClick={handleUploadHardContract}
                                            className="bg-teal-600 hover:bg-teal-700 text-white"
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
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContractDetail;