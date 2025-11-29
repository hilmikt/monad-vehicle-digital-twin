interface StatPillProps {
    label: string;
    color?: "green" | "blue" | "yellow" | "gray" | "red";
}

export default function StatPill({ label, color = "gray" }: StatPillProps) {
    const colorClasses = {
        green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]}`}
        >
            {label}
        </span>
    );
}
