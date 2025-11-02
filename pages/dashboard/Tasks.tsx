
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import type { Task, Priority, Recurrence } from '../../types.ts';
import { PlusIcon, TrashIcon, PencilIcon, FlagIcon, ArrowUturnLeftIcon, ChevronDownIcon, CheckIcon, XIcon, CalendarIcon, ArrowPathIcon, CheckCircleIcon } from '../../components/Icons.tsx';
import EmptyState from '../../components/EmptyState.tsx';
import Spinner from '../../components/Spinner.tsx';
import Modal from '../../components/Modal.tsx';
import { AuthContext } from '../../contexts/AuthContext.tsx';
import { useNotifier } from '../../contexts/NotificationContext.tsx';
import { notificationService } from '../../services/notificationService.ts';
import ButtonSpinner from '../../components/ButtonSpinner.tsx';
import { useLocation } from 'react-router-dom';
// FIX: Changed import of 'react-window' from a namespace import to a named import to resolve module resolution error.
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const priorityMap: Record<Priority, { label: string; color: string; bg: string }> = {
    3: { label: 'High', color: 'text-red-400', bg: 'bg-red-400/10' },
    2: { label: 'Medium', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    1: { label: 'Low', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    0: { label: 'None', color: 'text-dark-text-secondary', bg: 'bg-dark-border' },
};

const PrioritySelector: React.FC<{ value: Priority; onChange: (p: Priority) => void; }> = ({ value, onChange }) => {
    return (
        <select value={value} onChange={e => onChange(Number(e.target.value) as Priority)} aria-label="Task priority" className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none text-sm">
            {Object.entries(priorityMap).reverse().map(([p, { label }]) => (
                <option key={p} value={p}>{label}</option>
            ))}
        </select>
    );
};

// FIX: Changed onAdd return type from Promise<void> to Promise<any> to match the return type of the passed handler.
const AddTaskForm: React.FC<{
    onAdd: (task: Omit<Task, 'id' | 'user_id'>) => Promise<any>;
    parentId?: string | null;
    onCancel?: () => void;
    isSubtask?: boolean;
    shouldFocus?: boolean;
}> = ({ onAdd, parentId = null, onCancel, isSubtask = false, shouldFocus = false }) => {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState<Priority>(0);
    const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
    const [isAdding, setIsAdding] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !isAdding) {
            setIsAdding(true);
            try {
                await onAdd({ text, completed: false, priority, dueDate: dueDate || undefined, parentId, createdAt: Date.now(), recurring: recurrence !== 'none' ? { frequency: recurrence } : undefined, });
                setText('');
                setDueDate('');
                setPriority(0);
                setRecurrence('none');
                if (onCancel) onCancel();
            } finally {
                setIsAdding(false);
            }
        }
    };
    
    // For the main add task form, we wrap it to provide spacing. For subtasks, it's borderless.
    const formContainerClass = isSubtask ? 'p-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg' : 'mb-6';

    return (
        <form id={isSubtask ? '' : 'add-task-form'} onSubmit={handleSubmit} className={formContainerClass}>
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isSubtask ? "Add a new sub-task..." : "Add a new task..."}
                className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none mb-2"
                aria-label={isSubtask ? "New sub-task name" : "New task name"}
                autoFocus={shouldFocus}
            />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} aria-label="Due date" className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md p-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                    <PrioritySelector value={priority} onChange={setPriority} />
                    {dueDate && (
                        <select value={recurrence} onChange={e => setRecurrence(e.target.value as any)} aria-label="Task recurrence" className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none text-sm">
                            <option value="none">No Repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {onCancel && <button type="button" onClick={onCancel} className="p-2 text-dark-text-secondary hover:bg-dark-border rounded-md">Cancel</button>}
                    <button type="submit" aria-label={isSubtask ? "Add sub-task" : "Add task"} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50" disabled={!text.trim() || isAdding}>
                        {isAdding ? <ButtonSpinner /> : <PlusIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        </form>
    );
};

// FIX: Changed onAddSubtask and onAddNextRecurring return types from Promise<void> to Promise<any> to match the passed handler.
const TaskItem: React.FC<{
    task: Task;
    onUpdate: (id: string, updates: Partial<Task>, originalTask: Task) => Promise<void>;
    onDeleteRequest: (task: Task) => void;
    onAddSubtask: (task: Omit<Task, 'id' | 'user_id'>) => Promise<any>;
    onAddNextRecurring: (taskData: Omit<Task, 'id' | 'user_id'>) => Promise<any>;
    hasChildren: boolean;
    isExpanded: boolean;
    onToggleExpand: (taskId: string) => void;
}> = ({ task, onUpdate, onDeleteRequest, onAddSubtask, onAddNextRecurring, hasChildren, isExpanded, onToggleExpand }) => {
    const { user } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingSubtask, setIsAddingSubtask] = useState(false);
    const [editText, setEditText] = useState(task.text);
    const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
    const [editPriority, setEditPriority] = useState<Priority>(task.priority);
    const [editRecurrence, setEditRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(task.recurring?.frequency || 'none');
    const { addNotification } = useNotifier();
    const level = (task as any)._level || 0;

    const handleSave = async () => {
        try {
            await onUpdate(task.id, { text: editText, dueDate: editDueDate || undefined, priority: editPriority, recurring: editRecurrence !== 'none' ? { frequency: editRecurrence } : undefined, }, task);
            setIsEditing(false);
        } catch (error) {
            addNotification('Failed to update task. Please try again.', 'error');
        }
    };
    
    const handleCancel = () => {
        setIsEditing(false);
        setEditText(task.text);
        setEditDueDate(task.dueDate || '');
        setEditPriority(task.priority);
        setEditRecurrence(task.recurring?.frequency || 'none');
    };
    
    const handleToggleComplete = async () => {
        const isCompleting = !task.completed;
        try {
            const updates: Partial<Task> = { completed: isCompleting };
    
            await onUpdate(task.id, updates, task);
    
            if (isCompleting && task.recurring && task.dueDate) {
                const originalDueDate = new Date(`${task.dueDate}T00:00:00`);
                let nextDueDate = new Date(originalDueDate);
    
                switch (task.recurring.frequency) {
                    case 'daily':
                        nextDueDate.setDate(originalDueDate.getDate() + 1);
                        break;
                    case 'weekly':
                        nextDueDate.setDate(originalDueDate.getDate() + 7);
                        break;
                    case 'monthly':
                        nextDueDate.setMonth(originalDueDate.getMonth() + 1);
                        break;
                }
    
                const nextDueDateString = nextDueDate.toISOString().split('T')[0];
    
                const nextTask: Omit<Task, 'id' | 'user_id'> = {
                    text: task.text,
                    completed: false,
                    priority: task.priority,
                    dueDate: nextDueDateString,
                    parentId: task.parentId,
                    createdAt: Date.now(),
                    recurring: task.recurring,
                };
    
                await onAddNextRecurring(nextTask);
                addNotification(`Next task scheduled for ${nextDueDate.toLocaleDateString()}`, 'info');
            }

        } catch (error) {
            addNotification('Failed to update task status. Please try again.', 'error');
        }
    };

    if (isEditing) {
        return (
             <div className="p-3 bg-light-card dark:bg-dark-card border-2 border-primary rounded-lg" style={{ marginLeft: `${level * 1.75}rem` }}>
                <input type="text" value={editText} onChange={e => setEditText(e.target.value)} className="w-full bg-light-bg dark:bg-dark-bg p-2 rounded-md focus:outline-none mb-2" autoFocus />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)} aria-label="Due date" className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-md p-1 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                        <PrioritySelector value={editPriority} onChange={setEditPriority} />
                        {editDueDate && (
                            <select value={editRecurrence} onChange={e => setEditRecurrence(e.target.value as any)} aria-label="Task recurrence" className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none text-sm">
                                <option value="none">No Repeat</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCancel} aria-label="Cancel editing task"><XIcon className="w-5 h-5 text-dark-text-secondary"/></button>
                        <button onClick={handleSave} aria-label="Save task changes"><CheckIcon className="w-5 h-5 text-green-500"/></button>
                    </div>
                </div>
            </div>
        );
    }
    
    const getDueDateInfo = (dueDateStr?: string) => {
        if (!dueDateStr) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(`${dueDateStr}T00:00:00`);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let color = 'text-light-text-secondary dark:text-dark-text-secondary';
        let text = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (diffDays < 0) { color = 'text-red-500'; text = 'Overdue'; }
        else if (diffDays === 0) { color = 'text-orange-400'; text = 'Today'; }
        else if (diffDays === 1) { color = 'text-yellow-500'; text = 'Tomorrow'; }
        return { color, text };
    };

    const dueDateInfo = getDueDateInfo(task.dueDate);

    return (
        <div id={`task-container-${task.id}`}>
            <div 
                className={`flex items-start p-3 bg-light-card dark:bg-dark-card rounded-lg group transition-colors duration-200 hover:bg-light-bg dark:hover:bg-dark-border hover:shadow-md ${level > 0 ? 'border-l-2 border-light-border dark:border-dark-border ml-2' : ''}`}
                style={{ paddingLeft: `calc(${level * 1.75}rem + 0.75rem)` }}
            >
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 mr-1" style={{ marginLeft: `calc(${level * -1.75}rem - 2px)` }}>
                    {hasChildren && (
                        <button 
                            onClick={() => onToggleExpand(task.id)} 
                            aria-expanded={isExpanded}
                            aria-controls={`subtasks-for-${task.id}`}
                            aria-label={isExpanded ? 'Collapse sub-tasks' : 'Expand sub-tasks'}
                            className="p-1 rounded-full hover:bg-dark-border"
                        >
                            <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
                <input id={`task-${task.id}`} type="checkbox" checked={task.completed} onChange={handleToggleComplete} className="mt-1 w-5 h-5 rounded-md text-primary bg-dark-border border-dark-border focus:ring-primary focus:ring-2" aria-label={`${task.completed ? 'Mark task as incomplete:' : 'Mark task as complete:'} ${task.text}`} />
                <label htmlFor={`task-${task.id}`} className="ml-3 flex-1 cursor-pointer">
                    <span className={`${task.completed ? 'line-through text-light-text-secondary dark:text-dark-text-secondary' : ''}`}>{task.text}</span>
                    {(task.dueDate || task.priority > 0 || task.recurring) && (
                        <div className="flex items-center gap-4 text-xs mt-1.5 flex-wrap">
                            {dueDateInfo && (
                                <span className={`flex items-center gap-1 font-medium ${dueDateInfo.color}`}>
                                    <CalendarIcon className="w-4 h-4" aria-hidden="true" />
                                    {dueDateInfo.text}
                                </span>
                            )}
                            {task.recurring && (
                                <span className="flex items-center gap-1 font-medium text-purple-400">
                                    <ArrowPathIcon className="w-4 h-4" aria-hidden="true" />
                                    {task.recurring.frequency.charAt(0).toUpperCase() + task.recurring.frequency.slice(1)}
                                </span>
                            )}
                            {task.priority > 0 && (
                                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold ${priorityMap[task.priority].bg} ${priorityMap[task.priority].color}`}>
                                    <FlagIcon className="w-3 h-3" aria-hidden="true"/>
                                    {priorityMap[task.priority].label}
                                </span>
                            )}
                        </div>
                    )}
                </label>
                <div className="ml-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setIsEditing(true)} aria-label={`Edit task: ${task.text}`} className="p-1"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={() => setIsAddingSubtask(true)} aria-label={`Add sub-task to: ${task.text}`} className="p-1"><ArrowUturnLeftIcon className="w-4 h-4" /></button>
                    <button onClick={() => onDeleteRequest(task)} aria-label={`Delete task: ${task.text}`} className="p-1"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </div>
            {isAddingSubtask && (
                <div className="mt-2" style={{ paddingLeft: `${(level + 1) * 1.75}rem` }}>
                    <AddTaskForm onAdd={onAddSubtask} parentId={task.id} onCancel={() => setIsAddingSubtask(false)} isSubtask />
                </div>
            )}
        </div>
    );
};

const TaskControls: React.FC<{
    filterPriorities: Set<Priority>;
    onFilterChange: (p: Priority) => void;
    onClearFilters: () => void;
    sortBy: string;
    onSortChange: (sort: string) => void;
    completionFilter: 'all' | 'active' | 'completed';
    onCompletionFilterChange: (filter: 'all' | 'active' | 'completed') => void;
}> = ({
    filterPriorities,
    onFilterChange,
    onClearFilters,
    sortBy,
    onSortChange,
    completionFilter,
    onCompletionFilterChange
}) => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 p-3 bg-light-card dark:bg-dark-card rounded-lg border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-x-6 gap-y-2 flex-wrap">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-dark-text-secondary">Show</span>
                    {(['active', 'completed', 'all'] as const).map(filter => (
                        <button
                            key={filter}
                            onClick={() => onCompletionFilterChange(filter)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                completionFilter === filter
                                ? 'bg-primary text-white font-semibold'
                                : 'bg-dark-bg hover:bg-dark-border'
                            }`}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-dark-text-secondary">Priority</span>
                    {[3, 2, 1].map(p => (
                        <button key={p} onClick={() => onFilterChange(p as Priority)} aria-label={`Filter by ${priorityMap[p as Priority].label} priority`} className={`px-3 py-1 text-sm rounded-full border transition-colors ${filterPriorities.has(p as Priority) ? `${priorityMap[p as Priority].bg} ${priorityMap[p as Priority].color} border-current` : 'border-dark-border'}`}>
                            {priorityMap[p as Priority].label}
                        </button>
                    ))}
                    {filterPriorities.size > 0 && <button onClick={onClearFilters} className="text-sm text-dark-text-secondary hover:underline">Clear</button>}
                </div>
            </div>
             <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-dark-text-secondary">Sort by</span>
                <select value={sortBy} onChange={e => onSortChange(e.target.value)} aria-label="Sort tasks" className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none text-sm">
                    <option value="newest">Newest</option>
                    <option value="priority-desc">Priority: High-Low</option>
                    <option value="priority-asc">Priority: Low-High</option>
                    <option value="due-date">Due Date</option>
                    <option value="alpha-asc">Alphabetical (A-Z)</option>
                    <option value="alpha-desc">Alphabetical (Z-A)</option>
                </select>
            </div>
        </div>
    );
}

const Tasks: React.FC = () => {
    const { user } = useContext(AuthContext);
    const { addNotification } = useNotifier();
    const { items: allTasks, isLoading, addItem, updateItem, deleteItem } = useIndexedDB<Task>('tasks');
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterPriorities, setFilterPriorities] = useState<Set<Priority>>(new Set());
    const [sortBy, setSortBy] = useState('newest');
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
    const [completionFilter, setCompletionFilter] = useState<'all' | 'active' | 'completed'>('active');
    const location = useLocation();
    const shouldFocusInput = location.state?.focusInput;

    useEffect(() => {
        if (shouldFocusInput) {
            window.history.replaceState({}, document.title);
        }
    }, [shouldFocusInput]);

    const toggleExpand = (taskId: string) => {
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const handleFilterChange = (p: Priority) => {
        setFilterPriorities(prev => {
            const newSet = new Set(prev);
            if (newSet.has(p)) newSet.delete(p);
            else newSet.add(p);
            return newSet;
        });
    };

    const handleDeleteRequest = (task: Task) => setTaskToDelete(task);
    
    const confirmDelete = async () => {
        if (!taskToDelete || isDeleting) return;
        
        setIsDeleting(true);
        const taskToDeleteRef = taskToDelete;

        const tasksToDeleteIds: string[] = [taskToDeleteRef.id];
        const findChildren = (parentId: string) => {
            allTasks.forEach(t => {
                if(t.parentId === parentId) {
                    tasksToDeleteIds.push(t.id);
                    findChildren(t.id);
                }
            })
        };
        findChildren(taskToDeleteRef.id);

        tasksToDeleteIds.forEach(id => {
            const element = document.getElementById(`task-container-${id}`);
            if (element) {
                element.classList.add('animate-item-out');
            }
        });

        setTimeout(async () => {
            try {
                const deletePromises = tasksToDeleteIds.map(id => deleteItem(id));
                await Promise.all(deletePromises);
                addNotification(`Deleted ${tasksToDeleteIds.length} task(s).`, 'success');
            } catch (error) {
                addNotification('Failed to delete task(s). Please try again.', 'error');
            } finally {
                setTaskToDelete(null);
                setIsDeleting(false);
            }
        }, 300); // Wait for animation
    };

    const { flatTaskList, taskMap } = useMemo(() => {
        const parentTasks = allTasks.filter(t => !t.parentId);
        const childrenMap = allTasks.reduce((acc, task) => {
            if (task.parentId) {
                if (!acc[task.parentId]) acc[task.parentId] = [];
                acc[task.parentId].push(task);
            }
            return acc;
        }, {} as Record<string, Task[]>);
        
        const taskMap = allTasks.reduce((acc, task) => {
            acc[task.id] = task;
            return acc;
        }, {} as Record<string, Task>);
        
        let filteredTasks = parentTasks;

        if (completionFilter !== 'all') {
            const showCompleted = completionFilter === 'completed';
            filteredTasks = filteredTasks.filter(task => task.completed === showCompleted);
        }

        if (filterPriorities.size > 0) {
            filteredTasks = filteredTasks.filter(t => filterPriorities.has(t.priority));
        }

        filteredTasks.sort((a, b) => {
            switch (sortBy) {
                case 'priority-desc': return b.priority - a.priority;
                case 'priority-asc': return a.priority - b.priority;
                case 'due-date': return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
                case 'alpha-asc': return a.text.localeCompare(b.text);
                case 'alpha-desc': return b.text.localeCompare(a.text);
                case 'newest':
                default:
                    return b.createdAt - a.createdAt;
            }
        });
        
        const flatList: Task[] = [];
        const addChildren = (parentId: string, level: number) => {
            const children = (childrenMap[parentId] || []).sort((a, b) => a.createdAt - b.createdAt);
            children.forEach(child => {
                flatList.push({ ...child, _level: level } as Task & { _level: number });
                if(expandedTasks.has(child.id)) {
                    addChildren(child.id, level + 1);
                }
            });
        };
        
        filteredTasks.forEach(task => {
            flatList.push({ ...task, _level: 0 } as Task & { _level: number });
            if (expandedTasks.has(task.id)) {
                addChildren(task.id, 1);
            }
        });
        
        return { flatTaskList: flatList, taskMap };
    }, [allTasks, filterPriorities, sortBy, expandedTasks, completionFilter]);

    const handleAddTask = (task: Omit<Task, 'id' | 'user_id'>) => {
        if (!user) return Promise.reject("No user");
        return addItem({ ...task, user_id: user.id });
    };

    const handleUpdateTask = (id: string, updates: Partial<Task>, originalTask: Task) => {
        if (originalTask.dueDate && updates.dueDate !== originalTask.dueDate) {
            notificationService.cancelTaskNotification(id);
        }
        if (updates.dueDate && updates.dueDate !== originalTask.dueDate) {
            notificationService.scheduleTaskNotification({ ...originalTask, ...updates });
        }
        return updateItem(id, updates);
    };

    const TaskRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const task = flatTaskList[index];

        return (
            <div style={style} className="px-1 py-1">
                <TaskItem 
                    task={task} 
                    onUpdate={handleUpdateTask} 
                    onDeleteRequest={handleDeleteRequest} 
                    onAddSubtask={handleAddTask}
                    onAddNextRecurring={handleAddTask}
                    hasChildren={allTasks.some(t => t.parentId === task.id)}
                    isExpanded={expandedTasks.has(task.id)}
                    onToggleExpand={toggleExpand}
                />
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Tasks</h1>
            <AddTaskForm onAdd={handleAddTask} shouldFocus={shouldFocusInput} />

            {isLoading ? <div className="flex justify-center mt-8"><Spinner /></div> : allTasks.length > 0 ? (
                <>
                    <TaskControls 
                        filterPriorities={filterPriorities}
                        onFilterChange={handleFilterChange}
                        onClearFilters={() => setFilterPriorities(new Set())}
                        sortBy={sortBy}
                        onSortChange={setSortBy}
                        completionFilter={completionFilter}
                        onCompletionFilterChange={setCompletionFilter}
                    />
                     <div className="h-[calc(100vh-26rem)]">
                        <AutoSizer>
                            {({ height, width }) => (
                                <FixedSizeList
                                    height={height}
                                    itemCount={flatTaskList.length}
                                    itemSize={80} // Adjust based on TaskItem height
                                    width={width}
                                >
                                    {TaskRow}
                                </FixedSizeList>
                            )}
                        </AutoSizer>
                    </div>
                </>
            ) : (
                 <EmptyState 
                    title="All Clear!"
                    message="You have no tasks. Add one above to get started."
                    icon={<CheckCircleIcon className="w-16 h-16" />}
                 />
            )}

            <Modal isOpen={!!taskToDelete} onClose={() => setTaskToDelete(null)} title="Delete Task?">
                {taskToDelete && (
                    <>
                        <p className="mb-6">
                            Are you sure you want to delete the task "{taskToDelete.text}"? 
                             {allTasks.some(t => t.parentId === taskToDelete.id) && <strong> This will also delete all of its sub-tasks.</strong>}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setTaskToDelete(null)} className="px-4 py-2 rounded-lg bg-dark-border">Cancel</button>
                            <button onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 w-32 h-10 flex justify-center items-center">
                                {isDeleting ? <ButtonSpinner /> : 'Delete Task'}
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};
// FIX: Added a default export for the Tasks component.
export default Tasks;
