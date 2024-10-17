import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Check, X, } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table';
import { Toaster, toast } from 'sonner';

import Breadcrumb from '@/pages/admin/Breadcrumb';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

const ContractDetail = () => {
    const { id } = useParams();
    const [contract, setContract] = useState(null);
    const [adminSignature, setAdminSignature] = useState(null);
    const sigCanvas = useRef();
    const [numPages, setNumPages] = useState(null);
    const [pdfDocument, setPdfDocument] = useState(null);
    const [originalPdfBytes, setOriginalPdfBytes] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [signedPdfUrl, setSignedPdfUrl] = useState(null);

    useEffect(() => {
        const fetchContractAndPDF = async () => {
            try {
                setIsLoading(true);
                const mockContract = {
                    id: id,
                    contractNumber: 'CT001',
                    contractType: 'guarantee',
                    partyB: 'Nguyễn Văn A',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    status: 'pending',
                    signatureDate: '2023-12-15',
                    guaranteeAmount: 1000000,
                    content: '.....',
                    pdfURL: 'https://res.cloudinary.com/dnrs0dvt4/raw/upload/v1729172229/user_001/guarantee/contracts/nzgzihwkzcsgnctrkwpy.pdf'
                };
                setContract(mockContract);

                // Load PDF
                const pdfBytes = await fetch(mockContract.pdfURL).then(res => res.arrayBuffer());
                setOriginalPdfBytes(pdfBytes);
                const pdfDoc = await PDFDocument.load(pdfBytes);
                setPdfDocument(pdfDoc);
            } catch (error) {
                console.error('Error fetching contract or PDF:', error);
                setAlertType('error');
                setShowAlert(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContractAndPDF();
    }, [id]);

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
            toast.success('Chữ ký đã được lưu và chèn vào hợp đồng.');
        } catch (error) {
            console.error('Error saving signature:', error);
            toast.error('Có lỗi xảy ra khi lưu chữ ký.');
        }
    };

    const handleApprove = async () => {
        if (adminSignature) {
            try {
                if (!signedPdfUrl) {
                    toast.error("Vui lòng ký tên và lưu trước khi phê duyệt.");
                    return;
                }

                const response = await fetch(signedPdfUrl);
                const signedPdfBlob = await response.blob();

                const formData = new FormData();
                formData.append('file', signedPdfBlob, `signed_contract_${contract.contractNumber}.pdf`);
                formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET_NAME);
                formData.append('folder', 'admin/contracts');


                // Upload to Cloudinary
                const cloudinaryResponse = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/raw/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (!cloudinaryResponse.ok) {
                    throw new Error('Failed to upload to Cloudinary');
                }

                const cloudinaryData = await cloudinaryResponse.json();

                console.log('Uploaded to Cloudinary:', cloudinaryData.secure_url);



                toast.success('Hợp đồng đã được phê duyệt và tải lên thành công.');
            } catch (error) {
                toast.error('Đã xảy ra lỗi khi phê duyệt hợp đồng.');
            }
        } else {
            toast.error("Please sign and save before approving.");
        }
    };

    const handleReject = () => {
        toast.error('Hợp đồng đã bị từ chối. Vui lòng cung cấp phản hồi cho Bên B.');
        setShowAlert(true);
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

    if (isLoading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
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
                                    <TableHead className="font-semibold">Số hợp đồng</TableHead>
                                    <TableCell>{contract.contractNumber}</TableCell>
                                    <TableHead className="font-semibold">Loại hợp đồng</TableHead>
                                    <TableCell>{contract.contractType === 'disbursement' ? 'Giải ngân' : 'Tham gia bảo lãnh'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="font-semibold">Bên B</TableHead>
                                    <TableCell>{contract.partyB}</TableCell>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${contract.status === 'active' ? 'bg-green-200 text-green-800' :
                                            contract.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                                'bg-red-200 text-red-800'
                                            }`}>
                                            {contract.status === 'active' ? 'Đang hiệu lực' : contract.status === 'pending' ? 'Chờ ký' : 'Hết hạn'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="font-semibold">Ngày bắt đầu</TableHead>
                                    <TableCell>{new Date(contract.startDate).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableHead className="font-semibold">Ngày kết thúc</TableHead>
                                    <TableCell>{new Date(contract.endDate).toLocaleDateString('vi-VN')}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableHead className="font-semibold">Số tiền bảo lãnh</TableHead>
                                    <TableCell>{contract.guaranteeAmount.toLocaleString('vi-VN')} VND</TableCell>
                                    <TableHead className="font-semibold">Ngày ký</TableHead>
                                    <TableCell>{new Date(contract.signatureDate).toLocaleDateString('vi-VN')}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div className="flex gap-6">
                    <Card className="flex-grow w-2/3">
                        <CardHeader className="bg-teal-600 text-white">
                            <CardTitle className="text-2xl">Nội dung hợp đồng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[600px] w-full rounded-md border p-4 bg-white">
                                <Document
                                    file={signedPdfUrl || contract.pdfURL}
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

                    <Card className="flex-grow w-1/3">
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
                                    <Button onClick={handleClear} variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                                        <X className="h-4 w-4 mr-2" /> Xóa
                                    </Button>
                                    <Button onClick={handleSave} variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                                        <Save className="h-4 w-4 mr-2" /> Lưu chữ ký
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-2 mb-4">
                                <Button onClick={handleApprove} className="bg-green-500 hover:bg-green-600 text-white" disabled={!adminSignature}>
                                    Phê duyệt hợp đồng
                                </Button>

                                <Button onClick={handleReject} className="bg-red-500 hover:bg-red-600 text-white">
                                    Từ chối hợp đồng
                                </Button>
                            </div>


                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ContractDetail;