import { test } from '@playwright/test';
import { createCitizenServiceRecordHarness } from './helpers/testHarness';
import { generateCitizenServiceRecordData } from './utils/generateCitizenServiceRecordData';

test('creates a full service record with multiple supporting documents', async ({ page, request }) => {
  const { cleanup, record } = await createCitizenServiceRecordHarness(page, request);
  const scenario = generateCitizenServiceRecordData({
    scenarioName: 'service-record-full-multiple-documents',
    withRelatedParty: true,
    documentsCount: 2,
  });

  try {
    await record.completeAndSubmitScenario(scenario);
  } finally {
    await cleanup.cleanup();
  }
});
