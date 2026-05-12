import type { ServiceRecordDraft, SupportingDocument } from '@/features/service-records/types/serviceRecord';
import { e2eEnvironment } from '../helpers/e2eEnvironment';

export interface TestUploadDocument {
  file: {
    name: string;
    mimeType: string;
    buffer: Buffer;
  };
  category: string;
  notes: string;
}

export interface CitizenServiceRecordScenario {
  scenarioName: string;
  draft: ServiceRecordDraft;
  documents: TestUploadDocument[];
}

export interface CitizenServiceRecordScenarioOptions {
  scenarioName?: string;
  withRelatedParty?: boolean;
  documentsCount?: number;
}

function uniqueSuffix() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const random = Math.random().toString(36).slice(2, 8);

  return `${timestamp}-${random}`;
}

function normaliseScenarioName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildDocumentUpload(index: number, suffix: string): TestUploadDocument {
  const documentNumber = index + 1;

  return {
    file: {
      name: `identity-e2e-${documentNumber}-${suffix}.pdf`,
      mimeType: 'application/pdf',
      buffer: Buffer.from(`prototype identity document ${documentNumber} ${suffix}`),
    },
    category: documentNumber === 1 ? 'identity' : 'residence',
    notes: `Uploaded document ${documentNumber} for Services Australia prototype E2E flow ${suffix}.`,
  };
}

export function buildUploadedDocument(fileName: string, category = 'identity'): SupportingDocument {
  const suffix = uniqueSuffix();

  return {
    fileId: `file-${suffix}`,
    mediaId: `media-${suffix}`,
    fileName,
    category,
    fileSize: 27 * 1024,
    fileType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png',
    notes: '',
    url: `/sites/default/files/citizen-service-records/${fileName}`,
    uploadedAt: new Date().toISOString(),
    uploadProgress: 100,
    uploadStatus: 'uploaded',
  };
}

export function generateCitizenServiceRecordData(
  options: CitizenServiceRecordScenarioOptions = {},
): CitizenServiceRecordScenario {
  const scenarioName = normaliseScenarioName(options.scenarioName ?? 'service-record-full-related-party-no');
  const suffix = `${scenarioName}-${e2eEnvironment.runId}-${uniqueSuffix()}`;
  const firstName = `Alex${suffix.slice(-6)}`;
  const lastName = 'Citizen';
  const documentsCount = options.documentsCount ?? 1;

  return {
    scenarioName,
    draft: {
      applicant: {
        firstName,
        lastName,
        dateOfBirth: '1980-01-01',
      },
      contact: {
        email: `alex.citizen.${suffix}@example.gov.au`,
        phone: '+61 400 000 000',
        residentialAddress: '1 Example Street, Brisbane QLD 4000',
      },
      relatedParties: options.withRelatedParty
        ? [
            {
              relationship: 'Dependant',
              firstName: `Jamie${suffix.slice(-6)}`,
              lastName: 'Citizen',
            },
          ]
        : [],
      supportingDocuments: [],
    },
    documents: Array.from({ length: documentsCount }, (_, index) => buildDocumentUpload(index, suffix)),
  };
}
