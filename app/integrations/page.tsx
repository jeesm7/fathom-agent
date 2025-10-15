"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Check, X, ExternalLink } from "lucide-react";

export default function IntegrationsPage() {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);
  const [envConfig, setEnvConfig] = useState<Record<string, boolean>>({});

  const [config, setConfig] = useState({
    openaiApiKey: "",
    openaiVectorStoreId: "",
    googleClientId: "",
    googleClientSecret: "",
    tavilyApiKey: "",
    fathomWebhookSecret: "",
  });

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("integrations_config");
    if (saved) {
      setConfig(JSON.parse(saved));
    }

    // Check what's configured in .env
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setEnvConfig(data))
      .catch(() => {});
  }, []);

  const handleSave = () => {
    localStorage.setItem("integrations_config", JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const integrations = [
    {
      id: "openai",
      name: "OpenAI",
      description: "AI-powered classification, generation, and research",
      icon: "🤖",
      status: config.openaiApiKey || envConfig.hasOpenAI ? "connected" : "not_configured",
      fields: [
        { key: "openaiApiKey", label: "API Key", type: "password", link: "https://platform.openai.com/api-keys" },
        { key: "openaiVectorStoreId", label: "Vector Store ID (Optional)", type: "text", link: "https://platform.openai.com/vector-stores" },
      ],
    },
    {
      id: "google",
      name: "Google Workspace",
      description: "Create Docs, store in Drive, draft Gmail emails",
      icon: "📧",
      status: (config.googleClientId && config.googleClientSecret) || envConfig.hasGoogle ? "connected" : "not_configured",
      fields: [
        { key: "googleClientId", label: "Client ID", type: "text", link: "https://console.cloud.google.com/apis/credentials" },
        { key: "googleClientSecret", label: "Client Secret", type: "password", link: "https://console.cloud.google.com/apis/credentials" },
      ],
    },
    {
      id: "tavily",
      name: "Tavily Search",
      description: "Fallback web search when OpenAI web_search is unavailable",
      icon: "🔍",
      status: config.tavilyApiKey || envConfig.hasTavily ? "connected" : "optional",
      fields: [
        { key: "tavilyApiKey", label: "API Key (Optional)", type: "password", link: "https://tavily.com" },
      ],
    },
    {
      id: "fathom",
      name: "Fathom",
      description: "Webhook integration for automatic meeting processing",
      icon: "🎙️",
      status: config.fathomWebhookSecret || envConfig.hasFathom ? "connected" : "optional",
      fields: [
        { key: "fathomWebhookSecret", label: "Webhook Secret", type: "password", link: "https://app.fathom.video/settings/integrations" },
      ],
      webhookInfo: {
        endpoint: "/api/webhooks/fathom",
        event: "Meeting Ready / Call Ended",
        docs: "/FATHOM_INTEGRATION.md",
      },
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge variant="success" className="shadow-lg shadow-green-500/20"><Check className="w-3 h-3 mr-1" />Connected</Badge>;
      case "optional":
        return <Badge variant="secondary">Optional</Badge>;
      default:
        return <Badge variant="warning" className="shadow-lg shadow-yellow-500/20"><X className="w-3 h-3 mr-1" />Not Configured</Badge>;
    }
  };

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl -z-10" />
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Integrations
              </h1>
              <p className="text-xl text-gray-400">
                Connect your services to unlock powerful automation
              </p>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={saved}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {saved ? <><Check className="w-4 h-4 mr-2" />Saved!</> : "Save Configuration"}
            </Button>
          </div>
        </div>

        <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-6">
          <p className="text-blue-200 text-sm">
            <strong>✅ Auto-Save:</strong> Your configuration is automatically saved to your browser and will persist when you close/reopen the app.
            For extra backup, you can also copy values to your <code className="bg-gray-800 px-2 py-1 rounded">.env</code> file.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {integrations.map((integration) => (
            <Card
              key={integration.id}
              className="border-gray-700/50 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl hover:border-purple-500/30 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{integration.icon}</div>
                    <div>
                      <CardTitle className="text-2xl">{integration.name}</CardTitle>
                      <CardDescription className="text-base mt-1">{integration.description}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {integration.fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-300">{field.label}</Label>
                      {field.link && (
                        <a
                          href={field.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                        >
                          Get API Key <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type={showSecrets[field.key] ? "text" : field.type}
                        value={config[field.key as keyof typeof config]}
                        onChange={(e) =>
                          setConfig({ ...config, [field.key]: e.target.value })
                        }
                        placeholder={`Enter your ${field.label.toLowerCase()}`}
                        className="flex-1 bg-gray-800/50 border-gray-700 focus:border-purple-500"
                      />
                      {field.type === "password" && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleSecret(field.key)}
                          className="border-gray-700"
                        >
                          {showSecrets[field.key] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {integration.webhookInfo && (
                  <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">🔗 Webhook Configuration</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <Label className="text-xs text-gray-400">Webhook URL</Label>
                        <code className="block mt-1 text-sm text-purple-300">
                          https://your-domain.com{integration.webhookInfo.endpoint}
                        </code>
                      </div>
                      <div className="bg-gray-800/50 rounded-lg p-3">
                        <Label className="text-xs text-gray-400">Event Type</Label>
                        <p className="mt-1 text-sm text-gray-300">{integration.webhookInfo.event}</p>
                      </div>
                      <a
                        href={integration.webhookInfo.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                      >
                        📖 View Complete Setup Guide <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-cyan-900/20">
          <CardHeader>
            <CardTitle>📝 Environment Variables</CardTitle>
            <CardDescription>Copy this to your .env file and restart the app</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-gray-900/90 rounded-lg text-sm overflow-x-auto border border-gray-700">
{`# OpenAI
OPENAI_API_KEY=${config.openaiApiKey || "sk-..."}
OPENAI_VECTOR_STORE_ID=${config.openaiVectorStoreId || "vs_..."}

# Google OAuth
GOOGLE_CLIENT_ID=${config.googleClientId || "your-id.apps.googleusercontent.com"}
GOOGLE_CLIENT_SECRET=${config.googleClientSecret || "GOCSPX-..."}

# Optional Services
TAVILY_API_KEY=${config.tavilyApiKey || "tvly-..."}
FATHOM_WEBHOOK_SECRET=${config.fathomWebhookSecret || "your-secret"}

# NextAuth (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=REPLACE_ME`}
            </pre>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

