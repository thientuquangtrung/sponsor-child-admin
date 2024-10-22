import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillEditor = ({ value, onChange, className = '' }) => {
    return (
        <ReactQuill
            theme="snow"
            value={value}
            onChange={onChange}
            className={`h-full ${className}`}
            modules={{
                toolbar: [
                    [{ header: '1' }, { header: '2' }, { font: [] }],
                    [{ size: [] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            }}
        />
    );
};

export default QuillEditor;