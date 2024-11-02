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

import addCampaignSchema from '@/components/schema/addCampaignSchema';
import { formatNumber } from '@/lib/utils';
import ChildInfo from '@/pages/children-manager/campaign/ChildInfo';
import CampaignDetailInfo from '@/pages/children-manager/campaign/CampaignDetailInfo';
import DisbursementInfo from '@/pages/children-manager/campaign/DisbursementInfo';

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
        resolver: zodResolver(addCampaignSchema),
        defaultValues: {
            childName: '',
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
            startDate: new Date(),
            endDate: null,
            thumbnailUrl: null,
            imagesFolderUrl: [],
            campaignType: 0,
            plannedStartDate: new Date(),
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

    const uploadToCloudinary = async (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET_NAME);
        formData.append('folder', folder);
        try {
            setIsUploading(true);

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    const onDropChildFile = useCallback(
        (acceptedFiles) => {
            const file = acceptedFiles[0];
            if (childFile) {
                URL.revokeObjectURL(childFile.preview);
            }
            setChildFile(file);
            form.setValue('childIdentificationInformationFile', file);
            form.clearErrors('childIdentificationInformationFile');
        },
        [form, childFile],
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
            setThumbnail(
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                }),
            );
            form.setValue('thumbnailUrl', file);
            form.clearErrors('thumbnailUrl');
        },
        [form],
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

            const userFolder = `manager_${user.userID}`;
            const tempCampaignId = `c_${Date.now()}`; //timestamp

            // Upload thumbnail
            const thumbnailUrl = await uploadToCloudinary(
                data.thumbnailUrl,
                `${userFolder}/campaign/${tempCampaignId}`,
            );

            // Upload imagesFolderUrl
            const imageUrls = await Promise.all(
                data.imagesFolderUrl.map((file) =>
                    uploadToCloudinary(file, `${userFolder}/campaign/${tempCampaignId}/images-supported`),
                ),
            );

            const childIdentificationUrl = await uploadToCloudinary(
                data.childIdentificationInformationFile,
                `${userFolder}/campaign/${tempCampaignId}/child-identification`,
            );

            // Prepare the final data object
            const finalData = {
                managerID: user.userID,
                childName: data.childName,
                childBirthYear: parseInt(data.childBirthYear),
                childGender: data.childGender,
                childLocation: data.childLocation,
                childIdentificationInformationFile: childIdentificationUrl,
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
                thumbnailUrl,
                imagesFolderUrl: imageUrls.join(','),
                plannedStartDate: data.plannedStartDate.toISOString(),
                plannedEndDate: data.plannedEndDate.toISOString(),
                disbursementStages: data.disbursementStages.map((stage) => ({
                    disbursementAmount: stage.disbursementAmount,
                    scheduledDate: stage.scheduledDate.toISOString(),
                    description: stage.description,
                })),
            };

            console.log('Final data to be sent to backend:', finalData);
            const response = await createCampaign(finalData).unwrap();
            console.log('Campaign created:', response);
            form.reset();
            setThumbnail(null);
            setImagesFolderUrl([]);

            toast.success('Chiến dịch được tạo thành công!');
            navigate('/campaigns');
        } catch (error) {
            console.error('failed:', error);
            toast.error('Đã xảy ra lỗi! Vui lòng thử lại.');
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
