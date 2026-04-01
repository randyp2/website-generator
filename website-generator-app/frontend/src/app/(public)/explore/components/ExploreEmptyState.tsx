import { SearchX } from "lucide-react";

export function ExploreEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[#050a72]/16 bg-linear-to-br from-white to-[#f4f7ff] p-10 text-center shadow-lg dark:border-[#050a72]/28 dark:from-[#070b18]/96 dark:to-[#04060d]/98">
      <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#050a72]/16 bg-[#050a72]/8 dark:border-[#050a72]/28 dark:bg-[#050a72]/18">
        <SearchX className="h-5 w-5 text-[#050a72] dark:text-[#dfe8ff]" />
      </div>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">No portfolios yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
        Published portfolios will appear here. Be the first to share yours!
      </p>
    </div>
  );
}
