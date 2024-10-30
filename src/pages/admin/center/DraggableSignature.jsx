import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { PDFDocument } from 'pdf-lib';
import { Button } from "@/components/ui/button";
import { Save, X } from 'lucide-react';

const DraggableSignature = ({ pdfDocument, onSaveSignature }) => {
    const [adminSignature, setAdminSignature] = useState(null);
    const [position, setPosition] = useState({ x: 50, y: 190 });
    const sigCanvas = useRef();

    const handleClear = () => {
        sigCanvas.current.clear();
        setAdminSignature(null);
        setPosition({ x: 50, y: 190 });
    };

    const handleSave = async () => {
        if (sigCanvas.current.isEmpty()) {
            return;
        }

        const signatureDataUrl = sigCanvas.current.toDataURL();
        setAdminSignature(signatureDataUrl);

        try {
            const signedPdfBytes = await embedSignature(signatureDataUrl, {
                x: position.x,
                y: position.y,
                scaleFactor: 0.3,
                pageNumber: 0
            });
            onSaveSignature(signedPdfBytes);
        } catch (error) {
            console.error('Error saving signature:', error);
        }
    };

    const embedSignature = async (signatureDataUrl, config = {}) => {
        if (!signatureDataUrl || !pdfDocument) return;

        try {
            const pages = pdfDocument.getPages();
            const { x, y, scaleFactor = 0.3, pageNumber = 0 } = config;

            if (pageNumber < 0 || pageNumber >= pages.length) {
                throw new Error('Invalid page number');
            }

            const targetPage = pages[pageNumber];
            const pngImage = await pdfDocument.embedPng(signatureDataUrl);

            targetPage.drawImage(pngImage, {
                x,
                y,
                width: pngImage.width * scaleFactor,
                height: pngImage.height * scaleFactor,
            });

            return await pdfDocument.save();
        } catch (error) {
            console.error('Error embedding signature:', error);
            throw error;
        }
    };

    const onDrag = (e, ui) => {
        setPosition({ x: ui.x, y: ui.y });
    };

    return (
        <div>
            <div className="mb-4">
                <h3 className="font-semibold mb-2">Chữ ký Admin</h3>
                <div className="border-2 border-gray-300 rounded-lg mb-2 bg-white">
                    <Draggable
                        onDrag={onDrag}
                        position={position}
                        bounds="parent"
                    >
                        <div>
                            <SignatureCanvas
                                ref={sigCanvas}
                                canvasProps={{ width: 300, height: 150, className: 'signature-canvas' }}
                            />
                        </div>
                    </Draggable>
                </div>
                <div className="flex space-x-2 mb-4">
                    <Button
                        onClick={handleClear}
                        variant="outline"
                        className="border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                        <X className="h-4 w-4 mr-2" /> Xóa
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="outline"
                        className="border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                        <Save className="h-4 w-4 mr-2" /> Lưu chữ ký
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DraggableSignature;