import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RegistrationDates, Schedule } from '@/pages/children-manager/visitTrip/Schedule';
import { Activities } from '@/pages/children-manager/visitTrip/Activities';
import { GiftRequests } from '@/pages/children-manager/visitTrip/GiftRequests';
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
import { useCreateChildrenVisitTripsMutation } from '@/redux/childrenVisitTrips/childrenVisitTripsApi';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import QuillEditor from '@/pages/admin/campaign/QuillEditor';
import { useNavigate } from 'react-router-dom';

const VisitForm = () => {
    const {
        provinces,
        setSelectedProvince,
    } = useLocationVN();
    const navigate = useNavigate();

    const [thumbnail, setThumbnail] = useState(null);
    const [imagesFolderUrl, setImagesFolderUrl] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [createVisitTrip, { isLoading: isCreatingVisitTrip }] = useCreateChildrenVisitTripsMutation();
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
            const visitTripId = uuidv4();
            const visitTripFolder = UPLOAD_FOLDER.getVisitTripFolder(visitTripId);
            const visitTripdMeiaFolder = UPLOAD_FOLDER.getVisitTripMediaFolder(visitTripId);

            // Upload thumbnail
            const thumbnailResponse = await uploadFile({
                file: data.thumbnailUrl,
                folder: visitTripFolder,
                customFilename: UPLOAD_NAME.THUMBNAIL
            });

            // Upload event images
            const imageResponses = await uploadMultipleFiles({
                files: data.imagesFolderUrl,
                folder: visitTripdMeiaFolder
            });

            const formattedData = {
                ...data,
                id: visitTripId,
                childManagerID: user.userID,
                visitCost: parseFloat(data.visitCost.replace(/,/g, '')),
                maxParticipants: parseInt(data.maxParticipants),
                giftRequestDetails: data.giftRequestDetails.map(gift => ({
                    ...gift,
                    amount: parseInt(gift.amount),
                    unitPrice: parseFloat(gift.unitPrice.replace(/,/g, ''))
                })),
                thumbnailUrl: thumbnailResponse.secure_url,
                imagesFolderUrl: imageResponses.map(img => img.secure_url).join(','),
            };

            console.log('Formatted data to submit:', formattedData);
            const response = await createVisitTrip(formattedData).unwrap();

            form.reset();
            setThumbnail(null);
            setImagesFolderUrl([]);

            toast.success("Tạo chuyến thăm thành công!");
            navigate('/visits');

        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Có lỗi xảy ra khi tạo chuyến thăm!");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-t from-rose-100 to-teal-100 hover:bg-normal p-6">
                        <h2 className="text-2xl uppercase text-center font-bold text-gray-800 mb-4">
                            Tạo chuyến thăm mới
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
                                                        <Select
                                                            onValueChange={(value) => {
                                                                const province = provinces.find(p => p.name === value);
                                                                if (province) {
                                                                    setSelectedProvince(province);
                                                                    field.onChange(province.name);
                                                                }
                                                            }}
                                                            value={field.value}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Chọn tỉnh/thành" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {provinces.map((province) => (
                                                                    <SelectItem
                                                                        key={province.id}
                                                                        value={province.name}
                                                                    >
                                                                        {province.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
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
                                                        <FormLabel>Chi phí dự kiến cho 1 người (VNĐ)</FormLabel>
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

                                        className={`w-1/3 ${isUploading || isCreatingVisitTrip ? 'bg-gray-400' : 'bg-primary'} text-white text-lg py-2 rounded-lg`} disabled={isUploading || isCreatingVisitTrip}

                                    >
                                        {isUploading || isCreatingVisitTrip ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="animate-spin" size={18} />
                                                {isUploading ? 'Đang Tạo...' : 'Đang Tạo Chuyến thăm...'}
                                            </div>
                                        ) : (
                                            'Tạo chuyến thăm'
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

export default VisitForm;