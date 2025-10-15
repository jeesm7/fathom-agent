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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Edit, Save, X } from "lucide-react";

interface Prompt {
  id: string;
  key: string;
  description: string;
  system: string;
  userTemplate: string;
  temperature: number;
  topP: number;
  maxTokens: number;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Prompt>>({});

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    const res = await fetch("/api/prompts");
    if (res.ok) {
      const data = await res.json();
      setPrompts(data);
    }
  };

  const startEdit = (prompt: Prompt) => {
    setEditing(prompt.id);
    setEditForm(prompt);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editing || !editForm) return;

    const res = await fetch(`/api/prompts/${editing}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    if (res.ok) {
      fetchPrompts();
      setEditing(null);
      setEditForm({});
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
            <h1 className="text-4xl font-bold mb-2">Prompt Templates</h1>
            <p className="text-gray-400">
              Customize AI generation prompts for each deliverable type
            </p>
          </div>

          {prompts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">
                  No prompts configured yet. Add them via seed script or API.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {prompts.map((prompt) => (
                <Card key={prompt.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="capitalize">
                          {prompt.key.replace(/_/g, " ")}
                        </CardTitle>
                        <CardDescription>{prompt.description}</CardDescription>
                      </div>
                      {editing === prompt.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(prompt)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editing === prompt.id ? (
                      <>
                        <div>
                          <Label>System Prompt</Label>
                          <Textarea
                            value={editForm.system || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, system: e.target.value })
                            }
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label>User Template</Label>
                          <Textarea
                            value={editForm.userTemplate || ""}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                userTemplate: e.target.value,
                              })
                            }
                            rows={8}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Use variables like {"{{transcript}}"}, {"{{examples}}"}, etc.
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Temperature</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="2"
                              value={editForm.temperature || 0.7}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  temperature: parseFloat(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Top P</Label>
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              value={editForm.topP || 1.0}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  topP: parseFloat(e.target.value),
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Max Tokens</Label>
                            <Input
                              type="number"
                              step="100"
                              value={editForm.maxTokens || 4000}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  maxTokens: parseInt(e.target.value),
                                })
                              }
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label>System Prompt</Label>
                          <div className="mt-2 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-300">
                            {prompt.system}
                          </div>
                        </div>
                        <div>
                          <Label>User Template</Label>
                          <div className="mt-2 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
                            {prompt.userTemplate}
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <span className="text-gray-400">Temperature:</span>{" "}
                            <span className="font-mono text-purple-400">
                              {prompt.temperature}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Top P:</span>{" "}
                            <span className="font-mono text-purple-400">
                              {prompt.topP}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Max Tokens:</span>{" "}
                            <span className="font-mono text-purple-400">
                              {prompt.maxTokens}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
    </div>
  );
}

