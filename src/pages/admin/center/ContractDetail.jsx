import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Check, X, Upload, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Toaster, toast } from 'sonner';
import Breadcrumb from '@/pages/admin/Breadcrumb';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { contractStatus, contractPartyType, contractType } from '@/config/combobox';

import { useGetContractByIdQuery, useUpdateContractMutation } from '@/redux/contract/contractApi';
import LoadingScreen from '@/components/common/LoadingScreen';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const ContractDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data: contract, error, isLoading } = useGetContractByIdQuery(id);
    const [adminSignature, setAdminSignature] = useState(null);
    const sigCanvas = useRef();
    const [numPages, setNumPages] = useState(null);
    const [pdfDocument, setPdfDocument] = useState(null);
    const [originalPdfBytes, setOriginalPdfBytes] = useState(null);
    const [signedPdfUrl, setSignedPdfUrl] = useState(null);
    const [hardContractFile, setHardContractFile] = useState(null);
    const [updateContract] = useUpdateContractMutation();
    const [isUploading, setIsUploading] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);

    useEffect(() => {
        const loadPDF = async () => {
            if (contract && contract.softContractUrl) {
                try {
                    const pdfBytes = await fetch(contract.softContractUrl).then(res => res.arrayBuffer());
                    setOriginalPdfBytes(pdfBytes);
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    setPdfDocument(pdfDoc);
                } catch (error) {
                    console.error('Error loading PDF:', error);
                    toast.error('Failed to load PDF');
                }
            }
        };

        loadPDF();
    }, [contract]);

    const breadcrumbs = [
        { name: 'Bảng điều khiển', path: '/center' },
        { name: 'Quản lý hợp đồng', path: '/center/contracts' },
        { name: 'Chi tiết hợp đồng', path: null },
    ];

    const handleClear = () => {
        sigCanvas.current.clear();
        setAdminSignature(null);
        setSignedPdfUrl(null);
        resetPdfDocument();
    };

    const resetPdfDocument = async () => {
        if (originalPdfBytes) {
            const pdfDoc = await PDFDocument.load(originalPdfBytes);
            setPdfDocument(pdfDoc);
        }
    };

    const getContractTypeString = (type) => {
        return contractType.find(t => t.value === type)?.label || 'Không xác định';
    };

    const getContractStatusString = (status) => {
        return contractStatus.find(s => s.value === status)?.label || 'Không xác định';
    };

    const getPartyTypeString = (type) => {
        return contractPartyType.find(t => t.value === type)?.label || 'Không xác định';
    };

    const handleSave = async () => {
        if (sigCanvas.current.isEmpty()) {
            toast.error("Vui lòng ký tên trước khi lưu.");
            return;
        }
        const signatureDataUrl = sigCanvas.current.toDataURL();
        setAdminSignature(signatureDataUrl);

        try {
            await resetPdfDocument();
            const signedPdfBytes = await embedSignature(signatureDataUrl);
            const signedPdfBlob = new Blob([signedPdfBytes], { type: 'application/pdf' });
            const signedPdfUrl = URL.createObjectURL(signedPdfBlob);
            setSignedPdfUrl(signedPdfUrl);
        } catch (error) {
            console.error('Error saving signature:', error);
        }
    };

    const handleHardContractUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setHardContractFile(file);
        } else {
            toast.error('Vui lòng upload file PDF hợp lệ');
        }
    };

    const handleApprove = async () => {
        if (!adminSignature) {
            toast.error("Vui lòng ký tên trước khi phê duyệt.");
            return;
        }

        if (!hardContractFile) {
            toast.error("Vui lòng tải lên bản cứng của hợp đồng trước khi phê duyệt.");
            return;
        }

        setIsApproving(true);
        try {
            setIsUploading(true);
            // Upload signed soft contract
            const signedPdfBlob = await fetch(signedPdfUrl).then(res => res.blob());
            const softContractFormData = new FormData();
            softContractFormData.append('file', signedPdfBlob, `soft_contract_${contract.contractNumber}.pdf`);
            softContractFormData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET_NAME);
            softContractFormData.append('folder', 'admin/contracts');

            const softContractResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/raw/upload`,
                {
                    method: 'POST',
                    body: softContractFormData,
                }
            );

            if (!softContractResponse.ok) {
                throw new Error('Failed to upload soft contract to Cloudinary');
            }

            const softContractData = await softContractResponse.json();

            // Upload hard contract
            const hardContractFormData = new FormData();
            hardContractFormData.append('file', hardContractFile);
            hardContractFormData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET_NAME);
            hardContractFormData.append('folder', 'admin/contracts');

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
                partyAID: contract.partyAID,
                partyBType: contract.partyBType,
                partyBID: contract.partyBID,
                signDate: contract.signDate,
                softContractUrl: softContractData.secure_url,
                hardContractUrl: hardContractData.secure_url,
                status: 2,// Approved
                partyBSignatureUrl: contract.signatureUrl
            });
            if (updateResponse.error) {
                throw new Error('Failed to update contract');
            }

            toast.success('Hợp đồng đã được phê duyệt và cập nhật thành công.');
            navigate('/center/contracts');
        } catch (error) {
            console.error('Error approving contract:', error);
            toast.error(`Đã xảy ra lỗi khi phê duyệt hợp đồng: ${error.message}`);
        } finally {
            setIsUploading(false);
            setIsApproving(false);
        }
    };

    const handleReject = async () => {
        setIsRejecting(true);
        try {
            const updateResponse = await updateContract({
                contractId: contract.contractID,
                contractType: contract.contractType,
                partyAType: contract.partyAType,
                partyAID: contract.partyAID,
                partyBType: contract.partyBType,
                partyBID: contract.partyBID,
                signDate: contract.signDate,
                softContractUrl: contract.softContractUrl,
                hardContractUrl: contract.hardContractUrl,
                status: 4,// reject for Admin
                partyBSignatureUrl: contract.signatureUrl

            });
            if (updateResponse.error) {
                throw new Error('Failed to update contract');
            }

            toast.success('Hợp đồng đã bị từ chối.');
            navigate('/center/contracts');
        } catch (error) {
            console.error('Error rejecting contract:', error);
            toast.error('Đã xảy ra lỗi khi từ chối hợp đồng.');
        } finally {
            setIsRejecting(false);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const embedSignature = async (signatureDataUrl, config = {}) => {
        if (!signatureDataUrl || !pdfDocument) return;

        try {
            const pages = pdfDocument.getPages();

            const {
                x = 50,
                y = 190,
                scaleFactor = 0.3,
                pageNumber = 1
            } = config;

            if (pageNumber < 0 || pageNumber >= pages.length) {
                throw new Error('Invalid page number');
            }

            const targetPage = pages[pageNumber];
            const pngImage = await pdfDocument.embedPng(signatureDataUrl);

            targetPage.drawImage(pngImage, {
                x,
                y,
                width: pngImage.width * scaleFactor,
                height: pngImage.height * scaleFactor,
            });

            return await pdfDocument.save();
        } catch (error) {
            console.error('Error embedding signature:', error);
            throw error;
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
                                                'bg-red-200 text-red-800'
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

                <div className={`flex ${contract.status === 1 ? 'gap-6' : ''}`}>
                    <Card className={contract.status === 1 ? "w-2/3" : "w-2/3"}>
                        <CardHeader className="bg-teal-600 text-white">
                            <CardTitle className="text-2xl">Nội dung hợp đồng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-white">
                                <Document
                                    file={signedPdfUrl || contract.softContractUrl}
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

                    {contract.status === 1 && (
                        <Card className="w-1/3">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl">Xác nhận của Admin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2">Chữ ký Admin</h3>
                                    <div className="border-2 border-gray-300 rounded-lg mb-2 bg-white">
                                        <SignatureCanvas
                                            ref={sigCanvas}
                                            canvasProps={{ width: 300, height: 150, className: 'signature-canvas' }}
                                        />
                                    </div>
                                    <div className="flex space-x-2 mb-4">
                                        <Button
                                            onClick={handleClear}
                                            variant="outline"
                                            className="border-teal-600 text-teal-600 hover:bg-teal-50"
                                        >
                                            <X className="h-4 w-4 mr-2" /> Xóa
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            variant="outline"
                                            className="border-teal-600 text-teal-600 hover:bg-teal-50"
                                        >
                                            <Save className="h-4 w-4 mr-2" /> Lưu chữ ký
                                        </Button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-semibold mb-2">Upload Hợp đồng cứng (PDF)</h3>
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
                                                disabled={isUploading}
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Upload className="h-4 w-4 mr-2" />
                                                )}
                                                Chọn file PDF
                                            </Button>
                                        </label>
                                        {hardContractFile && (
                                            <span className="text-sm text-gray-600">{hardContractFile.name}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2 mb-4">
                                    <Button
                                        onClick={handleApprove}
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                        disabled={!adminSignature || !hardContractFile || isApproving}
                                    >
                                        {isApproving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Phê duyệt hợp đồng'
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleReject}
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                        disabled={isRejecting}
                                    >
                                        {isRejecting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            'Từ chối hợp đồng'
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContractDetail;