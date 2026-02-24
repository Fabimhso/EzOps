import { Cloud, Save, Key, Shield } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
                    <p className="text-gray-400">Configure your EzOps platform integrations and preferences.</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    <Save className="h-4 w-4" />
                    Save Changes
                </button>
            </div>

            {/* Cloud Integrations Section */}
            <section className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
                <div className="border-b border-[#1f2937] px-6 py-4 bg-[#1f2937]/30 flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-blue-400" />
                    <h2 className="text-lg font-semibold text-white">Cloud Integrations (Sync)</h2>
                </div>

                <div className="p-6 space-y-6">
                    <p className="text-sm text-gray-400">
                        Connect your cloud providers to allow EzOps to sync remote instances and inject secrets securely.
                    </p>

                    <div className="grid gap-6">
                        <div className="bg-[#1f2937]/20 border border-[#374151] rounded-lg p-5 flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12.004 0C5.378 0 0 5.377 0 12c0 6.622 5.378 12 12.004 12c6.627 0 12.004-5.378 12.004-12C24.008 5.377 18.631 0 12.004 0zm5.122 17.51l-5.118-2.696-5.12 2.696.978-5.703-4.14-4.037 5.727-.832L12.004 2l2.56 5.183 5.728.832-4.144 4.037.978 5.703z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-medium text-white text-lg">AWS Account</h3>
                                    <p className="text-sm text-gray-400 mt-1">Connect IAM Role or Access Keys for Secrets Manager bridging.</p>

                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Access Key ID</label>
                                            <input type="text" placeholder="AKIAIOSFODNN7EXAMPLE" className="w-full max-w-sm rounded bg-black/50 border border-[#374151] px-3 py-1.5 text-sm text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Secret Access Key</label>
                                            <input type="password" placeholder="••••••••••••••••" className="w-full max-w-sm rounded bg-black/50 border border-[#374151] px-3 py-1.5 text-sm text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="px-3 py-1.5 text-sm font-medium bg-[#374151] hover:bg-gray-600 text-white rounded transition">Connect</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Security Engine Settings */}
            <section className="rounded-xl border border-[#1f2937] bg-[#111827] overflow-hidden">
                <div className="border-b border-[#1f2937] px-6 py-4 bg-[#1f2937]/30 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    <h2 className="text-lg font-semibold text-white">Security & Code Engine</h2>
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
                            <p className="text-sm text-gray-400">Generate main.tf along with Dockerfiles during <code className="text-blue-400">ezops init</code>.</p>
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
