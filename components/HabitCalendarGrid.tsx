import React from 'react';

interface HabitCalendarGridProps {
    completedDates: string[]; // YYYY-MM-DD strings
    daysToShow?: number;
}

const HabitCalendarGrid: React.FC<HabitCalendarGridProps> = ({ completedDates, daysToShow = 30 }) => {
    const completedSet = new Set(completedDates);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const gridDays = Array.from({ length: daysToShow }).map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (daysToShow - 1 - i));
        return date;
    });

    const getDayKey = (date: Date) => date.toISOString().split('T')[0];
    const isToday = (date: Date) => getDayKey(date) === getDayKey(today);

    return (
        <div className="grid grid-cols-12 gap-1.5 p-2 bg-dark-bg rounded-md">
            {gridDays.map(date => {
                const dateKey = getDayKey(date);
                const isCompleted = completedSet.has(dateKey);
                
                let bgColor = 'bg-dark-border/50'; // Default for past incomplete
                if (isCompleted) {
                    bgColor = 'bg-primary';
                }

                return (
                    <div
                        key={dateKey}
                        className={`w-full aspect-square rounded-sm ${bgColor} ${isToday(date) ? 'ring-2 ring-offset-2 ring-offset-dark-card ring-primary' : ''}`}
                        title={`${date.toLocaleDateString()}: ${isCompleted ? 'Completed' : 'Not Completed'}`}
                    />
                );
            })}
        </div>
    );
};

export default HabitCalendarGrid;