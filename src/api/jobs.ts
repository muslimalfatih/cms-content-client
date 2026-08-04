import type {
  CreateJobRequest,
  CreateJobResponse,
  JobResult,
} from '@/types/job';
import { request } from './client';

export function createJob(
  body: CreateJobRequest,
): Promise<CreateJobResponse> {
  return request<CreateJobResponse>('/jobs', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getJob(jobId: string): Promise<JobResult> {
  return request<JobResult>(`/jobs/${jobId}`);
}
