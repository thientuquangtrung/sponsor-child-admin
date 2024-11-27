import React from 'react';
import { useDropzone } from 'react-dropzone';

export const useCustomFileDropzone = (onDrop, isMultiple = false, acceptedTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
    'video/*': ['.mp4', '.avi', '.mov']
}) => {
    return useDropzone({
        onDrop,
        accept: acceptedTypes,
        multiple: isMultiple
    });
};

export const CustomDropzone = ({ onDrop, multiple, children, acceptedTypes }) => {
    const { getRootProps, getInputProps } = useCustomFileDropzone(onDrop, multiple, acceptedTypes);
    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {children}
        </div>
    );
};

export default CustomDropzone;