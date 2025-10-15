"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Play, FileText, ExternalLink } from "lucide-react";

export default function DashboardPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [transcript, setTranscript] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    const res = await fetch("/api/runs");
    if (res.ok) {
      const data = await res.json();
      setRuns(data);
    }
  };

  const runTest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/test/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, meetingTitle }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Test run started! Run ID: ${data.runId}`);
        setTranscript("");
        setMeetingTitle("");
        fetchRuns();
      }
    } catch (error) {
      alert("Test run failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl -z-10" />
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Fathom AI Agent
            </h1>
            <p className="text-xl text-gray-400">
              Transform meeting transcripts into proposals, legal research, and more
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-purple-500/20 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  Quick Test Run
                </CardTitle>
                <CardDescription>
                  Paste a transcript to test the AI pipeline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Meeting Title</Label>
                  <Input
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder="e.g., Client Discovery Call"
                  />
                </div>
                <div>
                  <Label>Transcript</Label>
                  <Textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste meeting transcript here..."
                    rows={8}
                  />
                </div>
                <Button
                  onClick={runTest}
                  disabled={!transcript || loading}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {loading ? "Running..." : "Run Test"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  System Status
                </CardTitle>
                <CardDescription>Services and integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <span className="text-gray-300">Redis Queue</span>
                  <Badge variant="success" className="shadow-lg shadow-green-500/20">Active</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <span className="text-gray-300">OpenAI API</span>
                  <Badge variant="warning" className="shadow-lg shadow-yellow-500/20">Configure</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <span className="text-gray-300">Google APIs</span>
                  <Badge variant="warning" className="shadow-lg shadow-yellow-500/20">Configure</Badge>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30">
                  <span className="text-purple-300 font-medium">Total Runs</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{runs.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-cyan-500/20 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                Recent Runs
              </CardTitle>
              <CardDescription>Latest AI processing jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {runs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No runs yet. Start a test run above or configure your Fathom webhook.
                  </p>
                ) : (
                  runs.slice(0, 10).map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-700/30 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-100">
                          {JSON.parse(run.metadata || "{}")?.meeting_title || run.meetingId}
                        </p>
                        <p className="text-sm text-gray-400">
                          {formatDate(run.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            run.status === "completed"
                              ? "success"
                              : run.status === "failed"
                              ? "destructive"
                              : "warning"
                          }
                        >
                          {run.status}
                        </Badge>
                        {run.outputs?.length > 0 && (
                          <div className="flex gap-1">
                            {run.outputs.map((output: any) => (
                              <a
                                key={output.id}
                                href={output.shareUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-400 hover:text-purple-300"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          {/* Integration prompt banner */}
          {runs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-cyan-900/20 p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-2xl" />
              <div className="relative">
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  🚀 Get Started
                </h3>
                <p className="text-gray-300 mb-6 max-w-2xl">
                  Configure your integrations in Settings to unlock the full power of AI-generated documents, 
                  legal research, and automated follow-ups. Or paste a transcript above to test the system!
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => window.location.href = '/integrations'}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Configure Integrations
                  </Button>
                  <Button variant="outline">
                    View Documentation
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
    </div>
  );
}

