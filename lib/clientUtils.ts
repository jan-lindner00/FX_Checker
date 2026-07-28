import type { LogEntry } from "@/types/types";

export function convertToCSV(data: LogEntry[]) {
    if (!data.length) return "";

    const headers = Object.keys(data[0]) as (keyof LogEntry)[]
    const rowsArr = data.map((entry: LogEntry)=>{
        const row = headers.map((key: (keyof LogEntry))=>{
            const value: string | number = entry[key] ?? "" 
            const escaped = typeof value === "number" ? Number(value).toFixed(2).replace(/"/g, '""') : String(value).replace(/"/g, '""');
            return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        }).join(",")
        return row
    })
    const csvRows = [
        headers.join(","),
        ...rowsArr
    ];

    return csvRows.join("\n");
}

export function downloadCSV(data: LogEntry[], filename = `exchange-${Temporal.Now.plainDateTimeISO().toString()}.csv`) {
    const csvContent = convertToCSV(data);
    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}