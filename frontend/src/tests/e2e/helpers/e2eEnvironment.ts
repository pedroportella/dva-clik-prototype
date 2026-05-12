export interface E2EEnvironment {
  useMockApi: boolean;
  cleanupRecords: boolean;
  runId: string;
  apiBasePath: string;
}

function readBooleanEnv(name: string, defaultValue: boolean) {
  const value = process.env[name];

  if (value === undefined) {
    return defaultValue;
  }

  return !['0', 'false', 'no', 'off'].includes(value.toLowerCase());
}

function createRunId() {
  return `csr-e2e-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

export const e2eEnvironment: E2EEnvironment = {
  useMockApi: readBooleanEnv('E2E_USE_MOCK', true),
  cleanupRecords: readBooleanEnv('E2E_CLEANUP_RECORDS', true),
  runId: process.env.E2E_RUN_ID ?? createRunId(),
  apiBasePath: process.env.E2E_API_BASE_PATH ?? '/api',
};
