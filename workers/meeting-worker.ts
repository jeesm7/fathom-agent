import { Job } from "bullmq";
import { createWorker } from "@/lib/queue/connection";
import { MeetingJobData } from "@/lib/queue/meeting-queue";
import { prisma } from "@/lib/prisma";
import { classifyDeliverables } from "@/lib/openai/classification";
import { generateProposal } from "./jobs/generate-proposal";
import { generateLegalResearch } from "./jobs/generate-legal-research";
import { generateServiceAgreement } from "./jobs/generate-service-agreement";
import { generateScopeOfWork } from "./jobs/generate-scope-of-work";
import { generateFollowupEmail } from "./jobs/generate-followup-email";

async function processMeetingJob(job: Job<MeetingJobData>) {
  const { runId, transcript, meetingId, fathomExternalId, metadata } = job.data;

  try {
    // Update run status
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: "processing",
        transcript,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Step 1: Classify deliverables
    job.updateProgress(10);
    const classification = await classifyDeliverables(transcript);

    await prisma.run.update({
      where: { id: runId },
      data: {
        deliverables: JSON.stringify(classification.deliverables),
        logJson: JSON.stringify({ classification }),
      },
    });

    // Step 2: Generate each deliverable
    const outputs: any[] = [];
    const totalDeliverables = classification.deliverables.length;
    let completedDeliverables = 0;

    for (const deliverable of classification.deliverables) {
      try {
        let output = null;

        switch (deliverable) {
          case "PROPOSAL":
            output = await generateProposal(runId, transcript, metadata);
            break;
          case "LEGAL_RESEARCH":
            output = await generateLegalResearch(runId, transcript, metadata);
            break;
          case "SERVICE_AGREEMENT":
            output = await generateServiceAgreement(runId, transcript, metadata);
            break;
          case "SCOPE_OF_WORK":
            output = await generateScopeOfWork(runId, transcript, metadata);
            break;
          case "FOLLOWUP_EMAIL":
            output = await generateFollowupEmail(runId, transcript, metadata);
            break;
        }

        if (output) {
          outputs.push(output);
        }

        completedDeliverables++;
        const progress = 10 + (completedDeliverables / totalDeliverables) * 80;
        job.updateProgress(Math.floor(progress));
      } catch (error) {
        console.error(`Failed to generate ${deliverable}:`, error);
        // Continue with other deliverables
      }
    }

    // Step 3: Finalize run
    await prisma.run.update({
      where: { id: runId },
      data: {
        status: "completed",
        finishedAt: new Date(),
      },
    });

    job.updateProgress(100);

    return {
      runId,
      outputs,
      deliverables: classification.deliverables,
    };
  } catch (error) {
    console.error("Meeting processing failed:", error);

    await prisma.run.update({
      where: { id: runId },
      data: {
        status: "failed",
        finishedAt: new Date(),
        logJson: JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        }),
      },
    });

    throw error;
  }
}

// Create and export the worker
export const meetingWorker = createWorker<MeetingJobData>(
  "meeting",
  processMeetingJob
);

// Handle worker events
meetingWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

meetingWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

meetingWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

