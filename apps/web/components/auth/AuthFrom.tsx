"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signup, signin } from "@/service/AuthService";
import { useRouter } from "next/navigation";


type AuthType = "signin" | "signup";

interface AuthFormProps {
  type: AuthType;
}

export default function AuthForm({ type }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const router = useRouter();

  // pass the auth data -> backend 
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let response;
    try {
      if (type === "signup") {
        response = await signup({ username, email, password });
        alert(" WELCOME to  𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔..")
        router.push("/signin");

      }
      else {
      const  response = await signin({ email, password });
        alert("Signin successfully completed...!");

        router.push("/dashboard");  // after signin -> dashboard
      
      }
      console.log(response);
    } catch (error) {
      console.error("Auth Error:", error);
      alert("Something went to be wrong");
    };
  }
  
  return (
    <div className="font-[Sora] flex min-h-screen bg-[#0a0a0d] text-white relative">

      {/* GRID BACKGROUND */}

      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* LEFT PANEL */}


      <div className="flex-1 flex items-center justify-center p-[60px]">
        <div className="max-w-[420px]">

          <div className="flex items-center gap-[10px] mb-[30px]">
            <div className="bg-[rgba(245,158,11,0.2)] border border-[rgba(245,158,11,0.4)] px-[14px] py-[10px] rounded-[8px] font-bold">
              S
            </div>
            <span className="font-bold tracking-[2px]"> 𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔</span>
          </div>

          <h2 className="text-[38px] mb-[15px] text-[#f59e0b]">
            {type === "signin"
              ? "Good to see you again."
              : "Drawing something great."}
          </h2>

          <p className="text-[#a1a1aa] mb-[30px]">
            {type === "signin"
              ? "Sign in and continue your journey."
              : "Join thousands of teams using  𝚂𝚔𝚎𝚝𝚌𝚑𝙻𝚒𝚗𝚔."}
          </p>

          <div>
            <div className="bg-[#1c1c26] px-[16px] py-[10px] rounded-full mb-[10px] border border-[#2a2a35] w-fit">
              ✔ Enterprise-grade security
            </div>

            <div className="bg-[#1c1c26] px-[16px] py-[10px] rounded-full mb-[10px] border border-[#2a2a35] w-fit">
              ✔ Real-time collaboration
            </div>

            <div className="bg-[#1c1c26] px-[16px] py-[10px] rounded-full border border-[#2a2a35] w-fit">
              ✔ 99.9% uptime SLA
            </div>
          </div>

        </div>
      </div>

      {/* RIGHT PANEL */}


      <div className="w-[350px] flex items-center justify-center mr-[250px]">
        <div className="w-full bg-[#13131a] border border-[#2a2a35] p-[40px] rounded-[15px]">

          <h1 className="mb-[25px] text-[24px]  flex justify-center">
            {type === "signin" ? "Sign in" : "Create account"}
          </h1>

          <form onSubmit={handleSubmit}>

            {type === "signup" && (
              <div className="mb-[18px]">
                <label className="text-[13px] text-[#a1a1aa]">Username</label>
                <input
                  required
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full mt-[6px] h-[48px] px-[15px] rounded-[12px] border-[1.5px] border-[#2a2a35] bg-[#1c1c26] outline-none transition hover:border-[#f59e0b] focus:border-[#f59e0b] focus:ring-2 focus:ring-[rgba(245,158,11,0.3)]"
                />
              </div>
            )}

            <div className="mb-[18px]">
              <label className="text-[13px] text-[#a1a1aa]">Email</label>
              <input
                required
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-[6px] h-[48px] px-[15px] rounded-[12px] border-[1.5px] border-[#2a2a35] bg-[#1c1c26] outline-none transition hover:border-[#f59e0b] focus:border-[#f59e0b] focus:ring-2 focus:ring-[rgba(245,158,11,0.3)]"
              />
            </div>

            <div className="mb-[18px]">
              <label className="text-[13px] text-[#a1a1aa]">Password</label>

              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-[6px] h-[48px] px-[15px] rounded-[12px] border-[1.5px] border-[#2a2a35] bg-[#1c1c26] outline-none transition hover:border-[#f59e0b] focus:border-[#f0a016] focus:ring-2 focus:ring-[rgba(245,158,11,0.3)]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute mt-2 right-[10px] top-[12px] text-[#aaa]"
                >
                  👁
                </button>
              </div>
            </div>

            <button
              className="w-full h-[50px] bg-[#f59e0b] border-none rounded-[12px] mt-[10px] font-semibold cursor-pointer text-black transition hover:bg-[#d97706]"
              type="submit"
            >
              {type === "signin" ? "Sign in" : "Create Account"}
            </button>

          </form>

          <div className="mt-[20px] text-center text-[#777]">
            {/* {type === "signin"
              ? "Don't have an account?"
              : "Already have an account?" <Link href={"/signin"}> </Link>} */}

            {type === "signin" ? (
              <div className="flex ml-7" >
                Don't have an account? <Link href="/signup">
                  <h1 className="font-mono ml-1 hover:text-yellow-500 text-[#f4eeee]">
                    Signup
                  </h1></Link>
              </div>
            ) : (
              <div className="flex ml-7">
                Already have an account? <Link href="/signin">
                  <h1 className="font-mono ml-1  hover:text-yellow-500  text-[#f4eeee]">
                    Signin
                  </h1>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
