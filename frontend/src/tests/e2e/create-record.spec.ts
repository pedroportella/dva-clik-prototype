import { test } from '@playwright/test';
import { createCitizenServiceRecordHarness } from './helpers/testHarness';
import { generateCitizenServiceRecordData } from './utils/generateCitizenServiceRecordData';

test('creates a service record through the wizard with a supporting document', async ({ page, request }) => {
  const { cleanup, record } = await createCitizenServiceRecordHarness(page, request);
  const scenario = generateCitizenServiceRecordData({
    scenarioName: 'create-record',
    withRelatedParty: true,
  });

  try {
    await record.completeAndSubmitScenario(scenario);
  } finally {
    await cleanup.cleanup();
  }
});
