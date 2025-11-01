import React, { useContext, useMemo, useState, useEffect } from 'react';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import { Task, Note, Goal, DashboardLayoutItem } from '../../types.ts';
import { Link, useOutletContext } from 'react-router-dom';
import { CheckIcon, BookOpenIcon, TrophyIcon, FireIcon, AwardIcon, EyeIcon, EyeSlashIcon, MenuIcon, FlagIcon, CheckCircleIcon } from '../../components/Icons.tsx';
import { DEFAULT_DASHBOARD_LAYOUT } from '../../constants/dashboard.ts';

const usePrevious = <T,>(value: T): T | undefined => {
    const ref = React.useRef<T | undefined>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

const WidgetHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-light-border dark:border-dark-border">
        <div className="text-primary" aria-hidden="true">{icon}</div>
        <h3 className="font-semibold">{title}</h3>
    </div>
);

const WelcomeWidget: React.FC = () => {
    const { user } = useContext(AuthContext);
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div id="welcome-widget" className="widget-welcome">
            <h2 className="text-3xl font-bold">{greeting}, {user?.name}!</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">Today is {today}. Let's make it a great one.</p>
        </div>
    );
};

const DueSoonWidget: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const dueSoonTasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        return tasks
            .filter(t => !t.completed && t.dueDate)
            .filter(t => {
                const dueDate = new Date(`${t.dueDate}T00:00:00`);
                return dueDate >= today && dueDate <= nextWeek;
            })
            .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!))
            .slice(0, 5);
    }, [tasks]);
    
    return (
         <div>
            <WidgetHeader title="Due Soon" icon={<CheckIcon className="w-5 h-5" />} />
             {dueSoonTasks.length > 0 ? (
                <ul className="space-y-3">
                    {dueSoonTasks.map(task => (
                        <li key={task.id} className="flex items-center justify-between text-sm hover:bg-light-bg dark:hover:bg-dark-border p-2 rounded-md">
                            <span className="flex items-center gap-2">
                                {task.priority > 0 && <FlagIcon className={`w-4 h-4 text-red-400`} />}
                                {task.text}
                            </span>
                            <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">{new Date(`${task.dueDate}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </li>
                    ))}
                </ul>
             ) : (
                <p className="text-sm text-center text-light-text-secondary dark:text-dark-text-secondary py-4">No tasks due in the next 7 days. Enjoy the peace!</p>
             )}
             <Link to="/dashboard/tasks" state={{ focusInput: true }} className="block text-center mt-4 text-sm text-primary font-semibold hover:underline">Add a Task &rarr;</Link>
        </div>
    );
}

const RecentNotesWidget: React.FC<{ notes: Note[] }> = ({ notes }) => {
     const recentNotes = useMemo(() => {
        return [...notes]
            .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
            .slice(0, 3);
    }, [notes]);

    return (
        <div>
            <WidgetHeader title="Recent Notes" icon={<BookOpenIcon className="w-5 h-5" />} />
            {recentNotes.length > 0 ? (
                <ul className="space-y-2">
                    {recentNotes.map(note => (
                         <li key={note.id} className="text-sm p-2 rounded-md hover:bg-light-bg dark:hover:bg-dark-border">
                            <Link to="/dashboard/notes" state={{ selectedNoteId: note.id }} className="block">
                                <p className="font-medium truncate">{note.title}</p>
                                {note.tags && note.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {note.tags.slice(0,3).map(tag => (
                                            <span key={tag} className="text-xs bg-dark-border px-2 py-0.5 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                         </li>
                    ))}
                </ul>
            ) : (
                 <p className="text-sm text-center text-light-text-secondary dark:text-dark-text-secondary py-4">You haven't created any notes yet.</p>
            )}
            <Link to="/dashboard/notes" className="block text-center mt-4 text-sm text-primary font-semibold hover:underline">View All Notes &rarr;</Link>
        </div>
    );
}

const ActiveGoalsWidget: React.FC<{ goals: Goal[] }> = ({ goals }) => {
    // FIX: Use a type predicate to ensure TypeScript correctly narrows the 'Goal' type.
    const activeHabits = useMemo(() => goals.filter((g): g is Goal & { type: 'habit' } => g.type === 'habit').slice(0, 3), [goals]);
    
    return (
         <div>
             <WidgetHeader title="Active Habits" icon={<FireIcon className="w-5 h-5" />} />
             {activeHabits.length > 0 ? (
                <ul className="space-y-3">
                    {activeHabits.map(habit => (
                         <li key={habit.id} className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-light-bg dark:hover:bg-dark-border">
                            <span className="flex-1 font-medium">{habit.text}</span>
                             <span className="font-semibold flex items-center gap-1 text-orange-400">
                                <FireIcon className="w-4 h-4"/> {habit.currentStreak || 0}
                             </span>
                         </li>
                    ))}
                </ul>
             ) : (
                 <p className="text-sm text-center text-light-text-secondary dark:text-dark-text-secondary py-4">No habits are being tracked.</p>
             )}
             <Link to="/dashboard/goals" className="block text-center mt-4 text-sm text-primary font-semibold hover:underline">View All Goals &rarr;</Link>
        </div>
    );
};


const Home: React.FC = () => {
    const { user, updateUser } = useContext(AuthContext);
    const { items: tasks } = useIndexedDB<Task>('tasks');
    const { items: notes } = useIndexedDB<Note>('notes');
    const { items: goals } = useIndexedDB<Goal>('goals');
    const { isEditLayout } = useOutletContext<{ isEditLayout: boolean }>();
    const prevIsEditLayout = usePrevious(isEditLayout);
    
    const widgetMap: Record<string, { component: React.ReactNode }> = useMemo(() => ({
        welcome: { component: <WelcomeWidget /> },
        due_soon: { component: <DueSoonWidget tasks={tasks} /> },
        recent_notes: { component: <RecentNotesWidget notes={notes} /> },
        active_goals: { component: <ActiveGoalsWidget goals={goals} /> },
    }), [tasks, goals, notes]);
    
    const [localLayout, setLocalLayout] = useState<DashboardLayoutItem[]>(
        user?.dashboardLayout?.filter(item => widgetMap.hasOwnProperty(item.id)) || 
        DEFAULT_DASHBOARD_LAYOUT
    );
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    useEffect(() => {
        // When exiting edit mode, save the layout if it has changed.
        if (prevIsEditLayout && !isEditLayout) {
            if (JSON.stringify(localLayout) !== JSON.stringify(user?.dashboardLayout)) {
                updateUser({ dashboardLayout: localLayout });
            }
        }
    }, [isEditLayout, prevIsEditLayout, localLayout, updateUser, user?.dashboardLayout]);

    const handleToggleVisibility = (id: string) => {
        setLocalLayout(prev => prev.map(item => item.id === id ? { ...item, visible: !item.visible } : item));
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('opacity-50');
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (!draggedItemId || draggedItemId === targetId) return;

        setLocalLayout(prevLayout => {
            const draggedIndex = prevLayout.findIndex(item => item.id === draggedItemId);
            const targetIndex = prevLayout.findIndex(item => item.id === targetId);
            if (draggedIndex === -1 || targetIndex === -1) return prevLayout;

            const newLayout = [...prevLayout];
            const [draggedItem] = newLayout.splice(draggedIndex, 1);
            newLayout.splice(targetIndex, 0, draggedItem);
            return newLayout;
        });
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setDraggedItemId(null);
        e.currentTarget.classList.remove('opacity-50');
    };
    
    return (
        <div className="space-y-6">
            {localLayout.map(item => {
                const isVisible = item.visible;
                const widget = widgetMap[item.id];
                if (!widget) return null;

                const commonProps = {
                  id: item.id === 'welcome' ? '' : `widget-${item.id}`,
                  className: `relative transition-all ${item.id === 'welcome' ? 'widget-welcome' : ''}`,
                };

                if (isEditLayout) {
                    return (
                        <div 
                          key={item.id}
                          {...commonProps}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, item.id)}
                          onDragEnd={handleDragEnd}
                          className={`${commonProps.className} p-6 rounded-xl border-2 border-dashed ${!isVisible ? 'opacity-40' : ''} ${draggedItemId === item.id ? 'border-primary' : 'border-dark-border'}`}
                        >
                            <div className="absolute top-2 right-2 flex items-center gap-1 bg-dark-bg p-1 rounded-md z-10">
                                <button onClick={() => handleToggleVisibility(item.id)} className="p-1">
                                    {isVisible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                                </button>
                                <button className="p-1 cursor-move"><MenuIcon className="w-5 h-5" /></button>
                            </div>
                           {widget.component}
                        </div>
                    )
                }
                
                return isVisible ? (
                    <div key={item.id} {...commonProps} className={`${commonProps.className} bg-light-card dark:bg-dark-card p-6 rounded-xl`}>
                        {widget.component}
                    </div>
                ) : null;
            })}
        </div>
    );
};

export default Home;