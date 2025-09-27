'use client';

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import style from './main.module.css'
import FillInfo from '../components/fillInfos/page'
import NotePopup from '../components/notePopup/page'
import NoteCard from '../components/noteCard/NoteCard'

const Main = () => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showNotePopup, setShowNotePopup] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [userName, setUserName] = useState('user');
  const [userImage, setUserImage] = useState('/images/user.png'); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadNotes();
    }
  }, [userId, currentFilter]);

  useEffect(() => {
    // Filter notes based on search query
    if (searchQuery.trim()) {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [notes, searchQuery]);

  const initializeUser = async () => {
    try {
      const storedUserId = localStorage.getItem('userId');
      
      if (storedUserId) {
        console.log('Found stored user ID:', storedUserId);
        await loadUserProfile(storedUserId);
      } else {
        const sessionUserId = sessionStorage.getItem('userId');
        const shouldShowWelcome = sessionStorage.getItem('showWelcome');
        
        if (sessionUserId) {
          console.log('Found session user ID:', sessionUserId);
          setUserId(sessionUserId);
          localStorage.setItem('userId', sessionUserId);
          await loadUserProfile(sessionUserId);
          
          if (shouldShowWelcome === 'true') {
            setShowWelcomeModal(true);
            sessionStorage.removeItem('showWelcome');
          }
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      router.push('/signin');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userIdToLoad) => {
    try {
      const response = await fetch(`/api/user/profile?userId=${userIdToLoad}`);
      const data = await response.json();
      
      if (data.success && data.user) {
        setUserName(data.user.name || 'user');
        setUserImage(data.user.profileImage || '/images/user.png');
        setIsLoggedIn(true);
        setUserId(userIdToLoad);
        localStorage.setItem('userId', userIdToLoad);
        localStorage.setItem('userName', data.user.name || 'user');
        localStorage.setItem('userImage', data.user.profileImage || '/images/user.png');
        
        console.log('User profile loaded:', data.user);
      } else {
        console.error('Failed to load user profile:', data.message);
        localStorage.clear();
        sessionStorage.clear();
        router.push('/signin');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      localStorage.clear();
      sessionStorage.clear();
      router.push('/signin');
    }
  };

  const loadNotes = async () => {
    if (!userId) return;
    
    try {
      const filter = currentFilter === 'all' ? '' : currentFilter;
      const response = await fetch(`/api/notes?userId=${userId}&filter=${filter}`);
      const data = await response.json();
      
      if (data.success) {
        setNotes(data.notes);
      } else {
        console.error('Failed to load notes:', data.error);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleCreateNote = () => {
    setSelectedNote(null);
    setShowNotePopup(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setShowNotePopup(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      const isEditing = !!noteData.noteId;
      const url = '/api/notes';
      const method = isEditing ? 'PUT' : 'POST';
      
      const body = isEditing ? {
        noteId: noteData.noteId,
        title: noteData.title,
        content: noteData.content
      } : {
        title: noteData.title,
        content: noteData.content,
        userId: userId
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadNotes(); // Reload notes
        console.log('Note saved successfully');
      } else {
        throw new Error(data.error || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(`/api/notes?noteId=${noteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await loadNotes(); // Reload notes
        console.log('Note deleted successfully');
      } else {
        throw new Error(data.error || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  const handleFavoriteToggle = async (noteId, isFavorite) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, isFavorite }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadNotes(); // Reload notes
      } else {
        console.error('Failed to toggle favorite:', data.error);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleArchiveToggle = async (noteId, isArchived) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, isArchived }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadNotes(); // Reload notes
      } else {
        console.error('Failed to toggle archive:', data.error);
      }
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  };

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push('/signin');
  };

  const handleNameSubmit = async (name) => {
    if (!userId) {
      console.error('No user ID available');
      return;
    }
    
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUserName(name);
        localStorage.setItem('userName', name);
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile:', data.message);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleImageUpload = async (file) => {
    if (!userId || !file) {
      console.error('Missing user ID or file');
      return;
    }

    try {
      console.log('Uploading image for user:', userId);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', userId);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUserImage(data.imageUrl);
        localStorage.setItem('userImage', data.imageUrl);
        
        // Update user profile in database
        await fetch('/api/user/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, profileImage: data.imageUrl }),
        });
        
        console.log('Profile image updated:', data.imageUrl);
      } else {
        console.error('Failed to upload image:', data.error);
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw error;
    }
  };

  return (
    <>
    <main className={style.main}>
        <section className={style.bar}>
            <h1 className={style.barTitle}>My notes</h1>
            <div className={style.barChoices}>
                <a 
                  className={currentFilter === 'all' ? style.choice : style.barChoice}
                  onClick={() => handleFilterChange('all')}
                >
                  Dashboard
                </a>
                <a 
                  className={currentFilter === 'favorite' ? style.choice : style.barChoice}
                  onClick={() => handleFilterChange('favorite')}
                >
                  Favorite
                </a>
                <a 
                  className={currentFilter === 'archived' ? style.choice : style.barChoice}
                  onClick={() => handleFilterChange('archived')}
                >
                  Archive
                </a>
            </div>
            <div className={style.barIcons}>
                <a><i className={`${style.barIcon} fa-brands fa-instagram`}></i></a>
                <a><i className={`${style.barIcon} fa-brands fa-facebook`}></i></a>
                <a><i className={`${style.barIcon} fa-brands fa-tiktok`}></i></a>
            </div>
        </section>
        <section className={style.pricipal}>
            <nav className={style.nav}>
                <div className={style.search}>
                    <label htmlFor="search" className={style.searchIcon}>
                      <i className="fa-solid fa-magnifying-glass"></i>
                    </label>
                    <input 
                      type='search' 
                      placeholder='search' 
                      id='search' 
                      className={style.searchInput}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {isLoggedIn ? (
                  <div className={style.signin}>
                    <Image 
                      alt='user profile' 
                      src={userImage} 
                      width={500} 
                      height={500} 
                      className={style.signinImg}
                    />
                    <p className={style.signinText}>{userName}</p>
                    <i 
                      className="fa-solid fa-sign-out-alt" 
                      onClick={handleLogout}
                      style={{color: "#4D84CF", cursor: 'pointer' }}
                      title="Logout"
                    ></i>
                  </div>
                ) : (
                  <a href='/signin' className={style.signin}>
                    <Image 
                      alt='user' 
                      src='/images/user.png' 
                      width={500} 
                      height={500} 
                      className={style.signinImg}
                    />
                    <p className={style.signinText}>Sign in</p>
                  </a>
                )}
            </nav>
            
            <div className={style.salut}>
                <div className={style.salutText}>
                    <p className={style.salutBigT}>Welcome, {userName}!</p>
                    <p className={style.salutST}>
                      {currentFilter === 'favorite' ? 'Your favorite notes' :
                       currentFilter === 'archived' ? 'Your archived notes' : 
                       'Ready to take some notes?'}
                    </p>
                </div>
                <Image 
                  alt='cat-png' 
                  src='/images/cat-original.png' 
                  width={500} 
                  height={500} 
                  className={style.img}
                />
            </div>
            
            <div className={style.page}>
                {isLoggedIn ? (
                  filteredNotes.length > 0 ? (
                    <div className={style.notesGrid}>
                      {filteredNotes.map(note => (
                        <NoteCard
                          key={note._id}
                          note={note}
                          onClick={handleEditNote}
                          onFavorite={handleFavoriteToggle}
                          onArchive={handleArchiveToggle}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className={style.notConn}>
                      {searchQuery ? 'No notes found matching your search' :
                       currentFilter === 'favorite' ? 'No favorite notes yet' :
                       currentFilter === 'archived' ? 'No archived notes' :
                       'Tap + to add your first note'}
                    </p>
                  )
                ) : (
                  <p className={style.notConn}>Sign up to start</p>
                )}
            </div>
            
            <footer className={style.footer}>
                {isLoggedIn && (
                  <button className={style.add} onClick={handleCreateNote}>
                      <i className="fa-solid fa-plus"></i>
                  </button>
                )}
            </footer>
        </section>
    </main>

    <FillInfo
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onNameSubmit={handleNameSubmit}
        onImageUpload={handleImageUpload}
    />

    <NotePopup
        isOpen={showNotePopup}
        onClose={() => setShowNotePopup(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        note={selectedNote}
    />
    </>
  )
}

export default Main