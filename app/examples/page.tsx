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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, ExternalLink } from "lucide-react";

export default function ExamplesPage() {
  const [examples, setExamples] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("proposal");

  useEffect(() => {
    fetchExamples();
  }, []);

  const fetchExamples = async () => {
    // For now, we'll need to add an API endpoint to fetch examples
    // This is a placeholder
    setExamples([]);
  };

  const handleUpload = async () => {
    if (!file || !title) {
      alert("Please select a file and enter a title");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("kind", kind);

      const res = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("File uploaded successfully!");
        setFile(null);
        setTitle("");
        fetchExamples();
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      alert("Upload error");
    } finally {
      setUploading(false);
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
            <h1 className="text-4xl font-bold mb-2">Example Documents</h1>
            <p className="text-gray-400">
              Upload examples to guide AI generation with your style
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Example</CardTitle>
              <CardDescription>
                Upload PDFs, DOCX files to add to the vector store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Document Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q4 2024 Proposal Template"
                />
              </div>

              <div>
                <Label>Document Type</Label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  className="w-full h-10 rounded-xl border border-gray-700 bg-gray-900/50 px-3 py-2 text-sm text-gray-100"
                >
                  <option value="proposal">Proposal</option>
                  <option value="agreement">Service Agreement</option>
                  <option value="sow">Scope of Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <Label>File</Label>
                <Input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: PDF, DOCX
                </p>
              </div>

              <Button
                onClick={handleUpload}
                disabled={uploading || !file || !title}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload to Vector Store"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Uploaded Examples</CardTitle>
              <CardDescription>
                Documents indexed in the vector store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {examples.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No examples uploaded yet</p>
                  <p className="text-sm mt-2">
                    Upload your first example document to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {examples.map((example) => (
                    <div
                      key={example.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="font-medium text-gray-100">
                            {example.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {example.mimeType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge>{example.kind}</Badge>
                        <a
                          href={`https://drive.google.com/file/d/${example.driveFileId}/view`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-900/50 bg-blue-950/20">
            <CardHeader>
              <CardTitle className="text-blue-400">💡 How It Works</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-400 space-y-2">
              <p>
                • Upload example documents that represent your desired output style
              </p>
              <p>
                • Files are stored in Google Drive and indexed in OpenAI Vector Store
              </p>
              <p>
                • When generating new documents, the AI retrieves relevant examples
              </p>
              <p>
                • The AI matches your style, tone, and structure automatically
              </p>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}

