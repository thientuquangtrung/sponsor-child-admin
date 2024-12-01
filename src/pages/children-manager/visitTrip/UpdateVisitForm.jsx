import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RegistrationDates, Schedule } from './Schedule';
import { Activities } from './Activities';
import { GiftRequests } from './GiftRequests';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { visitFormSchema } from '@/components/schema/visitFormSchema';
import EventImages from './EventImages';
import useLocationVN from '@/hooks/useLocationVN';
import { UPLOAD_FOLDER, UPLOAD_NAME, uploadFile, uploadMultipleFiles } from '@/lib/cloudinary';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import QuillEditor from '@/pages/admin/campaign/QuillEditor';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetChildrenVisitTripsByIdQuery, useUpdateChildrenVisitTripsMutation } from '@/redux/childrenVisitTrips/childrenVisitTripsApi';
import LoadingScreen from '@/components/common/LoadingScreen';

const UpdateVisitForm = () => {
    const { id } = useParams();
    const {
        provinces,
        setSelectedProvince,
    } = useLocationVN();
    const navigate = useNavigate();

    const [thumbnail, setThumbnail] = useState(null);
    const [imagesFolderUrl, setImagesFolderUrl] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [updateVisitTrip, { isLoading: isUpdatingVisitTrip }] = useUpdateChildrenVisitTripsMutation();
    const { data: visitData, isLoading: isLoadingVisit } = useGetChildrenVisitTripsByIdQuery(id);
    const { user } = useSelector((state) => state.auth);

    const form = useForm({
        resolver: zodResolver(visitFormSchema),
        defaultValues: {
            title: "",
            description: "",
            visitCost: "",
            province: "",
            registrationStartDate: new Date(),
            registrationEndDate: "",
            startDate: new Date(),
            endDate: null,
            maxParticipants: "",
            travelItineraryDetails: [],
            giftRequestDetails: [],
            thumbnailUrl: null,
            imagesFolderUrl: []
        },
        mode: "onChange"
    });

    useEffect(() => {
        if (visitData) {
            const formattedVisitData = {
                ...visitData,
                visitCost: formatNumber(visitData.visitCost.toString()),
                registrationStartDate: new Date(visitData.registrationStartDate),
                registrationEndDate: new Date(visitData.registrationEndDate),
                maxParticipants: formatNumber(visitData.maxParticipants.toString()),
                startDate: new Date(visitData.startDate),
                endDate: new Date(visitData.endDate),
                travelItineraryDetails: visitData.travelItineraryDetails.map(detail => ({
                    ...detail,
                    date: new Date(detail.date)
                })),
                giftRequestDetails: visitData.giftRequestDetails.map(gift => ({
                    ...gift,
                    amount: gift.amount.toString(),
                    unitPrice: formatNumber(gift.unitPrice.toString())
                })),
                imagesFolderUrl: visitData.imagesFolderUrl ? visitData.imagesFolderUrl.split(',').map(url => ({
                    preview: url
                })) : [],
                thumbnailUrl: visitData.thumbnailUrl ? visitData.thumbnail : null,
            };


            Object.entries(formattedVisitData).forEach(([key, value]) => {
                form.setValue(key, value);
            });

            if (visitData.thumbnailUrl) {
                setThumbnail({
                    preview: visitData.thumbnailUrl
                });
                form.setValue('thumbnailUrl', visitData.thumbnailUrl);
            }

            if (visitData.imagesFolderUrl) {
                const images = visitData.imagesFolderUrl.split(',').map(url => ({
                    preview: url
                }));
                setImagesFolderUrl(images);
                form.setValue('imagesFolderUrl', images);
            }

            const province = provinces.find(p => p.name === visitData.province);
            if (province) {
                setSelectedProvince(province);
            }
        }
    }, [visitData, provinces, form]);

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

    const removeThumbnail = () => {
        if (thumbnail) {
            URL.revokeObjectURL(thumbnail.preview);
            setThumbnail(null);
            form.setValue('thumbnailUrl', null);
        }
    };

    const removeImageFolder = (index) => {
        const newImagesFolderUrl = [...imagesFolderUrl];
        URL.revokeObjectURL(newImagesFolderUrl[index].preview);
        newImagesFolderUrl.splice(index, 1);
        setImagesFolderUrl(newImagesFolderUrl);
        form.setValue('imagesFolderUrl', newImagesFolderUrl);
    };

    const onSubmit = async (data) => {
        try {
            setIsUploading(true);
            const visitTripFolder = UPLOAD_FOLDER.getVisitTripFolder(id);
            const visitTripMediaFolder = UPLOAD_FOLDER.getVisitTripMediaFolder(id);

            let thumbnailUrl = data.thumbnailUrl;
            let imagesUrls = [];

            // Only upload thumbnail if it's a new File
            if (data.thumbnailUrl && data.thumbnailUrl instanceof File) {
                const thumbnailResponse = await uploadFile({
                    file: data.thumbnailUrl,
                    folder: visitTripFolder,
                    customFilename: UPLOAD_NAME.THUMBNAIL
                });
                thumbnailUrl = thumbnailResponse.secure_url;
            }

            // Handle images folder
            if (Array.isArray(data.imagesFolderUrl)) {
                // Upload new files
                const newImages = data.imagesFolderUrl.filter(file => file instanceof File);
                if (newImages.length > 0) {
                    const imageResponses = await uploadMultipleFiles({
                        files: newImages,
                        folder: visitTripMediaFolder
                    });
                    imagesUrls = imageResponses.map(img => img.secure_url);
                }

                // Keep existing image URLs
                const existingImages = data.imagesFolderUrl
                    .filter(item => !(item instanceof File)) // Changed this line
                    .map(item => item.preview);

                imagesUrls = [...existingImages, ...imagesUrls];
            }

            const formattedData = {
                ...data,
                id: id,
                childManagerID: user.userID,
                visitCost: parseFloat(data.visitCost.replace(/,/g, '')),
                maxParticipants: parseInt(data.maxParticipants),
                giftRequestDetails: data.giftRequestDetails.map(gift => ({
                    ...gift,
                    amount: parseInt(gift.amount),
                    unitPrice: parseFloat(gift.unitPrice.replace(/,/g, ''))
                })),
                thumbnailUrl: thumbnailUrl,
                imagesFolderUrl: imagesUrls.length > 0 ? imagesUrls.join(',') : data.imagesFolderUrl
            };

            await updateVisitTrip(formattedData).unwrap();
            toast.success("Cập nhật chuyến thăm thành công!");
            navigate('/visits');

        } catch (error) {
            console.error("Error updating form:", error);
            toast.error("Có lỗi xảy ra khi cập nhật chuyến thăm!");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoadingVisit) {
        return (
            <div>
                <LoadingScreen />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6">
                        <h2 className="text-2xl uppercase text-center font-bold text-gray-800 mb-4">
                            Cập nhật chuyến thăm
                        </h2>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="bg-white p-6 rounded-lg space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                        Thông tin cơ bản
                                    </h3>

                                    <div className="grid grid-cols-1 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tiêu Đề</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Nhập tiêu đề chuyến thăm"
                                                            {...field}
                                                            className="rounded-lg"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-3 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="province"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1">
                                                        <FormLabel>Tỉnh/Thành phố</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                readOnly
                                                                className="cursor-not-allowed"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="maxParticipants"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Số lượng người tham gia tối đa</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                placeholder="Nhập số lượng"
                                                                min="1"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === '-') {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                onChange={(e) => {
                                                                    const value = Math.max(1, parseInt(e.target.value) || 1);
                                                                    field.onChange(value.toString());
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="visitCost"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Chi phí dự kiến cho 1 người (VNĐ)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="text"
                                                                placeholder="Ví dụ: 50,000đ"
                                                                {...field}
                                                                onChange={(e) => {
                                                                    const value = e.target.value.replace(/[^\d]/g, '');
                                                                    field.onChange(formatNumber(value));
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mô tả chi tiết</FormLabel>
                                                <FormControl>
                                                    <div className="h-[400px] overflow-hidden rounded-md border border-input">
                                                        <QuillEditor
                                                            value={field.value}
                                                            onChange={(content) => field.onChange(content)}
                                                            className="h-full"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <RegistrationDates form={form} />
                                </div>

                                <div className="bg-white p-6 rounded-lg">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                        Lịch trình
                                    </h3>
                                    <Schedule form={form} />
                                </div>

                                <div className="bg-white p-6 rounded-lg">
                                    <Activities form={form} />
                                </div>

                                <div className="bg-white p-6 rounded-lg">
                                    <GiftRequests form={form} />
                                </div>



                                <div className="bg-white p-6 rounded-lg">
                                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                                        Hình ảnh cho chuyến thăm
                                    </h3>
                                    <EventImages
                                        form={form}
                                        thumbnail={thumbnail}
                                        imagesFolderUrl={imagesFolderUrl}
                                        onDropThumbnail={onDropThumbnail}
                                        onDropImagesFolder={onDropImagesFolder}
                                        removeThumbnail={removeThumbnail}
                                        removeImageFolder={removeImageFolder}
                                    />
                                </div>

                                <div className="flex justify-center">
                                    <Button
                                        type="submit"
                                        className={`w-1/2 ${isUploading || isUpdatingVisitTrip ? 'bg-gray-400' : 'bg-[#2fabab]'} hover:bg-[#287176] text-white py-2 rounded-lg`}
                                        disabled={isUploading || isUpdatingVisitTrip}
                                    >
                                        {isUploading || isUpdatingVisitTrip ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="animate-spin" size={18} />
                                                {isUploading ? 'Đang cập nhật...' : 'Đang Cập Nhật Chuyến thăm...'}
                                            </div>
                                        ) : (
                                            'Cập nhật chuyến thăm'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateVisitForm;