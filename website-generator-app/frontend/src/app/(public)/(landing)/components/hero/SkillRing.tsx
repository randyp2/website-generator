interface SkillRingProps {
    label: string;
    percent: number;
    color: string;
}

const SkillRing = ({ label, percent, color }: SkillRingProps) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md">
            <div className="relative h-16 w-16">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="5"
                        className="text-white/10"
                    />
                    <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {percent}%
                </span>
            </div>
            <span className="text-[10px] font-medium text-white/70">
                {label}
            </span>
        </div>
    );
};

export default SkillRing;
