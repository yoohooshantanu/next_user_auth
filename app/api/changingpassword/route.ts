import { connect } from "@/utils/config/dbConfig";
import User from "@/utils/models/auth";
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { NextResponse, NextRequest } from "next/server";
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@sendinblue/client';

connect();

export async function POST(request: NextRequest) {
  try {
    const { newPassword,resetToken } = await request.json();
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    
    const userdb = await User.findOneAndUpdate(
      { resetToken },
      { password:hashedPassword }, 
      { new: true }
    );

    if (!userdb) {
      console.log('Error updating reset token');
      return NextResponse.json({ error: 'Error updating reset token' });
    }
      return NextResponse.json({ error: ' saving password done',userdb });
    
  } catch (error) {
    return NextResponse.json({ error: 'Error resetting password' });
  }
}
