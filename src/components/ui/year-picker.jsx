import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const YearPicker = React.forwardRef(({
    className,
    date,
    onYearSelect,
    fromYear,
    toYear,
    ...props
}, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(date);
    const [currentDecadeStart, setCurrentDecadeStart] = useState(
        Math.floor((date?.getFullYear() || new Date().getFullYear()) / 10) * 10
    );

    const handlePreviousDecade = () => {
        setCurrentDecadeStart(currentDecadeStart - 10);
    };

    const handleNextDecade = () => {
        setCurrentDecadeStart(currentDecadeStart + 10);
    };

    const isYearDisabled = (year) => {
        if (fromYear && year < fromYear) return true;
        if (toYear && year > toYear) return true;
        return false;
    };

    const handleYearSelect = (year) => {
        if (!isYearDisabled(year)) {
            const newDate = new Date(year, 0, 1);
            setSelectedDate(newDate);
            onYearSelect?.(newDate);
            setIsOpen(false);
        }
    };

    const yearsArray = Array.from({ length: 10 }, (_, i) => currentDecadeStart + i);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    ref={ref}
                    className={cn('flex w-auto border bg-white hover:bg-gray-100', className)}
                    {...props}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'yyyy', { locale: vi }) : <span>Chọn năm</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="max-w-xs bg-white p-4 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handlePreviousDecade} className="p-1 hover:bg-gray-100 rounded-lg">
                            <ChevronLeft size={24} className="text-gray-600 hover:text-black" />
                        </button>
                        <span className="text-lg font-medium">
                            {currentDecadeStart} - {currentDecadeStart + 9}
                        </span>
                        <button onClick={handleNextDecade} className="p-1 hover:bg-gray-100 rounded-lg">
                            <ChevronRight size={24} className="text-gray-600 hover:text-black" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        {yearsArray.map((year) => (
                            <button
                                key={year}
                                onClick={() => !isYearDisabled(year) && handleYearSelect(year)}
                                disabled={isYearDisabled(year)}
                                className={cn(
                                    'h-10 w-full flex items-center justify-center rounded-lg transition-colors',
                                    selectedDate?.getFullYear() === year
                                        ? 'bg-teal-500 text-white hover:bg-teal-600'
                                        : isYearDisabled(year)
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'hover:bg-blue-100 text-black cursor-pointer'
                                )}
                            >
                                {year}
                            </button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
});

YearPicker.displayName = 'YearPicker';

export { YearPicker };