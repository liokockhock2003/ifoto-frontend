import { NavLink } from 'react-router-dom'
import { ModeToggle } from '@/components/mode-toggle'
import { menuItems } from '@/routerMenuItems'          // ← import from here

export default function Sidebar() {
    return (
        <aside className="flex flex-col w-56 min-h-screen bg-gray-900 text-white px-4 py-6 gap-2">
            {/* Logo / App name */}
            <h1 className="text-xl font-bold mb-6 px-2">iFoto</h1>

            {/* Nav links */}
            <nav className="flex flex-col gap-1">
                {menuItems.map(({ to, label, icon: Icon }) => (
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
                        <Icon size={18} />              {/* ← render as component */}
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Push toggle to bottom */}
            <div className="mt-auto flex items-center gap-3 px-2">
                <ModeToggle />
                <span className="text-sm text-gray-400">Toggle theme</span>
            </div>
        </aside>
    )
}