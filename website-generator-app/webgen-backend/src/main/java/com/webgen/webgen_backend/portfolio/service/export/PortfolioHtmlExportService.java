package com.webgen.webgen_backend.portfolio.service.export;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.webgen.webgen_backend.portfolio.dto.common.GlobalThemeDTO;
import com.webgen.webgen_backend.portfolio.dto.common.SectionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class PortfolioHtmlExportService {

    private final ObjectMapper objectMapper;

    /**
     * Generates a standalone HTML document from portfolio sections.
     * The generated HTML uses client-side Babel transpilation and CDN libraries.
     */
    public String generateHtml(List<SectionDTO> sections, GlobalThemeDTO globalTheme, String title) {
        if (sections == null || sections.isEmpty()) {
            throw new IllegalArgumentException("Sections cannot be empty");
        }

        // Sort sections by orderIndex
        List<SectionDTO> sortedSections = sections.stream()
                .sorted(Comparator.comparingInt(s -> s.getOrderIndex() != null ? s.getOrderIndex() : 0))
                .collect(Collectors.toList());

        // Build isolated section script blocks (each parsed independently by Babel)
        String sectionScriptBlocks = IntStream.range(0, sortedSections.size())
                .mapToObj(i -> String.format("""
  <script type="text/babel">
    const { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView,
      once, y, x, opacity, scale, rotate, stiffness, damping, repeat, duration, icon,
      fontFamily, headingFontFamily,
      Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight, Twitter, Instagram,
      Youtube, ExternalLink, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
      Menu, X, Star, Calendar, Clock, Check, Award, Briefcase, GraduationCap,
      Code, Zap, Send, User, Users, Heart, MessageCircle, Download, FileText,
      Image, Play, ArrowRight, ArrowLeft, ArrowDown, Plus, Minus, Search,
      Settings, Sparkles, Quote, Target, Layers, Folder, Link } = window;
    try {
      %s
      window.__sections[%d] = Section%d;
    } catch(e) {
      console.error("Section %d failed:", e);
    }
  </script>""",
                        transformSectionSource(sortedSections.get(i).getReactSource(), i), i, i, i))
                .collect(Collectors.joining("\n"));

        // Build sections data array
        String sectionsData = buildSectionsData(sortedSections);

        // Build section renders — reference window.__sections, wrapped in ErrorBoundary
        String sectionRenders = IntStream.range(0, sortedSections.size())
                .mapToObj(i -> String.format(
                        "          {window.__sections[%d] && <ErrorBoundary key={%d}>{React.createElement(window.__sections[%d], { content: sectionsData[%d], data: sectionsData[%d] })}</ErrorBoundary>}",
                        i, i, i, i, i))
                .collect(Collectors.joining("\n"));

        // Build theme object
        String themeJson = buildThemeJson(globalTheme);

        // Page title
        String pageTitle = title != null && !title.isBlank() ? escapeHtml(title) : "Portfolio";

        return buildHtmlDocument(pageTitle, themeJson, sectionsData, sectionScriptBlocks, sectionRenders, globalTheme);
    }

    /**
     * Transforms section React source code:
     * - Removes import statements
     * - Converts export default to const SectionN
     * - Removes TypeScript type annotations
     */
    private String transformSectionSource(String reactSource, int index) {
        if (reactSource == null || reactSource.isBlank()) {
            return String.format("const Section%d = ({ content, data }) => {\n  return <div>Empty Section</div>;\n};", index);
        }

        String transformed = reactSource;

        // Remove import statements
        transformed = transformed.replaceAll("(?m)^import\\s+.*?;\\s*$", "");
        transformed = transformed.replaceAll("(?m)^import\\s+.*?from\\s+['\"].*?['\"];?\\s*$", "");

        // Remove "use client" directive
        transformed = transformed.replaceAll("(?m)^['\"]use client['\"];?\\s*$", "");

        // Convert "export default function ComponentName" to "const SectionN = function"
        Pattern exportDefaultFunctionPattern = Pattern.compile(
                "export\\s+default\\s+function\\s+(\\w+)\\s*\\(",
                Pattern.MULTILINE
        );
        Matcher matcher = exportDefaultFunctionPattern.matcher(transformed);
        if (matcher.find()) {
            transformed = matcher.replaceFirst(String.format("const Section%d = function(", index));
        }

        // Handle "export default function(" (anonymous)
        transformed = transformed.replaceAll(
                "export\\s+default\\s+function\\s*\\(",
                String.format("const Section%d = function(", index)
        );

        // Handle "export default ComponentName" (separate export)
        transformed = transformed.replaceAll(
                "export\\s+default\\s+\\w+\\s*;?\\s*$",
                ""
        );

        // Remove a narrow TypeScript annotation pattern from function parameters
        // e.g., ({ content, data }: { ... }) => ({ content, data }) =>
        // NOTE: Avoid broad ": <word>" stripping because it corrupts JS ternaries
        // such as "... ? foo : null" during HTML export.
        transformed = transformed.replaceAll(":\\s*\\{[^}]*\\}\\s*\\)", ")");

        // Remove interface/type declarations
        transformed = transformed.replaceAll("(?ms)^(interface|type)\\s+\\w+\\s*\\{.*?\\}\\s*$", "");

        // Clean up multiple blank lines
        transformed = transformed.replaceAll("\\n{3,}", "\n\n");

        return transformed.trim();
    }

    /**
     * Builds the sections data JSON array.
     */
    private String buildSectionsData(List<SectionDTO> sections) {
        try {
            List<Object> dataList = sections.stream()
                    .map(SectionDTO::getContentJson)
                    .collect(Collectors.toList());
            return objectMapper.writeValueAsString(dataList);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    /**
     * Builds the theme JSON object.
     */
    private String buildThemeJson(GlobalThemeDTO globalTheme) {
        if (globalTheme == null) {
            return "{\"background\":\"bg-slate-900\",\"textPrimary\":\"text-white\",\"textSecondary\":\"text-slate-400\",\"accentColor\":\"purple\"}";
        }
        try {
            return objectMapper.writeValueAsString(globalTheme);
        } catch (JsonProcessingException e) {
            return "{\"background\":\"bg-slate-900\",\"textPrimary\":\"text-white\",\"textSecondary\":\"text-slate-400\",\"accentColor\":\"purple\"}";
        }
    }

    /**
     * Escapes HTML special characters.
     */
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    /**
     * Builds the complete HTML document.
     */
    private String buildHtmlDocument(
            String pageTitle,
            String themeJson,
            String sectionsData,
            String sectionScriptBlocks,
            String sectionRenders,
            GlobalThemeDTO globalTheme
    ) {
        String bgClass = globalTheme != null && globalTheme.getBackground() != null
                ? globalTheme.getBackground()
                : "bg-slate-900";
        String textClass = globalTheme != null && globalTheme.getTextPrimary() != null
                ? globalTheme.getTextPrimary()
                : "text-white";

        // Build dynamic Google Fonts URL
        String bodyFont = "Inter";
        String headingFont = "Inter";
        if (globalTheme != null && globalTheme.getFonts() != null) {
            Map<String, String> fonts = globalTheme.getFonts();
            if (fonts.get("body") != null && !fonts.get("body").isBlank()) {
                bodyFont = fonts.get("body");
            }
            if (fonts.get("heading") != null && !fonts.get("heading").isBlank()) {
                headingFont = fonts.get("heading");
            }
        }
        Set<String> uniqueFonts = new LinkedHashSet<>();
        uniqueFonts.add(bodyFont);
        uniqueFonts.add(headingFont);
        String googleFontsFamilies = uniqueFonts.stream()
                .map(f -> "family=" + f.replace(" ", "+") + ":wght@300;400;500;600;700")
                .collect(Collectors.joining("&"));
        String googleFontsUrl = "https://fonts.googleapis.com/css2?" + googleFontsFamilies + "&display=swap";

        return String.format("""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>%s</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="%s" rel="stylesheet">

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- React 18 -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

  <!-- Babel Standalone -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- Framer Motion -->
  <script src="https://unpkg.com/framer-motion@10/dist/framer-motion.js"></script>

  <style>
    body {
      font-family: '%s', sans-serif;
      margin: 0;
      padding: 0;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: '%s', sans-serif;
    }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- Initialize section registry -->
  <script>window.__sections = [];</script>

  <!-- Shared globals: Framer Motion, constants, icons, theme, data -->
  <script type="text/babel">
    // =========================================================================
    // FRAMER MOTION GLOBALS
    // =========================================================================
    const { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } = Motion;
    window.motion = motion;
    window.AnimatePresence = AnimatePresence;
    window.useScroll = useScroll;
    window.useTransform = useTransform;
    window.useSpring = useSpring;
    window.useInView = useInView;

    // =========================================================================
    // COMMON ANIMATION CONSTANTS
    // =========================================================================
    const once = true;
    const y = 0;
    const x = 0;
    const opacity = 1;
    const scale = 1;
    const rotate = 15;
    const stiffness = 260;
    const damping = 20;
    const repeat = Infinity;
    const duration = 0.5;
    window.__consts = { once, y, x, opacity, scale, rotate, stiffness, damping, repeat, duration };

    // Fallback icon for shorthand syntax { icon, ... }
    const icon = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props?.size || 24} height={props?.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props?.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props?.className} style={props?.style}>
        <circle cx="12" cy="12" r="10"/>
      </svg>
    );
    window.icon = icon;

    // =========================================================================
    // ERROR BOUNDARY — isolates section render failures
    // =========================================================================
    class ErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }
      static getDerivedStateFromError() {
        return { hasError: true };
      }
      render() {
        if (this.state.hasError) {
          return (
            <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>
              <p style={{ fontSize: '0.875rem' }}>This section could not be rendered.</p>
            </div>
          );
        }
        return this.props.children;
      }
    }
    window.ErrorBoundary = ErrorBoundary;

    // =========================================================================
    // LUCIDE ICON COMPONENTS (Inline SVG)
    // =========================================================================
%s

    // =========================================================================
    // EXPOSE ALL GLOBALS TO WINDOW — section scripts run in separate scopes
    // =========================================================================
    Object.assign(window, {
      motion, AnimatePresence, useScroll, useTransform, useSpring, useInView,
      once, y, x, opacity, scale, rotate, stiffness, damping, repeat, duration, icon,
      Mail, Phone, MapPin, Globe, Github, Linkedin, ArrowUpRight, Twitter, Instagram,
      Youtube, ExternalLink, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
      Menu, X, Star, Calendar, Clock, Check, Award, Briefcase, GraduationCap,
      Code, Zap, Send, User, Users, Heart, MessageCircle, Download, FileText,
      Image, Play, ArrowRight, ArrowLeft, ArrowDown, Plus, Minus, Search,
      Settings, Sparkles, Quote, Target, Layers, Folder, Link
    });

    // =========================================================================
    // THEME & SECTIONS DATA
    // =========================================================================
    window.__theme = %s;
    window.__sectionsData = %s;

    // Font family globals — AI-generated sections may reference these directly
    const fontFamily = window.__theme?.fonts?.body || 'Inter, sans-serif';
    const headingFontFamily = window.__theme?.fonts?.heading || 'Inter, sans-serif';
    Object.assign(window, { fontFamily, headingFontFamily });
  </script>

  <!-- Section components — each in its own script for parse isolation -->
%s

  <!-- Main App — assembles sections -->
  <script type="text/babel">
    const { ErrorBoundary } = window;
    const sectionsData = window.__sectionsData;
    const theme = window.__theme;

    function App() {
      return (
        <div className={`min-h-screen %s`}>
          <div className="%s">
            <main>
%s
            </main>
          </div>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>
""",
                pageTitle,
                googleFontsUrl,
                bodyFont,
                headingFont,
                buildIconDefinitions(),
                themeJson,
                sectionsData,
                sectionScriptBlocks,
                bgClass,
                textClass,
                sectionRenders
        );
    }

    /**
     * Builds inline SVG React components for commonly used Lucide icons.
     */
    private String buildIconDefinitions() {
        return """
    const Mail = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    );

    const Phone = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    );

    const MapPin = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    );

    const Globe = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
        <path d="M2 12h20"/>
      </svg>
    );

    const Github = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
        <path d="M9 18c-4.51 2-5-2-7-2"/>
      </svg>
    );

    const Linkedin = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect width="4" height="12" x="2" y="9"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    );

    const ArrowUpRight = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M7 7h10v10"/>
        <path d="M7 17 17 7"/>
      </svg>
    );

    const Twitter = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
      </svg>
    );

    const Instagram = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
      </svg>
    );

    const Youtube = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
        <path d="m10 15 5-3-5-3z"/>
      </svg>
    );

    const ExternalLink = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M15 3h6v6"/>
        <path d="M10 14 21 3"/>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      </svg>
    );

    const ChevronDown = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="m6 9 6 6 6-6"/>
      </svg>
    );

    const ChevronUp = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="m18 15-6-6-6 6"/>
      </svg>
    );

    const ChevronLeft = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="m15 18-6-6 6-6"/>
      </svg>
    );

    const ChevronRight = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="m9 18 6-6-6-6"/>
      </svg>
    );

    const Menu = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <line x1="4" x2="20" y1="12" y2="12"/>
        <line x1="4" x2="20" y1="6" y2="6"/>
        <line x1="4" x2="20" y1="18" y2="18"/>
      </svg>
    );

    const X = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M18 6 6 18"/>
        <path d="m6 6 12 12"/>
      </svg>
    );

    const Star = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    );

    const Calendar = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
        <line x1="16" x2="16" y1="2" y2="6"/>
        <line x1="8" x2="8" y1="2" y2="6"/>
        <line x1="3" x2="21" y1="10" y2="10"/>
      </svg>
    );

    const Clock = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    );

    const Check = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    );

    const Award = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    );

    const Briefcase = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    );

    const GraduationCap = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    );

    const Code = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
      </svg>
    );

    const Zap = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    );

    const Send = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="m22 2-7 20-4-9-9-4Z"/>
        <path d="M22 2 11 13"/>
      </svg>
    );

    const User = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    );

    const Users = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    );

    const Heart = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    );

    const MessageCircle = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
      </svg>
    );

    const Download = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
      </svg>
    );

    const FileText = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" x2="8" y1="13" y2="13"/>
        <line x1="16" x2="8" y1="17" y2="17"/>
        <line x1="10" x2="8" y1="9" y2="9"/>
      </svg>
    );

    const Image = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
    );

    const Play = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    );

    const ArrowRight = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M5 12h14"/>
        <path d="m12 5 7 7-7 7"/>
      </svg>
    );

    const ArrowLeft = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="m12 19-7-7 7-7"/>
        <path d="M19 12H5"/>
      </svg>
    );

    const ArrowDown = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M12 5v14"/>
        <path d="m19 12-7 7-7-7"/>
      </svg>
    );

    const Plus = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
      </svg>
    );

    const Minus = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M5 12h14"/>
      </svg>
    );

    const Search = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
      </svg>
    );

    const Settings = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );

    const Sparkles = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/>
        <path d="M19 17v4"/>
        <path d="M3 5h4"/>
        <path d="M17 19h4"/>
      </svg>
    );

    const Quote = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21c0 1 0 1 1 1z"/>
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
      </svg>
    );

    const Target = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <circle cx="12" cy="12" r="10"/>
        <circle cx="12" cy="12" r="6"/>
        <circle cx="12" cy="12" r="2"/>
      </svg>
    );

    const Layers = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
        <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/>
        <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>
      </svg>
    );

    const Folder = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
      </svg>
    );

    const Link = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={props.strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={props.className} style={props.style}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    );
""";
    }
}
