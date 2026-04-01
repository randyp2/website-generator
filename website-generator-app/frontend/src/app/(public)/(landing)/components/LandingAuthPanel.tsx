"use client";

import { useState } from "react";
import { login, signup, signInWithGoogle } from "@/lib/auth-actions";
import { FcGoogle } from "react-icons/fc";

type Mode = "login" | "signup";

const LandingAuthPanel = () => {
    const [mode, setMode] = useState<Mode>("login");

    return (
        <div className="w-full max-w-md flex flex-col gap-4">
            {/* Auth Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10">
                <h2 className="text-xl font-semibold text-white mb-8">
                    {mode === "login"
                        ? "Log into PortRN"
                        : "Create your account"}
                </h2>

                {mode === "login" ? <LoginFields /> : <SignupFields />}

                <p className="text-center text-sm text-gray-500 mt-6">
                    Forgot password?
                </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 px-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-gray-500 shrink-0">OR</span>
                <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Social + Toggle Card */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col gap-3">
                <form action={signInWithGoogle}>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-transparent py-3 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:cursor-pointer"
                    >
                        <FcGoogle className="w-5 h-5" />
                        Continue with Google
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() =>
                        setMode(mode === "login" ? "signup" : "login")
                    }
                    className="w-full rounded-xl border border-white/10 bg-transparent py-3 text-sm font-medium text-blue-400 transition-colors hover:bg-white/5 hover:cursor-pointer"
                >
                    {mode === "login"
                        ? "Create new account"
                        : "Log into existing account"}
                </button>
            </div>
        </div>
    );
};

const LoginFields = () => (
    <form action={login} className="flex flex-col gap-3">
        <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
        />
        <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
        />
        <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 hover:cursor-pointer mt-1"
        >
            Log in
        </button>
    </form>
);

const SignupFields = () => (
    <form action={signup} className="flex flex-col gap-3">
        <div className="flex gap-3">
            <input
                type="text"
                name="first-name"
                placeholder="First name"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
            />
            <input
                type="text"
                name="last-name"
                placeholder="Last name"
                required
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
            />
        </div>
        <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
        />
        <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
        />
        <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 hover:cursor-pointer mt-1"
        >
            Sign up
        </button>
    </form>
);

export default LandingAuthPanel;
