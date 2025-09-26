import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/user";
import bcryptjs from "bcryptjs";

export async function POST(request) {
  console.log('📝 Signin API called');
  
  try {
    console.log('🔌 Attempting to connect to database...');
    await connectDB();
    console.log('✅ Database connected successfully');

    const body = await request.json();
    console.log('📨 Request body received:', { 
      email: body.email, 
      password: body.password ? '***' : 'missing',
      confirmPassword: body.confirmPassword ? '***' : 'missing'
    });

    const { email, password, confirmPassword } = body;
    
    if (!email || !password || !confirmPassword) {
      console.log('❌ Missing fields validation failed');
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      console.log('❌ Password mismatch validation failed');
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    console.log('🔍 Checking if user already exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return NextResponse.json(
        { error: "User already exists. Please log in instead." },
        { status: 409 }
      );
    }

    console.log('🔐 Hashing password...');
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    console.log('👤 Creating new user...');
    const user = await User.create({
      email,
      password: hashedPassword,
      name: 'user', 
      profileImage: '/images/user.png' 
    });

    console.log('✅ User created successfully:', user._id);

    const response = {
      success: true,
      isNewUser: true,
      message: "Account created successfully! Welcome to My Notes!",
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        profileImage: user.profileImage
      },
    };

    console.log('📤 Sending success response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error("💥 Signup error:", error);
    console.error("Error stack:", error.stack);
    
    return NextResponse.json(
      { 
        error: "Internal server error. Please try again.",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
