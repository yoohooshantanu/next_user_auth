"use client";

import { Mail, Lock } from "lucide-react";
import Image from "next/image";
import bg from "../public/bg3.png";
import logo from "../public/logo.png";
import google from "../public/google2.svg";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from "axios";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setUser((prevInfo) => ({ ...prevInfo, [name]: value }));
  };
  const handleResetPassword = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    console.log(user);
    try {
      if ( !user.email ) {
        setError("please enter email");
        return;
      }
      const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
      if (!emailRegex.test(user.email)) {
        setError("invalid email id");
        return;
      }
      const res = await axios.post("/api/reset-password", user);
      console.log(res.data);
      if (res.status == 200 || res.status == 201) {
        console.log("redirected successfully");
        setError("");
        router.push("/reset-password");
      }
    } catch (error) {
      console.log(error);
      setError("");
    } finally {
      setLoading(false);

      setUser({
      
        email: "",
        password: "",
      });
    }
  };


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user.email || !user.password) {
        setError("Please fill in all fields");
        return;
      }
      const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;
      if (!emailRegex.test(user.email)) {
        setError("Invalid email format");
        return;
      }

      const res = await signIn("credentials", {
        email: user.email,
        password: user.password,
        redirect: false,
      });

      if (res?.error) {
        console.log(res);
        setError("Authentication error");
      }

      setError("");
      router.push("/dashboard");
    } catch (error) {
      console.error('Login error:', error);
      setError("Error occurred during login");
    } finally {
      setLoading(false);
      setUser({
        email: "",
        password: "",
      });
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: `url("/background.png")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="grid place-items-center mx-auto max-w-4xl w-full py-10 min-h-screen">
        <div className="flex justify-center items-center lg:flex-row flex-col gap-6 lg:gap-0 w-full shadow-md rounded-2xl">
          <div className="lg:w-1/2 w-full bg-[#5D7DF3]">
            <Image
              src={bg}
              alt="bg"
              className="w-full h-full"
              width={300}
              height={300}
            />
          </div>
          <div className="lg:w-1/2 w-full flex flex-col justify-center items-center py-6 bg-[#eff1f6]">
            <div className="rounded px-4 py-2 shadow bg-[#90a5ef]">
              <Image src={logo} alt="bg" width={100} height={100} />
            </div>
            <div className="text-slate-900 font-medium text-xl py-5">
              Hello! Welcome Back
            </div>

            <form
              className="w-full px-5 py-6 space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col w-full lg:px-5">
                <label className="text-sm">Email</label>
                <div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
                  <Mail className="w-7 h-7 text-[#A1BDFD]" />
                  <input
                    type={"email"}
                    placeholder="example@123.com"
                    name="email"
                    className="outline-none w-full px-4"
                    value={user.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full lg:px-5">
                <label className="text-sm">Password</label>
                <div className="bg-white flex justify-start items-start py-3 px-4 rounded text-slate-600 text-lg mt-1">
                  <Lock className="w-7 h-7 text-[#A1BDFD]" />
                  <input
                    type={"password"}
                    placeholder="**********"
                    name="password"
                    className="outline-none w-full px-4"
                    value={user.password}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid place-items-center w-full mx-auto pt-7">
                {error && <p className="py-6 text-lg">{error}</p>}
                  <button
                    type="submit"
                    className="bg-[#5D7DF3] text-white text-lg w-full px-8 py-3 rounded-md uppercase font-semibold"
                  >
                    Login
                  </button>
                </div>

                <div className="flex justify-center w-full items-center gap-3 py-3">
                  <div className="border-b border-gray-800 py-2 w-full px-6" />
                  <div className="mt-3">or</div>
                  <div className="border-b border-gray-800 py-2 w-full px-6" />
                </div>
                <div className="flex justify-center items-center w-full gap-8 pb-8">
                  <div
                    onClick={handleResetPassword} // Added onClick event for resetting password
                    className="rounded px-6 py-2 shadow cursor-pointer bg-gray-50 grid place-items-center mx-auto mb-4"
                  >
                    Reset Password
                  </div>
                  <div
                    onClick={() => signIn("google")}
                    className="rounded px-6 py-2 shadow cursor-pointer bg-gray-50 grid place-items-center mx-auto mb-4"
                  >
                    <Image src={google} alt="bg" width={100} height={100} />
                  </div>{" "}
                </div>
                <div className="text-lg text-slate-900 font-medium">
                  <span>Don't have an account?</span>
                  <a
                    href="/signup"
                    className="text-[#5D7DF3] pl-3 hover:underline"
                  >
                    Create an account
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;