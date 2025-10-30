export default function ProcessLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Skeleton */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-6 animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded mx-auto animate-pulse"></div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm mb-8">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-12 w-full bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-12 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Steps Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

