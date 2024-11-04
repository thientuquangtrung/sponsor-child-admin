import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useSelector } from 'react-redux';
import { Toaster, toast } from 'sonner';
import { ClipboardCheck, ClipboardPenLine, Eraser, XCircle } from 'lucide-react';

import 'react-datepicker/dist/react-datepicker.css';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetContractByIdQuery, useUpdateContractMutation } from '@/redux/contract/contractApi';
import { useGetCampaignByIdQuery } from '@/redux/campaign/campaignApi';
import ContractCampaignContent from '@/pages/admin/center/ContractCampaignContent';
import ContractGuaranteeContent from '@/pages/admin/center/ContractGuaranteeContent';
import { UPLOAD_FOLDER, UPLOAD_NAME, uploadFile } from '@/lib/cloudinary';
import { generatePDF } from '@/lib/utils';

const ContractSign = ({ contractID }) => {
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
            skip: !contractDetails || contractDetails.contractType !== 1,
        },
    );

    const isSignatureEmpty = () => {
        return sigCanvas.current?.isEmpty();
    };

    const handleClear = () => {
        sigCanvas.current.clear();
        setSignatureA(null);
        setIsSigned(false);
    };

    const handleSave = () => {
        if (isSignatureEmpty()) {
            toast.info('Vui lòng ký tên trước');
            return;
        }
        setSignatureA(sigCanvas.current.toDataURL());
        setIsSigned(true);
    };

    const handleUpdateContract = async (status) => {
        if (!contractDetails) return;

        setUploadLoading(true);
        const actionText = status === 6 ? 'phê duyệt' : 'từ chối';

        toast.promise(
            async () => {
                try {
                    let pdfUrl = contractDetails.softContractUrl;

                    if (status === 6) {
                        const pdf = await generatePDF(contractRef.current);
                        const pdfBlob = pdf.output('blob');
                        const pdfData = await uploadFile({
                            file: pdfBlob,
                            folder:
                                contractDetails.contractType === 0
                                    ? UPLOAD_FOLDER.getGuaranteeContractFolder(contractDetails.partyBID)
                                    : UPLOAD_FOLDER.getCampaignDocumentFolder(contractDetails.campaignID),
                            customFilename:
                                contractDetails.contractType === 0
                                    ? UPLOAD_NAME.REGISTRATION_CONTRACT_SOFT
                                    : UPLOAD_NAME.CAMPAIGN_CONTRACT_SOFT,
                            resourceType: 'raw',
                        });
                        pdfUrl = pdfData.secure_url;
                    }

                    // Prepare contract update data
                    const updateData = {
                        contractId: contractDetails.contractID,
                        contractType: contractDetails.contractType,
                        partyAType: contractDetails.partyAType,
                        partyAID: user.userID,
                        partyBType: contractDetails.partyBType,
                        partyBID: contractDetails.partyBID,
                        signDate: contractDetails.signDate,
                        status: status,
                        softContractUrl: pdfUrl,
                        hardContractUrl: '',
                        partyBSignatureUrl: contractDetails.partyBSignatureUrl,
                    };

                    if (contractDetails.contractType === 1) {
                        updateData.campaignID = contractDetails.campaignID;
                    }

                    await updateContract(updateData).unwrap();

                    return `Đã ${actionText} hợp đồng`;
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
            },
        );
    };

    const handleApprove = () => {
        if (!isSigned) {
            toast.info('Vui lòng ký tên trước khi phê duyệt');
            return;
        }
        handleUpdateContract(6);
    };
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
            return <ContractGuaranteeContent signatureA={signatureA} contractDetails={contractDetails} />;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
            <Toaster />

            <div className="w-full lg:w-2/3 p-4">
                <ScrollArea className="h-[calc(100vh-2rem)] lg:h-[calc(100vh-2rem)]">
                    <div ref={contractRef}>{renderContractContent()}</div>
                </ScrollArea>
            </div>
            <div className="w-full lg:w-1/3 p-4 bg-white shadow-md py-8 font-sans">
                <h2 className="font-semibold mb-2">Ký tên</h2>
                <div className="border-2 border-gray-300 rounded-lg mb-4">
                    <SignatureCanvas ref={sigCanvas} canvasProps={{ width: 390, height: 150 }} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <Button
                        className="flex-1 border-2 bg-sky-400 hover:bg-sky-500 text-sky-800 rounded-lg"
                        onClick={handleSave}
                    >
                        <ClipboardPenLine className="h-4 w-4 mr-2" /> Ký
                    </Button>
                    <Button
                        className="flex-1 border-2 bg-yellow-400 hover:bg-yellow-400 text-rose-800 rounded-lg"
                        type="button"
                        onClick={handleClear}
                    >
                        <Eraser className="h-4 w-4 mr-2" /> Ký lại
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        className="flex-1 border-2 bg-green-500 hover:bg-green-500"
                        onClick={handleApprove}
                        disabled={!isSigned || uploadLoading || isUpdatingContract}
                    >
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        {uploadLoading || isUpdatingContract ? 'Đang xử lý...' : 'Phê duyệt hợp đồng'}
                    </Button>
                    <Button
                        className="flex-1 border-2 bg-red-500 hover:bg-red-500 text-white"
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
