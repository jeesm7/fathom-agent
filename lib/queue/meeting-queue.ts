import { createQueue } from "./connection";

export interface MeetingJobData {
  runId: string;
  meetingId: string;
  fathomExternalId?: string;
  transcript: string;
  metadata?: Record<string, any>;
}

export const meetingQueue = createQueue<MeetingJobData>("meeting");

export async function enqueueMeeting(data: MeetingJobData) {
  const job = await meetingQueue.add("processMeeting", data, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: {
      age: 86400, // 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 604800, // 7 days
    },
  });

  return job;
}

