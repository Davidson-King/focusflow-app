import React, { useState, useMemo, useEffect } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import type { Achievement } from '../../types.ts';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  AwardIcon,
} from '../../components/Icons.tsx';
import EmptyState from '../../components/EmptyState.tsx';
import Spinner from '../../components/Spinner.tsx';
import Modal from '../../components/Modal.tsx';
import { useNotifier } from '../../contexts/NotificationContext.tsx';
import ButtonSpinner from '../../components/ButtonSpinner.tsx';

/* -------------------------------------------------------------------------- */
/*                               ACHIEVEMENT MODAL                            */
/* -------------------------------------------------------------------------- */
const AchievementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Achievement, 'id'>) => Promise<void>;
  achievementToEdit?: Achievement | null;
}> = ({ isOpen, onClose, onSave, achievementToEdit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { addNotification } = useNotifier();

  /* Reset form whenever the modal opens */
  useEffect(() => {
    if (!isOpen) return;

    setName(achievementToEdit?.name ?? '');
    setDescription(achievementToEdit?.description ?? '');
    const initDate = achievementToEdit?.achievedOn
      ? new Date(achievementToEdit.achievedOn)
      : new Date();
    setDate(initDate.toISOString().split('T')[0]);
    setIsSaving(false);
  }, [isOpen, achievementToEdit]);

  const handleSave = async () => {
    if (!name.trim() || !date || isSaving) return;

    const selected = new Date(date);
    if (Number.isNaN(selected.getTime())) {
      addNotification('Please pick a valid date.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        achievedOn: new Date(`${date}T00:00:00`).getTime(),
      });
      onClose();
    } catch {
      addNotification('Failed to save achievement.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={achievementToEdit ? 'Edit Achievement' : 'Log Achievement'}
    >
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Achievement
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Ran a 5K"
            className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            autoFocus
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Date Achieved
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Add details..."
            className="w-full p-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-dark-border hover:bg-dark-border/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim() || !date}
            className="px-4 py-2 rounded-lg bg-primary text-white font-medium min-w-24 h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isSaving ? <ButtonSpinner /> : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */
const Achievements: React.FC = () => {
  const {
    items: achievements,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
  } = useIndexedDB<Achievement>('achievements');
  const { addNotification } = useNotifier();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [achievementToEdit, setAchievementToEdit] = useState<Achievement | null>(null);
  const [achievementToDelete, setAchievementToDelete] = useState<Achievement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* Sort newest first */
  const sortedAchievements = useMemo(() => {
    return [...achievements].sort(
      (a, b) => (b.achievedOn ?? 0) - (a.achievedOn ?? 0)
    );
  }, [achievements]);

  /* ---------------------------------------------------------------------- */
  /*                               CRUD HANDLERS                              */
  /* ---------------------------------------------------------------------- */
  const handleSave = async (data: Omit<Achievement, 'id'>) => {
    try {
      if (achievementToEdit) {
        await updateItem(achievementToEdit.id, data);
        addNotification('Achievement updated!', 'success');
      } else {
        await addItem(data);
        addNotification('Achievement logged!', 'success');
      }
    } catch {
      addNotification('Failed to save achievement.', 'error');
    } finally {
      setAchievementToEdit(null);
      setIsModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!achievementToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteItem(achievementToDelete.id);
      addNotification('Achievement removed.', 'success');
    } catch {
      addNotification('Failed to remove achievement.', 'error');
    } finally {
      setIsDeleting(false);
      setAchievementToDelete(null);
    }
  };

  /* ---------------------------------------------------------------------- */
  /*                               UI HELPERS                                 */
  /* ---------------------------------------------------------------------- */
  const openCreate = () => {
    setAchievementToEdit(null);
    setIsModalOpen(true);
  };
  const openEdit = (ach: Achievement) => {
    setAchievementToEdit(ach);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setAchievementToEdit(null);
  };

  /* ---------------------------------------------------------------------- */
  /*                                 RENDER                                   */
  /* ---------------------------------------------------------------------- */
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-hover transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Log Achievement</span>
        </button>
      </div>

      {/* Loading / Empty / List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : sortedAchievements.length === 0 ? (
        <EmptyState
          title="Log Your First Win"
          message="Track personal and professional accomplishments, big or small."
          icon={<AwardIcon className="w-16 h-16 text-yellow-400" />}
          actionText="Log an Achievement"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-4">
          {sortedAchievements.map((ach) => (
            <div
              key={ach.id}
              className="bg-light-card dark:bg-dark-card p-4 rounded-xl group animate-pop-in transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                {/* Left side – icon + info */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                    <AwardIcon className="w-5 h-5 text-yellow-400" />
                  </div>

                  <div>
                    <p className="font-semibold text-lg">{ach.name}</p>

                    {ach.achievedOn && (
                      <p className="text-sm text-dark-text-secondary">
                        {new Date(ach.achievedOn).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}

                    <p className="text-sm text-dark-text-secondary mt-1">
                      {ach.description}
                    </p>
                  </div>
                </div>

                {/* Right side – edit / delete (visible on hover) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => openEdit(ach)}
                    aria-label={`Edit achievement: ${ach.name}`}
                    className="p-2 rounded-lg hover:bg-light-bg dark:hover:bg-dark-bg transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 text-dark-text-secondary" />
                  </button>

                  <button
                    onClick={() => setAchievementToDelete(ach)}
                    aria-label={`Delete achievement: ${ach.name}`}
                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- CREATE / EDIT MODAL ---------- */}
      <AchievementModal
        key={achievementToEdit?.id ?? 'new'}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        achievementToEdit={achievementToEdit}
      />

      {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
      <Modal
        isOpen={!!achievementToDelete}
        onClose={() => setAchievementToDelete(null)}
        title="Remove Achievement?"
      >
        <p className="text-dark-text">
          Are you sure you want to remove "
          <span className="font-semibold">{achievementToDelete?.name}</span>
          "? This cannot be undone.
        </p>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setAchievementToDelete(null)}
            className="px-4 py-2 rounded-lg bg-dark-border hover:bg-dark-border/80 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium min-w-24 h-10 flex items-center justify-center disabled:opacity-50 transition-opacity"
          >
            {isDeleting ? <ButtonSpinner /> : 'Remove'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Achievements;