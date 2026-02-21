const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const api = {
    getDashboard: async () => {
        const res = await fetch(`${API_URL}/dashboard`);
        if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
        return res.json();
    },
    getEmployees: async () => {
        const res = await fetch(`${API_URL}/employees`);
        if (!res.ok) throw new Error("Failed to fetch employees");
        return res.json();
    },
    createEmployee: async (data: { employeeId: string; fullName: string; email: string; department: string }) => {
        const res = await fetch(`${API_URL}/employees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || "Failed to create employee");
        }
        return res.json();
    },
    deleteEmployee: async (id: string) => {
        const res = await fetch(`${API_URL}/employees/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete employee");
        return res.json();
    },
    getAttendance: async (employeeId: string, date?: string) => {
        const url = date ? `${API_URL}/attendance/${employeeId}?date=${date}` : `${API_URL}/attendance/${employeeId}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch attendance");
        return res.json();
    },
    markAttendance: async (data: { employeeId: string; date: string; status: string }) => {
        const res = await fetch(`${API_URL}/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.detail || "Failed to mark attendance");
        }
        return res.json();
    },
};
