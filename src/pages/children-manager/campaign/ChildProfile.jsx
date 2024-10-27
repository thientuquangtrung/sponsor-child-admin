import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSelector } from 'react-redux';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateChildProfileMutation } from '@/redux/childProfile/childProfileApi';
import { useDropzone } from 'react-dropzone';
import { Loader, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import useLocationVN from '@/hooks/useLocationVN';

const schema = z.object({
    name: z.string().min(1, "Vui lòng nhập tên trẻ."),
    age: z.number({ invalid_type_error: "Vui lòng nhập tuổi của trẻ" }).int().nonnegative("Tuổi phải là số không âm.").max(16, "Tuổi của trẻ phải nhỏ hơn 17."),

    gender: z.number().min(0).max(1),
    location: z.string().min(1, "Vui lòng nhập địa chỉ trẻ."),
    identificationInformationFile: z
        .any()
        .refine((val) => val !== null, "Vui lòng tải thông tin định danh trẻ")
        .refine((val) => val && val.size <= 10 * 1024 * 1024, "Kích thước tệp không được vượt quá 10MB"),
    provinceId: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
    districtId: z.string().min(1, "Vui lòng chọn quận/huyện"),
    wardId: z.string().min(1, "Vui lòng chọn phường/xã"),
});

const useCustomDropzone = (onDrop) => {
    return useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        multiple: false
    });
};

const CustomDropzone = ({ onDrop, children }) => {
    const { getRootProps, getInputProps } = useCustomDropzone(onDrop);
    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {children}
        </div>
    );
};

const ChildProfile = ({ nextStep, onSuccess }) => {
    const { user } = useSelector((state) => state.auth);
    const [createChildProfile, { isLoading: isCreatingChildProfile }] = useCreateChildProfileMutation();
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const {
        provinces,
        districts,
        wards,
        setSelectedProvince,
        setSelectedDistrict,
        setSelectedWard,
    } = useLocationVN();

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            age: 0,
            gender: 0,
            location: "",
            identificationInformationFile: null,
            provinceId: "",
            districtId: "",
            wardId: ""
        },
    });

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET_NAME);
        formData.append('folder', `user_${user.userID}/child_profiles`);

        try {
            setIsUploading(true);
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

            const data = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setFile(file);
        form.setValue('identificationInformationFile', file);
        form.clearErrors('identificationInformationFile');
    }, [form]);

    const removeFile = () => {
        setFile(null);
        form.setValue('identificationInformationFile', null);
    };

    const onSubmit = async (data) => {
        try {
            const fileUrl = await uploadToCloudinary(data.identificationInformationFile);

            const province = provinces.find(p => p.id === data.provinceId)?.name || '';
            const district = districts.find(d => d.id === data.districtId)?.name || '';
            const ward = wards.find(w => w.id === data.wardId)?.name || '';

            const childProfileData = {
                name: data.name,
                age: Number(data.age),
                gender: Number(data.gender),
                location: data.location,
                identificationInformationFile: fileUrl,
                ward: ward,
                district: district,
                province: province
            };

            const result = await createChildProfile(childProfileData).unwrap();

            if (result) {
                toast.success('Hồ sơ trẻ em đã được tạo thành công!');
                onSuccess(result.childProfile.childID);
                nextStep();
            }
        } catch (error) {
            console.error("Lỗi khi tạo hồ sơ trẻ em:", error);
            toast.error(error.data?.message || 'Không thể tạo hồ sơ trẻ em. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleProvinceChange = (provinceId) => {
        const province = provinces.find(p => p.id === provinceId);
        setSelectedProvince(province);
        form.setValue('provinceId', provinceId);
        form.setValue('districtId', '');
        form.setValue('wardId', '');
        form.trigger('provinceId');

    };

    const handleDistrictChange = (districtId) => {
        const district = districts.find(d => d.id === districtId);
        setSelectedDistrict(district);
        form.setValue('districtId', districtId);
        form.setValue('wardId', '');
        form.trigger('districtId');

    };

    const handleWardChange = (wardId) => {
        const ward = wards.find(w => w.id === wardId);
        setSelectedWard(ward);
        form.setValue('wardId', wardId);
        form.trigger('wardId');

    };

    return (
        <div className="bg-white p-8 shadow-md w-full max-w-7xl mx-auto rounded-lg border-2">
            <h2 className="text-2xl font-bold text-center mb-6">Thông Tin Trẻ Em</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mx-32">
                    <div className="flex space-x-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="text-lg">Tên</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nhập tên trẻ" {...field} className="border-gray-300 rounded-lg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="age"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel className="text-lg">Tuổi</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="16"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '') {
                                                    field.onChange('');
                                                } else {
                                                    const numValue = parseInt(value, 10);
                                                    field.onChange(numValue >= 0 && numValue <= 16 ? numValue : 16);
                                                }
                                            }}
                                            onBlur={() => {
                                                if (field.value > 16) {
                                                    field.onChange(16);
                                                }
                                            }}
                                            className="border-gray-300 rounded-lg w-1/5"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-lg">Địa chỉ</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nhập số nhà, tên đường" {...field} className="border-gray-300 rounded-lg" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="provinceId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Tỉnh/Thành phố</FormLabel>
                                    <Select onValueChange={handleProvinceChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn tỉnh/thành phố" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {provinces.map((province) => (
                                                <SelectItem key={province.id} value={province.id}>
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
                            name="districtId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Quận/Huyện</FormLabel>
                                    <Select onValueChange={handleDistrictChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn quận/huyện" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {districts.map((district) => (
                                                <SelectItem key={district.id} value={district.id}>
                                                    {district.name}
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
                            name="wardId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-lg">Phường/Xã</FormLabel>
                                    <Select onValueChange={handleWardChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn phường/xã" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {wards.map((ward) => (
                                                <SelectItem key={ward.id} value={ward.id}>
                                                    {ward.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="identificationInformationFile"
                        render={() => (
                            <FormItem>
                                <FormLabel className="text-lg">Thông tin định danh trẻ em</FormLabel>
                                <FormControl>
                                    <CustomDropzone onDrop={onDrop}>
                                        {file ? (
                                            <div className="flex justify-center items-center w-full py-4">
                                                <div className="relative flex items-center justify-center bg-gray-100 rounded-lg p-4">
                                                    <div className="text-center">
                                                        <p className="text-gray-700 font-medium">File đã chọn:</p>
                                                        <p className="text-gray-500">{file.name}</p>
                                                        <p className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeFile();
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
                                                <p>Kéo và thả file vào đây, hoặc click để chọn</p>
                                            </div>
                                        )}
                                    </CustomDropzone>
                                </FormControl>
                                <FormDescription>
                                    Chấp nhận các định dạng: PDF, DOC, DOCX, JPEG, PNG
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            className={`w-1/2 ${(isUploading || isCreatingChildProfile) ? 'bg-gray-400' : 'bg-[#2fabab]'} hover:bg-[#287176] text-white py-2 rounded-lg`}
                            disabled={isUploading || isCreatingChildProfile}
                        >
                            {(isUploading || isCreatingChildProfile) ? (
                                <div className="flex items-center gap-2">
                                    <Loader className="animate-spin" size={18} />
                                    {isUploading ? 'Đang Tải File...' : 'Đang Tạo Hồ Sơ...'}
                                </div>
                            ) : (
                                'Tạo Hồ Sơ'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ChildProfile;