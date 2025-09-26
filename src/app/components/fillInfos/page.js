// app/components/fillInfos/page.js - With image upload
'use client';

import React, { useState } from 'react'
import style from './fillInfo.module.css'
import Image from 'next/image';

const FillInfo = ({ isOpen, onClose, onNameSubmit }) => {
  const [name, setName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }

    setUploading(true);
    
    try {
      // First, submit the name
      await onNameSubmit(name);
      
      // If there's an image, upload it
      if (selectedImage) {
        const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
        if (userId) {
          await uploadImage(selectedImage, userId);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const uploadImage = async (file, userId) => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', userId);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Update the user's profile with the new image
        await fetch('/api/user/update-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId, 
            profileImage: data.imageUrl 
          }),
        });
        
        // Update localStorage
        localStorage.setItem('userImage', data.imageUrl);
        console.log('Profile image uploaded:', data.imageUrl);
      } else {
        throw new Error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload profile image, but name was saved.');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={style.modalBackdrop} onClick={onClose}>
        <section className={style.fillInfoMain} onClick={(e) => e.stopPropagation()}>
          <div className={style.fillInfo}>
            <h1 className={style.title}>Welcome to My Notes!</h1>
            <p className={style.sTitle}>Please enter your name and upload a profile picture</p>
            
            <form className={style.form} onSubmit={handleSubmit}>
              {/* Image Upload Section */}
              <div className={style.imageSection}>
                <div className={style.imagePreview}>
                  {imagePreview ? (
                    <Image 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className={style.previewImg}
                      width={120}
                      height={120}
                    />
                  ) : (
                    <div className={style.placeholderImg}>
                      <i className="fa-solid fa-user"></i>
                    </div>
                  )}
                </div>
                
                <input 
                  type="file" 
                  id="fileUpload" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleImageChange}
                />
                <label htmlFor="fileUpload" className={style.imageBtn}>
                  <i className="fa-solid fa-camera"></i>
                  {selectedImage ? 'Change Photo' : 'Add Photo'}
                </label>
              </div>

              {/* Name Input */}
              <input 
                type='text' 
                placeholder='Enter your name'
                className={style.input} 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
                disabled={uploading}
              />
              
              <button 
                type='submit' 
                className={style.btn}
                disabled={uploading}
              >
                {uploading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </>
  )
}

export default FillInfo