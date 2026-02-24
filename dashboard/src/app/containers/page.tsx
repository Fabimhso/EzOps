import { Play, Square, RotateCcw, Box, TerminalSquare } from "lucide-react";

export default function ContainersPage() {
    const containers = [
        { name: "ezops-api-1", image: "ezops-backend:latest", status: "running", ports: "8080->8080/tcp", cpu: "2.5%", mem: "145MB" },
        { name: "web-frontend-1", image: "nextjs-app:v2", status: "running", ports: "3000->3000/tcp", cpu: "1.2%", mem: "89MB" },
        { name: "postgres-db", image: "postgres:15-alpine", status: "running", ports: "5432->5432/tcp", cpu: "4.8%", mem: "512MB" },
        { name: "redis-cache", image: "redis:alpine", status: "exited", ports: "-", cpu: "-", mem: "-" },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Containers</h1>
                <p className="text-gray-400">Manage, inspect, and execute commands in your isolated environments.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {containers.map((c, i) => (
                    <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border border-[#1f2937] bg-[#111827] shadow-sm hover:border-[#374151] transition-colors">

                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                            <div className={`p-3 rounded-lg ${c.status === 'running' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-800 text-gray-400'}`}>
                                <Box className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                    {c.name}
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${c.status === 'running' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-gray-700 text-gray-400'}`}>
                                        {c.status}
                                    </span>
                                </h3>
                                <p className="text-sm text-gray-400 mt-1 font-mono">{c.image}</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full md:w-auto">
                            {c.status === 'running' && (
                                <div className="flex gap-4 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-xs">Ports</span>
                                        <span className="text-gray-200 font-mono">{c.ports}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-xs">CPU</span>
                                        <span className="text-gray-200">{c.cpu}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-xs">RAM</span>
                                        <span className="text-gray-200">{c.mem}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2 ml-auto">
                                <button className="p-2 text-gray-400 hover:text-white rounded bg-[#1f2937] hover:bg-gray-700 transition" title="View Logs">
                                    <TerminalSquare className="h-4 w-4" />
                                </button>
                                {c.status === 'running' ? (
                                    <>
                                        <button className="p-2 text-amber-400 hover:text-amber-300 rounded bg-[#1f2937] hover:bg-amber-900/30 transition" title="Restart">
                                            <RotateCcw className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 text-red-400 hover:text-red-300 rounded bg-[#1f2937] hover:bg-red-900/30 transition" title="Stop">
                                            <Square className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <button className="p-2 text-emerald-400 hover:text-emerald-300 rounded bg-[#1f2937] hover:bg-emerald-900/30 transition" title="Start">
                                        <Play className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}
