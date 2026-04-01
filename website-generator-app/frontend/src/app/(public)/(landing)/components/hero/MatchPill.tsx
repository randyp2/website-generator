import { Sparkles } from "lucide-react";

const MatchPill = () => (
    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 shadow-xl backdrop-blur-md">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-[11px] font-semibold text-white">
            97% Match
        </span>
    </div>
);

export default MatchPill;
