// app/api/validate-reset-token/route.ts

import { connect } from "@/utils/config/dbConfig";
import User from "@/utils/models/auth";
import { NextResponse, NextRequest } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    
    const { resetToken } = await request.json();
    console.log(request.json());    
    console.log(resetToken)
    const user = await User.findOne({
        resetToken,
        resetTokenExpiry: { $gte: new Date()},
      });
      console.log("Found user:",resetToken);
      console.log("Found shit:",new Date());
    if (!user) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ valid: false, error: 'Error validating token' }, { status: 500 });
  }
}
