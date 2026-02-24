// src/App.tsx
import { useGetPhotosQuery, useTestConnectionQuery } from '@/features/api/apiSlice'

function App() {
    // Optional: keep test connection for debugging
    const {
        data: testData,
        isLoading: testLoading,
        error: testError,
    } = useTestConnectionQuery()

    // Main data we care about
    const {
        data: photosData,
        isLoading: photosLoading,
        error: photosError,
        isFetching,
    } = useGetPhotosQuery()

    // Simple combined loading state
    if (photosLoading || isFetching || testLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center text-xl">
                Loading photos...
            </div>
        )
    }

    if (photosError || testError) {
        return (
            <div className="flex min-h-screen items-center justify-center text-red-600 text-xl">
                Error loading data meow
                <br />
                {JSON.stringify(photosError || testError, null, 2)}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-10">
            <header className="bg-linear-to-r from-purple-600 to-pink-500 text-white py-8 shadow-xl mb-10 rounded-b-2xl">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">iFoto</h1>
                    <p className="mt-3 text-lg md:text-xl opacity-90">
                        Your photo gallery — Backend connected successfully
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4">
                {/* Test connection result (optional – can remove later) */}
                {testData && (
                    <div className="mb-10 p-6 bg-white rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">Backend Health Check</h2>
                        <p className="text-gray-700">
                            <strong>Status:</strong> {testData.status}
                            <br />
                            <strong>Message:</strong> {testData.message}
                        </p>
                    </div>
                )}

                {/* Photos list */}
                <section>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                        Photos ({photosData?.count || 0})
                    </h2>

                    {photosData?.photos?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {photosData.photos.map((photo, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                >
                                    <div className="h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        {/* Later: replace with real <img src={photo.url} /> */}
                                        <span className="text-gray-500 font-medium text-center px-4">
                                            {photo}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-gray-600 truncate">{photo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-10">
                            No photos yet. Upload some!
                        </p>
                    )}
                </section>
            </main>

            <footer className="mt-16 py-6 text-center text-gray-500 border-t">
                <p>Built with Vite + React + RTK Query + Tailwind CSS</p>
            </footer>
        </div>
    )
}

export default App