import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ImageGallery = ({ thumbnailUrl, imagesFolderUrl }) => {
    const [selectedImage, setSelectedImage] = useState(thumbnailUrl);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const supportingImages = imagesFolderUrl ? imagesFolderUrl.split(',') : [];
    const allImages = [thumbnailUrl, ...supportingImages];

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleThumbnailClick = (image, index) => {
        setSelectedImage(image);
        setCurrentIndex(index);
    };

    const handlePrevious = (e) => {
        if (e) {
            e.stopPropagation();
        }
        const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
        setSelectedImage(allImages[newIndex]);
        setCurrentIndex(newIndex);
    };

    const handleNext = (e) => {
        if (e) {
            e.stopPropagation();
        }
        const newIndex = (currentIndex + 1) % allImages.length;
        setSelectedImage(allImages[newIndex]);
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

    return (
        <>
            <div className="w-full space-y-4">
                <div className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                    <img
                        src={selectedImage}
                        alt="Main campaign"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={openModal}
                    />

                    {allImages.length > 1 && (
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

                {supportingImages.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        <div
                            onClick={() => handleThumbnailClick(thumbnailUrl, 0)}
                            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all
                ${selectedImage === thumbnailUrl ? 'ring-2 ring-teal-500' : 'hover:opacity-80'}`}
                        >
                            <img
                                src={thumbnailUrl}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {supportingImages.map((image, index) => (
                            <div
                                key={image}
                                onClick={() => handleThumbnailClick(image, index + 1)}
                                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer transition-all
                  ${selectedImage === image ? 'ring-2 ring-teal-500' : 'hover:opacity-80'}`}
                            >
                                <img
                                    src={image}
                                    alt={`Supporting image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
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
                        <img
                            src={selectedImage}
                            alt="Fullscreen view"
                            className="max-h-[90vh] max-w-[90vw] object-contain"
                            onClick={e => e.stopPropagation()}
                        />

                        {allImages.length > 1 && (
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