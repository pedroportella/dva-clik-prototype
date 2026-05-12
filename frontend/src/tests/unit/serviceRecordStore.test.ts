import { describe, expect, it } from 'vitest';
import {
  validateServiceRecordDraft,
  validateServiceRecordStep,
} from '@/features/service-records/validation/serviceRecordValidation';
import { emptyDraft } from '@/stores/serviceRecordStore';

describe('service record validation', () => {
  it('requires mandatory applicant and contact fields', () => {
    const result = validateServiceRecordDraft(emptyDraft());

    expect(result.valid).toBe(false);
    expect(result.errors['applicant.firstName']).toBe('Enter the applicant first name.');
    expect(result.errors['contact.email']).toBe('Enter the applicant email address.');
  });

  it('validates the active wizard step only', () => {
    const result = validateServiceRecordStep(emptyDraft(), 'applicant');

    expect(result.valid).toBe(false);
    expect(result.errors['applicant.firstName']).toBe('Enter the applicant first name.');
    expect(result.errors['contact.email']).toBeUndefined();
  });

  it('validates supporting document file metadata and category', () => {
    const draft = emptyDraft();
    draft.supportingDocuments.push({ fileName: '', category: '' });

    const result = validateServiceRecordStep(draft, 'supportingDocuments');

    expect(result.valid).toBe(false);
    expect(result.errors['supportingDocuments.0.fileName']).toBe('Upload a document file or remove this row.');
    expect(result.errors['supportingDocuments.0.category']).toBe('Select a document category.');
  });

  it('accepts a complete draft', () => {
    const draft = emptyDraft();
    draft.applicant.firstName = 'Alex';
    draft.applicant.lastName = 'Citizen';
    draft.applicant.dateOfBirth = '1980-01-01';
    draft.contact.email = 'alex.citizen@example.gov.au';
    draft.contact.phone = '+61 400 000 000';
    draft.contact.residentialAddress = '1 Example Street, Brisbane QLD 4000';

    const result = validateServiceRecordDraft(draft);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });
});
