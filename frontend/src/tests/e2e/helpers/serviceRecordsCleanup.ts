import type { APIRequestContext, Page, Response } from '@playwright/test';
import { e2eEnvironment } from './e2eEnvironment';

export interface ServiceRecordCleanupTracker {
  readonly createdRecordIds: string[];
  cleanup(): Promise<void>;
}

function isServiceRecordCreateResponse(response: Response) {
  const request = response.request();
  const url = new URL(response.url());

  return request.method() === 'POST' && url.pathname.endsWith('/api/service-records');
}

async function readCreatedRecordId(response: Response) {
  try {
    const payload = (await response.json()) as { id?: unknown };
    return typeof payload.id === 'string' && payload.id.length > 0 ? payload.id : null;
  } catch {
    return null;
  }
}

export function createServiceRecordCleanupTracker(
  page: Page,
  request: APIRequestContext,
): ServiceRecordCleanupTracker {
  const createdRecordIds: string[] = [];
  const pendingResponseReads: Promise<void>[] = [];

  page.on('response', (response) => {
    if (!isServiceRecordCreateResponse(response) || !response.ok()) {
      return;
    }

    const pendingRead = readCreatedRecordId(response).then((id) => {
      if (id && !createdRecordIds.includes(id)) {
        createdRecordIds.push(id);
      }
    });

    pendingResponseReads.push(pendingRead);
  });

  return {
    createdRecordIds,
    async cleanup() {
      await Promise.all(pendingResponseReads);

      if (e2eEnvironment.useMockApi || !e2eEnvironment.cleanupRecords || createdRecordIds.length === 0) {
        return;
      }

      for (const id of [...createdRecordIds].reverse()) {
        const response = await request.delete(`${e2eEnvironment.apiBasePath}/service-records/${id}`, {
          failOnStatusCode: false,
        });

        if ([200, 202, 204, 404].includes(response.status())) {
          continue;
        }

        throw new Error(`Unable to clean up E2E service record ${id}. API returned ${response.status()}.`);
      }
    },
  };
}
