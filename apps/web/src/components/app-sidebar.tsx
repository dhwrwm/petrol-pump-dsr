import {
  Fuel,
  HardHat,
  LayoutDashboard,
  ReceiptText,
  Settings,
  UserRound,
} from "lucide-react";
import { NavLink } from "react-router";

export function AppSidebar() {
  return (
    <aside
      className="bg-brand-900 text-brand-50 p-6 max-md:p-3.5"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-2.5 text-xl font-extrabold mb-9 max-md:mb-3.5">
        <Fuel size={24} />
        <span>DSR</span>
      </div>
      <nav className="grid gap-1.5 max-md:grid-cols-7">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-2.5 no-underline px-3 py-2.5 rounded-lg max-md:justify-center max-md:text-[0px] ${
              isActive
                ? "bg-brand-800 text-white"
                : "text-[#c9d7d0] hover:bg-brand-800 hover:text-white"
            }`
          }
        >
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>
        {/* <NavLink
          to="/shifts"
          className={({ isActive }) =>
            `flex items-center gap-2.5 no-underline px-3 py-2.5 rounded-lg max-md:justify-center max-md:text-[0px] ${
              isActive
                ? "bg-brand-800 text-white"
                : "text-[#c9d7d0] hover:bg-brand-800 hover:text-white"
            }`
          }
        >
          <Gauge size={18} />
          Shift
        </NavLink> */}
        <NavLink
          to="/sales"
          className={({ isActive }) =>
            `flex items-center gap-2.5 no-underline px-3 py-2.5 rounded-lg max-md:justify-center max-md:text-[0px] ${
              isActive
                ? "bg-brand-800 text-white"
                : "text-[#c9d7d0] hover:bg-brand-800 hover:text-white"
            }`
          }
        >
          <ReceiptText size={18} />
          Sales
        </NavLink>
        <NavLink
          to="/credit"
          className={({ isActive }) =>
            `flex items-center gap-2.5 no-underline px-3 py-2.5 rounded-lg max-md:justify-center max-md:text-[0px] ${
              isActive
                ? "bg-brand-800 text-white"
                : "text-[#c9d7d0] hover:bg-brand-800 hover:text-white"
            }`
          }
        >
          <UserRound size={18} />
          Credit
        </NavLink>
        <NavLink
          to="/employees"
          className={({ isActive }) =>
            `flex items-center gap-2.5 no-underline px-3 py-2.5 rounded-lg max-md:justify-center max-md:text-[0px] ${
              isActive
                ? "bg-brand-800 text-white"
                : "text-[#c9d7d0] hover:bg-brand-800 hover:text-white"
            }`
          }
        >
          <HardHat size={18} />
          Employees
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-2.5 no-underline px-3 py-2.5 rounded-lg max-md:justify-center max-md:text-[0px] ${
              isActive
                ? "bg-brand-800 text-white"
                : "text-[#c9d7d0] hover:bg-brand-800 hover:text-white"
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}
