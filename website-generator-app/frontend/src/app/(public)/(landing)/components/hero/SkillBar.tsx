interface SkillBarProps {
    skills: { name: string; level: number; color: string }[];
}

const SkillBar = ({ skills }: SkillBarProps) => (
    <div className="flex flex-col gap-2 rounded-2xl bg-white/10 px-4 py-3 shadow-xl backdrop-blur-md">
        {skills.map((skill) => (
            <div key={skill.name} className="flex items-center gap-2">
                <span className="w-14 text-[10px] font-medium text-white/70">
                    {skill.name}
                </span>
                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: `${skill.level}%`,
                            backgroundColor: skill.color,
                        }}
                    />
                </div>
            </div>
        ))}
    </div>
);

export default SkillBar;
