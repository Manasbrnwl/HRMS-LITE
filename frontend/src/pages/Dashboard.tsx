import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck } from "lucide-react";
import { api } from "@/services/api";

export default function Dashboard() {
    const [metrics, setMetrics] = useState({ totalEmployees: "--", todaysAttendance: "--" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMetrics = async () => {
            try {
                const data = await api.getDashboard();
                setMetrics(data);
            } catch (error) {
                console.error("Failed to load metrics");
            } finally {
                setLoading(false);
            }
        };
        loadMetrics();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground mt-2">
                    Overview of your HRMS Lite metrics.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "..." : metrics.totalEmployees}</div>
                        <p className="text-xs text-muted-foreground">Registered in the system</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "..." : metrics.todaysAttendance}</div>
                        <p className="text-xs text-muted-foreground">Present today</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
