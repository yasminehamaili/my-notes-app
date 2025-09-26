'use client';

import React, { useState, useEffect } from 'react';
import style from './notePopup.module.css';

const NotePopup = ({ 
  isOpen, 
  onClose, 
  onSave, 
  onDelete,
  note = null, 
  isEditing = false 
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (note) {
        // Editing existing note
        setTitle(note.title || '');
        setContent(note.content || '');
      } else {
        // Creating new note
        setTitle('');
        setContent('');
      }
    }
  }, [isOpen, note]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        content: content.trim(),
        noteId: note?._id
      });
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note?._id) return;
    
    const confirmed = confirm('Are you sure you want to delete this note?');
    if (!confirmed) return;

    setSaving(true);
    try {
      await onDelete(note._id);
      onClose();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={style.modalBackdrop} onClick={onClose}>
      <div className={style.notePopup} onClick={(e) => e.stopPropagation()}>
        <div className={style.header}>
          <h2 className={style.title}>
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
          <div className={style.actions}>
            {note && (
              <button 
                className={style.deleteBtn}
                onClick={handleDelete}
                disabled={loading}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            )}
            <button 
              className={style.closeBtn}
              onClick={onClose}
              disabled={loading}
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>

        <div className={style.form}>
          <input
            type="text"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={style.titleInput}
            disabled={loading}
            maxLength={100}
          />
          
          <textarea
            placeholder="Start writing your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={style.contentInput}
            disabled={loading}
            maxLength={5000}
            rows={10}
          />
          
          <div className={style.footer}>
            <div className={style.charCount}>
              {content.length}/5000 characters
            </div>
            <div className={style.buttonGroup}>
              <button 
                className={style.cancelBtn}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className={style.saveBtn}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotePopup;