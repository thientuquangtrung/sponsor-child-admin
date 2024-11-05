import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const ImageAlbum = ({ files }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const imageUrls = files?.split(',').filter(url => url?.trim());

    const handlePrevious = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
        setSelectedImage(imageUrls[currentIndex === 0 ? imageUrls.length - 1 : currentIndex - 1]);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
        setSelectedImage(imageUrls[currentIndex === imageUrls.length - 1 ? 0 : currentIndex + 1]);
    };

    return (
        <>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imageUrls?.map((url, index) => (
                    <div
                        key={index}
                        className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md"
                        onClick={() => {
                            setSelectedImage(url);
                            setCurrentIndex(index);
                        }}
                    >
                        <img
                            src={url}
                            alt={`Volunteer experience ${index + 1}`}
                            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                    </div>
                ))}
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-4xl w-full">
                        <button
                            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {imageUrls.length > 1 && (
                            <button
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
                                onClick={handlePrevious}
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                        )}

                        {imageUrls.length > 1 && (
                            <button
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
                                onClick={handleNext}
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        )}

                        <img
                            src={selectedImage}
                            alt="Selected volunteer experience"
                            className="w-full h-auto rounded-lg"
                        />
                    </div>
                </div>
            )}


        </>
    );
};
export default ImageAlbum;
