import type { Task, Note, JournalEntry, Folder, Goal, Milestone } from '../types';
import { MilestoneID } from '../constants/milestones';

type DataSnapshot = {
  tasks: Task[];
  notes: Note[];
  journalEntries: JournalEntry[];
  folders: Folder[];
  goals: Goal[];
};

export const checkMilestones = (data: DataSnapshot, unlockedMilestones: Milestone[]): MilestoneID[] => {
  const unlockedIds = new Set(unlockedMilestones.map(a => a.id));
  const newMilestones: MilestoneID[] = [];

  const check = (id: MilestoneID, condition: boolean) => {
    if (!unlockedIds.has(id) && condition) {
      newMilestones.push(id);
    }
  };

  // --- Volume Milestones ---
  const completedTasksCount = data.tasks.filter(t => t.completed).length;
  check('first-steps', completedTasksCount >= 1);
  check('task-starter', completedTasksCount >= 10);
  check('task-master', completedTasksCount >= 100);

  check('note-taker', data.notes.length >= 5);
  check('diarist', data.journalEntries.length >= 10);

  // --- Consistency Milestones ---
  const habits = data.goals.filter((g): g is Goal & { type: 'habit' } => g.type === 'habit');
  check('7-day-streak', habits.some(h => h.currentStreak >= 7));
  check('30-day-streak', habits.some(h => h.currentStreak >= 30));
  
  // --- Mastery Milestones ---
  check('organizer', data.folders.length >= 1);
  check('goal-setter', data.goals.some(g => g.type === 'target'));

  return newMilestones;
};
