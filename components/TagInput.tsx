import React, { useState } from 'react';
import { XIcon } from './Icons';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, onChange, placeholder }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const newTag = inputValue.trim().toLowerCase();
            if (!tags.includes(newTag)) {
                onChange([...tags, newTag]);
            }
            setInputValue('');
        } else if (e.key === 'Backspace' && !inputValue) {
             onChange(tags.slice(0, -1));
        }
    };
    
    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border focus-within:ring-2 focus-within:ring-primary">
            {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-primary/20 text-primary text-sm font-medium px-2 py-1 rounded-md">
                    {tag}
                    <button onClick={() => removeTag(tag)} aria-label={`Remove tag: ${tag}`} className="text-primary hover:bg-primary/30 rounded-full">
                        <XIcon className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || 'Add a tag...'}
                aria-label="Add a new tag"
                className="flex-1 bg-transparent focus:outline-none min-w-[100px]"
            />
        </div>
    );
};

export default TagInput;