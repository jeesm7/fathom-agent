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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function LogsPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRuns = async () => {
    const res = await fetch("/api/runs");
    if (res.ok) {
      const data = await res.json();
      setRuns(data);
    }
  };

  const toggleExpand = (runId: string) => {
    setExpandedRun(expandedRun === runId ? null : runId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
    }
  };

  return (
    <div className="p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          <div>
            <h1 className="text-4xl font-bold mb-2">Activity Logs</h1>
            <p className="text-gray-400">
              View detailed logs and job execution history
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Processing Runs</CardTitle>
              <CardDescription>
                Complete history of all meeting processing jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {runs.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p>No runs yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {runs.map((run) => {
                    const metadata = run.metadata ? JSON.parse(run.metadata) : {};
                    const deliverables = run.deliverables
                      ? JSON.parse(run.deliverables)
                      : [];
                    const isExpanded = expandedRun === run.id;

                    return (
                      <div
                        key={run.id}
                        className="border border-gray-700 rounded-xl overflow-hidden"
                      >
                        <div
                          className="flex items-center justify-between p-4 bg-gray-800/50 cursor-pointer hover:bg-gray-800/70 transition-colors"
                          onClick={() => toggleExpand(run.id)}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {getStatusIcon(run.status)}
                            <div className="flex-1">
                              <p className="font-medium text-gray-100">
                                {metadata.meeting_title || run.meetingId}
                              </p>
                              <p className="text-sm text-gray-400">
                                {formatDate(run.createdAt)}
                              </p>
                            </div>
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
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-400">
                                {run.outputs?.length || 0} outputs
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            className="border-t border-gray-700 p-4 bg-gray-900/50"
                          >
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-2">
                                  Deliverables
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {deliverables.length > 0 ? (
                                    deliverables.map((d: string) => (
                                      <Badge key={d} variant="outline">
                                        {d.replace(/_/g, " ")}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      No deliverables classified
                                    </span>
                                  )}
                                </div>
                              </div>

                              {run.outputs && run.outputs.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                                    Generated Outputs
                                  </h4>
                                  <div className="space-y-2">
                                    {run.outputs.map((output: any) => (
                                      <div
                                        key={output.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50"
                                      >
                                        <div>
                                          <p className="text-sm font-medium text-gray-200">
                                            {output.type.replace(/_/g, " ")}
                                          </p>
                                          {output.title && (
                                            <p className="text-xs text-gray-500">
                                              {output.title}
                                            </p>
                                          )}
                                        </div>
                                        {output.shareUrl && (
                                          <a
                                            href={output.shareUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-purple-400 hover:text-purple-300 text-sm"
                                          >
                                            View →
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {run.transcript && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                                    Transcript Preview
                                  </h4>
                                  <div className="p-3 bg-gray-800/50 rounded-lg text-xs text-gray-400 max-h-40 overflow-y-auto font-mono">
                                    {run.transcript.slice(0, 500)}
                                    {run.transcript.length > 500 && "..."}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}

