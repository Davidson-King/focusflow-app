import { DashboardLayoutItem } from '../types.ts';

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayoutItem[] = [
    { id: 'welcome', visible: true },
    { id: 'due_soon', visible: true },
    { id: 'recent_notes', visible: true },
    { id: 'active_goals', visible: true },
];