import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Note from "@/models/note";
import User from "@/models/user";


export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const filter = searchParams.get('filter'); 
    const search = searchParams.get('search');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    let query = { userId };
    
    // Apply filters
    if (filter === 'favorite') {
      query.isFavorite = true;
      query.isArchived = false;
    } else if (filter === 'archived') {
      query.isArchived = true;
    } else {
      query.isArchived = false; 
    }

    // Apply search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      notes
    });

  } catch (error) {
    console.error("Get notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// CREATE a new note
export async function POST(request) {
  try {
    await connectDB();
    
    const { title, content, userId, color } = await request.json();
    
    if (!title || !content || !userId) {
      return NextResponse.json(
        { error: "Title, content, and user ID are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const note = await Note.create({
      title,
      content,
      userId,
      color: color || '#C1D8F7'
    });

    return NextResponse.json({
      success: true,
      message: "Note created successfully",
      note
    });

  } catch (error) {
    console.error("Create note error:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}

// UPDATE a note
export async function PUT(request) {
  try {
    await connectDB();
    
    const { noteId, title, content, color, isFavorite, isArchived } = await request.json();
    
    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (color !== undefined) updateData.color = color;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const note = await Note.findByIdAndUpdate(
      noteId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      note
    });

  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }
}

// DELETE a note
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    
    if (!noteId) {
      return NextResponse.json(
        { error: "Note ID is required" },
        { status: 400 }
      );
    }

    const note = await Note.findByIdAndDelete(noteId);

    if (!note) {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully"
    });

  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}