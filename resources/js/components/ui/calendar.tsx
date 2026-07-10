import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type Formatters } from 'react-day-picker';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const formatCaption: Formatters['formatCaption'] = (month, options) => {
    const caption = format(month, 'LLLL yyy', { locale: options?.locale });
    const [firstLetter, ...rest] = caption.split('');

    return firstLetter.toUpperCase() + rest.join('');
};

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: CalendarProps) {
    return (
        <DayPicker
            locale={es}
            formatters={{ formatCaption }}
            showOutsideDays={showOutsideDays}
            className={cn('p-3', className)}
            classNames={{
                months: 'relative flex flex-col sm:flex-row gap-4',
                month: 'space-y-4',
                month_caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium',
                nav: 'absolute inset-x-1 top-1 z-10 flex items-center justify-between',
                button_previous: cn(
                    buttonVariants({ variant: 'outline' }),
                    'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                ),
                button_next: cn(
                    buttonVariants({ variant: 'outline' }),
                    'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                ),
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex',
                weekday:
                    'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                week: 'flex w-full mt-2',
                day: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md',
                day_button: cn(
                    buttonVariants({ variant: 'ghost' }),
                    'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                ),
                range_end: 'range-end',
                selected:
                    'rounded-md bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
                today: 'rounded-md bg-accent text-accent-foreground',
                outside:
                    'text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
                disabled: 'text-muted-foreground opacity-50',
                range_middle:
                    'aria-selected:bg-accent aria-selected:text-accent-foreground',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Chevron: ({ className, orientation, ...props }) =>
                    orientation === 'left' ? (
                        <ChevronLeft
                            className={cn('h-4 w-4', className)}
                            {...props}
                        />
                    ) : (
                        <ChevronRight
                            className={cn('h-4 w-4', className)}
                            {...props}
                        />
                    ),
            }}
            {...props}
        />
    );
}
Calendar.displayName = 'Calendar';

export { Calendar };
