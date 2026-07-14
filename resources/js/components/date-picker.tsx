import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { type DayPickerProps } from 'react-day-picker';

type DatePickerProps = {
    placeholder?: string;
    /** A `Date`, or the `yyyy-MM-dd` string the forms keep in their state. */
    date: Date | string;
    setDate: (date: Date | undefined) => void;
    disabled?: DayPickerProps['disabled'];
};

/**
 * `new Date('2026-07-25')` reads a date-only string as midnight UTC, which in
 * Argentina (UTC−3) is the 24th at 21:00 — the picker showed the day before
 * the one that was chosen. `parseISO` reads it in local time.
 */
const toLocalDate = (date: Date | string): Date | undefined => {
    const parsed = typeof date === 'string' ? parseISO(date) : date;

    return isValid(parsed) ? parsed : undefined;
};

export function DatePicker({
    placeholder,
    date,
    setDate,
    disabled,
}: DatePickerProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const selected = toLocalDate(date);

    return (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'mt-1 w-full justify-start text-left font-normal',
                        !selected && 'text-muted-foreground',
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selected
                        ? format(selected, 'PPP', { locale: es })
                        : placeholder && <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selected}
                    onSelect={(day) => {
                        setDate(day);
                        setIsCalendarOpen(false);
                    }}
                    disabled={disabled}
                    autoFocus
                />
            </PopoverContent>
        </Popover>
    );
}
