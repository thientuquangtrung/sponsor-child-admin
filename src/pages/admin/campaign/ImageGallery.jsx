import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ImageGallery = ({ thumbnailUrl, imagesFolderUrl }) => {
    const [selectedMedia, setSelectedMedia] = useState(thumbnailUrl);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const supportingMedia = imagesFolderUrl ? imagesFolderUrl.split(',') : [];
    const allMedia = [thumbnailUrl, ...supportingMedia];
    const [currentIndex, setCurrentIndex] = useState(0);
    const isVideo = (url) => url.toLowerCase().endsWith('.mp4');
    const handleThumbnailClick = (media, index) => {
        setSelectedMedia(media);
        setCurrentIndex(index);
    };
    const handlePrevious = (e) => {
        if (e) {
            e.stopPropagation();
        }
        const newIndex = (currentIndex - 1 + allMedia.length) % allMedia.length;
        setSelectedMedia(allMedia[newIndex]);
        setCurrentIndex(newIndex);
    };

    const handleNext = (e) => {
        if (e) {
            e.stopPropagation();
        }
        const newIndex = (currentIndex + 1) % allMedia.length;
        setSelectedMedia(allMedia[newIndex]);
        setCurrentIndex(newIndex);
    };

    const openModal = () => {
        setIsModalOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = (e) => {
        if (e) {
            e.stopPropagation();
        }
        setIsModalOpen(false);
        document.body.style.overflow = 'unset';
    };

    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (!isModalOpen) return;

            switch (event.key) {
                case 'ArrowLeft':
                    handlePrevious();
                    break;
                case 'ArrowRight':
                    handleNext();
                    break;
                case 'Escape':
                    closeModal();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, currentIndex]);

    const renderMedia = (src, className = '', onClick = null, autoplay = false) => {
        if (isVideo(src)) {
            return (
                <video
                    src={src}
                    className={className}
                    onClick={onClick}
                    controls
                    autoPlay={autoplay}
                    playsInline
                >
                    Your browser does not support the video tag.
                </video>
            );
        }
        return (
            <img
                src={src}
                alt="Media content"
                className={className}
                onClick={onClick}
            />
        );
    };

    return (
        <>
            <div className="w-full space-y-4">
                <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                    {renderMedia(
                        selectedMedia,
                        "w-full h-full object-cover cursor-pointer",
                        openModal
                    )}

                    {allMedia.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>

                {supportingMedia.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        <div
                            onClick={() => handleThumbnailClick(thumbnailUrl, 0)}
                            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all
                ${selectedMedia === thumbnailUrl ? 'ring-2 ring-teal-500' : 'hover:opacity-80'}`}
                        >
                            <img
                                src={thumbnailUrl}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {supportingMedia.map((media, index) => (
                            <div
                                key={media}
                                onClick={() => handleThumbnailClick(media, index + 1)}
                                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all
                  ${selectedMedia === media ? 'ring-2 ring-teal-500' : 'hover:opacity-80'}`}
                            >
                                {isVideo(media) ? (
                                    <video
                                        src={media}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={media}
                                        alt={`Supporting media ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
                    onClick={closeModal}
                >
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-[10000]"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                        {renderMedia(
                            selectedMedia,
                            "max-h-[90vh] max-w-[90vw] object-contain",
                            e => e.stopPropagation(),
                            true
                        )}
                        {allMedia.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrevious();
                                    }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-[10000]"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNext();
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-[10000]"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ImageGallery;