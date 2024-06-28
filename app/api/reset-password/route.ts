import { connect } from "@/utils/config/dbConfig";
import User from "@/utils/models/auth";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { NextResponse, NextRequest } from "next/server";
import { TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from '@sendinblue/client';

connect();

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    const resetToken = crypto.randomBytes(20).toString('hex');
 
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;
    const emailBody = `Please click on this link to reset your password: <a href="${resetUrl}">Reset Password</a>`;
    
    const userdb = await User.findOneAndUpdate(
      { email },
      { resetToken: resetToken, resetTokenExpiry: Date.now() + 36000000 }, // Token expires in 1 hour
      { new: true }
    );

    if (!userdb) {
      console.log('Error updating reset token');
      return NextResponse.json({ error: 'Error updating reset token' });
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.error('BREVO_API_KEY is not defined');
      return NextResponse.json({ error: 'Server configuration error' });
    }

    // Initialize Brevo (Sendinblue) client
    const brevoClient = new TransactionalEmailsApi();
    brevoClient.setApiKey(TransactionalEmailsApiApiKeys.apiKey, apiKey);

    const emailParams = {
      sender: { email: 'santanujuvekar@gmail.com' }, // Replace with your sender email
      to: [{ email }],
      subject: 'Reset Your Password',
      htmlContent: emailBody,
    };

    const response = await brevoClient.sendTransacEmail(emailParams);

    if (response.body && response.body.messageId) {
      return NextResponse.json({ message: "Email successfully sent" ,response});
    } else {
      console.error('Error in Brevo response:', response);
      return NextResponse.json({ error: 'Error sending email' });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Error resetting password' });
  }
}
