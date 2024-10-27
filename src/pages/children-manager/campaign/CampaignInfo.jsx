import React, { useState, useCallback, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Upload, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { useCreateCampaignMutation } from '@/redux/campaign/campaignApi';
import { campaignTypes } from '@/config/combobox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { useNavigate } from 'react-router-dom';
import QuillEditor from '@/pages/admin/campaign/QuillEditor';


const addCampaignSchema = z.object({
    title: z.string().min(1, "Bạn vui lòng nhập Tiêu Đề chiến dịch"),
    story: z.string().min(1, "Bạn vui lòng nhập thông tin chi tiết về chiến dịch"),
    targetAmount: z.string().min(1, "Bạn vui lòng nhập số tiền mục tiêu lớn hơn 0"),
    startDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc",
        invalid_type_error: "Vui lòng chọn ngày kết thúc",
    }),
    thumbnailUrl: z.any().refine((val) => val !== null, "Bạn vui lòng tải lên hình ảnh cho chiến dịch"),
    imagesFolderUrl: z.array(z.any()).optional(),
    campaignType: z.number({
        required_error: "Vui lòng chọn loại chiến dịch",
    }),
    plannedStartDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu dự kiến",
    }),
    plannedEndDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc dự kiến",
        invalid_type_error: "Vui lòng chọn ngày kết thúc dự kiến",

    }),
    disbursementStages: z.array(z.object({
        disbursementAmount: z.number({
            required_error: "Vui lòng nhập số tiền giải ngân",
            invalid_type_error: "Số tiền giải ngân phải là số"
        }).min(1, "Số tiền giải ngân phải lớn hơn 0"),
        scheduledDate: z.date({
            required_error: "Vui lòng chọn ngày giải ngân",
            invalid_type_error: "Ngày giải ngân không hợp lệ"
        }),
        activity: z.string().min(1, "Vui lòng nhập hoạt động giải ngân"),
    }))
        .min(1, "Phải có ít nhất một giai đoạn giải ngân")
        .refine((stages) => {
            for (let i = 1; i < stages.length; i++) {
                if (stages[i].scheduledDate <= stages[i - 1].scheduledDate) {
                    return false;
                }
            }
            return true;
        }, {
            message: "Ngày giải ngân của giai đoạn sau phải lớn hơn giai đoạn trước",
            path: ["disbursementStages"]
        })
}).superRefine((data, ctx) => {
    if (data.endDate && data.endDate <= data.startDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày kết thúc phải sau ngày bắt đầu",
            path: ["endDate"]
        });
    }

    if (data.plannedStartDate <= data.endDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày bắt đầu dự kiến phải sau ngày kết thúc chiến dịch",
            path: ["plannedStartDate"]
        });
    }

    if (data.plannedEndDate <= data.plannedStartDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ngày kết thúc dự kiến phải sau ngày bắt đầu dự kiến",
            path: ["plannedEndDate"]
        });
    }

    const targetAmount = parseFloat(data.targetAmount.replace(/,/g, ''));
    const totalDisbursement = data.disbursementStages.reduce(
        (sum, stage) => sum + stage.disbursementAmount,
        0
    );
    if (data.campaignType === 1) {
        if (data.disbursementStages.length !== 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Chiến dịch khẩn cấp chỉ được có một giai đoạn giải ngân",
                path: ["disbursementStages"]
            });
        }
        if (totalDisbursement !== targetAmount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Số tiền giải ngân phải bằng số tiền mục tiêu (${targetAmount.toLocaleString()} VNĐ)`,
                path: ["disbursementStages"]
            });
        }
    } else {
        if (data.disbursementStages.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Chiến dịch nuôi em phải có ít nhất hai giai đoạn giải ngân",
                path: ["disbursementStages"]
            });
        }

        data.disbursementStages.forEach((stage, index) => {
            if (stage.disbursementAmount > targetAmount * 0.5) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Mỗi giai đoạn không được vượt quá 50% tổng số tiền mục tiêu",
                    path: [`disbursementStages.${index}.disbursementAmount`]
                });
            }
        });

        if (totalDisbursement !== targetAmount) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Tổng số tiền giải ngân (${totalDisbursement.toLocaleString()} VNĐ) phải bằng số tiền mục tiêu (${targetAmount.toLocaleString()} VNĐ)`,
                path: ["disbursementStages"]
            });
        }
    }
    data.disbursementStages.forEach((stage, index) => {
        if (stage.scheduledDate < data.plannedStartDate || stage.scheduledDate > data.plannedEndDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ngày giải ngân phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc dự kiến",
                path: [`disbursementStages.${index}.scheduledDate`]
            });
        }
    });

    for (let i = 1; i < data.disbursementStages.length; i++) {
        const prevDate = new Date(data.disbursementStages[i - 1].scheduledDate);
        const currentDate = new Date(data.disbursementStages[i].scheduledDate);
        const monthDiff = (currentDate.getFullYear() - prevDate.getFullYear()) * 12 +
            (currentDate.getMonth() - prevDate.getMonth());

        if (monthDiff < 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Các giai đoạn giải ngân phải cách nhau ít nhất 1 tháng",
                path: [`disbursementStages.${i}.scheduledDate`]
            });
        }
    }
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
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {children}
        </div>
    );
};

const CampaignInfo = ({ childID }) => {
    const [imagesFolderUrl, setImagesFolderUrl] = useState([]);
    const navigate = useNavigate();
    const [thumbnail, setThumbnail] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const [createCampaign, { isLoading: isCreatingCampaign }] = useCreateCampaignMutation();
    const [isUploading, setIsUploading] = useState(false);
    if (!childID) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500">Vui lòng tạo hồ sơ trẻ trước khi tạo chiến dịch</p>
            </div>
        );
    }
    const form = useForm({
        resolver: zodResolver(addCampaignSchema),
        defaultValues: {
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
                    activity: ''
                },
                {
                    disbursementAmount: 0,
                    scheduledDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                    activity: ''
                }
            ]
        },
        mode: "onChange",
    });
    const campaignType = form.watch("campaignType");
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "disbursementStages",
        rules: {
            minLength: campaignType === 0 ? 2 : 1
        }
    });

    const handleRemove = (index) => {
        if (campaignType === 0 && fields.length <= 2) {
            toast.error('Chiến dịch nuôi em phải có ít nhất hai giai đoạn giải ngân');
            return;
        }
        remove(index);
    };
    useEffect(() => {
        // Reset form khi thay đổi loại chiến dịch
        const subscription = form.watch((value, { name }) => {
            if (name === 'campaignType') {
                const campaignType = form.getValues('campaignType');
                const currentDate = new Date();

                if (campaignType === 1) {
                    // Chiến dịch khẩn cấp
                    form.setValue('disbursementStages', [{
                        disbursementAmount: 0,
                        scheduledDate: currentDate,
                        activity: ''
                    }]);
                } else {
                    // Chiến dịch nuôi em
                    const nextMonth = new Date(currentDate);
                    nextMonth.setMonth(currentDate.getMonth() + 1);

                    form.setValue('disbursementStages', [
                        {
                            disbursementAmount: 0,
                            scheduledDate: currentDate,
                            activity: ''
                        },
                        {
                            disbursementAmount: 0,
                            scheduledDate: nextMonth,
                            activity: ''
                        }
                    ]);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);

    // Xóa useEffect cũ về campaignType và thay bằng useEffect mới
    useEffect(() => {
        const campaignType = form.getValues('campaignType');
        const stages = form.getValues('disbursementStages') || [];

        // Chỉ tự động thêm giai đoạn nếu không có giai đoạn nào
        if (stages.length === 0) {
            const currentDate = new Date();
            if (campaignType === 0) {
                const nextMonth = new Date(currentDate);
                nextMonth.setMonth(currentDate.getMonth() + 1);

                form.setValue('disbursementStages', [
                    {
                        disbursementAmount: 0,
                        scheduledDate: currentDate,
                        activity: ''
                    },
                    {
                        disbursementAmount: 0,
                        scheduledDate: nextMonth,
                        activity: ''
                    }
                ]);
            } else {
                form.setValue('disbursementStages', [{
                    disbursementAmount: 0,
                    scheduledDate: currentDate,
                    activity: ''
                }]);
            }
        }
    }, [form]);



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
                }
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

    const onDrop = useCallback((acceptedFiles) => {
        const newImagesFolderUrl = acceptedFiles.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
        }));

        setImagesFolderUrl(prevImagesFolderUrl => {
            const updatedImagesFolderUrl = [...prevImagesFolderUrl, ...newImagesFolderUrl];
            form.setValue('imagesFolderUrl', updatedImagesFolderUrl);
            return updatedImagesFolderUrl;
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
            const totalDisbursement = data.disbursementStages.reduce(
                (sum, stage) => sum + stage.disbursementAmount,
                0
            );

            if (totalDisbursement !== targetAmount) {
                form.setError('disbursementStages', {
                    type: 'custom',
                    message: `Tổng số tiền giải ngân (${totalDisbursement.toLocaleString()} VNĐ) phải bằng số tiền mục tiêu (${targetAmount.toLocaleString()} VNĐ)`
                });
                toast.error('Vui lòng kiểm tra lại số tiền giải ngân');
                return;
            }
            const userFolder = `user_${user.userID}`;
            const tempCampaignId = `c_${Date.now()}`; //timestamp
            // Upload thumbnail
            const thumbnailUrl = await uploadToCloudinary(
                data.thumbnailUrl,
                `${userFolder}/campaign/${tempCampaignId}`
            );
            // Upload images-supported
            const imageUrls = await Promise.all(
                data.imagesFolderUrl.map(file =>
                    uploadToCloudinary(file, `${userFolder}/campaign/${tempCampaignId}/images-supported`)
                )
            );

            // Prepare the final data object
            const finalData = {
                managerID: user.userID,
                childID: childID,
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
                disbursementStages: data.disbursementStages.map(stage => ({
                    disbursementAmount: stage.disbursementAmount,
                    scheduledDate: stage.scheduledDate.toISOString()
                }))
            };

            console.log('Final data to be sent to backend:', finalData);
            const response = await createCampaign(finalData).unwrap();
            console.log('Campaign created:', response);
            form.reset();
            setThumbnail(null);
            setImagesFolderUrl([]);

            toast.success('Chiến dịch được tạo thành công!');
            navigate('/cm-campaigns');

        } catch (error) {
            console.error('failed:', error);
            toast.error('Đã xảy ra lỗi! Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const formatNumber = (value) => {
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };


    return (
        <div className='relative font-sans'>
            <Card className="w-full max-w-6xl mx-auto rounded-lg border-2">
                <CardHeader>
                    <CardTitle className="text-center text-3xl">Tạo thông tin chiến dịch</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tiêu Đề Chiến Dịch</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tiêu đề chiến dịch" {...field}
                                                    className="rounded-lg"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="campaignType"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>Loại Chiến Dịch</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                                        defaultValue={field.value.toString()}
                                                        className="flex flex-row space-x-4">
                                                        {campaignTypes.map((type) => (
                                                            <FormItem className="flex items-center space-x-3 space-y-0" key={type.value}>
                                                                <FormControl>
                                                                    <RadioGroupItem value={type.value.toString()} />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">
                                                                    {type.label}
                                                                </FormLabel>
                                                            </FormItem>
                                                        ))}
                                                    </RadioGroup>
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
                                                        className="w-2/3"

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
                                name="imagesFolderUrl"
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

                            <div className="flex justify-between">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ngày Bắt Đầu</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    onDateSelect={(date) => field.onChange(date)}
                                                    variant="outline"
                                                    minDate={new Date()}
                                                    className="ml-2"
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
                                        <FormItem className="text-right">
                                            <FormLabel>Ngày Kết Thúc</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    onDateSelect={(date) => field.onChange(date)}
                                                    variant="outline"
                                                    minDate={new Date()}
                                                    className="ml-2"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <h3 className="font-semibold mb-2 text-2xl text-center">Giai Đoạn Giải Ngân</h3>
                            <div className="flex justify-between">
                                <FormField
                                    control={form.control}
                                    name="plannedStartDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ngày Bắt Đầu Dự Kiến Giải Ngân</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    onDateSelect={(date) => field.onChange(date)}
                                                    variant="outline"
                                                    minDate={new Date()}
                                                    className="ml-2"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="plannedEndDate"
                                    render={({ field }) => (
                                        <FormItem className="text-right">
                                            <FormLabel>Ngày Kết Thúc Dự Kiến Giải Ngân</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    date={field.value}
                                                    onDateSelect={(date) => field.onChange(date)}
                                                    variant="outline"
                                                    minDate={new Date()}
                                                    className="ml-2"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <Table className="border-collapse border border-slate-400">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="border border-slate-300 font-semibold">Giải ngân giai đoạn</TableHead>
                                            <TableHead className="border border-slate-300 font-semibold">Số tiền cần giải ngân</TableHead>
                                            <TableHead className="border border-slate-300 font-semibold">Ngày dự kiến giải ngân</TableHead>
                                            <TableHead className="border border-slate-300 font-semibold">Hoạt động giải ngân</TableHead>

                                            <TableHead className="border border-slate-300"></TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {fields.map((field, index) => (
                                            <TableRow key={field.id}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`disbursementStages.${index}.disbursementAmount`}
                                                        render={({ field: { onChange, ...field }, formState }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Số tiền giải ngân"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value.replace(/[^\d]/g, '');
                                                                            onChange(parseFloat(value) || 0);
                                                                        }}
                                                                        className={`${formState.errors.disbursementStages?.[index]?.disbursementAmount
                                                                            ? 'border-red-500'
                                                                            : ''
                                                                            }`}
                                                                    />
                                                                </FormControl>
                                                                {formState.errors.disbursementStages?.[index]?.disbursementAmount && (
                                                                    <FormMessage className="text-xs">
                                                                        {formState.errors.disbursementStages[index].disbursementAmount.message}
                                                                    </FormMessage>
                                                                )}
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className="border border-slate-300">
                                                    <FormField
                                                        control={form.control}
                                                        name={`disbursementStages.${index}.scheduledDate`}
                                                        render={({ field, formState }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <DatePicker
                                                                        date={field.value}
                                                                        onDateSelect={(date) => field.onChange(date)}
                                                                        variant="outline"
                                                                        minDate={form.getValues('plannedStartDate')}
                                                                        maxDate={form.getValues('plannedEndDate')}
                                                                        className={`w-full border-2 p-2 rounded ${formState.errors.disbursementStages?.[index]?.scheduledDate
                                                                            ? 'border-red-500'
                                                                            : 'border-input'
                                                                            }`}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                {formState.errors.disbursementStages?.[index]?.scheduledDate && (
                                                                    <FormMessage className="text-xs">
                                                                        {formState.errors.disbursementStages[index].scheduledDate.message}
                                                                    </FormMessage>
                                                                )}
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`disbursementStages.${index}.activity`}
                                                        render={({ field, formState }) => (
                                                            <FormItem className="space-y-0">
                                                                <FormControl>
                                                                    <Textarea
                                                                        placeholder="Nhập hoạt động giải ngân"
                                                                        className={`min-h-[60px] ${formState.errors.disbursementStages?.[index]?.activity
                                                                            ? 'border-red-500'
                                                                            : ''
                                                                            }`}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                {formState.errors.disbursementStages?.[index]?.activity && (
                                                                    <FormMessage className="text-xs">
                                                                        {formState.errors.disbursementStages[index].activity.message}
                                                                    </FormMessage>
                                                                )}
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {index > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => handleRemove(index)}
                                                            disabled={campaignType === 0 && fields.length <= 2}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {form.formState.errors.disbursementStages && (
                                    <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">
                                        {form.formState.errors.disbursementStages.message}
                                    </div>
                                )}
                            </div>

                            {campaignType === 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const lastStage = fields[fields.length - 1];
                                        const newDate = new Date(lastStage.scheduledDate);
                                        newDate.setDate(newDate.getDate() + 1);
                                        append({
                                            disbursementAmount: 0,
                                            scheduledDate: newDate,
                                            activity: '',
                                        });
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Thêm Giai Đoạn
                                </Button>
                            )}

                            <div className="flex justify-center">
                                <Button
                                    type="submit"
                                    className={`w-1/2 ${isUploading || isCreatingCampaign ? 'bg-gray-400' : 'bg-[#2fabab]'} hover:bg-[#287176] text-white py-2 rounded-lg`}
                                    disabled={isUploading || isCreatingCampaign}
                                >
                                    {(isUploading || isCreatingCampaign) ?
                                        (<div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            {isUploading ? 'Đang Tạo...' : 'Đang Tạo Hồ Sơ...'}
                                        </div>
                                        ) : (
                                            'Tạo Hồ Sơ'
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
