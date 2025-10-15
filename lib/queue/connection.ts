import { Queue, Worker, QueueEvents } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export { connection };

export function createQueue<T = any>(name: string) {
  return new Queue<T>(name, { connection });
}

export function createWorker<T = any>(
  name: string,
  processor: (job: any) => Promise<any>
) {
  return new Worker<T>(name, processor, {
    connection,
    concurrency: 5,
  });
}

export function createQueueEvents(name: string) {
  return new QueueEvents(name, { connection });
}

