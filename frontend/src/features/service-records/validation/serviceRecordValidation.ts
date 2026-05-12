import type { ServiceRecordDraft, ServiceRecordValidationResult } from '@/features/service-records/types/serviceRecord';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const acceptedDocumentTypes = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const maxDocumentSizeBytes = 10 * 1024 * 1024;
const maxSupportingDocuments = 5;

export const serviceRecordWizardSteps = [
  'applicant',
  'contact',
  'relatedParties',
  'supportingDocuments',
  'review',
] as const;

export type ServiceRecordWizardStep = (typeof serviceRecordWizardSteps)[number];

function validateApplicant(draft: ServiceRecordDraft, errors: Record<string, string>) {
  if (!draft.applicant.firstName.trim()) {
    errors['applicant.firstName'] = 'Enter the applicant first name.';
  }

  if (!draft.applicant.lastName.trim()) {
    errors['applicant.lastName'] = 'Enter the applicant last name.';
  }

  if (!draft.applicant.dateOfBirth.trim()) {
    errors['applicant.dateOfBirth'] = 'Enter the applicant date of birth.';
  }
}

function validateContact(draft: ServiceRecordDraft, errors: Record<string, string>) {
  if (!draft.contact.email.trim()) {
    errors['contact.email'] = 'Enter the applicant email address.';
  } else if (!emailPattern.test(draft.contact.email)) {
    errors['contact.email'] = 'Enter a valid email address.';
  }

  if (!draft.contact.phone.trim()) {
    errors['contact.phone'] = 'Enter the applicant phone number.';
  }

  if (!draft.contact.residentialAddress.trim()) {
    errors['contact.residentialAddress'] = 'Enter the residential address.';
  }
}

function validateRelatedParties(draft: ServiceRecordDraft, errors: Record<string, string>) {
  draft.relatedParties.forEach((party, index) => {
    if (!party.relationship.trim() || !party.firstName.trim() || !party.lastName.trim()) {
      errors[`relatedParties.${index}`] = 'Complete all related party fields or remove this row.';
    }
  });
}

function validateSupportingDocuments(draft: ServiceRecordDraft, errors: Record<string, string>) {
  if (draft.supportingDocuments.length > maxSupportingDocuments) {
    errors.supportingDocuments = `Upload no more than ${maxSupportingDocuments} supporting documents.`;
  }

  draft.supportingDocuments.forEach((document, index) => {
    if (!document.fileName.trim() || !document.fileId || document.uploadStatus !== 'uploaded') {
      errors[`supportingDocuments.${index}.fileName`] = 'Upload a document file or remove this row.';
    }

    if (document.uploadStatus === 'uploading') {
      errors[`supportingDocuments.${index}.fileName`] = 'Wait for the document upload to finish.';
    }

    if (document.uploadStatus === 'error') {
      errors[`supportingDocuments.${index}.fileName`] = document.uploadError || 'Upload the document again.';
    }

    if (!document.category.trim()) {
      errors[`supportingDocuments.${index}.category`] = 'Select a document category.';
    }

    if (document.fileSize && document.fileSize > maxDocumentSizeBytes) {
      errors[`supportingDocuments.${index}.fileName`] = 'Choose a file smaller than 10 MB.';
    }

    if (document.fileType && !acceptedDocumentTypes.has(document.fileType)) {
      errors[`supportingDocuments.${index}.fileName`] = 'Choose a PDF, PNG, JPG, DOC or DOCX file.';
    }
  });
}

export function validateServiceRecordStep(
  draft: ServiceRecordDraft,
  step: ServiceRecordWizardStep,
): ServiceRecordValidationResult {
  const errors: Record<string, string> = {};

  if (step === 'applicant') {
    validateApplicant(draft, errors);
  }

  if (step === 'contact') {
    validateContact(draft, errors);
  }

  if (step === 'relatedParties') {
    validateRelatedParties(draft, errors);
  }

  if (step === 'supportingDocuments') {
    validateSupportingDocuments(draft, errors);
  }

  if (step === 'review') {
    return validateServiceRecordDraft(draft);
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateServiceRecordDraft(draft: ServiceRecordDraft): ServiceRecordValidationResult {
  const errors: Record<string, string> = {};

  validateApplicant(draft, errors);
  validateContact(draft, errors);
  validateRelatedParties(draft, errors);
  validateSupportingDocuments(draft, errors);

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
