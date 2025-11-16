import React, { useRef, useCallback, forwardRef } from 'react';
import Modal from './Modal';
import { MilestoneDefinition } from '../constants/milestones';
import { ArrowDownTrayIcon, XMarkIcon as XIcon } from './Icons'; // Using XMarkIcon as XIcon
import { toPng } from 'html-to-image';
import { useNotifier } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

interface AchievementCardProps {
    achievement: MilestoneDefinition;
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
                        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Milestone Unlocked</p>
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


interface ShareAchievementModalProps {
    isOpen: boolean;
    onClose: () => void;
    achievement: MilestoneDefinition | null;
    achievedOn: number | null;
}

const ShareAchievementModal: React.FC<ShareAchievementModalProps> = ({ isOpen, onClose, achievement, achievedOn }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { addNotification } = useNotifier();

    const handleDownload = useCallback(() => {
        if (cardRef.current === null || !achievement) return;

        toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `focusflow-milestone-${achievement.id}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error("Failed to generate image", err);
                addNotification('Could not generate image. Please try again.', 'error');
            });
    }, [cardRef, achievement, addNotification]);

    if (!achievement || !achievedOn) return null;

    const shareText = `I just unlocked the "${achievement.name}" milestone in FocusFlow! 🎉\n\nCheck out this free, private, offline-first productivity app.`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=https://focusflowlab.netlify.app/&hashtags=productivity,focus,privacy`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Share Your Milestone`}>
            <div className="flex flex-col items-center gap-6">
                <p className="text-center text-dark-text-secondary -mt-2">You earned it! Share your progress with the world.</p>
                <AchievementCard ref={cardRef} achievement={achievement} achievedOn={achievedOn} />

                <div className="w-full flex flex-col sm:flex-row gap-4">
                    <button onClick={handleDownload} className="w-full flex-1 flex items-center justify-center gap-2 bg-dark-border px-4 py-3 rounded-lg font-semibold hover:bg-opacity-80">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Download Image
                    </button>
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="w-full flex-1 flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-800">
                        <XIcon className="w-5 h-5" />
                        Share on X
                    </a>
                </div>
            </div>
        </Modal>
    );
};

export default ShareAchievementModal;
