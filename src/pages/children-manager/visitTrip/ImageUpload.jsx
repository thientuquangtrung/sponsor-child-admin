import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useDropzone } from 'react-dropzone';
import { Image, X } from 'lucide-react';
import { cn } from "@/lib/utils";

const EventImages = ({
    form,
    thumbnail,
    imagesFolderUrl,
    onDropThumbnail,
    onDropImagesFolder,
    removeThumbnail,
    removeImageFolder
}) => {
    const thumbnailDropzone = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        maxFiles: 1,
        onDrop: onDropThumbnail
    });

    const imagesDropzone = useDropzone({
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        onDrop: onDropImagesFolder
    });

    return (
        <div className="space-y-6">
            {/* Thumbnail Upload */}
            <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ảnh chính</FormLabel>
                        <FormControl>
                            <div>
                                <div
                                    {...thumbnailDropzone.getRootProps()}
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                                        thumbnailDropzone.isDragActive
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300 hover:border-blue-500"
                                    )}
                                >
                                    <input {...field} {...thumbnailDropzone.getInputProps()} />
                                    {thumbnail ? (
                                        <div className="relative">
                                            <img
                                                src={thumbnail.preview}
                                                alt="Thumbnail preview"
                                                className="max-h-48 mx-auto"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeThumbnail();
                                                }}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Image className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="text-gray-600">
                                                Kéo thả hoặc click để tải ảnh lên
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                PNG, JPG, WEBP (tối đa 5MB)
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <FormMessage />
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />

            {/* Additional Images Upload */}
            <FormField
                control={form.control}
                name="imagesFolderUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ảnh phụ</FormLabel>
                        <FormControl>
                            <div>
                                <div
                                    {...imagesDropzone.getRootProps()}
                                    className={cn(
                                        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                                        imagesDropzone.isDragActive
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-300 hover:border-blue-500"
                                    )}
                                >
                                    <input {...field} {...imagesDropzone.getInputProps()} />
                                    <div className="space-y-2">
                                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="text-gray-600">
                                            Kéo thả hoặc click để tải ảnh lên
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            PNG, JPG, WEBP (tối đa 5MB mỗi ảnh)
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Grid */}
                                {imagesFolderUrl.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                                        {imagesFolderUrl.map((file, index) => (
                                            <div key={file.name} className="relative">
                                                <img
                                                    src={file.preview}
                                                    alt={`Preview ${index}`}
                                                    className="w-full h-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImageFolder(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <FormMessage />
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />
        </div>
    );
};

export default EventImages;