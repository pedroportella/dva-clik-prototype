import type { APIRequestContext, Page } from '@playwright/test';
import { CitizenServiceRecordPO } from './CitizenServiceRecordPO';
import { attachE2EDiagnostics } from './e2ePage';
import { e2eEnvironment } from './e2eEnvironment';
import { createServiceRecordCleanupTracker } from './serviceRecordsCleanup';
import { mockServiceRecordsApi } from './serviceRecordsApiMock';

export async function createCitizenServiceRecordHarness(page: Page, request: APIRequestContext) {
  attachE2EDiagnostics(page);
  const api = e2eEnvironment.useMockApi ? await mockServiceRecordsApi(page) : null;
  const cleanup = createServiceRecordCleanupTracker(page, request);
  const record = new CitizenServiceRecordPO(page);

  return {
    api,
    cleanup,
    record,
    runId: e2eEnvironment.runId,
    useMockApi: e2eEnvironment.useMockApi,
  };
}
