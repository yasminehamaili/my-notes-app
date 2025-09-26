import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(request) {
  try {
    console.log('Profile API called');
    await connectDB();
    console.log('Database connected');
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    console.log('Fetching profile for userId:', userId);
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log('User found:', user.name);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}