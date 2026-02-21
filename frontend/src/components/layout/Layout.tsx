import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Toaster } from "@/components/ui/toaster";

export function Layout() {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-muted/20">
                <div className="mx-auto p-8">
                    <Outlet />
                </div>
            </main>
            <Toaster />
        </div>
    );
}
