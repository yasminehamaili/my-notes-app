'use client';

import React from 'react';
import style from './noteCard.module.css';

const NoteCard = ({ 
  note, 
  onClick, 
  onFavorite, 
  onArchive 
}) => {
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavorite(note._id, !note.isFavorite);
  };

  const handleArchiveClick = (e) => {
    e.stopPropagation();
    onArchive(note._id, !note.isArchived);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const truncateContent = (content, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div 
      className={style.noteCard}
      style={{ backgroundColor: note.color || '#C1D8F7' }}
      onClick={() => onClick(note)}
    >
      <div className={style.header}>
        <h3 className={style.title}>{note.title}</h3>
        <div className={style.actions}>
          <button
            className={`${style.actionBtn} ${note.isFavorite ? style.favorited : ''}`}
            onClick={handleFavoriteClick}
            title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <i className={note.isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
          </button>
          <button
            className={style.actionBtn}
            onClick={handleArchiveClick}
            title={note.isArchived ? 'Unarchive' : 'Archive'}
          >
            <i className={note.isArchived ? 'fa-solid fa-box-open' : 'fa-solid fa-box-archive'}></i>
          </button>
        </div>
      </div>
      
      <div className={style.content}>
        <p>{truncateContent(note.content)}</p>
      </div>
      
      <div className={style.footer}>
        <span className={style.date}>
          {formatDate(note.updatedAt)}
        </span>
        {note.isFavorite && (
          <span className={style.badge}>
            <i className="fa-solid fa-heart"></i>
          </span>
        )}
        {note.isArchived && (
          <span className={style.badge}>
            <i className="fa-solid fa-box-archive"></i>
          </span>
        )}
      </div>
    </div>
  );
};

export default NoteCard;