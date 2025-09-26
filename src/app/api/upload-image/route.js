import { NextResponse } from "next/server";
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    console.log('Image upload API called');
    
    const formData = await request.formData();
    const file = formData.get('image');
    const userId = formData.get('userId');
    
    if (!file || !userId) {
      return NextResponse.json(
        { error: "Image and user ID are required" },
        { status: 400 }
      );
    }

    console.log('File received:', file.name, 'Size:', file.size);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP)" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Please upload an image smaller than 5MB" },
        { status: 400 }
      );
    }

    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const fileName = `profile_${userId}_${timestamp}${fileExtension}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define upload path
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    const filePath = path.join(uploadDir, fileName);
    
    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    await writeFile(filePath, buffer);
    console.log('File saved to:', filePath);

    // Return the public URL
    const imageUrl = `/uploads/profiles/${fileName}`;

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}