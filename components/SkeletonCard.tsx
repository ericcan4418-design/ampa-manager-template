export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3">
      <div className="h-4 bg-[#F1F5F9] rounded w-3/4" />
      <div className="h-3 bg-[#F1F5F9] rounded w-1/2" />
    </div>
  );
}
