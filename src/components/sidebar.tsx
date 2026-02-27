import { NavLink } from 'react-router-dom'
import { Home, LogIn } from 'lucide-react'

const links = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/login', label: 'Login', icon: <LogIn size={18} /> },
]

export default function Sidebar() {
    return (
        <aside className="flex flex-col w-56 min-h-screen bg-gray-900 text-white px-4 py-6 gap-2">
            {/* Logo / App name */}
            <h1 className="text-xl font-bold mb-6 px-2">iFoto</h1>

            {/* Nav links */}
            <nav className="flex flex-col gap-1">
                {links.map(({ to, label, icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`
                        }
                    >
                        {icon}
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    )
}