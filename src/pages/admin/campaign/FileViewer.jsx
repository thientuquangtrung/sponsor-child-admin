import React, { useState } from 'react';
import { FileText, Image, File, Maximize2, Minimize2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FileViewer = ({ fileUrl }) => {
    const [isFullView, setIsFullView] = useState(false);
    const [displayMode, setDisplayMode] = useState('cover');

    const getFileExtension = (url) => {
        return url.split('.').pop().toLowerCase();
    };

    const isImageFile = (extension) => {
        return ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
    };

    const isPdfFile = (extension) => {
        return extension === 'pdf';
    };

    const isDocFile = (extension) => {
        return ['doc', 'docx'].includes(extension);
    };

    const getFileIcon = (extension) => {
        if (isImageFile(extension)) return <Image className="w-12 h-12 text-teal-600" />;
        if (isPdfFile(extension)) return <FileText className="w-12 h-12 text-rose-300" />;
        if (isDocFile(extension)) return <FileText className="w-12 h-12 text-blue-600" />;
        return <File className="w-12 h-12 text-gray-600" />;
    };

    const toggleDisplayMode = () => {
        setDisplayMode(prev => prev === 'cover' ? 'contain' : 'cover');
    };

    const toggleFullView = () => {
        setIsFullView(prev => !prev);
    };

    const extension = getFileExtension(fileUrl);

    const imageContainer = isFullView
        ? "fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
        : "w-full h-[400px] relative rounded-lg overflow-hidden border-4 border-teal-600";

    const imageStyle = isFullView
        ? "max-w-full max-h-full"
        : `w-full h-full object-${displayMode}`;

    return (
        <div className="w-full flex justify-center">
            <div className={isFullView ? "w-full h-full" : "max-w-2xl w-full"}>
                {isImageFile(extension) ? (
                    <div className={imageContainer}>
                        <img
                            src={fileUrl}
                            alt="Child Identification"
                            className={imageStyle}
                        />
                        <div className="absolute top-4 right-4 space-x-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={toggleDisplayMode}
                                className="bg-white/10 hover:bg-white/20 text-white"
                            >
                                {displayMode === 'cover' ? 'Thu vừa' : 'Hiển thị đầy đủ'}
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={toggleFullView}
                                className="bg-white/10 hover:bg-white/20 text-white"
                            >
                                {isFullView ? (
                                    <Minimize2 className="w-4 h-4" />
                                ) : (
                                    <Maximize2 className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        {isFullView && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={toggleFullView}
                                className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white"
                            >
                                Đóng
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="w-full p-6 rounded-lg border-2 border-dashed border-gray-300 bg-white">
                        <div className="flex flex-col items-center space-y-4">
                            {getFileIcon(extension)}
                            <div className="text-center">
                                <p className="text-lg font-medium text-gray-900">
                                    Tập tin định danh trẻ em
                                </p>
                                <p className="text-sm text-gray-500">
                                    {extension.toUpperCase()} file
                                </p>
                            </div>
                            <Button
                                className="bg-teal-600 hover:bg-teal-700 text-white"
                                onClick={() => window.open(fileUrl, '_blank')}
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem tập tin
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileViewer;