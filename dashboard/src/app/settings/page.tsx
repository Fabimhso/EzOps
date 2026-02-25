"use client";

import { useState, useEffect } from "react";
import { Cloud, Save, Shield, CheckCircle2, Trash2 } from "lucide-react";

type CloudProvider = "AWS" | "GCP" | "AZURE";

export default function SettingsPage() {
    const [provider, setProvider] = useState<CloudProvider>("AWS");

    // Connected Accounts list from backend
    const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);

    // AWS State
    const [accessKey, setAccessKey] = useState("");
    const [secretKey, setSecretKey] = useState("");

    // GCP State
    const [gcpJson, setGcpJson] = useState("");

    // Azure State
    const [tenantId, setTenantId] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [subId, setSubId] = useState("");

    const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const fetchConnectedAccounts = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/settings/cloud");
            const data = await res.json();
            setConnectedAccounts(data.connected_accounts || []);
        } catch (e) {
            console.error("Failed to fetch connected accounts", e);
        }
    };

    useEffect(() => {
        fetchConnectedAccounts();
    }, []);

    const isConnected = (prov: string) => {
        return connectedAccounts.some(acc => acc.provider === prov);
    };

    const handleSaveAWS = async () => {
        if (!accessKey || !secretKey) {
            setErrorMsg("Both keys are required for AWS.");
            setStatus("error");
            return;
        }

        setStatus("saving");
        try {
            const res = await fetch("http://localhost:8080/api/settings/aws", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ access_key: accessKey, secret_key: secretKey })
            });
            const data = await res.json();

            if (data.status === "success") {
                setStatus("success");
                setAccessKey("");
                setSecretKey("");
                await fetchConnectedAccounts();
                setTimeout(() => setStatus("idle"), 3000);
            } else {
                throw new Error(data.message);
            }
        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || "Failed to save AWS credentials");
            setStatus("error");
        }
    };

    const handleSaveGCP = async () => {
        if (!gcpJson) {
            setErrorMsg("Service Account JSON is required.");
            setStatus("error");
            return;
        }

        setStatus("saving");
        try {
            const res = await fetch("http://localhost:8080/api/settings/gcp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ service_account_json: gcpJson })
            });
            const data = await res.json();

            if (data.status === "success") {
                setStatus("success");
                setGcpJson("");
                await fetchConnectedAccounts();
                setTimeout(() => setStatus("idle"), 3000);
            } else {
                throw new Error(data.message);
            }
        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || "Failed to save GCP credentials");
            setStatus("error");
        }
    };

    const handleSaveAzure = async () => {
        if (!tenantId || !clientId || !clientSecret || !subId) {
            setErrorMsg("All four fields are required for Azure.");
            setStatus("error");
            return;
        }

        setStatus("saving");
        try {
            const res = await fetch("http://localhost:8080/api/settings/azure", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenant_id: tenantId,
                    client_id: clientId,
                    client_secret: clientSecret,
                    subscription_id: subId
                })
            });
            const data = await res.json();

            if (data.status === "success") {
                setStatus("success");
                setTenantId("");
                setClientId("");
                setClientSecret("");
                setSubId("");
                await fetchConnectedAccounts();
                setTimeout(() => setStatus("idle"), 3000);
            } else {
                throw new Error(data.message);
            }
        } catch (e: any) {
            console.error(e);
            setErrorMsg(e.message || "Failed to save Azure credentials");
            setStatus("error");
        }
    };

    const getSaveHandler = () => {
        if (provider === 'AWS') return handleSaveAWS;
        if (provider === 'GCP') return handleSaveGCP;
        return handleSaveAzure;
    };

    const handleDeleteAccount = async (prov: string) => {
        if (!confirm(`Are you sure you want to disconnect ${prov}?`)) return;

        try {
            await fetch(`http://localhost:8080/api/settings/cloud/${prov}`, {
                method: "DELETE"
            });
            await fetchConnectedAccounts();
        } catch (e) {
            console.error("Failed to delete account", e);
        }
    }

    return (
        <div className="flex flex-col gap-8 max-w-4xl pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Configure your EzOps platform integrations and preferences.</p>
                </div>
            </div>

            {/* Cloud Integrations Section */}
            <section className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
                <div className="border-b border-[#1f2937] px-6 py-4 bg-[#1f2937]/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Cloud className="h-5 w-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Cloud Integrations (Sync)</h2>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-400">
                        Connect your cloud providers to allow EzOps to sync remote instances and inject secrets securely.
                        Credentials are saved safely to your local machine.
                    </p>

                    {/* Active Connections List */}
                    {connectedAccounts.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-300 mb-3 border-b border-[#374151] pb-2">Active Connections</h3>
                            <div className="grid gap-3">
                                {connectedAccounts.map((acc, i) => (
                                    <div key={i} className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            <div>
                                                <p className="font-medium text-emerald-400">{acc.provider} <span className="text-xs text-emerald-500/70 ml-2">Connected</span></p>
                                                <p className="text-xs text-gray-400 mt-0.5">{acc.details}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAccount(acc.provider)}
                                            className="p-2 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                            title="Disconnect Cloud"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 className="text-sm font-medium text-gray-300 mb-2 border-b border-[#374151] pb-2">Add New Connection</h3>

                    {/* Provider Selector */}
                    <div className="flex gap-2 p-1 bg-[#1f2937]/50 rounded-lg w-fit border border-[#374151]">
                        {(["AWS", "GCP", "AZURE"] as CloudProvider[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => { setProvider(p); setStatus("idle"); setErrorMsg(""); }}
                                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${provider === p
                                    ? "bg-blue-600 text-white shadow"
                                    : "text-gray-400 hover:text-white hover:bg-[#374151]"
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="grid gap-6">
                        <div className="bg-[#1f2937]/20 border border-[#374151] rounded-lg p-5 flex flex-col items-start gap-6">
                            <div className="w-full flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-white text-lg flex items-center gap-3">
                                        {provider === "AWS" && "Amazon Web Services"}
                                        {provider === "GCP" && "Google Cloud Platform"}
                                        {provider === "AZURE" && "Microsoft Azure"}
                                        {isConnected(provider) && <span className="text-xs bg-[#1f2937] px-2 py-0.5 rounded text-gray-400 border border-[#374151]">Already Configured</span>}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-1 mb-4">
                                        {provider === "AWS" && "Provide IAM Access Keys for Secrets Manager bridging."}
                                        {provider === "GCP" && "Paste your Service Account JSON key content."}
                                        {provider === "AZURE" && "Provide App Registration credentials for Azure."}
                                    </p>
                                    {status === 'error' && <p className="text-red-400 text-sm mb-3">{errorMsg}</p>}
                                    {status === 'success' && <p className="text-emerald-400 text-sm mb-3">Saved locally!</p>}
                                </div>
                            </div>

                            {/* Forms */}
                            {provider === "AWS" && (
                                <div className="space-y-4 w-full max-w-md">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Access Key ID</label>
                                        <input
                                            type="text"
                                            value={accessKey}
                                            onChange={e => setAccessKey(e.target.value)}
                                            placeholder="AKIAIOSFODNN7EXAMPLE"
                                            className="w-full rounded bg-black/50 border border-[#374151] px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Secret Access Key</label>
                                        <input
                                            type="password"
                                            value={secretKey}
                                            onChange={e => setSecretKey(e.target.value)}
                                            placeholder="••••••••••••••••"
                                            className="w-full rounded bg-black/50 border border-[#374151] px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            )}

                            {provider === "GCP" && (
                                <div className="space-y-4 w-full max-w-xl">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Service Account JSON</label>
                                        <textarea
                                            value={gcpJson}
                                            onChange={e => setGcpJson(e.target.value)}
                                            placeholder='{\n  "type": "service_account",\n  "project_id": "my-project",\n ...\n}'
                                            rows={6}
                                            className="w-full rounded bg-black/50 border border-[#374151] px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono"
                                        />
                                    </div>
                                </div>
                            )}

                            {provider === "AZURE" && (
                                <div className="space-y-4 w-full max-w-md">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Tenant ID</label>
                                        <input
                                            type="text"
                                            value={tenantId}
                                            onChange={e => setTenantId(e.target.value)}
                                            placeholder="00000000-0000-0000-0000-000000000000"
                                            className="w-full rounded bg-black/50 border border-[#374151] px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Client ID</label>
                                        <input
                                            type="text"
                                            value={clientId}
                                            onChange={e => setClientId(e.target.value)}
                                            placeholder="00000000-0000-0000-0000-000000000000"
                                            className="w-full rounded bg-black/50 border border-[#374151] px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Client Secret</label>
                                        <input
                                            type="password"
                                            value={clientSecret}
                                            onChange={e => setClientSecret(e.target.value)}
                                            placeholder="••••••••••••••••"
                                            className="w-full rounded bg-black/50 border border-[#374151] px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 mb-1">Subscription ID</label>
                                        <input
                                            type="text"
                                            value={subId}
                                            onChange={e => setSubId(e.target.value)}
                                            placeholder="00000000-0000-0000-0000-000000000000"
                                            className="w-full rounded bg-black/50 border border-[#374151] px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="w-full flex justify-end mt-2 pt-4 border-t border-[#374151]">
                                <button
                                    onClick={getSaveHandler()}
                                    disabled={status === 'saving'}
                                    className="flex items-center gap-2 px-6 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded transition"
                                >
                                    <Save className="h-4 w-4" />
                                    {status === 'saving' ? `Saving ${provider}...` : (isConnected(provider) ? `Update ${provider}` : `Connect ${provider}`)}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Engine Settings Mockup */}
            <section className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden opacity-80">
                <div className="border-b border-[#1f2937] px-6 py-4 bg-[#1f2937]/30 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-lg font-semibold text-white">Security & Code Engine (Global Defaults)</h2>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-[#1f2937]">
                        <div>
                            <h4 className="font-medium text-gray-200">Force Rootless Containers</h4>
                            <p className="text-sm text-gray-400">Always generate Dockerfiles adding a non-root user.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-[#1f2937]">
                        <div>
                            <h4 className="font-medium text-gray-200">Auto IaC Generation</h4>
                            <p className="text-sm text-gray-400">Generate main.tf along with Dockerfiles during <code className="bg-black text-blue-400 px-1 rounded">ezops init</code>.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
}
