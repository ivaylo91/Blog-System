type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className = "h-16 w-16 rounded-[1.6rem]" }: BrandMarkProps) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-[linear-gradient(160deg,#1c1917_0%,#44403c_45%,#f59e0b_100%)] shadow-[0_18px_42px_rgba(28,25,23,0.24)] ring-1 ring-white/50 ${className}`}>
      <div className="absolute inset-[0.32rem] rounded-[1.3rem] border border-white/18 bg-[radial-gradient(circle_at_top,_rgba(255,247,237,0.32)_0%,_rgba(255,247,237,0)_58%)]" />
      <div className="absolute h-8 w-8 rounded-full border border-amber-100/70 bg-[linear-gradient(135deg,#fff7ed,#fdba74)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" />
      <div className="absolute h-4 w-4 rounded-full border border-amber-900/10 bg-[linear-gradient(135deg,#ea580c,#f59e0b)]" />
      <div className="absolute left-[1.05rem] top-[1.1rem] h-7 w-1 rounded-full bg-amber-50/90 rotate-[-28deg]" />
      <div className="absolute left-[1.28rem] top-[0.9rem] h-2.5 w-0.5 rounded-full bg-amber-50/90 rotate-[-28deg]" />
      <div className="absolute left-[1.52rem] top-[0.78rem] h-2.8 w-0.5 rounded-full bg-amber-50/90 rotate-[-28deg]" />
      <div className="absolute left-[1.76rem] top-[0.66rem] h-2.5 w-0.5 rounded-full bg-amber-50/90 rotate-[-28deg]" />
      <div className="absolute right-[1.22rem] top-[1rem] h-7 w-1 rounded-full bg-stone-950/78 rotate-[24deg]" />
      <div className="absolute right-[0.9rem] top-[0.92rem] h-3.5 w-2.5 rounded-t-full rounded-b-[0.9rem] border border-stone-950/20 bg-amber-50/92 rotate-[24deg]" />
    </div>
  );
}