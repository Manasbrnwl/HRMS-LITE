import { Link, useLocation } from "react-router-dom";
import { Users, CalendarCheck, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Employees", href: "/employees", icon: Users },
    { name: "Attendance", href: "/attendance", icon: CalendarCheck },
];

export function Sidebar() {
    const location = useLocation();

    return (
        <div className="flex h-full w-64 flex-col overflow-y-auto border-r bg-card px-3 py-4">
            <div className="mb-8 px-4">
                <h2 className="text-2xl font-bold tracking-tight text-primary">HRMS Lite</h2>
            </div>
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "mr-3 h-5 w-5 flex-shrink-0",
                                    isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="mt-auto px-4 pb-4">
                <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
        </div>
    );
}
