import { defineStore } from 'pinia';
import { createServiceRecord, getServiceRecord, getServiceRecords } from '@/services/serviceRecordsApi';
import type { ServiceRecord, ServiceRecordDraft, ServiceRecordSummary } from '@/features/service-records/types/serviceRecord';

const draftStorageKey = 'citizen-service-record-draft';

export const emptyDraft = (): ServiceRecordDraft => ({
  applicant: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  },
  contact: {
    email: '',
    phone: '',
    residentialAddress: '',
  },
  relatedParties: [],
  supportingDocuments: [],
});

interface ServiceRecordState {
  records: ServiceRecordSummary[];
  selectedRecord: ServiceRecord | null;
  draft: ServiceRecordDraft;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function normaliseDraft(value: Partial<ServiceRecordDraft>): ServiceRecordDraft {
  return {
    applicant: {
      firstName: value.applicant?.firstName ?? '',
      lastName: value.applicant?.lastName ?? '',
      dateOfBirth: value.applicant?.dateOfBirth ?? '',
    },
    contact: {
      email: value.contact?.email ?? '',
      phone: value.contact?.phone ?? '',
      residentialAddress: value.contact?.residentialAddress ?? '',
    },
    relatedParties: Array.isArray(value.relatedParties) ? value.relatedParties : [],
    supportingDocuments: Array.isArray(value.supportingDocuments) ? value.supportingDocuments : [],
  };
}

export const useServiceRecordStore = defineStore('service-records', {
  state: (): ServiceRecordState => ({
    records: [],
    selectedRecord: null,
    draft: emptyDraft(),
    loading: false,
    submitting: false,
    error: null,
  }),
  actions: {
    restoreDraft() {
      if (!isBrowser()) {
        return;
      }

      const savedDraft = window.sessionStorage.getItem(draftStorageKey);

      if (!savedDraft) {
        return;
      }

      try {
        this.draft = normaliseDraft(JSON.parse(savedDraft) as Partial<ServiceRecordDraft>);
      } catch {
        window.sessionStorage.removeItem(draftStorageKey);
      }
    },
    persistDraft() {
      if (!isBrowser()) {
        return;
      }

      window.sessionStorage.setItem(draftStorageKey, JSON.stringify(this.draft));
    },
    resetDraft() {
      this.draft = emptyDraft();
      this.error = null;

      if (isBrowser()) {
        window.sessionStorage.removeItem(draftStorageKey);
      }
    },
    async loadRecords() {
      this.loading = true;
      this.error = null;

      try {
        this.records = await getServiceRecords();
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load records.';
      } finally {
        this.loading = false;
      }
    },
    async loadRecord(id: string) {
      this.loading = true;
      this.error = null;

      try {
        this.selectedRecord = await getServiceRecord(id);
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to load record.';
      } finally {
        this.loading = false;
      }
    },
    async submitDraft() {
      this.submitting = true;
      this.error = null;

      try {
        const record = await createServiceRecord(this.draft);
        this.selectedRecord = record;
        this.records = [record, ...this.records.filter((existing) => existing.id !== record.id)];
        this.resetDraft();
        return record;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Unable to submit record.';
        throw error;
      } finally {
        this.submitting = false;
      }
    },
  },
});
