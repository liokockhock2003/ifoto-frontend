// src/App.tsx
import { useQuery } from '@tanstack/react-query'

async function fetchPosts() {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts')
    if (!res.ok) throw new Error('Failed to fetch posts')
    return res.json()
}

function App() {
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['posts'],          // unique cache key
        queryFn: fetchPosts,          // fetch function
        // Optional: staleTime: 5 * 60 * 1000,  // cache 5 mins
    })

    if (isLoading) return <div className="flex min-h-screen items-center justify-center text-xl">Loading posts...</div>
    if (error) return <div className="flex min-h-screen items-center justify-center text-red-600 text-xl">Error: {error.message}</div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-6 shadow-lg">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">My TanStack Query + Tailwind App</h1>
                    <p className="mt-2 text-lg opacity-90">Testing setup — March 2026 style 🚀</p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts?.map((post: any) => (
                        <div
                            key={post.id}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 line-clamp-3">{post.body}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {posts?.length === 0 && (
                    <p className="text-center text-gray-500 text-xl mt-10">No posts found</p>
                )}
            </main>

            <footer className="bg-gray-800 text-white py-4 text-center mt-auto">
                <p>Built with Vite + React + TanStack Query + Tailwind v4</p>
            </footer>
        </div>
    )
}

export default App