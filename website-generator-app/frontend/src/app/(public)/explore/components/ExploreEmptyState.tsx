import { SearchX } from "lucide-react";

export function ExploreEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-white/20 bg-[#060d18] p-10 text-center">
      <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5">
        <SearchX className="h-5 w-5 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-white">No portfolios yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
        Published portfolios will appear here. Be the first to share yours!
      </p>
    </div>
  );
}
