export default function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-10 bg-gray-100 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="h-3 w-32 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-64 bg-gray-50 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="h-64 bg-gray-50 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 flex-1 bg-gray-50 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
