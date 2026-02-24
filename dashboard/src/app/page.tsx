import { Activity, Cpu, Server, ShieldCheck } from "lucide-react";

const mockMetrics = [
  { title: "Active Containers", value: "12", icon: Server, color: "text-blue-500" },
  { title: "CPU Load Avg", value: "45%", icon: Cpu, color: "text-amber-500" },
  { title: "Network In/Out", value: "1.2GB / 800MB", icon: Activity, color: "text-emerald-500" },
  { title: "Security Scans", value: "Pass", icon: ShieldCheck, color: "text-indigo-500" },
];

const mockContainers = [
  { id: "ezops-api-1", image: "ezops-backend:latest", status: "Running", uptime: "14d 2h", port: "8000" },
  { id: "ezops-web-1", image: "ezops-frontend:latest", status: "Running", uptime: "14d 2h", port: "3000" },
  { id: "redis-cache", image: "redis:7-alpine", status: "Running", uptime: "20d 5h", port: "6379" },
  { id: "pg-database", image: "postgres:15-alpine", status: "Running", uptime: "30d 1h", port: "5432" },
  { id: "model-worker", image: "ml-worker:v1.2", status: "Stopped", uptime: "-", port: "8080" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Platform Overview</h1>
        <p className="text-gray-400">Monitor your infrastructure health and container metrics.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric, i) => (
          <div key={i} className="rounded-xl border border-[#1f2937] bg-[#111827] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{metric.title}</p>
                <p className="mt-2 text-3xl font-bold text-white">{metric.value}</p>
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
          <h2 className="text-lg font-semibold text-white">Recent Containers</h2>
          <button className="text-sm text-blue-500 hover:text-blue-400 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1f2937]/50 text-gray-400">
              <tr>
                <th className="px-6 py-3 font-medium">Container ID</th>
                <th className="px-6 py-3 font-medium">Image reference</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Port</th>
                <th className="px-6 py-3 font-medium flex justify-end">Uptime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937] text-gray-300">
              {mockContainers.map((container, i) => (
                <tr key={i} className="hover:bg-[#1f2937]/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-blue-400">{container.id}</td>
                  <td className="px-6 py-4">{container.image}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${container.status === 'Running'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                      {container.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono">{container.port}</td>
                  <td className="px-6 py-4 text-right text-gray-400">{container.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
