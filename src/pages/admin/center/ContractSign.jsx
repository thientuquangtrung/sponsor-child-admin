import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Send, Trash, XCircle } from 'lucide-react';
import "react-datepicker/dist/react-datepicker.css";
import { useGetContractByIdQuery, useUpdateContractMutation } from '@/redux/contract/contractApi';
import { useSelector } from 'react-redux';
import { Toaster, toast } from 'sonner';
import { useGetCampaignByIdQuery } from '@/redux/campaign/campaignApi';
import ContractCampaignContent from '@/pages/admin/center/ContractCampaignContent';
import ContractGuaranteeContent from '@/pages/admin/center/ContractGuaranteeContent';
import { useNavigate } from 'react-router-dom';


const ContractSign = ({ contractID }) => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [signatureA, setSignatureA] = useState(null);
    const [isSigned, setIsSigned] = useState(false);
    const sigCanvas = useRef({});
    const contractRef = useRef(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [updateContract, { isLoading: isUpdatingContract }] = useUpdateContractMutation();
    const { data: contractDetails, isLoading: isLoadingContract } = useGetContractByIdQuery(contractID);

    const { data: campaignDetails, isLoading: isLoadingCampaign } = useGetCampaignByIdQuery(
        contractDetails?.contractType === 1 ? contractDetails.campaignID : undefined,
        {
            skip: !contractDetails || contractDetails.contractType !== 1
        }
    );

    const handleClear = () => {
        sigCanvas.current.clear();
        setSignatureA(null);
        setIsSigned(false);
    };

    const handleSave = () => {
        setSignatureA(sigCanvas.current.toDataURL());
        setIsSigned(true);
    };

    const uploadToCloudinary = async (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET_NAME);
        formData.append('folder', folder);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/raw/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    };

    const generatePDF = async () => {
        const element = contractRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true,
            scrollY: -window.scrollY
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
        }

        return pdf;
    };

    const handleUpdateContract = async (status) => {
        if (!contractDetails) return;

        setUploadLoading(true);
        const actionText = status === 2 ? 'phê duyệt' : 'từ chối';

        toast.promise(
            async () => {
                try {
                    const partyAID = user.userID;
                    let pdfUrl = contractDetails.softContractUrl;

                    if (status === 2) {
                        const pdf = await generatePDF();
                        const pdfBlob = pdf.output('blob');
                        const pdfData = await uploadToCloudinary(
                            pdfBlob,
                            `admin_${partyAID}/contracts_${contractDetails.partyBID}`
                        );
                        pdfUrl = pdfData.secure_url;
                    }

                    // Prepare contract update data
                    const updateData = {
                        contractId: contractDetails.contractID,
                        contractType: contractDetails.contractType,
                        partyAType: contractDetails.partyAType,
                        partyAID: partyAID,
                        partyBType: contractDetails.partyBType,
                        partyBID: contractDetails.partyBID,
                        signDate: contractDetails.signDate,
                        status: status,
                        softContractUrl: pdfUrl,
                        hardContractUrl: "",
                        partyBSignatureUrl: contractDetails.partyBSignatureUrl,
                    };

                    if (contractDetails.contractType === 1) {
                        updateData.campaignID = contractDetails.campaignID;
                    }

                    await updateContract(updateData).unwrap();
                    setTimeout(() => {
                        navigate('/center/contracts');
                    }, 1000);
                    return `Đã ${actionText} hợp đồng`;
                } catch (error) {
                    console.error('Update failed:', error);
                    throw error;
                } finally {
                    setUploadLoading(false);
                }
            },
            {
                loading: `Đang ${actionText} hợp đồng...`,
                success: (message) => message,
                error: `${actionText} hợp đồng thất bại. Vui lòng thử lại.`,
            }
        );
    };

    const handleApprove = () => handleUpdateContract(2);
    const handleReject = () => handleUpdateContract(4);

    const renderContractContent = () => {
        if (!contractDetails) return null;

        if (contractDetails.contractType === 1) {
            if (isLoadingCampaign) {
                return (
                    <div className="flex items-center justify-center h-full">
                        <p>Đang tải hợp đồng ...</p>
                    </div>
                );
            }
            return (
                <ContractCampaignContent
                    signatureA={signatureA}
                    campaignDetails={campaignDetails}
                    contractDetails={contractDetails}
                />
            );
        } else {
            return (
                <ContractGuaranteeContent
                    signatureA={signatureA}
                    contractDetails={contractDetails}
                />
            );
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            <Toaster />

            <div className="w-full lg:w-2/3 p-4">
                <ScrollArea className="h-[calc(100vh-2rem)] lg:h-[calc(100vh-2rem)]">
                    <div ref={contractRef}>
                        {renderContractContent()}
                    </div>
                </ScrollArea>
            </div>
            <div className="w-full lg:w-1/3 p-4 bg-white shadow-md py-8 font-sans">
                <h2 className="font-semibold mb-2">Ký tên</h2>
                <div className="border-2 border-gray-300 rounded-lg mb-4 w-fit">
                    <SignatureCanvas ref={sigCanvas} canvasProps={{ width: 350, height: 150 }} />
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex space-x-2 mt-4">
                        <Button
                            className="flex-1 border-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                            type="button"
                            onClick={handleClear}
                        >
                            <Trash className="h-4 w-4 mr-2" /> Ký lại
                        </Button>
                        <Button
                            className="flex-1 border-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg"
                            onClick={handleSave}
                        >
                            <Save className="h-4 w-4 mr-2" /> Xác nhận
                        </Button>
                    </div>
                </div>

                <div className="flex space-x-2 mt-4">
                    <Button
                        className="flex-1 border-2 bg-[#21883b] hover:bg-green-600 text-white"
                        onClick={handleApprove}
                        disabled={!isSigned || uploadLoading || isUpdatingContract}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {uploadLoading || isUpdatingContract ? 'Đang xử lý...' : 'Phê duyệt hợp đồng'}
                    </Button>
                    <Button
                        className="flex-1 border-2 bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleReject}
                        disabled={uploadLoading || isUpdatingContract}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        {uploadLoading || isUpdatingContract ? 'Đang xử lý...' : 'Từ chối hợp đồng'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ContractSign;