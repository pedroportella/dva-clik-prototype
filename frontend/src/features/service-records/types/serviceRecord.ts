export type ServiceRecordStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'COMPLETED';
export type SupportingDocumentUploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';

export interface ApplicantDetails {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export interface ContactDetails {
  email: string;
  phone: string;
  residentialAddress: string;
}

export interface RelatedParty {
  relationship: string;
  firstName: string;
  lastName: string;
}

export interface SupportingDocument {
  fileName: string;
  category: string;
  notes?: string;
  fileId?: string;
  mediaId?: string | null;
  url?: string;
  fileSize?: number;
  fileType?: string;
  uploadedAt?: string;
  uploadProgress?: number;
  uploadStatus?: SupportingDocumentUploadStatus;
  uploadError?: string;
}

export interface ServiceRecordDraft {
  applicant: ApplicantDetails;
  contact: ContactDetails;
  relatedParties: RelatedParty[];
  supportingDocuments: SupportingDocument[];
}

export interface ServiceRecordSummary {
  id: string;
  referenceNumber: string;
  applicantName: string;
  status: ServiceRecordStatus;
  submittedAt?: string;
}

export interface ServiceRecord extends ServiceRecordSummary {
  applicant: ApplicantDetails;
  contact: ContactDetails;
  relatedParties: RelatedParty[];
  supportingDocuments: SupportingDocument[];
}

export interface ServiceRecordValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
