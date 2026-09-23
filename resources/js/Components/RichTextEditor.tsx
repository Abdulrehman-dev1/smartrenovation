import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Youtube from '@tiptap/extension-youtube';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useRef } from 'react';

type Props = {
    value: string;
    onChange: (html: string) => void;
    error?: string;
    placeholder?: string;
};

function csrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

function ToolbarButton({
    onClick,
    active,
    children,
    title,
}: {
    onClick: () => void;
    active?: boolean;
    children: React.ReactNode;
    title: string;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`rounded px-2 py-1 text-xs font-medium ${
                active ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
        >
            {children}
        </button>
    );
}

export default function RichTextEditor({
    value,
    onChange,
    error,
    placeholder = 'Write content…',
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
            }),
            Image.configure({
                allowBase64: false,
                HTMLAttributes: { class: 'rounded-md max-w-full h-auto' },
            }),
            Youtube.configure({
                width: 640,
                height: 360,
                HTMLAttributes: { class: 'rounded-md aspect-video w-full' },
            }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || '',
        onUpdate: ({ editor: current }) => {
            onChange(current.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'rich-content min-h-[180px] px-3 py-2 focus:outline-none',
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        const next = value || '';
        if (next !== current && next !== '<p></p>') {
            editor.commands.setContent(next, { emitUpdate: false });
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previous = editor.getAttributes('link').href as string | undefined;
        const url = window.prompt('Link URL (leave empty to remove)', previous || 'https://');
        if (url === null) return;
        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().unsetUnderline().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    };

    const removeLink = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().unsetUnderline().run();
    };

    const addImageFromUrl = () => {
        const url = window.prompt('Image URL', 'https://');
        if (!url) return;
        editor.chain().focus().setImage({ src: url }).run();
    };

    const uploadImage = async (file: File | null) => {
        if (!file) return;
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/admin/editor-uploads', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: form,
        });
        if (!res.ok) {
            window.alert('Image upload failed. Use jpeg/png/webp under 50MB.');
            return;
        }
        const json = (await res.json()) as { url: string };
        editor.chain().focus().setImage({ src: json.url }).run();
    };

    const addVideo = () => {
        const url = window.prompt('YouTube URL');
        if (!url) return;
        editor.commands.setYoutubeVideo({ src: url });
    };

    return (
        <div>
            <div className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
                <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
                    <ToolbarButton title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')}>
                        P
                    </ToolbarButton>
                    <ToolbarButton title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
                        H1
                    </ToolbarButton>
                    <ToolbarButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
                        H2
                    </ToolbarButton>
                    <ToolbarButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
                        H3
                    </ToolbarButton>
                    <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
                        Bold
                    </ToolbarButton>
                    <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
                        Italic
                    </ToolbarButton>
                    <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
                        Underline
                    </ToolbarButton>
                    <ToolbarButton title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
                        • List
                    </ToolbarButton>
                    <ToolbarButton title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
                        1. List
                    </ToolbarButton>
                    <ToolbarButton title="Link" onClick={setLink} active={editor.isActive('link')}>
                        Link
                    </ToolbarButton>
                    <ToolbarButton title="Remove link" onClick={removeLink} active={false}>
                        Unlink
                    </ToolbarButton>
                    <ToolbarButton title="Image URL" onClick={addImageFromUrl}>
                        Image URL
                    </ToolbarButton>
                    <ToolbarButton title="Upload image" onClick={() => fileInputRef.current?.click()}>
                        Upload image
                    </ToolbarButton>
                    <ToolbarButton title="YouTube video" onClick={addVideo}>
                        Video
                    </ToolbarButton>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                            uploadImage(e.target.files?.[0] ?? null);
                            e.target.value = '';
                        }}
                    />
                </div>
                <EditorContent editor={editor} />
            </div>
            {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
        </div>
    );
}
