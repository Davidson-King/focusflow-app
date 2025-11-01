import React, { useEffect, useRef } from 'react';
import Quill from 'quill';

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
];

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, ariaLabel }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillInstance = useRef<any>(null);

    useEffect(() => {
        if (editorRef.current && !quillInstance.current) {
            const quill = new Quill(editorRef.current, {
                modules: { toolbar: toolbarOptions },
                theme: 'bubble',
                placeholder: placeholder || 'Start writing...',
            });
            quillInstance.current = quill;

            const editor = editorRef.current.querySelector('.ql-editor');
            if (editor && ariaLabel) {
                editor.setAttribute('aria-label', ariaLabel);
            }

            quill.on('text-change', (delta: any, oldDelta: any, source: string) => {
                if (source === 'user') {
                    onChange(quill.root.innerHTML);
                }
            });
        }
    }, [ariaLabel, placeholder, onChange]);

    useEffect(() => {
        const quill = quillInstance.current;
        if (quill && quill.root.innerHTML !== value) {
            quill.root.innerHTML = value;
        }
    }, [value]);

    return <div ref={editorRef} className="h-full" />;
};

export default RichTextEditor;