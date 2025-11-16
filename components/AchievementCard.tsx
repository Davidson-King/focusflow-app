import React, { forwardRef } from 'react';
import { AchievementDefinition } from '../constants/achievements';
import { useAuth } from '../contexts/AuthContext';

interface AchievementCardProps {
    achievement: AchievementDefinition;
    achievedOn: number;
}

const AchievementCard = forwardRef<HTMLDivElement, AchievementCardProps>(({ achievement, achievedOn }, ref) => {
    const { user } = useAuth();
    const date = new Date(achievedOn).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div ref={ref} className="w-[400px] h-[250px] bg-dark-card border border-primary-glow rounded-xl p-6 flex flex-col justify-between text-white font-sans overflow-hidden relative shadow-2xl">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark-bg to-dark-card opacity-80"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--primary-glow),_transparent_40%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.05),_transparent_30%)]"></div>

            <div className="relative z-10">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 flex-shrink-0">
                        <achievement.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Achievement Unlocked</p>
                        <h2 className="text-2xl font-bold mt-1">{achievement.name}</h2>
                    </div>
                </div>
                <p className="text-sm text-dark-text-secondary mt-2">{achievement.description}</p>
            </div>

            <div className="relative z-10 flex justify-between items-end">
                <div>
                    <p className="text-sm font-semibold">{user?.name || 'A FocusFlow User'}</p>
                    <p className="text-xs text-dark-text-secondary">{date}</p>
                </div>
                <p className="text-lg font-bold text-primary opacity-70">FocusFlow</p>
            </div>
        </div>
    );
});

export default AchievementCard;
