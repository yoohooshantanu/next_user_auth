// app/api/change-password/route.ts
import { NextResponse, NextRequest } from "next/server";
import { updateUserByResetToken } from "../../../utils/models/auth";
import bcryptjs from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { newPassword, resetToken } = await request.json();
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    const user = await updateUserByResetToken(resetToken, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });

    if (!user) {
      console.log("Error updating password");
      return NextResponse.json({ error: "Error updating password" }, { status: 400 });
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error updating password" }, { status: 500 });
  }
}
