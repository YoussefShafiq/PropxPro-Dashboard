import { EditorProvider, useCurrentEditor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold, Italic, Strikethrough, List, ListOrdered,
    Heading1, Heading2, Heading3, Quote, Code,
    Undo, Redo, Code2, Minus, AlignLeft,
    AlignCenter, AlignRight, Image, Link, Unlink,
    InfoIcon,
    Check,
    X
} from 'lucide-react';
import TextAlign from '@tiptap/extension-text-align';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import { useCallback, useRef, useState, useEffect } from 'react';
import axios from 'axios';
import './styles.scss';

// Utility function to generate slug from text
const generateSlug = (text) => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Custom heading extension with auto-generated IDs
import { Heading } from '@tiptap/extension-heading';
import toast from 'react-hot-toast';

const HeadingWithId = Heading.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            id: {
                default: null,
                parseHTML: element => element.getAttribute('id'),
                renderHTML: attributes => {
                    if (!attributes.id) {
                        return {};
                    }
                    return {
                        id: attributes.id,
                    };
                },
            },
        };
    },

    addCommands() {
        return {
            ...this.parent?.(),
            setHeadingWithId: (attributes) => ({ commands }) => {
                return commands.setNode(this.name, attributes);
            },
        };
    },
});

// Custom image extension with alt text support
const CustomImageExtension = ImageExtension.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            alt: {
                default: '',
                parseHTML: element => element.getAttribute('alt'),
                renderHTML: attributes => {
                    if (!attributes.alt) {
                        return {};
                    }
                    return {
                        alt: attributes.alt,
                    };
                },
            },
        };
    },
});

const extensions = [
    StarterKit.configure({
        heading: false, // Disable default heading
    }),
    HeadingWithId.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
            class: 'heading-with-id',
        },
    }),
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
    CustomImageExtension.configure({
        inline: true,
        allowBase64: false,
        HTMLAttributes: {
            class: 'help-center-image',
        },
    }),
    LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'custom-link',
            rel: 'noopener noreferrer',
        },
    }),
];

const MenuBar = () => {
    const { editor } = useCurrentEditor();
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showImageAltInput, setShowImageAltInput] = useState(false);
    const [imageAltText, setImageAltText] = useState('');
    const [currentImagePos, setCurrentImagePos] = useState(null);
    const linkInputRef = useRef(null);
    const altInputRef = useRef(null);

    if (!editor) {
        return null;
    }

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post(
                'https://api.propxpro.com/api/admin/blogs/images/upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    },
                }
            );

            if (response.data.success && response.data.data?.url) {
                const src = response.data.data.url;
                editor.chain().focus().setImage({ src }).run();

                // After image is inserted, show alt text input
                const { state } = editor;
                const { selection } = state;
                const pos = selection.$anchor.pos - 1; // Position of the inserted image

                setCurrentImagePos(pos);
                setImageAltText('');
                setShowImageAltInput(true);
                setTimeout(() => {
                    altInputRef.current?.focus();
                }, 100);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            toast.error('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
            event.target.value = '';
        }
    };

    const handleImageAltSubmit = (e) => {
        e.preventDefault();
        if (!currentImagePos) return;

        const { state } = editor;
        const node = state.doc.nodeAt(currentImagePos);

        if (node && node.type.name === 'image') {
            editor
                .chain()
                .focus()
                .command(({ tr }) => {
                    const nodeAttrs = { ...node.attrs, alt: imageAltText };
                    tr.setNodeMarkup(currentImagePos, undefined, nodeAttrs);
                    return true;
                })
                .run();
        }

        setShowImageAltInput(false);
        setImageAltText('');
        setCurrentImagePos(null);
    };

    const handleImageAltCancel = () => {
        setShowImageAltInput(false);
        setImageAltText('');
        setCurrentImagePos(null);
        editor.chain().focus().run();
    };

    const handleLinkClick = (e) => {
        e.preventDefault();

        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');

        if (selectedText.trim() === '') {
            toast.error('Please select some text first');
            return;
        }

        // If link is already active, get current URL
        if (editor.isActive('link')) {
            const currentUrl = editor.getAttributes('link').href || '';
            setLinkUrl(currentUrl);
        } else {
            setLinkUrl('');
        }

        setShowLinkInput(true);
        setTimeout(() => {
            linkInputRef.current?.focus();
        }, 100);
    };

    const handleLinkSubmit = (e) => {
        e.preventDefault();

        if (linkUrl.trim() === '') {
            setShowLinkInput(false);
            return;
        }

        // Add protocol if not present
        let finalUrl = linkUrl.trim();
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }

        editor.chain().focus().setLink({ href: finalUrl }).run();
        setShowLinkInput(false);
        setLinkUrl('');
    };

    const handleLinkCancel = () => {
        setShowLinkInput(false);
        setLinkUrl('');
        editor.chain().focus().run();
    };

    const handleUnlink = (e) => {
        e.preventDefault();
        editor.chain().focus().unsetLink().run();
    };

    const handleImageClick = (e) => {
        e.preventDefault();
        const { state } = editor;
        const { selection } = state;
        const node = state.doc.nodeAt(selection.from - 1);

        if (node && node.type.name === 'image') {
            setCurrentImagePos(selection.from - 1);
            setImageAltText(node.attrs.alt || '');
            setShowImageAltInput(true);
            setTimeout(() => {
                altInputRef.current?.focus();
            }, 100);
        }
    };

    return (
        <div className="tiptap-toolbar single-line">
            <div className="toolbar-group">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleBold().run();
                    }}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'is-active' : ''}
                    title="Bold"
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleItalic().run();
                    }}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'is-active' : ''}
                    title="Italic"
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleStrike().run();
                    }}
                    disabled={!editor.can().chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'is-active' : ''}
                    title="Strikethrough"
                >
                    <Strikethrough size={16} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleHeading({ level: 1 }).run();
                    }}
                    className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                    title="Heading 1"
                >
                    <Heading1 size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleHeading({ level: 2 }).run();
                    }}
                    className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                    title="Heading 2"
                >
                    <Heading2 size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleHeading({ level: 3 }).run();
                    }}
                    className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                    title="Heading 3"
                >
                    <Heading3 size={16} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleBulletList().run();
                    }}
                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                    title="Bullet List"
                >
                    <List size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleOrderedList().run();
                    }}
                    className={editor.isActive('orderedList') ? 'is-active' : ''}
                    title="Numbered List"
                >
                    <ListOrdered size={16} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleBlockquote().run();
                    }}
                    className={editor.isActive('blockquote') ? 'is-active' : ''}
                    title="info icon"
                >
                    <InfoIcon size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleCodeBlock().run();
                    }}
                    className={editor.isActive('codeBlock') ? 'is-active' : ''}
                    title="Code Block"
                >
                    <Code2 size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().setHorizontalRule().run();
                    }}
                    title="Horizontal Rule"
                >
                    <Minus size={16} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().setTextAlign('left').run();
                    }}
                    className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
                    title="Align Left"
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().setTextAlign('center').run();
                    }}
                    className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
                    title="Align Center"
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().setTextAlign('right').run();
                    }}
                    className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
                    title="Align Right"
                >
                    <AlignRight size={16} />
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={handleLinkClick}
                    className={editor.isActive('link') ? 'is-active' : ''}
                    title="Add/Edit Link"
                >
                    <Link size={16} />
                </button>

                {editor.isActive('link') && (
                    <button
                        onClick={handleUnlink}
                        title="Remove Link"
                    >
                        <Unlink size={16} />
                    </button>
                )}
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={isUploading}
                />
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        fileInputRef.current.click();
                    }}
                    title="Upload Image"
                    disabled={isUploading}
                    className={isUploading ? 'is-uploading' : ''}
                >
                    {isUploading ? 'Uploading...' : <Image size={16} />}
                </button>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-group">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().undo().run();
                    }}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <Undo size={16} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().redo().run();
                    }}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <Redo size={16} />
                </button>
            </div>

            {/* Link Input Modal */}
            {showLinkInput && (
                <div className="link-input-modal">
                    <div className="link-input-overlay" onClick={handleLinkCancel} />
                    <div className="link-input-container">
                        <div>
                            <input
                                ref={linkInputRef}
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="Enter URL (e.g., https://example.com)"
                                className="link-input"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleLinkSubmit(e);
                                    }
                                    if (e.key === 'Escape') {
                                        handleLinkCancel();
                                    }
                                }}
                            />
                            <div className="link-input-buttons">
                                <button type="button" onClick={handleLinkSubmit} className="link-submit-btn">
                                    {editor.isActive('link') ? 'Update' : 'Add'} Link
                                </button>
                                <button type="button" onClick={handleLinkCancel} className="link-cancel-btn">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Alt Text Input Modal */}
            {showImageAltInput && (
                <div className="link-input-modal">
                    <div className="link-input-overlay" onClick={handleImageAltCancel} />
                    <div className="link-input-container">
                        <div>
                            <input
                                ref={altInputRef}
                                type="text"
                                value={imageAltText}
                                onChange={(e) => setImageAltText(e.target.value)}
                                placeholder="Enter alt text for the image"
                                className="link-input"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleImageAltSubmit(e);
                                    }
                                    if (e.key === 'Escape') {
                                        handleImageAltCancel();
                                    }
                                }}
                            />
                            <div className="link-input-buttons">
                                <button type="button" onClick={handleImageAltSubmit} className="link-submit-btn">
                                    Save Alt Text
                                </button>
                                <button type="button" onClick={handleImageAltCancel} className="link-cancel-btn">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const CustomBubbleMenu = () => {
    const { editor } = useCurrentEditor();
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showImageAltInput, setShowImageAltInput] = useState(false);
    const [imageAltText, setImageAltText] = useState('');
    const [currentImagePos, setCurrentImagePos] = useState(null);
    const linkInputRef = useRef(null);
    const altInputRef = useRef(null);

    if (!editor) {
        return null;
    }

    const handleBubbleLinkClick = (e) => {
        e.preventDefault();

        if (editor.isActive('link')) {
            const currentUrl = editor.getAttributes('link').href || '';
            setLinkUrl(currentUrl);
        } else {
            setLinkUrl('');
        }

        setShowLinkInput(true);
        setTimeout(() => {
            linkInputRef.current?.focus();
        }, 100);
    };

    const handleBubbleLinkSubmit = (e) => {
        e.preventDefault();

        if (linkUrl.trim() === '') {
            setShowLinkInput(false);
            return;
        }

        let finalUrl = linkUrl.trim();
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }

        editor.chain().focus().setLink({ href: finalUrl }).run();
        setShowLinkInput(false);
        setLinkUrl('');
    };

    const handleBubbleLinkCancel = () => {
        setShowLinkInput(false);
        setLinkUrl('');
        editor.chain().focus().run();
    };

    const handleBubbleUnlink = (e) => {
        e.preventDefault();
        editor.chain().focus().unsetLink().run();
    };

    const handleBubbleImageAltClick = (e) => {
        e.preventDefault();

        // Find the image node at the current selection
        const { state } = editor;
        const { from, to } = state.selection;

        // Check all nodes in the current selection range
        state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === 'image') {
                setCurrentImagePos(pos);
                setImageAltText(node.attrs.alt || '');
                setShowImageAltInput(true);
                setTimeout(() => {
                    altInputRef.current?.focus();
                }, 100);
                return false; // Stop searching after first image found
            }
        });
    };

    const handleBubbleImageAltSubmit = (e) => {
        e.preventDefault();

        if (currentImagePos === null) return;

        editor.chain().focus().command(({ tr }) => {
            const node = tr.doc.nodeAt(currentImagePos);
            if (node && node.type.name === 'image') {
                tr.setNodeMarkup(currentImagePos, undefined, {
                    ...node.attrs,
                    alt: imageAltText
                });
            }
            return true;
        }).run();

        setShowImageAltInput(false);
        setImageAltText('');
        setCurrentImagePos(null);
    };

    const handleBubbleImageAltCancel = () => {
        setShowImageAltInput(false);
        setImageAltText('');
        setCurrentImagePos(null);
        editor.chain().focus().run();
    };

    return (
        <BubbleMenu
            editor={editor}
            tippyOptions={{
                duration: 100,
                onHidden: () => {
                    // Reset inputs when bubble menu hides
                    setShowLinkInput(false);
                    setShowImageAltInput(false);
                    setLinkUrl('');
                    setImageAltText('');
                    setCurrentImagePos(null);
                }
            }}
        >
            <div className="bubble-menu">
                {/* Always show these buttons */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleBold().run();
                    }}
                    className={editor.isActive('bold') ? 'is-active' : ''}
                    title="Bold"
                >
                    <Bold size={14} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleItalic().run();
                    }}
                    className={editor.isActive('italic') ? 'is-active' : ''}
                    title="Italic"
                >
                    <Italic size={14} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleHeading({ level: 1 }).run();
                    }}
                    className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                    title="Heading 1"
                >
                    H1
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleHeading({ level: 2 }).run();
                    }}
                    className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                    title="Heading 2"
                >
                    H2
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleHeading({ level: 3 }).run();
                    }}
                    className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                    title="Heading 3"
                >
                    H3
                </button>

                {/* Link buttons */}
                <button
                    onClick={handleBubbleLinkClick}
                    className={editor.isActive('link') ? 'is-active' : ''}
                    title="Add/Edit Link"
                >
                    <Link size={14} />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleBlockquote().run();
                    }}
                    className={editor.isActive('blockquote') ? 'is-active' : ''}
                    title="info icon"
                >
                    <InfoIcon size={16} />
                </button>
                {editor.isActive('link') && (
                    <button
                        onClick={handleBubbleUnlink}
                        title="Remove Link"
                    >
                        <Unlink size={14} />
                    </button>
                )}

                {/* Image Alt button - only shown when image is selected */}
                {editor.isActive('image') && (
                    <button
                        onClick={handleBubbleImageAltClick}
                        title="Edit Alt Text"
                    >
                        Alt
                    </button>
                )}

                {/* Image Alt Text Input */}
                {showImageAltInput && (
                    <div className="bubble-link-input">
                        <div>
                            <input
                                ref={altInputRef}
                                type="text"
                                value={imageAltText}
                                onChange={(e) => setImageAltText(e.target.value)}
                                placeholder="Enter alt text"
                                className="bubble-link-field"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleBubbleImageAltSubmit(e);
                                    }
                                    if (e.key === 'Escape') {
                                        handleBubbleImageAltCancel();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleBubbleImageAltSubmit}
                                className="bubble-link-submit "
                            >
                                <Check size={16} color='green' />

                            </button>
                            <button
                                type="button"
                                onClick={handleBubbleImageAltCancel}
                                className="bubble-link-cancel"
                            >
                                <X size={16} color='red' />
                            </button>
                        </div>
                    </div>
                )}

                {/* Link Input (kept from previous implementation) */}
                {showLinkInput && (
                    <div className="bubble-link-input">
                        <div>
                            <input
                                ref={linkInputRef}
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="Enter URL"
                                className="bubble-link-field"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleBubbleLinkSubmit(e);
                                    }
                                    if (e.key === 'Escape') {
                                        handleBubbleLinkCancel();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={handleBubbleLinkSubmit}
                                className="bubble-link-submit"
                            >
                                ✓
                            </button>
                            <button
                                type="button"
                                onClick={handleBubbleLinkCancel}
                                className="bubble-link-cancel"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </BubbleMenu>
    );
};

// Function to extract headings from HTML content and ensure IDs are present
const extractHeadings = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    return Array.from(headingElements).map(heading => {
        const text = heading.textContent.trim();
        const existingId = heading.id;
        const generatedId = generateSlug(text);

        return {
            id: existingId || generatedId,
            text: text,
            level: parseInt(heading.tagName.substring(1)),
            tag: heading.tagName.toLowerCase()
        };
    });
};

// Function to ensure all headings in HTML have IDs
const ensureHeadingIds = (htmlContent) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    let updated = false;

    headingElements.forEach(heading => {
        const text = heading.textContent.trim();
        if (text && !heading.id) {
            heading.id = generateSlug(text);
            updated = true;
        }
    });

    return updated ? doc.body.innerHTML : htmlContent;
};

const TiptapWithImg = ({ content = '', onUpdate, onHeadingsUpdate }) => {
    const [initialized, setInitialized] = useState(false);
    const [editor, setEditor] = useState(null);
    const updateTimeoutRef = useRef(null);

    // Debounced function to update heading IDs
    const updateHeadingIds = useCallback((editor) => {
        if (!editor || !initialized) return;

        // Clear any existing timeout
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        // Set a new timeout to update IDs after user stops typing
        updateTimeoutRef.current = setTimeout(() => {
            const { state } = editor;
            const { tr } = state;
            let updated = false;

            state.doc.descendants((node, pos) => {
                if (node.type.name === 'heading' && node.textContent) {
                    const currentId = node.attrs.id;
                    const expectedId = generateSlug(node.textContent);

                    if (currentId !== expectedId) {
                        tr.setNodeMarkup(pos, undefined, { ...node.attrs, id: expectedId });
                        updated = true;
                    }
                }
            });

            if (updated) {
                editor.view.dispatch(tr);
            }
        }, 500); // Wait 500ms after user stops typing
    }, [initialized]);

    const handleUpdate = useCallback(({ editor }) => {
        if (initialized) {
            let html = editor.getHTML();

            // Ensure all headings have IDs in the HTML content
            html = ensureHeadingIds(html);

            // Extract headings from the HTML
            const headings = extractHeadings(html);

            // Call the update callbacks
            if (onUpdate) {
                onUpdate(html);
            }

            if (onHeadingsUpdate) {
                onHeadingsUpdate(headings);
            }

            // Update heading IDs with debounce
            updateHeadingIds(editor);
        }
    }, [onUpdate, onHeadingsUpdate, initialized, updateHeadingIds]);

    const handleCreate = useCallback(({ editor }) => {
        setEditor(editor);
    }, []);

    useEffect(() => {
        setInitialized(true);

        // Cleanup timeout on unmount
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="tiptap-container">
            <EditorProvider
                extensions={extensions}
                content={content}
                onUpdate={handleUpdate}
                onCreate={handleCreate}
            >
                <MenuBar />
                <CustomBubbleMenu />
            </EditorProvider>
        </div>
    );
};

export default TiptapWithImg;