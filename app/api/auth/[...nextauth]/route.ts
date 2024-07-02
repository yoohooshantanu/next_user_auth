import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { findUserByEmail, createUser } from "../../../../utils/models/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { User as UserType } from "../../../../utils/types/types"; // Ensure to import the User type

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        try {
          const user = await findUserByEmail(email);
          if (!user) {
            return null;
          }
          const passwordsMatch = await bcrypt.compare(password, user.password!);
          if (!passwordsMatch) {
            return null;
          }
          // Map your user document to the User type
          const userForAuth: UserType = {
            id: user._id.toString(), // Ensure to include id property
            email: user.email,
            name: user.name,
          };
          return userForAuth;
        } catch (error) {
          console.log("Error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account && account.provider === "google") {
        try {
          const email = user?.email || profile?.email || "no-email@example.com";
          const name = user?.name || profile?.name || "Anonymous";
          if (email) {
            const existingUser = await findUserByEmail(email);
            if (!existingUser) {
              const newUser = await createUser({ name: name, email });
              user.id = newUser.insertedId.toString();
            } else {
              user.id = existingUser._id.toString();
            }
          }
          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email || "no-email@example.com";
        token.name = user.name || "Anonymous";
        token.id = user.id; // Ensure token has id
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email || "no-email@example.com";
        session.user.name = token.name || "Anonymous";
        session.user.id = token.id; // Ensure session has id
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
  pages: {
    signIn: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
