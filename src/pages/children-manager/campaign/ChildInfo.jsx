import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload } from 'lucide-react';
import CustomDropzone from '@/pages/children-manager/campaign/CustomDropzone';
import { YearPicker } from '@/components/ui/year-picker';

const ChildInfo = ({ form, provinces, districts, wards, handleProvinceChange, handleDistrictChange, handleWardChange, childFile, onDropChildFile, removeChildFile }) => {
    return (
        <>
            <h2 className="text-xl font-semibold">Thông Tin Trẻ Em</h2>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="childName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tên Trẻ</FormLabel>
                            <FormControl>
                                <Input placeholder="Nhập tên trẻ" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="childBirthYear"
                    render={({ field }) => (
                        <FormItem >
                            <FormLabel>Năm Sinh</FormLabel>
                            <FormControl>
                                <YearPicker
                                    date={field.value ? new Date(field.value, 0, 1) : undefined}
                                    onYearSelect={(date) => field.onChange(date.getFullYear())}
                                    fromYear={new Date().getFullYear() - 16}
                                    toYear={new Date().getFullYear()}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="childLocation"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Địa Chỉ</FormLabel>
                        <FormControl>
                            <Input placeholder="Nhập địa chỉ của trẻ" {...field} />
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
                            <FormLabel>Tỉnh/Thành phố</FormLabel>
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
                            <FormLabel>Quận/Huyện</FormLabel>
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
                            <FormLabel>Phường/Xã</FormLabel>
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
                name="childIdentificationInformationFile"
                render={() => (
                    <FormItem>
                        <FormLabel>Thông tin định danh trẻ em</FormLabel>
                        <FormControl>
                            <CustomDropzone onDrop={onDropChildFile} dropzoneType="documentAndImage"
                            >
                                {childFile ? (
                                    <div className="flex justify-center items-center w-full py-4">
                                        <div className="relative flex items-center justify-center bg-gray-100 rounded-lg p-4">
                                            <div className="text-center">
                                                <p className="text-gray-700 font-medium">File đã chọn:</p>
                                                <p className="text-gray-500">{childFile.name}</p>
                                                <p className="text-gray-500">({(childFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeChildFile();
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
            <FormField
                control={form.control}
                name="childIdentificationCode"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mã Định Danh Trẻ Em (Không bắt buộc)</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="Nhập mã định danh của trẻ hoặc mã khai sinh"
                                {...field}
                                value={field.value || ''}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    );
};

export default ChildInfo;