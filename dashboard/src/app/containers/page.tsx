"use client";

import { useState, useEffect } from "react";
import { Play, Square, RotateCcw, Box, TerminalSquare, RefreshCw } from "lucide-react";

/**
 * Individual Container Row Component
 * Manages its own stats fetching if running
 */
function ContainerRow({ container, onAction }: { container: any, onAction: () => void }) {
    const [stats, setStats] = useState({ cpu: "-", mem: "-" });
    const isRunning = container.status.toLowerCase() === 'running';

    useEffect(() => {
        let interval: NodeJS.Timeout;

        async function fetchStats() {
            if (!isRunning) return;
            try {
                const res = await fetch(`http://localhost:8080/api/containers/${container.id}/stats`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (e) {
                console.error("Failed to fetch stats for", container.id);
            }
        }

        if (isRunning) {
            fetchStats();
            interval = setInterval(fetchStats, 5000); // Poll every 5 seconds
        }

        return () => clearInterval(interval);
    }, [container.id, isRunning]);

    const performAction = async (action: string) => {
        try {
            await fetch(`http://localhost:8080/api/containers/${container.id}/${action}`, {
                method: 'POST'
            });
            onAction(); // Trigger a refresh of the container list
        } catch (e) {
            console.error(`Failed to ${action} container ${container.id}`, e);
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border border-[#1f2937] bg-[#111827] shadow-sm hover:border-[#374151] transition-colors">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className={`p-3 rounded-lg ${isRunning ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-800 text-gray-400'}`}>
                    <Box className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        {container.name}
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isRunning ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-700 text-gray-400'}`}>
                            {container.status}
                        </span>
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 font-mono">{container.image}</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto">
                {isRunning && (
                    <div className="flex gap-4 text-sm">
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">Ports</span>
                            <span className="text-gray-200 font-mono">{container.port}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">CPU</span>
                            <span className="text-gray-200">{stats.cpu}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 text-xs">RAM</span>
                            <span className="text-gray-200">{stats.mem}</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 ml-auto">
                    <button className="p-2 text-gray-400 hover:text-white rounded bg-[#1f2937] hover:bg-gray-700 transition" title="View Logs">
                        <TerminalSquare className="h-4 w-4" />
                    </button>
                    {isRunning ? (
                        <>
                            <button onClick={() => performAction('restart')} className="p-2 text-amber-400 hover:text-amber-300 rounded bg-[#1f2937] hover:bg-amber-900/30 transition" title="Restart">
                                <RotateCcw className="h-4 w-4" />
                            </button>
                            <button onClick={() => performAction('stop')} className="p-2 text-red-400 hover:text-red-300 rounded bg-[#1f2937] hover:bg-red-900/30 transition" title="Stop">
                                <Square className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => performAction('start')} className="p-2 text-emerald-400 hover:text-emerald-300 rounded bg-[#1f2937] hover:bg-emerald-900/30 transition" title="Start">
                            <Play className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ContainersPage() {
    const [containers, setContainers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchContainers = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/containers');
            const json = await res.json();
            // Optional: filter out AWS nodes or show them distinctly. 
            // For now, we will show all, but AWS nodes dont have start/stop APIs setup yet.
            setContainers(json.containers || []);
        } catch (e) {
            console.error("Failed to fetch containers", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContainers();
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Containers</h1>
                    <p className="text-gray-400">Manage, inspect, and execute commands in your isolated environments.</p>
                </div>
                <button
                    onClick={fetchContainers}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg transition-colors font-medium text-sm"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {loading && containers.length === 0 ? (
                <div className="text-gray-400 animate-pulse">Loading containers...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {containers.map((c, i) => (
                        <ContainerRow key={c.id || i} container={c} onAction={fetchContainers} />
                    ))}
                    {containers.length === 0 && (
                        <div className="text-gray-500 italic p-6 border border-dashed border-gray-700 rounded-xl text-center">
                            No containers found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
