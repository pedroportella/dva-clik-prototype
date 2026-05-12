import { test } from '@playwright/test';
import { createCitizenServiceRecordHarness } from './helpers/testHarness';
import { generateCitizenServiceRecordData } from './utils/generateCitizenServiceRecordData';

test('creates a full service record with a related party', async ({ page, request }) => {
  const { cleanup, record } = await createCitizenServiceRecordHarness(page, request);
  const scenario = generateCitizenServiceRecordData({
    scenarioName: 'service-record-full-related-party-yes',
    withRelatedParty: true,
  });

  try {
    await record.completeAndSubmitScenario(scenario);
  } finally {
    await cleanup.cleanup();
  }
});
