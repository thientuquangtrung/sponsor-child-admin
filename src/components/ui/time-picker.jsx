import React, { useState } from 'react';
import { Clock } from 'lucide-react'; // Import icon từ lucide-react
import Modal from 'react-modal';
// Đảm bảo bạn gọi Modal.setAppElement cho accessibility
Modal.setAppElement('#root');
const TimePicker = ({ value, onChange, className }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [time, setTime] = useState(value || { hours: '00', minutes: '00' });
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const handleTimeChange = (type, val) => {
        const updatedTime = { ...time, [type]: val };
        setTime(updatedTime);
        onChange(updatedTime);
    };
    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            {/* Icon để mở modal chọn giờ */}
            <button onClick={openModal} className="flex items-center space-x-1 border p-2 rounded-lg">
                <Clock className="w-5 h-5" />
                <span>{`${time.hours}:${time.minutes}`}</span>
            </button>
            {/* Modal để chọn giờ và phút */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Select Time"
                className="modal-content"
                overlayClassName="modal-overlay"
            >
                <div className="flex flex-col space-y-4">
                    <h2 className="text-lg font-semibold">Chọn giờ</h2>
                    {/* Chọn giờ */}
                    <div className="flex space-x-4">
                        {[...Array(24)].map((_, index) => {
                            const hour = String(index).padStart(2, '0');
                            return (
                                <button
                                    key={hour}
                                    onClick={() => handleTimeChange('hours', hour)}
                                    className="px-4 py-2 border rounded-lg hover:bg-teal-500 hover:text-white"
                                >
                                    {hour}
                                </button>
                            );
                        })}
                    </div>
                    <h2 className="text-lg font-semibold">Chọn phút</h2>
                    {/* Chọn phút */}
                    <div className="flex space-x-4">
                        {[...Array(60)].map((_, index) => {
                            const minute = String(index).padStart(2, '0');
                            return (
                                <button
                                    key={minute}
                                    onClick={() => handleTimeChange('minutes', minute)}
                                    className="px-4 py-2 border rounded-lg hover:bg-teal-500 hover:text-white"
                                >
                                    {minute}
                                </button>
                            );
                        })}
                    </div>
                    {/* Close Modal */}
                    <div className="mt-4 text-center">
                        <button
                            onClick={closeModal}
                            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
export default TimePicker;