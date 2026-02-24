"use client";

import { useState } from "react";
import { Plus, Key, Eye, EyeOff, Trash2, Copy, Cloud } from "lucide-react";

// In a real app, this list might come from a DB of keys we intend to inject.
// Since AWS Secrets Manager 'list_secrets' requires broad IAM permissions, 
// we store the keys we care about, and fetch their values on demand.
const initialSecrets = [
    { id: "1", key: "DATABASE_URL", env: "Production", lastUpdated: "2 days ago" },
    { id: "2", key: "JWT_SECRET", env: "Global", lastUpdated: "1 week ago" },
    { id: "3", key: "AWS_ACCESS_KEY", env: "Production", lastUpdated: "1 month ago" },
    { id: "4", key: "REDIS_HOST", env: "Staging", lastUpdated: "5 hours ago" },
    { id: "5", key: "STRIPE_API_KEY", env: "Production", lastUpdated: "2 months ago" },
];

export default function SecretsPage() {
    const [secrets, setSecrets] = useState(initialSecrets);
    const [revealed, setRevealed] = useState<Record<string, string | null>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const toggleReveal = async (key: string) => {
        // Hide if already revealed
        if (revealed[key] !== undefined) {
            setRevealed(prev => {
                const updated = { ...prev };
                delete updated[key];
                return updated;
            });
            setErrorMsg(null);
            return;
        }

        // Fetch from backend
        setLoading(prev => ({ ...prev, [key]: true }));
        setErrorMsg(null);

        try {
            const res = await fetch(`http://localhost:8080/api/secrets/${key}`);
            const data = await res.json();

            if (data.error) {
                setErrorMsg(`[${key}] ` + data.error);
                setRevealed(prev => ({ ...prev, [key]: "AWS_NOT_CONFIGURED" }));
            } else {
                setRevealed(prev => ({ ...prev, [key]: data.value }));
            }
        } catch (e) {
            setErrorMsg("Failed to connect to backend");
            setRevealed(prev => ({ ...prev, [key]: "ERROR" }));
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Secrets Manager</h1>
                    <p className="text-gray-400">Inject parameters and credentials dynamically from the Cloud Vault.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <Cloud className="h-4 w-4" />
                    Sync External
                </button>
            </div>

            {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                    {errorMsg}
                </div>
            )}

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
                                <th className="px-6 py-3 font-medium">Value (Proxy)</th>
                                <th className="px-6 py-3 font-medium">Updated</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1f2937] text-gray-300">
                            {secrets.map((secret, i) => {
                                const isRevealed = revealed[secret.key] !== undefined;
                                const val = revealed[secret.key];
                                const isLoad = loading[secret.key];

                                return (
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
                                        <td className="px-6 py-4 font-mono text-gray-400">
                                            {isLoad ? (
                                                <span className="animate-pulse">Fetching from AWS...</span>
                                            ) : isRevealed ? (
                                                <span className={val === 'AWS_NOT_CONFIGURED' ? 'text-red-400 text-xs' : 'text-emerald-400'}>
                                                    {val}
                                                </span>
                                            ) : (
                                                <span className="tracking-widest">••••••••••••••••</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{secret.lastUpdated}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {isRevealed && val !== 'AWS_NOT_CONFIGURED' && (
                                                    <button onClick={() => copyToClipboard(val!)} className="p-1.5 text-gray-400 hover:text-white rounded bg-[#1f2937] hover:bg-gray-700" title="Copy value">
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button onClick={() => toggleReveal(secret.key)} className="p-1.5 text-gray-400 hover:text-white rounded bg-[#1f2937] hover:bg-gray-700" title={isRevealed ? "Hide" : "Reveal via AWS"}>
                                                    {isRevealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                                <button className="p-1.5 text-red-400 hover:text-red-300 rounded bg-[#1f2937] hover:bg-red-900/30" title="Delete record">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
