import { Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from './ui/utils';
import { useState, useRef } from 'react';


interface DateTimePickerProps {
    date: string;
    time: string;
    onDateChange: (date: string) => void;
    onTimeChange: (time: string) => void;
}

export function DateTimePicker({ date, time, onDateChange, onTimeChange }: DateTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const timeOptions = Array.from({ length: 36 }).map((_, i) => {
        const totalMinutes = 6 * 60 + i * 30; // Start at 6:00 AM
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${period}`;
    });

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <div className="bg-red-600 p-1.5 rounded-lg">
                    <CalendarIcon className="size-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">When?</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 ml-1">Date</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    "w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 text-left outline-none transition-all flex items-center justify-between",
                                    !date && "text-gray-400"
                                )}
                            >
                                <span className="truncate">
                                    {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Select date"}
                                </span>
                                <CalendarIcon className="size-4 text-gray-400 shrink-0" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                            <Calendar
                                mode="single"
                                selected={date ? new Date(date) : undefined}
                                onSelect={(newDate) => {
                                    if (newDate) {
                                        const year = newDate.getFullYear();
                                        const month = String(newDate.getMonth() + 1).padStart(2, '0');
                                        const day = String(newDate.getDate()).padStart(2, '0');
                                        onDateChange(`${year}-${month}-${day}`);
                                    }
                                }}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                fromYear={1900}
                                captionLayout="buttons"
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 ml-1">Time</label>
                    <Popover open={isOpen} onOpenChange={setIsOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                className={cn(
                                    "w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 block p-3 text-left outline-none transition-all flex items-center justify-between",
                                    !time && "text-gray-400"
                                )}
                            >
                                <span className="truncate">{time || "Select time"}</span>
                                <Clock className="size-4 text-gray-400 shrink-0" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 rounded-md bg-white" align="start" style={{ scrollbarWidth: 'thin', maxHeight: '240px', overflowY: 'auto', width: 'var(--radix-popover-trigger-width)' }}>
                            {timeOptions.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        onTimeChange(option);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-3 py-3 text-sm rounded-lg transition-colors flex items-center justify-between",
                                        time === option ? "bg-red-50 text-red-700 font-medium" : "hover:bg-gray-100 text-gray-900"
                                    )}
                                >
                                    {option}
                                    {time === option && <Check className="size-4 text-red-600" />}
                                </button>
                            ))}
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
