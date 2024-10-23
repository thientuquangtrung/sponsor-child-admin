import React, { useState, useCallback, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Upload, X, Plus, Trash2 } from 'lucide-react';
import QuillEditor from '@/pages/admin/campaign/QuillEditor';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import { useCreateCampaignMutation } from '@/redux/campaign/campaignApi';
import { campaignTypes } from '@/config/combobox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';

const addCampaignSchema = z.object({
    title: z.string().min(1, "Bạn vui lòng nhập Tiêu Đề chiến dịch"),
    story: z.string().min(1, "Bạn vui lòng nhập thông tin chi tiết về chiến dịch"),
    targetAmount: z.string().min(1, "Bạn vui lòng nhập số tiền mục tiêu lớn hơn 0"),
    startDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
    }),
    endDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc",
    }).nullable(),
    thumbnailUrl: z.any().refine((val) => val !== null, "Bạn vui lòng tải lên hình ảnh cho chiến dịch"),
    imagesFolderUrl: z.array(z.any()).optional(),
    campaignType: z.number({
        required_error: "Vui lòng chọn loại chiến dịch",
    }), plannedStartDate: z.date({
        required_error: "Vui lòng chọn ngày bắt đầu dự kiến",
    }),
    plannedEndDate: z.date({
        required_error: "Vui lòng chọn ngày kết thúc dự kiến",
    }),
    disbursementStages: z.array(z.object({
        disbursementAmount: z.number().min(1, "Số tiền phải lớn hơn 0"),
        scheduledDate: z.date({
            required_error: "Vui lòng chọn ngày giải ngân",
        }),
        activity: z.string().min(1, "Vui lòng nhập hoạt động giải ngân"),
    }))
}).refine((data) => data.plannedEndDate > data.plannedStartDate, {
    message: "Ngày kết thúc dự kiến phải sau ngày bắt đầu dự kiến",
    path: ["plannedEndDate"],
}).refine((data) => data.plannedStartDate > data.endDate, {
    message: "Ngày bắt đầu dự kiến phải sau ngày kết thúc chiến dịch",
    path: ["plannedStartDate"],
}).refine((data) => data.endDate > data.startDate, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["endDate"],
}).refine((data) => {
    const targetAmount = parseFloat(data.targetAmount.replace(/,/g, ''));
    const totalDisbursement = data.disbursementStages.reduce((sum, stage) => sum + stage.disbursementAmount, 0);
    return totalDisbursement <= targetAmount;
}, {
    message: "Tổng số tiền giải ngân không được vượt quá số tiền mục tiêu",
    path: ["disbursementStages"]
}).refine((data) => {
    const targetAmount = parseFloat(data.targetAmount.replace(/,/g, ''));
    return data.disbursementStages.every(stage => stage.disbursementAmount <= targetAmount * 0.4);
}, {
    message: "Mỗi giai đoạn giải ngân không được vượt quá 40% số tiền mục tiêu",
    path: ["disbursementStages"]
}).refine((data) => {
    for (let i = 1; i < data.disbursementStages.length; i++) {
        if (data.disbursementStages[i].scheduledDate <= data.disbursementStages[i - 1].scheduledDate) {
            return false;
        }
    }
    return true;
}, {
    message: "Ngày giải ngân của giai đoạn sau phải lớn hơn giai đoạn trước",
    path: ["disbursementStages"]
}).refine((data) => {
    return data.disbursementStages.every(stage =>
        stage.scheduledDate >= data.plannedStartDate && stage.scheduledDate <= data.plannedEndDate
    );
}, {
    message: "Ngày giải ngân phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc dự kiến",
    path: ["disbursementStages"]
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
    const [thumbnail, setThumbnail] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const [createCampaign, { isLoading: isCreatingCampaign }] = useCreateCampaignMutation();

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
            disbursementStages: [{
                disbursementAmount: 0,
                scheduledDate: new Date(),
                activity: ''
            }]
        }
    });



    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "disbursementStages"
    });
    useEffect(() => {
        const plannedStartDate = form.getValues('plannedStartDate');
        form.setValue('disbursementStages.0.scheduledDate', plannedStartDate);
    }, [form]);
    const uploadToCloudinary = async (file, folder) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET_NAME);
        formData.append('folder', folder);
        try {
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
                guaranteeID: user.userID,
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
        } catch (error) {
            console.error('failed:', error);
            toast.error('Đã xảy ra lỗi! Vui lòng thử lại.');
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
                                name="campaignType"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Loại Chiến Dịch</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={(value) => field.onChange(parseInt(value))}
                                                defaultValue={field.value.toString()}
                                                className="flex flex-col space-y-1"
                                            >
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

                            <div className="flex justify-between">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ngày Bắt Đầu</FormLabel>
                                            <FormControl>
                                                <DatePicker
                                                    selected={field.value}
                                                    onChange={(date) => field.onChange(date)}
                                                    dateFormat="dd/MM/yyyy"
                                                    className="ml-10 w-3/4 border-2 border-input p-2 rounded"
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
                                                    selected={field.value}
                                                    onChange={(date) => field.onChange(date)}
                                                    dateFormat="dd/MM/yyyy"
                                                    className="w-3/4 border-2 border-input p-2 rounded"
                                                    placeholderText="Chọn ngày kết thúc"
                                                    isClearable
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
                                                    selected={field.value}
                                                    onChange={(date) => field.onChange(date)}
                                                    dateFormat="dd/MM/yyyy"
                                                    className="ml-10 w-3/4 border-2 border-input p-2 rounded"
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
                                                    selected={field.value}
                                                    onChange={(date) => field.onChange(date)}
                                                    dateFormat="dd/MM/yyyy"
                                                    className="w-3/4 border-2 border-input p-2 rounded"
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
                                                <TableCell className="border border-slate-300">{index + 1}</TableCell>
                                                <TableCell className="border border-slate-300">
                                                    <FormField
                                                        control={form.control}
                                                        name={`disbursementStages.${index}.disbursementAmount`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="text"
                                                                        placeholder="Số tiền giải ngân"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            const value = e.target.value.replace(/[^\d]/g, '');
                                                                            field.onChange(parseFloat(value) || 0);
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <TableCell className="border border-slate-300">
                                                    <FormField
                                                        control={form.control}
                                                        name={`disbursementStages.${index}.scheduledDate`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <DatePicker
                                                                            selected={field.value}
                                                                            onChange={(date) => field.onChange(date)}
                                                                            dateFormat="dd/MM/yyyy"
                                                                            minDate={form.getValues('plannedStartDate')}
                                                                            maxDate={form.getValues('plannedEndDate')}
                                                                            className="w-full border-2 border-input p-2 rounded"
                                                                            popperPlacement="bottom-start"
                                                                            popperModifiers={[
                                                                                {
                                                                                    name: 'offset',
                                                                                    options: {
                                                                                        offset: [0, 8],
                                                                                    },
                                                                                },
                                                                                {
                                                                                    name: 'preventOverflow',
                                                                                    options: {
                                                                                        rootBoundary: 'viewport',
                                                                                        tether: false,
                                                                                        altAxis: true,
                                                                                    },
                                                                                },
                                                                            ]}
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </TableCell>
                                                <FormField
                                                    control={form.control}
                                                    name={`disbursementStages.${index}.activity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Nhập hoạt động giải ngân"
                                                                    className="min-h-[60px]"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <TableCell className="border border-slate-300">
                                                    {index > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="icon"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

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
                                        activity: ''
                                    });
                                }}
                            >
                                <Plus className="mr-2 h-4 w-4" /> Thêm Giai Đoạn
                            </Button>



                            <div className="flex justify-center">
                                <Button
                                    type="submit"
                                    className={`w-1/2 ${isCreatingCampaign ? 'bg-gray-400' : 'bg-[#2fabab]'} hover:bg-[#287176] text-white py-2 rounded-lg`}
                                    disabled={isCreatingCampaign}
                                >
                                    {isCreatingCampaign ? 'Đang Tạo Chiến Dịch...' : 'Tạo Chiến Dịch'}
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
