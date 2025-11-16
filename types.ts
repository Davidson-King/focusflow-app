export type Mode = 'light' | 'dark';

export interface ColorTheme {
    name: string;
    displayName: string;
    colors: {
        primary: string;
        primaryHover: string;
        primaryGlow: string;
    };
}

export interface DashboardLayoutItem {
    id: string;
    visible: boolean;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar: string;
    dashboardLayout: DashboardLayoutItem[];
    isMockUser?: boolean;
}

export type Priority = 0 | 1 | 2 | 3;

export interface Recurrence {
    frequency: 'daily' | 'weekly' | 'monthly';
}

export interface Task {
    id: string;
    user_id: string;
    text: string;
    completed: boolean;
    priority: Priority;
    dueDate?: string; // YYYY-MM-DD
    parentId: string | null;
    createdAt: number;
    updatedAt?: number;
    recurring?: Recurrence;
    // For virtual lists
    _level?: number;
}

export interface Folder {
    id: string;
    user_id: string;
    name: string;
    type: 'note' | 'journal';
    createdAt: number;
}

export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string; // HTML string from Quill
    tags: string[];
    folderId: string | null;
    createdAt: number;
    updatedAt?: number;
    shareId?: string;
}

export interface JournalEntry {
    id: string;
    user_id: string;
    title: string;
    content: string; // HTML string from Quill
    folderId: string | null;
    createdAt: number;
    updatedAt?: number;
}

export interface TimelineEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    description: string;
}

export interface Timeline {
    id: string;
    user_id: string;
    name: string;
    events: TimelineEvent[];
    createdAt: number;
}

export type Goal = {
    id: string;
    user_id: string;
    text: string;
    createdAt: number;
} & ({
    type: 'habit';
    completedDates: string[]; // YYYY-MM-DD
    currentStreak: number;
    longestStreak: number;
    targetType?: 'completions' | 'streak';
    targetValue?: number;
} | {
    type: 'target';
    currentValue: number;
    targetValue: number;
    unit?: string;
});

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

export interface FeedbackOutboxItem {
    id: string;
    subject: string;
    body: string;
    createdAt: number;
}

export interface Milestone {
    id: string; // e.g., 'task-master-1'
    name: string;
    description: string;
    achievedOn?: number; // timestamp
}

export interface Achievement {
    id: string;
    user_id: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD
    createdAt: number;
    updatedAt?: number;
}
