/* Reference-led rule: educator navigation uses a deep navy mobile dock, teal active state, and compact evidence-oriented labels. */
import Link from "next/link";
import { BookOpen, ChartNoAxesColumn, House, Users } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Class Overview", icon: House },
  { href: "/dashboard/student", label: "Student Profiles", icon: Users },
  { href: "/dashboard/report", label: "Teacher Report", icon: ChartNoAxesColumn },
  { href: "/dashboard", label: "Lesson Resources", icon: BookOpen },
];

export function EducatorBottomNav({ active }: { active: "class" | "students" }) {
  return (
    <nav className="mt-10 grid grid-cols-4 rounded-t-[1.55rem] bg-[var(--reader-navy)] px-2 py-4 text-center text-[0.68rem] text-slate-400 sm:text-xs lg:rounded-[1.55rem]">
      {items.map(({ href, label, icon: Icon }, index) => {
        const isActive = (active === "class" && index === 0) || (active === "students" && index === 1);
        return (
          <Link className={`pressable flex flex-col items-center gap-1.5 ${isActive ? "text-[#3cb0b4]" : "text-slate-400"}`} href={href} key={`${href}-${label}`}>
            <Icon className="size-7" fill={isActive && index === 0 ? "currentColor" : "none"} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
