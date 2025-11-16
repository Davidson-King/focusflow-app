import React from 'react';
import {
  SparklesIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  BookOpenIcon,
  FireIcon,
  FolderPlusIcon,
  TrophyIcon,
} from '../components/Icons';

export type MilestoneID =
  | 'first-steps'
  | 'task-starter'
  | 'task-master'
  | 'note-taker'
  | 'diarist'
  | '7-day-streak'
  | '30-day-streak'
  | 'organizer'
  | 'goal-setter';

export interface MilestoneDefinition {
  id: MilestoneID;
  name: string;
  description: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const ALL_MILESTONES: Record<MilestoneID, MilestoneDefinition> = {
  'first-steps': {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your very first task.',
    icon: SparklesIcon,
  },
  'task-starter': {
    id: 'task-starter',
    name: 'Task Starter',
    description: 'Complete your first 10 tasks.',
    icon: CheckCircleIcon,
  },
  'task-master': {
    id: 'task-master',
    name: 'Task Master',
    description: 'Complete 100 tasks.',
    icon: CheckBadgeIcon,
  },
  'note-taker': {
    id: 'note-taker',
    name: 'Note Taker',
    description: 'Create your first 5 notes.',
    icon: PencilSquareIcon,
  },
  'diarist': {
    id: 'diarist',
    name: 'Diarist',
    description: 'Write 10 journal entries.',
    icon: BookOpenIcon,
  },
  '7-day-streak': {
    id: '7-day-streak',
    name: '7-Day Streak',
    description: 'Maintain a 7-day streak on any habit.',
    icon: FireIcon,
  },
  '30-day-streak': {
    id: '30-day-streak',
    name: '30-Day Streak',
    description: 'Maintain a 30-day streak on any habit.',
    icon: FireIcon,
  },
  'organizer': {
    id: 'organizer',
    name: 'Organizer',
    description: 'Create your first folder (in Notes or Journal).',
    icon: FolderPlusIcon,
  },
  'goal-setter': {
    id: 'goal-setter',
    name: 'Goal Setter',
    description: 'Create your first long-term, measurable goal.',
    icon: TrophyIcon,
  },
};

// Provides a consistent order for display
export const MILESTONE_ORDER: MilestoneID[] = [
  'first-steps',
  'task-starter',
  'task-master',
  'note-taker',
  'diarist',
  '7-day-streak',
  '30-day-streak',
  'organizer',
  'goal-setter',
];
