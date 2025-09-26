import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import bcryptjs from "bcryptjs";

export async function POST(request) {
  try {
    await connectDB();

    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    const needsProfileSetup = user.name === 'user';

    const response = {
      success: true,
      isNewUser: needsProfileSetup,
      message: `Welcome back, ${user.name !== 'user' ? user.name : 'there'}!`,
      user: {
        id: user._id.toString(), 
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      },
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Login error:", error.message);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}