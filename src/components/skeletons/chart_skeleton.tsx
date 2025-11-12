import { Skeleton } from "../../components/ui/skeleton";

export function ChartSkeleton() {
  const bars = 5; // number of categories placeholder
  const segments = 5; // totalBudget, activeBudget, budgetCount, totalTransactions, transactionCount

  return (
    <div className="bg-white p-4 rounded-lg shadow animate-pulse w-full" style={{ minHeight: "450px" }}>
      <h2 className="text-lg font-semibold mb-4">
        <Skeleton className="h-6 w-[200px] rounded-full" />
      </h2>

      <div className="flex justify-between items-end h-[350px]">
        {Array.from({ length: bars }).map((_, barIdx) => (
          <div key={barIdx} className="flex flex-col justify-end gap-1">
            {Array.from({ length: segments }).map((_, segIdx) => (
              <Skeleton
                key={segIdx}
                style={{
                  height: 30 + segIdx * 15, 
                  width: 20,
                }}
                className="rounded bg-gray-300"
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between">
        {Array.from({ length: bars }).map((_, idx) => (
          <Skeleton key={idx} className="h-4 w-12 rounded-full" />
        ))}
      </div>
    </div>
  );
}
