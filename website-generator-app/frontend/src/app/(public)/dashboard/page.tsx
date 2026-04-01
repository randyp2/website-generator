"use client";

import React, { useEffect, useReducer, useState } from "react";
import { motion } from "framer-motion";
import FormContainer from "@/app/(public)/dashboard/components/FormContainer";

import { formReducer } from "@/webgenForm/useFormReducer";
import PreviewContainer from "@/app/(public)/dashboard/components/PreviewContainer";
import { initialState } from "@/webgenForm/formType";

const buildMockPortfolioHtml = (state: typeof initialState) => {
  const displayName = state.name.trim() || "Your Name";
  const tagline = state.tagline.trim() || "Portfolio headline goes here";
  const about =
    state.about.trim() ||
    "This public dashboard is now a front-end-only mockup. Generated content is placeholder content based on your form inputs.";
  const skills = state.skills.filter(Boolean);
  const email = state.email.trim();
  const github = state.github.trim();
  const linkedin = state.linkedin.trim();
  const customSectionTitle = state.customSectionTitle.trim() || "Highlights";
  const customSectionContent =
    state.customSectionContent.trim() ||
    "Add custom case studies, testimonials, or differentiators here.";

  const skillItems = (skills.length > 0 ? skills : ["React", "Design Systems", "Frontend Architecture"])
    .map(
      (skill) =>
        `<li style="padding:10px 14px;border:1px solid rgba(14,165,233,0.18);border-radius:999px;background:rgba(255,255,255,0.04)">${skill}</li>`,
    )
    .join("");

  const links = [
    email ? `<a href="mailto:${email}">${email}</a>` : "",
    github ? `<a href="${github}" target="_blank" rel="noreferrer">GitHub</a>` : "",
    linkedin ? `<a href="${linkedin}" target="_blank" rel="noreferrer">LinkedIn</a>` : "",
  ]
    .filter(Boolean)
    .join("");

  const linkMarkup = links
    ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px">${links}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${displayName} Portfolio Mock</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #08111b;
        --panel: rgba(15, 23, 42, 0.82);
        --line: rgba(148, 163, 184, 0.18);
        --text: #e2e8f0;
        --muted: #94a3b8;
        --accent: #38bdf8;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Inter", sans-serif;
        background:
          radial-gradient(circle at top right, rgba(56,189,248,0.2), transparent 28%),
          radial-gradient(circle at bottom left, rgba(14,165,233,0.18), transparent 32%),
          var(--bg);
        color: var(--text);
      }
      a { color: var(--accent); text-decoration: none; }
      main { max-width: 1080px; margin: 0 auto; padding: 72px 24px 96px; }
      section {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 28px;
        padding: 28px;
        backdrop-filter: blur(14px);
        box-shadow: 0 30px 80px rgba(2, 8, 23, 0.35);
      }
      h1,h2,h3,p { margin: 0; }
      .hero { padding: 48px 36px; margin-bottom: 24px; }
      .eyebrow {
        display: inline-flex;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(56,189,248,0.22);
        background: rgba(56,189,248,0.1);
        color: #bae6fd;
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-bottom: 20px;
      }
      .hero h1 { font-size: clamp(2.4rem, 6vw, 4.8rem); line-height: 0.98; margin-bottom: 16px; }
      .hero p { max-width: 700px; color: var(--muted); font-size: 1.05rem; line-height: 1.7; }
      .grid { display: grid; grid-template-columns: 1.3fr 0.9fr; gap: 24px; }
      .stack { display: grid; gap: 24px; }
      ul.skills {
        list-style: none;
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding: 0;
        margin: 20px 0 0;
      }
      .mock-note {
        margin-top: 22px;
        padding: 14px 16px;
        border-radius: 16px;
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.18);
        color: #fde68a;
        font-size: 0.92rem;
      }
      @media (max-width: 860px) {
        .grid { grid-template-columns: 1fr; }
        .hero { padding: 32px 24px; }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <div class="eyebrow">Frontend-Only Mock Preview</div>
        <h1>${displayName}</h1>
        <p>${tagline}</p>
        ${linkMarkup}
        <div class="mock-note">This generated portfolio is a nonfunctional mockup. It is built locally in the browser and is not backed by any live AI or server generation.</div>
      </section>

      <div class="grid">
        <div class="stack">
          <section>
            <h2 style="font-size:1.25rem;margin-bottom:14px">About</h2>
            <p style="color:var(--muted);line-height:1.8">${about}</p>
          </section>
          <section>
            <h2 style="font-size:1.25rem;margin-bottom:14px">${customSectionTitle}</h2>
            <p style="color:var(--muted);line-height:1.8">${customSectionContent}</p>
          </section>
        </div>
        <section>
          <h2 style="font-size:1.25rem;margin-bottom:14px">Skills</h2>
          <p style="color:var(--muted);line-height:1.7">A placeholder skills panel assembled from your form inputs.</p>
          <ul class="skills">${skillItems}</ul>
        </section>
      </div>
    </main>
  </body>
</html>`;
};

export default function DashboardPage() {
  // Form state containing user's portfolio info
  const [state, dispatch] = useReducer(formReducer, initialState);
  useEffect(() => {
    console.log(state);
  }, [state])
  // Generated html/css code
  const [generatedHTML, setGeneratedHTML] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  /**
   * @brief Generates a local mock HTML preview from the current form state
   */
  const handleGenerate = async () => {
    setIsLoading(true);
    setShowPreview(false);

    window.setTimeout(() => {
      setGeneratedHTML(buildMockPortfolioHtml(state));
      setShowPreview(true);
      setIsLoading(false);
    }, 1400);
  };

  return (
    <div className="min-h-screen pt-20 bg-[#151d21]">
      {/* Hero Header */}
      <section className="relative py-12 px-6 overflow-hidden">
        {/* Subtle background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0084ff]/10 rounded-full filter blur-3xl opacity-30" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#0084ff]/5 rounded-full filter blur-3xl opacity-20" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >


            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Build Your{" "}
              <span className="bg-linear-to-r from-[#0084ff] to-[#00a8ff] bg-clip-text text-transparent">
                Professional
              </span>{" "}
              Portfolio
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Fill in your details and generate a front-end-only mock portfolio preview. This public builder is now a nonfunctional demo with local placeholder output.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Workspace */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Panel - Form (Takes 5 columns) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-5"
          >
            <FormContainer
              state={state}
              dispatch={dispatch}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
          </motion.div>

          {/* Right Panel - Preview (Takes 7 columns) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="lg:col-span-7"
          >
            <PreviewContainer
              formData={state}
              showPreview={showPreview}
              isLoading={isLoading}
              generatedHTML={generatedHTML ?? ""}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
};
