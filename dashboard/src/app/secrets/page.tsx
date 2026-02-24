import { Plus, Key, Eye, EyeOff, Trash2, Copy } from "lucide-react";

const mockSecrets = [
    { id: "1", key: "DATABASE_URL", env: "Production", lastUpdated: "2 days ago" },
    { id: "2", key: "JWT_SECRET", env: "Global", lastUpdated: "1 week ago" },
    { id: "3", key: "AWS_ACCESS_KEY", env: "Production", lastUpdated: "1 month ago" },
    { id: "4", key: "REDIS_HOST", env: "Staging", lastUpdated: "5 hours ago" },
    { id: "5", key: "STRIPE_API_KEY", env: "Production", lastUpdated: "2 months ago" },
];

export default function SecretsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Secrets Manager</h1>
                    <p className="text-gray-400">Manage environment variables and sensitive credentials securely.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <Plus className="h-4 w-4" />
                    Add Secret
                </button>
            </div>

            <div className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
                <div className="p-4 border-b border-[#1f2937] flex gap-4">
                    <input
                        type="text"
                        placeholder="Search secrets..."
                        className="w-full max-w-sm rounded-md border border-[#374151] bg-[#1f2937] px-4 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                    />
                    <select className="rounded-md border border-[#374151] bg-[#1f2937] px-4 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none">
                        <option>All Environments</option>
                        <option>Production</option>
                        <option>Staging</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#1f2937]/50 text-gray-400">
                            <tr>
                                <th className="px-6 py-3 font-medium">Key Name</th>
                                <th className="px-6 py-3 font-medium">Environment</th>
                                <th className="px-6 py-3 font-medium">Value</th>
                                <th className="px-6 py-3 font-medium">Updated</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1f2937] text-gray-300">
                            {mockSecrets.map((secret, i) => (
                                <tr key={i} className="hover:bg-[#1f2937]/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-gray-200 flex items-center gap-3">
                                        <div className="p-1.5 rounded bg-gray-800">
                                            <Key className="h-3 w-3 text-gray-400" />
                                        </div>
                                        {secret.key}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${secret.env === 'Production'
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : secret.env === 'Staging'
                                                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                    : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                            }`}>
                                            {secret.env}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono tracking-widest text-gray-500">
                                        ••••••••••••••••
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{secret.lastUpdated}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-gray-400 hover:text-white rounded bg-[#1f2937] hover:bg-gray-700" title="Copy value">
                                                <Copy className="h-4 w-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-white rounded bg-[#1f2937] hover:bg-gray-700" title="Reveal">
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button className="p-1.5 text-red-400 hover:text-red-300 rounded bg-[#1f2937] hover:bg-red-900/30" title="Delete">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
