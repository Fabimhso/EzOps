'use client'

import { useEffect, useState } from "react";
import { Activity, Cpu, Server, ShieldCheck, RefreshCw } from "lucide-react";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchContainers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/containers');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, []);

  const activeCount = data?.metrics?.active_containers || 0;
  const totalCount = data?.metrics?.total_containers || 0;
  const containers = data?.containers || [];

  const metrics = [
    { title: "Active Containers", value: `${activeCount} / ${totalCount}`, icon: Server, color: "text-blue-500" },
    { title: "Docker Daemon", value: data ? "Connected" : "Unknown", icon: Cpu, color: data ? "text-emerald-500" : "text-amber-500" },
    { title: "Network Status", value: "Monitoring", icon: Activity, color: "text-blue-500" },
    { title: "Security Scans", value: "Enabled", icon: ShieldCheck, color: "text-indigo-500" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Overview</h1>
          <p className="text-gray-400">Monitor your infrastructure health and container metrics in real-time.</p>
        </div>
        <button
          onClick={fetchContainers}
          disabled={loading}
          className="flex items-center gap-2 bg-[#1f2937] hover:bg-[#374151] text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <div key={i} className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{metric.title}</p>
                <p className="mt-2 text-2xl font-bold text-white">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-[#1f2937] ${metric.color}`}>
                <metric.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Containers List */}
      <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
        <div className="border-b border-[#1f2937] px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Docker Containers (Live)</h2>
        </div>
        <div className="overflow-x-auto min-h-[200px]">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading containers...</div>
          ) : containers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No containers found running on your Docker daemon.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1f2937]/50 text-gray-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Image reference</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Exposed Port</th>
                  <th className="px-6 py-3 font-medium text-right">Uptime/Init</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2937] text-gray-300">
                {containers.map((container: any, i: number) => (
                  <tr key={i} className="hover:bg-[#1f2937]/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-blue-400">
                      <div className="flex flex-col">
                        <span>{container.name}</span>
                        <span className="text-xs text-gray-600">{container.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-xs">{container.image}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${container.status === 'Running'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                        {container.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono">{container.port}</td>
                    <td className="px-6 py-4 text-right text-gray-400 text-xs">{container.uptime.replace('T', ' ').split('.')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
