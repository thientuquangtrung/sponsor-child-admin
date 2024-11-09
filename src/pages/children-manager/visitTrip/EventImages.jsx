import React from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const EventImages = ({
    form,
    thumbnail,
    imagesFolderUrl = [],
    onDropThumbnail,
    onDropImagesFolder,
    removeThumbnail,
    removeImageFolder
}) => {
    const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
        onDrop: onDropThumbnail,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
        },
        maxFiles: 1,
    });

    const { getRootProps: getImagesRootProps, getInputProps: getImagesInputProps } = useDropzone({
        onDrop: onDropImagesFolder,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
        },
        multiple: true,
    });

    return (
        <div className="space-y-6">
            <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ảnh đại diện</FormLabel>
                        <FormControl>
                            <div className="space-y-4">
                                <div
                                    {...getThumbnailRootProps()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                >
                                    <input {...getThumbnailInputProps()} />
                                    {!thumbnail ? (
                                        <div className="space-y-2">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="text-sm text-gray-600">Kéo và thả hoặc nhấp để tải lên ảnh</p>
                                        </div>
                                    ) : (
                                        <div className="flex justify-center items-center w-full py-4">
                                            <div className="relative">
                                                <img
                                                    src={thumbnail.preview}
                                                    alt="Thumbnail preview"
                                                    className="w-48 h-48 object-cover rounded-lg"
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
                                    )}
                                </div>
                                <FormMessage />
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="imagesFolderUrl"
                render={() => (
                    <FormItem>
                        <FormLabel>Ảnh phụ</FormLabel>
                        <FormControl>
                            <div className="space-y-4">
                                <div
                                    {...getImagesRootProps()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                                >
                                    <input {...getImagesInputProps()} />
                                    <div className="space-y-2">
                                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="text-sm text-gray-600">
                                            Kéo và thả hoặc nhấp để tải lên nhiều ảnh
                                        </p>
                                    </div>
                                </div>
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