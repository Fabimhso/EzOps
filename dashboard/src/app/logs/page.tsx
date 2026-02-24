import { Search, Filter, Download } from "lucide-react";

export default function LogsPage() {
    const logStream = [
        { time: "12:45:01", level: "INFO", source: "ezops-api-1", msg: "HTTP/1.1 GET /api/health - 200 OK" },
        { time: "12:45:03", level: "WARN", source: "postgres-db", msg: "checkpoint starting: time" },
        { time: "12:45:06", level: "INFO", source: "ezops-api-1", msg: "Connecting to Docker Daemon locally..." },
        { time: "12:45:09", level: "ERROR", source: "web-frontend-1", msg: "Unhandled promise rejection: fetch failed" },
        { time: "12:45:15", level: "INFO", source: "redis-cache", msg: "Ready to accept connections" },
        { time: "12:45:22", level: "DEBUG", source: "ezops-api-1", msg: "Fetched 4 containers from daemon" },
        { time: "12:45:30", level: "INFO", source: "ezops-api-1", msg: "HTTP/1.1 GET /api/containers - 200 OK (45ms)" },
    ];

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

            <div className="flex gap-4 shrink-0">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search log messages, trace IDs..."
                        className="w-full rounded-md border border-[#374151] bg-[#111827] py-2 pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 bg-[#111827] border border-[#374151] hover:bg-[#1f2937] text-gray-200 px-4 py-2 rounded-md transition-colors">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            <div className="flex-1 rounded-xl border border-[#1f2937] bg-black overflow-hidden flex flex-col font-mono text-sm leading-relaxed">
                <div className="p-2 border-b border-[#1f2937] bg-[#111827] flex items-center justify-between text-xs text-gray-400">
                    <span>Live Tail Active</span>
                    <span className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Streaming
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-1">
                    {logStream.map((log, i) => (
                        <div key={i} className="flex gap-4 hover:bg-white/5 px-2 py-0.5 rounded transition-colors group">
                            <span className="text-gray-500 shrink-0 select-none">{log.time}</span>

                            <span className={`shrink-0 w-14 font-semibold ${log.level === 'INFO' ? 'text-blue-400' :
                                    log.level === 'WARN' ? 'text-amber-400' :
                                        log.level === 'ERROR' ? 'text-red-400' : 'text-gray-400'
                                }`}>
                                {log.level}
                            </span>

                            <span className="text-emerald-400 shrink-0 w-32 truncate" title={log.source}>
                                [{log.source}]
                            </span>

                            <span className={`text-gray-300 ${log.level === 'ERROR' ? 'text-red-300 font-medium' : ''}`}>
                                {log.msg}
                            </span>
                        </div>
                    ))}
                    <div className="animate-pulse flex gap-4 px-2 py-0.5 mt-2">
                        <span className="text-gray-600">...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
