#!/usr/bin/env node
import { meetingWorker } from "./meeting-worker";

console.log("Starting BullMQ workers...");
console.log("Meeting worker started");

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing workers...");
  await meetingWorker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing workers...");
  await meetingWorker.close();
  process.exit(0);
});

