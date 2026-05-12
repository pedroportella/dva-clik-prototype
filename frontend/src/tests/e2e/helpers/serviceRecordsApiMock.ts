import type { Page, Route } from '@playwright/test';
import type { ServiceRecord, ServiceRecordDraft, ServiceRecordSummary } from '@/features/service-records/types/serviceRecord';
import { buildUploadedDocument } from '../utils/generateCitizenServiceRecordData';

interface MockApiState {
  records: ServiceRecord[];
}

function toSummary(record: ServiceRecord): ServiceRecordSummary {
  return {
    id: record.id,
    referenceNumber: record.referenceNumber,
    applicantName: record.applicantName,
    status: record.status,
    submittedAt: record.submittedAt,
  };
}

async function fulfilJson(route: Route, status: number, body: unknown) {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

function createSubmittedRecord(payload: ServiceRecordDraft, sequence: number): ServiceRecord {
  const suffix = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

  return {
    id: `csr-e2e-${suffix}-${String(sequence).padStart(4, '0')}`,
    referenceNumber: `CSR-E2E-${String(sequence).padStart(4, '0')}`,
    applicantName: `${payload.applicant.firstName} ${payload.applicant.lastName}`.trim(),
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    applicant: payload.applicant,
    contact: payload.contact,
    relatedParties: payload.relatedParties,
    supportingDocuments: payload.supportingDocuments,
  };
}

async function getUploadedFileName(route: Route) {
  const fallback = 'identity-e2e.pdf';
  const body = await route.request().postDataBuffer();
  const content = body?.toString('utf8') ?? '';
  const filenameMatch = /filename="([^"]+)"/.exec(content);

  return filenameMatch?.[1] ?? fallback;
}

export async function mockServiceRecordsApi(page: Page) {
  const state: MockApiState = { records: [] };

  await page.addInitScript(() => {
    window.sessionStorage.clear();
  });

  await page.route('**/api/service-records**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const pathParts = url.pathname.split('/').filter(Boolean);
    const endpoint = pathParts.at(-1);

    if (url.pathname.endsWith('/api/service-records/documents')) {
      if (request.method() !== 'POST') {
        await fulfilJson(route, 405, { message: 'Method not allowed.' });
        return;
      }

      const fileName = await getUploadedFileName(route);
      await fulfilJson(route, 201, buildUploadedDocument(fileName));
      return;
    }

    if (url.pathname.endsWith('/api/service-records')) {
      if (request.method() === 'GET') {
        await fulfilJson(route, 200, state.records.map(toSummary));
        return;
      }

      if (request.method() === 'POST') {
        const payload = request.postDataJSON() as ServiceRecordDraft;
        const record = createSubmittedRecord(payload, state.records.length + 1);
        state.records.unshift(record);
        await fulfilJson(route, 201, record);
        return;
      }
    }

    if (endpoint) {
      const recordIndex = state.records.findIndex((item) => item.id === endpoint);
      const record = state.records[recordIndex];

      if (request.method() === 'GET' && record) {
        await fulfilJson(route, 200, record);
        return;
      }

      if (request.method() === 'DELETE' && recordIndex >= 0) {
        state.records.splice(recordIndex, 1);
        await fulfilJson(route, 200, { deleted: true });
        return;
      }
    }

    await fulfilJson(route, 404, { message: 'Record not found.' });
  });

  return state;
}
