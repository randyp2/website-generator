import { SearchX } from "lucide-react";

interface ExploreEmptyStateProps {
  onReset: () => void;
}

export function ExploreEmptyState({ onReset }: ExploreEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/20 bg-[#060d18] p-10 text-center">
      <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5">
        <SearchX className="h-5 w-5 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-white">No portfolios found</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
        No cards match this search and filter combination yet. Clear your
        filters to keep browsing.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10"
      >
        Reset filters
      </button>
    </div>
  );
}
