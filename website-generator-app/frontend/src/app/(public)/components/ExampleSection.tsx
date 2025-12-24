"use client";


import { useRouter } from "next/navigation";
import React from "react";

export const ExampleSection: React.FC = () => {
    const router = useRouter(); 
    
    return (
        <section className="py-20 px-6 bg-[#030506] text-white">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">
                        Portfolio Examples
                    </h2>
                    <p className="text-lg text-slate-200 max-w-2xl mx-auto">
                        See what our AI can create for you — each portfolio is unique,
                        professional, and ready to impress.
                    </p>
                </div>

                
            </div>
        </section>
    );
}
