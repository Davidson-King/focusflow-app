import React, { useMemo, useState } from 'react';
import { useIndexedDB } from '../../hooks/useIndexedDB';
import type { Milestone } from '../../types';
import { ALL_MILESTONES, MILESTONE_ORDER, MilestoneDefinition } from '../../constants/milestones';
import Spinner from '../../components/Spinner';
import { ShareIcon } from '../../components/Icons';
import ShareAchievementModal from '../../components/ShareAchievementModal';

const Milestones: React.FC = () => {
    const { items: unlocked, isLoading } = useIndexedDB<Milestone>('milestones');
    
    const [milestoneToShare, setMilestoneToShare] = useState<{ def: MilestoneDefinition, unlocked: Milestone } | null>(null);

    const unlockedMap = useMemo(() => {
        return new Map(unlocked.map(a => [a.id, a]));
    }, [unlocked]);

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">Your Milestones</h1>
                <p className="text-dark-text-secondary mt-2">
                    Celebrate your progress and milestones on your productivity journey.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {MILESTONE_ORDER.map(id => {
                    const definition = ALL_MILESTONES[id];
                    const unlockedMilestone = unlockedMap.get(id);
                    const isUnlocked = !!unlockedMilestone;

                    return (
                        <div
                            key={id}
                            className={`relative bg-light-card dark:bg-dark-card p-6 rounded-xl border border-light-border dark:border-dark-border transition-all duration-300 ${
                                isUnlocked ? 'shadow-lg' : 'opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                            }`}
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isUnlocked ? 'bg-primary/10' : 'bg-dark-border'}`}>
                                    <definition.icon className={`w-10 h-10 ${isUnlocked ? 'text-primary' : 'text-dark-text-secondary'}`} />
                                </div>
                                <h3 className="font-semibold text-lg">{definition.name}</h3>
                                <p className="text-sm text-dark-text-secondary mt-1 flex-grow">{definition.description}</p>
                                {isUnlocked && (
                                    <>
                                        <p className="text-xs text-primary font-semibold mt-3">
                                            Unlocked on {new Date(unlockedMilestone.achievedOn!).toLocaleDateString()}
                                        </p>
                                        <button 
                                            onClick={() => setMilestoneToShare({ def: definition, unlocked: unlockedMilestone })}
                                            className="absolute top-2 right-2 p-2 rounded-full hover:bg-dark-border"
                                            aria-label={`Share ${definition.name}`}
                                        >
                                            <ShareIcon className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <ShareAchievementModal
                isOpen={!!milestoneToShare}
                onClose={() => setMilestoneToShare(null)}
                achievement={milestoneToShare?.def || null}
                achievedOn={milestoneToShare?.unlocked.achievedOn || null}
            />
        </div>
    );
};

export default Milestones;
