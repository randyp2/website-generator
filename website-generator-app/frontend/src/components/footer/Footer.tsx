export default function Footer() { 
    return (
        <footer className="py-12 px-6 border-t border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-slate-600 text-sm">
              © 2025 AI Portfolio Generator. Crafted with care.
            </div>
            <div className="flex gap-8">
              <a
                href="#"
                className="text-slate-600 hover:text-cyan-600 transition-colors text-sm font-medium hover:cursor-pointer"
              >
                Support
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-cyan-600 transition-colors text-sm font-medium hover:cursor-pointer"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-cyan-600 transition-colors text-sm font-medium hover:cursor-pointer"
              >
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
}