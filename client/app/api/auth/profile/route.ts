import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await req.json();

    // Validate input
    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
