import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function Attendance() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [filterDate, setFilterDate] = useState("");

    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [status, setStatus] = useState("Present");

    const { toast } = useToast();

    useEffect(() => {
        loadEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            loadAttendance(selectedEmployee, filterDate);
        } else {
            setAttendanceRecords([]);
        }
    }, [selectedEmployee, filterDate]);

    const loadEmployees = async () => {
        try {
            const data = await api.getEmployees();
            setEmployees(data);
            if (data.length > 0) {
                setSelectedEmployee(data[0].id);
            }
        } catch (e: any) {
            // Ignore if empty or failed on init
        }
    };

    const loadAttendance = async (empId: string, filter?: string) => {
        setLoadingRecords(true);
        try {
            const data = await api.getAttendance(empId, filter);
            setAttendanceRecords(data);
        } catch (e: any) {
            toast({ title: "Error", description: "Failed to load records", variant: "destructive" });
        } finally {
            setLoadingRecords(false);
        }
    };

    const handleMarkAttendance = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        try {
            await api.markAttendance({ employeeId: selectedEmployee, date, status });
            toast({ title: "Success", description: "Attendance marked successfully" });
            loadAttendance(selectedEmployee, filterDate);
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Attendance</h2>
                <p className="text-muted-foreground mt-2">Track and view daily attendance for employees.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardContent className="pt-6">
                        <form onSubmit={handleMarkAttendance} className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Mark Attendance</h3>
                            <div className="space-y-2">
                                <Label>Employee</Label>
                                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map(emp => (
                                            <SelectItem key={emp.id} value={emp.id}>{emp.fullname} ({emp.employeeid})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Present">Present</SelectItem>
                                        <SelectItem value="Absent">Absent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit" className="w-full mt-2" disabled={!selectedEmployee}>Submit Record</Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="font-semibold text-lg">Recent Records</h3>
                            <div className="flex items-center space-x-2">
                                <Label className="text-sm">Filter:</Label>
                                <Input type="date" className="h-8 text-sm" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                                {filterDate && (
                                    <Button variant="ghost" size="sm" onClick={() => setFilterDate("")} className="h-8 px-2 text-xs">Clear</Button>
                                )}
                            </div>
                        </div>
                        <div className="rounded-md border bg-card overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingRecords ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-24">Loading...</TableCell>
                                        </TableRow>
                                    ) : attendanceRecords.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">No records found for this employee.</TableCell>
                                        </TableRow>
                                    ) : (
                                        attendanceRecords.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.status === 'Present' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {record.status}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
