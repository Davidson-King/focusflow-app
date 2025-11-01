import React, { useMemo } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import { Task, Goal } from '../../types.ts';
import BarChart from '../../components/BarChart.tsx';
import { getStartOfCurrentWeek } from '../../utils/date.ts';

const WeeklyReview: React.FC = () => {
    const { items: tasks } = useIndexedDB<Task>('tasks');
    const { items: goals } = useIndexedDB<Goal>('goals');

    const { weekStart, weekEnd } = useMemo(() => {
        return {
            weekStart: getStartOfCurrentWeek(),
            weekEnd: new Date()
        };
    }, []);

    const weekStats = useMemo(() => {
        const completedTasks = tasks.filter(t => {
            if (!t.completed || !t.updatedAt) return false;
            const completedDate = new Date(t.updatedAt);
            return completedDate >= weekStart && completedDate <= weekEnd;
        });

        // FIX: Use a type predicate to ensure TypeScript correctly narrows the 'Goal' type.
        const habits = goals.filter((g): g is Goal & { type: 'habit' } => g.type === 'habit');
        const habitCompletions: Record<string, number> = {};
        habits.forEach(h => {
            const completedInWeek = h.completedDates.filter(d => {
                const date = new Date(`${d}T00:00:00`);
                return date >= weekStart && date <= weekEnd;
            }).length;
            if (completedInWeek > 0) {
                 habitCompletions[h.text] = completedInWeek;
            }
        });
        
        const daysInWeekSoFar = weekEnd.getDay() + 1;

        return {
            completedTasksCount: completedTasks.length,
            topHabits: Object.entries(habitCompletions)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([label, value]) => ({ label, value, goal: daysInWeekSoFar })),
            completedTasksList: completedTasks.slice(0, 10),
        };
    }, [tasks, goals, weekStart, weekEnd]);

    return (
        <div>
             <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">This Week's Review</h1>
                <p className="text-dark-text-secondary mt-2">
                    Reviewing your progress since {weekStart.toLocaleDateString()}
                </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Tasks Completed</h3>
                    <p className="text-5xl font-bold text-primary">{weekStats.completedTasksCount}</p>
                    <p className="text-dark-text-secondary mt-2">tasks accomplished this week.</p>
                </div>

                <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Top Completed Tasks</h3>
                     {weekStats.completedTasksList.length > 0 ? (
                        <ul className="list-disc list-inside text-dark-text-secondary space-y-1">
                            {weekStats.completedTasksList.map(task => <li key={task.id}>{task.text}</li>)}
                        </ul>
                     ) : (
                        <p className="text-sm text-center text-dark-text-secondary py-4">No tasks were completed this week.</p>
                     )}
                </div>

                <div className="md:col-span-2">
                     <BarChart title="Top Habit Performance" data={weekStats.topHabits} color="var(--primary)" />
                </div>
            </div>
        </div>
    );
};

export default WeeklyReview;