import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSelector } from 'react-redux';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Breadcrumb from '@/pages/admin/Breadcrumb';
import QuillEditor from '@/pages/admin/campaign/QuillEditor';
import LoadingScreen from '@/components/common/LoadingScreen';
import { useGetCampaignByIdQuery, useUpdateCampaignMutation } from '@/redux/campaign/campaignApi';
import { UPLOAD_FOLDER, UPLOAD_NAME, uploadFile, uploadMultipleFiles } from '@/lib/cloudinary';
import * as z from 'zod';
import CustomDropzone from '@/pages/children-manager/campaign/CustomDropzone';

const updateCampaignSchema = z.object({
    title: z.string().min(1, "Bạn vui lòng nhập Tiêu Đề chiến dịch"),
    story: z.string().min(1, "Bạn vui lòng nhập thông tin chi tiết về chiến dịch"),
    thumbnailUrl: z.any(),
    imagesFolderUrl: z.array(z.any()).optional(),
});

const UpdateCampaign = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: campaignData, isLoading, error } = useGetCampaignByIdQuery(id);
    const [updateCampaign, { isLoading: isUpdating }] = useUpdateCampaignMutation();
    const { user } = useSelector((state) => state.auth);

    const [imagesFolderUrl, setImagesFolderUrl] = useState([]);
    const [thumbnail, setThumbnail] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm({
        resolver: zodResolver(updateCampaignSchema),
        defaultValues: {
            title: '',
            story: '',
            thumbnailUrl: null,
            imagesFolderUrl: [],
        }
    });

    useEffect(() => {
        if (campaignData && !isLoading) {
            form.reset({
                title: campaignData.title || '',
                story: campaignData.story || '',
                thumbnailUrl: campaignData.thumbnailUrl || null,
                imagesFolderUrl: campaignData.imagesFolderUrl
                    ? campaignData.imagesFolderUrl.split(',').filter(Boolean)
                    : [],
            });

            if (campaignData.thumbnailUrl) {
                setThumbnail({ preview: campaignData.thumbnailUrl });
            }

            if (campaignData.imagesFolderUrl) {
                const images = campaignData.imagesFolderUrl
                    .split(',')
                    .filter(Boolean)
                    .map(url => ({ preview: url }));
                setImagesFolderUrl(images);
            }
        }
    }, [campaignData, form, isLoading]);

    const onDropThumbnail = useCallback((acceptedFiles) => {
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
    }, [form]);

    const onDropImagesFolder = useCallback((acceptedFiles) => {
        const newImagesFolderUrl = acceptedFiles.map((file) =>
            Object.assign(file, {
                preview: URL.createObjectURL(file),
            })
        );

        setImagesFolderUrl((prevImagesFolderUrl) => {
            const updatedImagesFolderUrl = [...prevImagesFolderUrl, ...newImagesFolderUrl];
            form.setValue('imagesFolderUrl', updatedImagesFolderUrl);
            return updatedImagesFolderUrl;
        });
    }, [form]);

    const removeThumbnail = () => {
        if (thumbnail?.preview?.startsWith('blob:')) {
            URL.revokeObjectURL(thumbnail.preview);
        }
        setThumbnail(null);
        form.setValue('thumbnailUrl', null);
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
            if (!campaignData) {
                throw new Error('Không có dữ liệu chiến dịch');
            }

            setIsUploading(true);

            const campaignFolder = UPLOAD_FOLDER.getCampaignFolder(id);
            const campaignMediaFolder = UPLOAD_FOLDER.getCampaignMediaFolder(id);

            // Upload thumbnail
            let thumbnailUrl = data.thumbnailUrl;
            if (data.thumbnailUrl instanceof File) {
                const thumbnailResponse = await uploadFile({
                    file: data.thumbnailUrl,
                    folder: campaignFolder,
                    customFilename: UPLOAD_NAME.THUMBNAIL
                });
                thumbnailUrl = thumbnailResponse.secure_url;
            }

            // Upload additional images
            let imageUrls = '';
            if (Array.isArray(data.imagesFolderUrl) && data.imagesFolderUrl.length > 0) {
                const filesToUpload = data.imagesFolderUrl.filter(file => file instanceof File);

                if (filesToUpload.length > 0) {
                    const imageResponses = await uploadMultipleFiles({
                        files: filesToUpload,
                        folder: campaignMediaFolder,
                        resourceType: 'auto'
                    });

                    const existingUrls = data.imagesFolderUrl
                        .filter(file => !(file instanceof File))
                        .map(file => file.preview || file);

                    const newUploadedUrls = imageResponses.map(response => response.secure_url);
                    imageUrls = [...existingUrls, ...newUploadedUrls].join(',');
                } else {
                    imageUrls = data.imagesFolderUrl
                        .map(file => file.preview || file)
                        .join(',');
                }
            }

            const finalData = {
                id,
                guaranteeID: campaignData.guaranteeID,
                title: data.title,
                story: data.story,
                thumbnailUrl,
                imagesFolderUrl: imageUrls,
                status: campaignData.status,
                userID: user.userID,
            };

            await updateCampaign(finalData).unwrap();
            toast.success('Cập nhật chiến dịch thành công!');
            navigate(`/campaign/${id}`);
        } catch (error) {
            console.error('Error updating campaign:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi cập nhật chiến dịch.');
        } finally {
            setIsUploading(false);
        }
    };

    const breadcrumbs = [
        { name: 'Chiến dịch', path: '/campaigns' },
        { name: 'Cập nhật chiến dịch', path: null },
    ];

    if (error) return (
        <div className="p-6 text-center">
            <p className="text-red-500">{error.message || 'Không thể tải dữ liệu chiến dịch'}</p>
        </div>
    );

    if (isLoading) {
        return <LoadingScreen />;
    }



    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />

            <div className="min-h-screen bg-gray-50">
                <div className="p-6">
                    <div className="space-y-6 max-w-4xl mx-auto">
                        <Card className="shadow-lg border-0">
                            <CardHeader className="bg-teal-600 text-white">
                                <CardTitle className="text-2xl font-semibold">
                                    Cập nhật thông tin chiến dịch
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-lg font-medium text-gray-700">
                                                        Tiêu đề chiến dịch
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            className="h-12 text-lg"
                                                            placeholder="Nhập tiêu đề chiến dịch"
                                                        />
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
                                                    <FormLabel className="text-lg font-medium text-gray-700">
                                                        Mô tả chiến dịch
                                                    </FormLabel>
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
                                            name="thumbnailUrl"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel className="text-lg font-medium text-gray-700">
                                                        Ảnh đại diện
                                                    </FormLabel>
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
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="imagesFolderUrl"
                                            render={() => (
                                                <FormItem>
                                                    <FormLabel className="text-lg font-medium text-gray-700">
                                                        Ảnh phụ (Không bắt buộc)
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="w-fit">
                                                            <CustomDropzone onDrop={onDropImagesFolder} multiple={true}>
                                                                <div className="flex items-center justify-center w-20 h-20 border border-dashed border-gray-300 rounded-lg hover:border-primary cursor-pointer">
                                                                    <Upload className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                            </CustomDropzone>
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>
                                                        Tải lên một hoặc nhiều ảnh phụ cho chiến dịch của bạn (JPEG, PNG, GIF, BMP, WebP)
                                                    </FormDescription>
                                                </FormItem>
                                            )}
                                        />

                                        {imagesFolderUrl.length > 0 && (
                                            <div className="mt-4 border rounded-lg p-4">
                                                <div className="grid grid-cols-7 gap-4">
                                                    {imagesFolderUrl.map((file, index) => (
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

                                        <div className="flex justify-end space-x-4 pt-6">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => navigate(`/campaign/${id}`)}
                                                className="h-12 px-6"
                                            >
                                                Hủy
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="bg-teal-600 hover:bg-teal-700 text-white h-12 px-6"
                                                disabled={isUploading || isUpdating}
                                            >
                                                {(isUploading || isUpdating) ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Đang cập nhật...
                                                    </>
                                                ) : (
                                                    'Cập nhật'
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UpdateCampaign;