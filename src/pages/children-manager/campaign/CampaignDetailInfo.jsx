import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Upload, X } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from '@/components/ui/date-picker';
import { campaignTypes } from '@/config/combobox';
import { useCustomFileDropzone } from '@/pages/children-manager/campaign/CustomDropzone';
import QuillEditor from '@/pages/admin/campaign/QuillEditor';
import { formatDateForServer, setLocalDateWithoutTime } from '@/lib/utils';


const CustomDropzone = ({ onDrop, multiple, children }) => {
    const { getRootProps, getInputProps } = useCustomFileDropzone(onDrop, multiple);
    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {children}
        </div>
    );
};

const CampaignDetailInfo = ({
    form,
    thumbnail,
    onDropThumbnail,
    removeThumbnail,
    imagesFolderUrl,
    onDropImagesFolder,
    removeImageFolder,
    formatNumber
}) => {

    return (
        <>
            <h2 className="text-xl font-semibold">Thông Tin Chiến Dịch</h2>

            <div className="grid grid-cols-1 gap-6">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tiêu Đề</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Nhập tiêu đề chiến dịch"
                                    {...field}
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
                        <FormLabel>Ảnh/Video Phụ (Không bắt buộc)</FormLabel>
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
                            Tải lên một hoặc nhiều ảnh/video phụ cho chiến dịch của bạn (JPEG, PNG, GIF, BMP, WebP, MP4, AVI, MOV)
                        </FormDescription>
                    </FormItem>
                )}
            />

            {imagesFolderUrl.length > 0 && (
                <div className="mt-4 border rounded-lg p-4">
                    <div className="grid grid-cols-7 gap-4">
                        {imagesFolderUrl.map((file, index) => (
                            <div key={index} className="relative aspect-square">
                                {file.type.startsWith('video/') ? (
                                    <video
                                        src={file.preview}
                                        alt={`Upload ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                        controls
                                    />
                                ) : (
                                    <img
                                        src={file.preview}
                                        alt={`Upload ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                )}
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
                                    date={setLocalDateWithoutTime(field.value)}
                                    onDateSelect={(date) => {
                                        const formattedDate = formatDateForServer(date);
                                        field.onChange(new Date(formattedDate));
                                    }}
                                    variant="outline"
                                    disablePastDates={true}
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
                                    date={setLocalDateWithoutTime(field.value)}
                                    onDateSelect={(date) => {
                                        const formattedDate = formatDateForServer(date);
                                        field.onChange(new Date(formattedDate));
                                    }}
                                    variant="outline"
                                    disablePastDates={true}
                                    className="ml-2"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </>
    );
};

export default CampaignDetailInfo;