import type { ServiceRecord, ServiceRecordDraft, ServiceRecordSummary, SupportingDocument } from '@/features/service-records/types/serviceRecord';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

async function readJsonResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    let message = fallbackMessage;

    try {
      const payload = (await response.json()) as { message?: string; errors?: Record<string, string> };
      const validationErrors = payload.errors ? Object.values(payload.errors).join(' ') : '';
      message = [payload.message, validationErrors].filter(Boolean).join(' ') || fallbackMessage;
    } catch {
      message = fallbackMessage;
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function readUploadError(xhr: XMLHttpRequest, fallbackMessage: string) {
  try {
    const payload = JSON.parse(xhr.responseText) as { message?: string };
    return payload.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function getServiceRecords(): Promise<ServiceRecordSummary[]> {
  const response = await fetch(`${apiBaseUrl}/service-records`);
  return readJsonResponse<ServiceRecordSummary[]>(response, 'Unable to load service records.');
}

export async function getServiceRecord(id: string): Promise<ServiceRecord> {
  const response = await fetch(`${apiBaseUrl}/service-records/${id}`);
  return readJsonResponse<ServiceRecord>(response, 'Unable to load service record.');
}

export async function createServiceRecord(payload: ServiceRecordDraft): Promise<ServiceRecord> {
  const response = await fetch(`${apiBaseUrl}/service-records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readJsonResponse<ServiceRecord>(response, 'Unable to create service record.');
}

export function uploadSupportingDocument(file: File, onProgress: (progress: number) => void): Promise<SupportingDocument> {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as SupportingDocument);
        return;
      }

      reject(new Error(readUploadError(xhr, 'Unable to upload supporting document.')));
    });

    xhr.addEventListener('error', () => reject(new Error('Unable to upload supporting document.')));
    xhr.addEventListener('abort', () => reject(new Error('Supporting document upload was cancelled.')));
    xhr.open('POST', `${apiBaseUrl}/service-records/documents`);
    xhr.send(formData);
  });
}
