"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Filter, Download, TerminalSquare } from "lucide-react";

export default function LogsPage() {
    const [containers, setContainers] = useState<any[]>([]);
    const [selectedContainer, setSelectedContainer] = useState<string>("");
    const [logs, setLogs] = useState<string[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);

    const logsEndRef = useRef<HTMLDivElement>(null);

    // Fetch containers to populate the dropdown
    useEffect(() => {
        const fetchContainers = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/containers");
                const data = await res.json();

                const localContainers = data.containers || [];
                setContainers(localContainers);
                if (localContainers.length > 0) {
                    setSelectedContainer(localContainers[0].id);
                }
            } catch (e) {
                console.error("Failed to fetch containers", e);
            }
        };
        fetchContainers();
    }, []);

    // Manage SSE Connection for the selected container
    useEffect(() => {
        if (!selectedContainer) return;

        setLogs([]); // Clear logs when switching container
        setIsStreaming(true);

        const eventSource = new EventSource(`http://localhost:8080/api/containers/${selectedContainer}/logs`);

        eventSource.onmessage = (event) => {
            setLogs((prev) => {
                const newLogs = [...prev, event.data];
                // Keep the last 300 logs to prevent memory leaks in the browser
                if (newLogs.length > 300) {
                    return newLogs.slice(newLogs.length - 300);
                }
                return newLogs;
            });
        };

        eventSource.onerror = (e) => {
            console.error("SSE Error", e);
            setIsStreaming(false);
            eventSource.close();
        };

        return () => {
            eventSource.close();
            setIsStreaming(false);
        };
    }, [selectedContainer]);

    // Auto-scroll to bottom of logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs]);

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
            <div className="flex justify-between items-end shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Centralized Logs</h1>
                    <p className="text-gray-400">Stream and query standard output from all your services.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-[#1f2937] hover:bg-[#374151] text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors">
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            <div className="flex gap-4 shrink-0 bg-[#111827] border border-[#374151] p-3 rounded-lg flex-wrap">
                <div className="flex items-center gap-2">
                    <TerminalSquare className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Instance:</span>
                    <select
                        value={selectedContainer}
                        onChange={(e) => setSelectedContainer(e.target.value)}
                        className="rounded bg-[#1f2937] border border-[#374151] px-3 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                        {containers.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} ({c.image})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="relative flex-1 min-w-[200px] ml-auto">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search log messages..."
                        className="w-full rounded-md border border-[#374151] bg-[#1f2937] py-1 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 bg-[#1f2937] border border-[#374151] hover:bg-gray-700 text-gray-200 px-4 py-1 rounded-md transition-colors text-sm">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            <div className="flex-1 rounded-xl border border-[#1f2937] bg-black overflow-hidden flex flex-col font-mono text-sm leading-relaxed">
                <div className="p-2 border-b border-[#1f2937] bg-[#111827] flex items-center justify-between text-xs text-gray-400">
                    <span>Live Tail Active</span>
                    <span className="flex items-center gap-2">
                        {isStreaming ? (
                            <>
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Streaming
                            </>
                        ) : (
                            <>
                                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                                Disconnected
                            </>
                        )}
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {logs.length === 0 && isStreaming && (
                        <div className="text-gray-500 italic pb-2">Waiting for logs...</div>
                    )}

                    {logs.map((log, i) => (
                        <div key={i} className="flex gap-4 hover:bg-white/5 px-2 py-0.5 rounded transition-colors group">
                            <span className="text-gray-300 break-all">{log}</span>
                        </div>
                    ))}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
}
