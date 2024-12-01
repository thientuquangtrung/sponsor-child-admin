import React from 'react';
import { useDropzone } from 'react-dropzone';

const imageOnlyTypes = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/bmp': ['.bmp'],
    'image/webp': ['.webp']
};
const documentAndImageTypes = {
    'image/*': ['.jpeg', '.jpg', '.png'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
};

const imageAndVideoTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp'],
    'video/*': ['.mp4', '.avi', '.mov']
};

export const useCustomFileDropzone = (onDrop, isMultiple = false, acceptedTypes = imageAndVideoTypes) => {
    return useDropzone({
        onDrop,
        accept: acceptedTypes,
        multiple: isMultiple
    });
};

export const useImageOnlyDropzone = (onDrop, isMultiple = false) => {
    return useDropzone({
        onDrop,
        accept: imageOnlyTypes,
        multiple: isMultiple
    });
};

export const useDocumentAndImageDropzone = (onDrop, isMultiple = false) => {
    return useDropzone({
        onDrop,
        accept: documentAndImageTypes,
        multiple: isMultiple
    });
};

export const CustomDropzone = ({ onDrop, multiple, children, dropzoneType = 'default' }) => {
    let dropzoneHook;

    switch (dropzoneType) {
        case 'imageOnly':
            dropzoneHook = useImageOnlyDropzone(onDrop, multiple);
            break;
        case 'documentAndImage':
            dropzoneHook = useDocumentAndImageDropzone(onDrop, multiple);
            break;
        default:
            dropzoneHook = useCustomFileDropzone(onDrop, multiple);
    }

    const { getRootProps, getInputProps } = dropzoneHook;

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {children}
        </div>
    );
};

export default CustomDropzone;