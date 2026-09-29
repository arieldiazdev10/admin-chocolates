export const StatCard = ({ icon: Icon, label, value, tone = "cacao" }) => {
  const tones = {
    cacao: "bg-cacao-100 text-cacao-800",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        <Icon size={24} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
          {label}
        </p>
        <p className="truncate text-2xl font-bold text-stone-900">{value}</p>
      </div>
    </div>
  );
};
