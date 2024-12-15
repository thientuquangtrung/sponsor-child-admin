import React, { useState, useCallback, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useCreateCampaignMutation } from '@/redux/campaign/campaignApi';
import useLocationVN from '@/hooks/useLocationVN';
import { formatNumber } from '@/lib/utils';
import ChildInfo from '@/pages/children-manager/campaign/ChildInfo';
import CampaignDetailInfo from '@/pages/children-manager/campaign/CampaignDetailInfo';
import DisbursementInfo from '@/pages/children-manager/campaign/DisbursementInfo';
import { UPLOAD_FOLDER, UPLOAD_NAME, uploadFile, uploadMultipleFiles } from '@/lib/cloudinary';
import { v4 as uuidv4 } from 'uuid';
import getAddCampaignSchema from '@/components/schema/addCampaignSchema';

const CampaignInfo = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [imagesFolderUrl, setImagesFolderUrl] = useState([]);
    const [childFile, setChildFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [createCampaign, { isLoading: isCreatingCampaign }] = useCreateCampaignMutation();
    const {
        provinces,
        districts,
        wards,
        selectedProvince,
        selectedDistrict,
        selectedWard,
        setSelectedProvince,
        setSelectedDistrict,
        setSelectedWard,
    } = useLocationVN();

    const form = useForm({
        resolver: zodResolver(getAddCampaignSchema()),
        defaultValues: {
            childName: '',
            childIdentificationCode: '',
            childBirthYear: new Date().getFullYear() - 1,
            childGender: 0,
            childLocation: '',
            childIdentificationInformationFile: null,
            provinceId: '',
            districtId: '',
            wardId: '',
            title: '',
            story: '',
            targetAmount: '',
            startDate: new Date(new Date().setDate(new Date().getDate() + 1)),
            endDate: null,
            thumbnailUrl: null,
            imagesFolderUrl: [],
            campaignType: 0,
            plannedStartDate: new Date(new Date().setDate(new Date().getDate() + 1)),
            plannedEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            disbursementStages: [
                {
                    disbursementAmount: 0,
                    scheduledDate: new Date(),
                    description: '',
                },
                {
                    disbursementAmount: 0,
                    scheduledDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    description: '',
                },
            ],
        },
        mode: 'onChange',
    });

    const campaignType = form.watch('campaignType');
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'disbursementStages',
        rules: {
            minLength: campaignType === 0 ? 2 : 1,
        },
    });

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'campaignType') {
                const campaignType = form.getValues('campaignType');
                const currentDate = new Date();

                if (campaignType === 1) {
                    form.setValue('disbursementStages', [
                        {
                            disbursementAmount: 0,
                            scheduledDate: currentDate,
                            description: '',
                        },
                    ]);
                } else {
                    const nextMonth = new Date(currentDate);
                    nextMonth.setMonth(currentDate.getMonth() + 1);

                    form.setValue('disbursementStages', [
                        {
                            disbursementAmount: 0,
                            scheduledDate: currentDate,
                            description: '',
                        },
                        {
                            disbursementAmount: 0,
                            scheduledDate: nextMonth,
                            description: '',
                        },
                    ]);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    useEffect(() => {
        const campaignType = form.getValues('campaignType');
        const stages = form.getValues('disbursementStages') || [];

        if (stages.length === 0) {
            const currentDate = new Date();
            if (campaignType === 0) {
                const nextMonth = new Date(currentDate);
                nextMonth.setMonth(currentDate.getMonth() + 1);

                form.setValue('disbursementStages', [
                    {
                        disbursementAmount: 0,
                        scheduledDate: currentDate,
                        description: '',
                    },
                    {
                        disbursementAmount: 0,
                        scheduledDate: nextMonth,
                        description: '',
                    },
                ]);
            } else {
                form.setValue('disbursementStages', [
                    {
                        disbursementAmount: 0,
                        scheduledDate: currentDate,
                        description: '',
                    },
                ]);
            }
        }
    }, [form]);

    const handleProvinceChange = (provinceId) => {
        setSelectedProvince(provinces.find((p) => p.id === provinceId));
        form.setValue('provinceId', provinceId);
        form.setValue('districtId', '');
        form.setValue('wardId', '');
        form.trigger('provinceId');
    };

    const handleDistrictChange = (districtId) => {
        setSelectedDistrict(districts.find((d) => d.id === districtId));
        form.setValue('districtId', districtId);
        form.setValue('wardId', '');
        form.trigger('districtId');
    };

    const handleWardChange = (wardId) => {
        setSelectedWard(wards.find((w) => w.id === wardId));
        form.setValue('wardId', wardId);
        form.trigger('wardId');
    };

    const handleRemove = (index) => {
        if (campaignType === 0 && fields.length <= 2) {
            toast.error('Chiến dịch nuôi em phải có ít nhất hai giai đoạn giải ngân');
            return;
        }
        remove(index);
    };
    const onDropChildFile = useCallback(
        (acceptedFiles) => {
            if (!acceptedFiles || acceptedFiles.length === 0) {
                toast.error('Vui lòng chỉ tải lên các file PDF, DOC, DOCX, JPEG hoặc PNG');
                return;
            }
            const file = acceptedFiles[0];
            if (!file) {
                toast.error('Không thể đọc file. Vui lòng thử lại.');
                return;
            }
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'image/jpeg',
                'image/png'
            ];

            if (!allowedTypes.includes(file.type) || file.type.startsWith('video/')) {
                toast.error('Vui lòng chỉ tải lên các file PDF, DOC, DOCX, JPEG hoặc PNG');
                return;
            }

            const maxFileSize = 10 * 1024 * 1024;
            if (file.size > maxFileSize) {
                toast.error('Kích thước file không được vượt quá 10MB');
                return;
            }

            if (childFile) {
                URL.revokeObjectURL(childFile.preview);
            }

            const fileWithPreview = Object.assign(file, {
                preview: URL.createObjectURL(file)
            });

            setChildFile(fileWithPreview);
            form.setValue('childIdentificationInformationFile', file);
            form.clearErrors('childIdentificationInformationFile');
        },
        [form, childFile]
    );

    const onDropImagesFolder = useCallback(
        (acceptedFiles) => {
            const newImagesFolderUrl = acceptedFiles.map((file) =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }),
            );

            setImagesFolderUrl((prevImagesFolderUrl) => {
                const updatedImagesFolderUrl = [...prevImagesFolderUrl, ...newImagesFolderUrl];
                form.setValue('imagesFolderUrl', updatedImagesFolderUrl);
                return updatedImagesFolderUrl;
            });
        },
        [form],
    );

    const removeChildFile = () => {
        setChildFile(null);
        form.setValue('childIdentificationInformationFile', null);
    };

    const onDropThumbnail = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (!file.type.startsWith('image/')) {
                toast.error('Vui lòng chỉ tải lên tệp hình ảnh');
                return;
            }

            setThumbnail(
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                })
            );
            form.setValue('thumbnailUrl', file);
            form.clearErrors('thumbnailUrl');
        },
        [form]
    );
    const removeImageFolder = (index) => {
        const newImagesFolderUrl = [...imagesFolderUrl];
        URL.revokeObjectURL(newImagesFolderUrl[index].preview);
        newImagesFolderUrl.splice(index, 1);
        setImagesFolderUrl(newImagesFolderUrl);
        form.setValue('imagesFolderUrl', newImagesFolderUrl);
    };

    const removeThumbnail = () => {
        URL.revokeObjectURL(thumbnail.preview);
        setThumbnail(null);
        form.setValue('thumbnailUrl', null);
    };

    const onSubmit = async (data) => {
        try {
            const targetAmount = parseFloat(data.targetAmount.replace(/,/g, ''));
            const totalDisbursement = data.disbursementStages.reduce((sum, stage) => sum + stage.disbursementAmount, 0);

            if (totalDisbursement !== targetAmount) {
                form.setError('disbursementStages', {
                    type: 'custom',
                    message: `Tổng số tiền giải ngân (${totalDisbursement.toLocaleString()} VNĐ) phải bằng số tiền mục tiêu (${targetAmount.toLocaleString()} VNĐ)`,
                });
                toast.error('Vui lòng kiểm tra lại số tiền giải ngân');
                return;
            }

            const campaignID = uuidv4();
            const campaignFolder = UPLOAD_FOLDER.getCampaignFolder(campaignID);
            const campaignMediaFolder = UPLOAD_FOLDER.getCampaignMediaFolder(campaignID);
            const campaignChildFolder = UPLOAD_FOLDER.getCampaignChildFolder(campaignID);

            setIsUploading(true);

            // Upload thumbnail
            const thumbnailResponse = await uploadFile({
                file: data.thumbnailUrl,
                folder: campaignFolder,
                customFilename: UPLOAD_NAME.THUMBNAIL
            });


            const imageResponses = await uploadMultipleFiles({
                files: data.imagesFolderUrl,
                folder: campaignMediaFolder,
                resourceType: data.imagesFolderUrl.some(file => file.type.startsWith('video/')) ? 'video' : 'auto'
            });


            const identificationFileType = data.childIdentificationInformationFile.type;
            const resourceType =
                identificationFileType.startsWith('image/') ? 'image' :
                    identificationFileType === 'application/pdf' ? 'raw' :
                        identificationFileType.includes('document') ? 'raw' :
                            'auto';

            // Upload child identification document
            const childDocResponse = await uploadFile({
                file: data.childIdentificationInformationFile,
                folder: campaignChildFolder,
                customFilename: UPLOAD_NAME.IDENTIFICATION_FILE,
                resourceType: resourceType
            });


            const finalData = {
                id: campaignID,
                managerID: user.userID,
                childIdentificationCode: data.childIdentificationCode || null,
                childName: data.childName,
                childBirthYear: parseInt(data.childBirthYear),
                childGender: data.childGender,
                childLocation: data.childLocation,
                childIdentificationInformationFile: childDocResponse.secure_url,
                childWard: selectedWard.name,
                childDistrict: selectedDistrict.name,
                childProvince: selectedProvince.name,
                title: data.title,
                story: data.story,
                targetAmount: parseFloat(data.targetAmount.replace(/,/g, '')),
                startDate: data.startDate.toISOString(),
                endDate: data.endDate ? data.endDate.toISOString() : null,
                status: 0,
                campaignType: data.campaignType,
                thumbnailUrl: thumbnailResponse.secure_url,
                imagesFolderUrl: imageResponses.map(img => img.secure_url).join(','),
                plannedStartDate: data.plannedStartDate.toISOString(),
                plannedEndDate: data.plannedEndDate.toISOString(),
                disbursementStages: data.disbursementStages.map((stage) => ({
                    disbursementAmount: stage.disbursementAmount,
                    scheduledDate: stage.scheduledDate.toISOString(),
                    description: stage.description,
                })),
            };

            try {
                const response = await createCampaign(finalData).unwrap();
                form.reset();
                setThumbnail(null);
                setImagesFolderUrl([]);

                toast.success('Chiến dịch được tạo thành công!');
                navigate('/campaigns');
            } catch (error) {
                if (error.status === 400) {
                    let errorMessage = 'Đã xảy ra lỗi khi tạo chiến dịch.';

                    if (error.data?.message) {
                        switch (error.data.message) {
                            case "Campaign with this child identification already exists and is not in 'Completed', 'Reject', or 'Cancelled' status.":
                                errorMessage = 'Đã tồn tại chiến dịch cho trẻ em này và đang ở trạng thái chưa hoàn thành.';
                                break;
                            case "Guarantee has already created 2 campaigns with status different from 'Completed', 'Reject', or 'Cancelled'.":
                                errorMessage = 'Bạn đã tạo 2 chiến dịch đang ở trạng thái chưa hoàn thành. Vui lòng hoàn thành các chiến dịch trước khi tạo mới.';
                                break;
                            default:
                                errorMessage = error.data.message;
                        }
                    }

                    toast.error(errorMessage);

                    if (errorMessage.includes('chiến dịch cho trẻ em')) {
                        form.setError('childIdentificationCode', {
                            type: 'manual',
                            message: errorMessage
                        });
                    }
                } else {
                    console.error('Failed to create campaign:', error);
                    toast.error('Đã xảy ra lỗi! Vui lòng thử lại.');
                }
            }
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Đã xảy ra lỗi! Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <div className="relative font-sans">
            <Card className="w-full max-w-6xl mx-auto rounded-lg border-2">
                <CardHeader>
                    <CardTitle className="text-center text-3xl">TẠO CHIẾN DỊCH</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <ChildInfo
                                form={form}
                                provinces={provinces}
                                districts={districts}
                                wards={wards}
                                handleProvinceChange={handleProvinceChange}
                                handleDistrictChange={handleDistrictChange}
                                handleWardChange={handleWardChange}
                                childFile={childFile}
                                onDropChildFile={onDropChildFile}
                                removeChildFile={removeChildFile}
                            />
                            <CampaignDetailInfo
                                form={form}
                                thumbnail={thumbnail}
                                onDropThumbnail={onDropThumbnail}
                                removeThumbnail={removeThumbnail}
                                imagesFolderUrl={imagesFolderUrl}
                                onDropImagesFolder={onDropImagesFolder}
                                removeImageFolder={removeImageFolder}
                                formatNumber={formatNumber}
                            />
                            <DisbursementInfo
                                form={form}
                                fields={fields}
                                append={append}
                                campaignType={campaignType}
                                handleRemove={handleRemove}
                            />
                            <div className="flex justify-center">
                                <Button
                                    type="submit"
                                    className={`w-1/2 ${isUploading || isCreatingCampaign ? 'bg-gray-400' : 'bg-[#2fabab]'
                                        } hover:bg-[#287176] text-white py-2 rounded-lg`}
                                    disabled={isUploading || isCreatingCampaign}
                                >
                                    {isUploading || isCreatingCampaign ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            {isUploading ? 'Đang Tạo...' : 'Đang Tạo Chiến Dịch...'}
                                        </div>
                                    ) : (
                                        'Tạo Chiến Dịch'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CampaignInfo;
