import { CheckCircle2 } from "lucide-react";

const VerifiedBadge = () => (
    <div className="flex items-center gap-2 rounded-full bg-emerald-500/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
        <CheckCircle2 className="h-4 w-4 text-white" />
        <span className="text-xs font-semibold text-white">Verified</span>
    </div>
);

export default VerifiedBadge;
