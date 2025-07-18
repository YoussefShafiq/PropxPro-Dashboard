import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TiptapWithImg from '../TextEditor/TiptapWithImg';

export default function Test() {
    const [content, setContent] = useState('<p>Start writing your help article here...</p>');
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('draft');
    const [headings, setHeadings] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [editorReady, setEditorReady] = useState(false);

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Please enter a title for your article');
            return;
        }

        if (!editorReady) {
            alert('Editor is not ready yet. Please wait a moment.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await axios.post(
                'https://propxpro.run.place/api/help-articles',
                {
                    title: title,
                    content: content,
                    status: status,
                    headings: headings, // Send headings as separate field
                },
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    }
                }
            );

            console.log('Article saved:', response.data);
            console.log('Headings saved:', headings);
            alert('Article saved successfully!');
        } catch (error) {
            console.error('Failed to save article:', error);
            alert(error.response?.data?.message || 'Failed to save article');
        } finally {
            setIsSaving(false);
        }
    };

    const handleContentUpdate = (html) => {
        setContent(html);
        setEditorReady(true);
    };

    const handleHeadingsUpdate = (extractedHeadings) => {
        setHeadings(extractedHeadings);
    };

    return (
        <div className="help-article-form">
            <h1>Create Help Article</h1>

            <div className="form-group">
                <label htmlFor="article-title">Title</label>
                <input
                    id="article-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article title"
                />
            </div>

            <div className="form-group">
                <label htmlFor="article-status">Status</label>
                <select
                    id="article-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                </select>
            </div>

            <div className="form-group">
                <label>Content</label>
                <TiptapWithImg
                    content={content}
                    onUpdate={handleContentUpdate}
                    onHeadingsUpdate={handleHeadingsUpdate}
                />
            </div>

            {/* Display extracted headings for debugging/preview */}
            {headings.length > 0 && (
                <div className="form-group">
                    <label>Table of Contents (Auto-generated)</label>
                    <div className="headings-preview">
                        {headings.map((heading, index) => (
                            <div key={index} className={`heading-item heading-level-${heading.level}`}>
                                <span className="heading-text">{heading.text}</span>
                                <span className="heading-id">#{heading.id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={handleSave}
                disabled={isSaving || !editorReady}
                className="save-button"
            >
                {isSaving ? 'Saving...' : 'Save Article'}
            </button>
        </div>
    );
}