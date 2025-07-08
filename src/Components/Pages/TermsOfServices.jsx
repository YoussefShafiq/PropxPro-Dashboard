// src/pages/PrivacyAndTerms.jsx
import React, { useState } from 'react';
import Tiptap from '../TextEditor/Tiptap';
import TiptapWithImg from '../TextEditor/TiptapWithImg';

export default function TermsOfServices() {
    const [editorContent, setEditorContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/save-privacy-terms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: editorContent }),
            });

            if (response.ok) {
                alert('Content saved successfully!');
            }
        } catch (error) {
            console.error('Error saving content:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Terms of Services</h1>

            <div className="border border-gray-200 rounded-lg shadow-sm p-6 bg-white">
                <TiptapWithImg
                    content={editorContent}
                    onUpdate={setEditorContent}
                />

                <div className="flex gap-4 mt-6">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-6 py-2 rounded-md font-medium text-white ${isSaving ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} transition-colors`}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                        onClick={() => console.log(editorContent)}
                        className="px-6 py-2 rounded-md font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        View HTML Output
                    </button>
                </div>
            </div>
        </div>
    );
}