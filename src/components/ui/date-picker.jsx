import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const DatePicker = React.forwardRef(({ className, date, onDateSelect, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(date);
    const [currentMonth, setCurrentMonth] = useState(date ? date.getMonth() : new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(date ? date.getFullYear() : new Date().getFullYear());

    useEffect(() => {
        setSelectedDate(date);
    }, [date]);

    const monthNames = [
        'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
        'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
    ];

    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const daysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(newDate);
        onDateSelect?.(newDate);
        setIsOpen(false);
    };

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
    };

    const isSelected = (day) => {
        return selectedDate &&
            day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear();
    };

    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const blankDays = Array(firstDay).fill(null);
    const daysArray = [...Array(daysInMonth(currentMonth, currentYear)).keys()].map(i => i + 1);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    className={cn('w-auto bg-white hover:bg-gray-100', className)}
                    {...props}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: vi }) : <span>Chọn ngày</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="max-w-xs bg-white p-4 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handlePreviousMonth} className="p-1 hover:bg-gray-100 rounded-lg">
                            <ChevronLeft size={24} className="text-gray-600 hover:text-black" />
                        </button>
                        <span className="text-lg font-medium space-x-2">
                            <span>{monthNames[currentMonth]}</span>
                            <span>{currentYear}</span>
                        </span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-lg">
                            <ChevronRight size={24} className="text-gray-600 hover:text-black" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day, index) => (
                            <div
                                key={index}
                                className="text-center text-sm font-medium text-gray-500 h-8 flex items-center justify-center"
                            >
                                {day}
                            </div>
                        ))}
                        {blankDays.map((_, index) => (
                            <div key={`blank-${index}`} className="h-10" />
                        ))}
                        {daysArray.map((day) => (
                            <button
                                key={day}
                                onClick={() => handleDateSelect(day)}
                                className={cn(
                                    'h-10 w-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors',
                                    isSelected(day) ? 'bg-teal-500 text-white hover:bg-teal-600' :
                                        isToday(day) ? 'bg-teal-500 text-white' :
                                            'hover:bg-blue-100 text-black'
                                )}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
});

DatePicker.displayName = 'DatePicker';

export { DatePicker };