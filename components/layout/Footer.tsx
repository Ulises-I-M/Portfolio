import { personal } from "@/lib/data";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#1e1e1e] py-8 px-6">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="font-mono text-xs text-[#555555] tracking-[0.1em]">
          © {year} {personal.nameDisplay}
        </p>
        <p className="font-mono text-xs text-[#555555] tracking-[0.1em]">
          <span className="text-[#a8ff00]">✦</span> BUILT WITH NEXT.JS + TAILWIND
        </p>
      </div>
    </footer>
  );
}
