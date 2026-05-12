import { test } from '@playwright/test';
import { createCitizenServiceRecordHarness } from './helpers/testHarness';
import { generateCitizenServiceRecordData } from './utils/generateCitizenServiceRecordData';

test('creates a full service record without a related party', async ({ page, request }) => {
  const { cleanup, record } = await createCitizenServiceRecordHarness(page, request);
  const scenario = generateCitizenServiceRecordData({
    scenarioName: 'service-record-full-related-party-no',
    withRelatedParty: false,
  });

  try {
    await record.completeAndSubmitScenario(scenario);
  } finally {
    await cleanup.cleanup();
  }
});
