import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CustomCalendar } from '@/components/ui/customcalendar';
import { Upload, X } from 'lucide-react';
import QuillEditor from '@/pages/guarantee/QuillEditor';
import { toast } from 'sonner'
import { useUploadImageMutation } from '@/redux/cloudinary/cloudinaryApi';
// import { useDispatch, useSelector } from 'react-redux';
// import { setProgress, setIsUploading } from '@/redux/slices/uploadProgressSlice';

const AddFundrasingSchema = z.object({
    title: z.string().min(1, "Bạn vui lòng nhập Tiêu Đề chiến dịch"),
    story: z.string().min(1, "Bạn vui lòng nhập thông tin chi tiết về chiến dịch"),
    targetAmount: z.string().min(1, "Bạn vui lòng nhập số tiền mục tiêu lớn hơn 0"),
    startDate: z.date(),
    endDate: z.date().nullable(),
    thumbnailUrl: z.any().refine((val) => val !== null, "Bạn vui lòng tải lên hình ảnh cho chiến dịch"),
    imagesFolder: z.array(z.any()).optional()
});

const useCustomDropzone = (onDrop, isMultiple) => {
    return useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
        },
        multiple: isMultiple
    });
};

const CustomDropzone = ({ onDrop, multiple, children }) => {
    const { getRootProps, getInputProps } = useCustomDropzone(onDrop, multiple);

    return (
        <div {...getRootProps()}  >
            <input {...getInputProps()} />
            {children}
        </div>
    );
};

const AddFundrasing = () => {
    const [imagesFolder, setImagesFolder] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [uploadImage] = useUploadImageMutation();

    const form = useForm({
        resolver: zodResolver(AddFundrasingSchema),
        defaultValues: {
            title: '',
            story: '',
            targetAmount: '',
            startDate: new Date(),
            endDate: null,
            thumbnailUrl: null,
            imagesFolder: [],
        }
    });
    const uploadToCloudinary = async (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET_NAME);
        formData.append('folder', folder);

        try {
            const result = await uploadImage(formData).unwrap();
            return result.secure_url;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        const newImagesFolder = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));

        setImagesFolder(prevImagesFolder => {
            const updatedImagesFolder = [...prevImagesFolder, ...newImagesFolder];
            form.setValue('imagesFolder', updatedImagesFolder);
            return updatedImagesFolder;
        });
    }, [form]);


    const onDropThumbnail = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setThumbnail(Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));
        form.setValue('thumbnailUrl', file);
        form.clearErrors('thumbnailUrl');
    }, [form]);

    const removeImageFolder = (index) => {
        const newImagesFolder = [...imagesFolder];
        URL.revokeObjectURL(newImagesFolder[index].preview);
        newImagesFolder.splice(index, 1);
        setImagesFolder(newImagesFolder);
        form.setValue('imagesFolder', newImagesFolder);
    };

    const removeThumbnail = () => {
        URL.revokeObjectURL(thumbnail.preview);
        setThumbnail(null);
        form.setValue('thumbnailUrl', null);
    };


    const onSubmit = async (data) => {
        try {
            const userFolder = 'user_001'; // test with user_001
            const tempFundrasingId = `c_001`; //test with c_001

            // Upload thumbnail
            const thumbnailUrl = await uploadToCloudinary(
                data.thumbnailUrl,
                `${userFolder}/fundrasing/${tempFundrasingId}/thumbnail`
            );

            // Upload images-supported
            const imageUrls = await Promise.all(
                data.imagesFolder.map(file =>
                    uploadToCloudinary(file, `${userFolder}/fundrasing/${tempFundrasingId}/images-supported`)
                )
            );

            // Prepare the final data object
            const finalData = {
                ...data,
                thumbnailUrl,
                imagesFolder: imageUrls,
                tempFundrasingId
            };


            // Reset form or navigate to a success page
            form.reset();
            setThumbnail(null);
            setImagesFolder([]);

            toast.success('Fundrasing created successfully!');
        } catch (error) {
            toast.error('Failed to create fundrasing. Please try again.');
        }
    };

    const formatNumber = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div className='py-20 relative'>
            <Card className="w-full max-w-7xl mx-auto rounded-lg border-2">
                <CardHeader>
                    <CardTitle className="text-center">Thêm Chiến Dịch Mới</CardTitle>
                    <CardDescription>Tạo một chiến dịch gây quỹ mới</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tiêu Đề Chiến Dịch</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nhập tiêu đề chiến dịch" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="story"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Mô Tả Chiến Dịch</FormLabel>
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

                            <FormField
                                control={form.control}
                                name="targetAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số Tiền Mục Tiêu (VNĐ)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="Ví dụ: 10,000,000 đ"
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


                            <FormField
                                control={form.control}
                                name="thumbnailUrl"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Ảnh Chiến Dịch</FormLabel>
                                        <FormControl>
                                            <CustomDropzone onDrop={onDropThumbnail} multiple={false}>
                                                {thumbnail ? (
                                                    <div className="flex justify-center items-center w-full py-4">
                                                        <div className="relative">
                                                            <img
                                                                src={thumbnail.preview}
                                                                alt="Thumbnail"
                                                                className="w-96 h-96 object-cover rounded-lg"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeThumbnail();
                                                                }}
                                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 rounded-lg">
                                                        <Upload className="mx-auto mb-2 text-gray-400" />
                                                        <p>Kéo và thả hình ảnh vào đây, hoặc click để chọn</p>
                                                    </div>
                                                )}
                                            </CustomDropzone>
                                        </FormControl>
                                        <FormDescription>
                                            Tải lên một hình ảnh cho chiến dịch của bạn (JPEG, PNG, GIF, BMP, WebP)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="imagesFolder"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Ảnh Phụ (Không bắt buộc)</FormLabel>
                                        <FormControl>
                                            <div className="w-fit">
                                                <CustomDropzone onDrop={onDrop} multiple={true}>
                                                    <div className="flex items-center justify-center w-20 h-20 border border-dashed border-gray-300 rounded-lg hover:border-primary cursor-pointer">
                                                        <Upload className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                </CustomDropzone>
                                            </div>
                                        </FormControl>
                                        <FormDescription>Tải lên một hoặc nhiều ảnh phụ cho chiến dịch của bạn (JPEG, PNG, GIF, BMP, WebP)</FormDescription>
                                    </FormItem>
                                )}
                            />

                            {imagesFolder.length > 0 && (
                                <div className="mt-4 border rounded-lg p-4">
                                    <div className="grid grid-cols-7 gap-4">
                                        {imagesFolder.map((file, index) => (
                                            <div key={index} className="relative aspect-square">
                                                <img
                                                    src={file.preview}
                                                    alt={`Upload ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImageFolder(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày Bắt Đầu </FormLabel>
                                        <FormControl>
                                            <CustomCalendar
                                                date={field.value}
                                                onDateSelect={(date) => field.onChange(date)}
                                                className="ml-7"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày Kết Thúc </FormLabel>
                                        <FormControl>
                                            <CustomCalendar
                                                date={field.value}
                                                onDateSelect={(date) => field.onChange(date)}
                                                className="ml-6"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-center">
                                <Button type="submit" className="w-1/2">Tạo Chiến Dịch</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddFundrasing;