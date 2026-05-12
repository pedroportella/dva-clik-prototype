<script setup lang="ts">
import { uploadSupportingDocument } from '@/services/serviceRecordsApi';
import type { SupportingDocument } from '@/features/service-records/types/serviceRecord';

const props = defineProps<{
  documents: SupportingDocument[];
  errors?: Record<string, string>;
  showErrors?: boolean;
}>();

const emit = defineEmits<{
  'update:documents': [documents: SupportingDocument[]];
}>();

const documentCategories = [
  { value: '', label: 'Select a category' },
  { value: 'identity', label: 'Identity document' },
  { value: 'income', label: 'Income or employment evidence' },
  { value: 'relationship', label: 'Relationship or dependant evidence' },
  { value: 'residence', label: 'Residence or address evidence' },
  { value: 'other', label: 'Other supporting document' },
];

function updateDocuments(documents: SupportingDocument[]) {
  emit('update:documents', documents);
}

function addDocument() {
  updateDocuments([
    ...props.documents,
    {
      fileName: '',
      category: '',
      notes: '',
      uploadProgress: 0,
      uploadStatus: 'idle',
    },
  ]);
}

function removeDocument(index: number) {
  updateDocuments(props.documents.filter((_, documentIndex) => documentIndex !== index));
}

function updateDocument(index: number, patch: Partial<SupportingDocument>) {
  updateDocuments(
    props.documents.map((document, documentIndex) =>
      documentIndex === index
        ? {
            ...document,
            ...patch,
          }
        : document,
    ),
  );
}

function handleCategoryChange(event: Event, index: number) {
  const select = event.target as HTMLSelectElement;
  updateDocument(index, { category: select.value });
}

function handleNotesInput(event: Event, index: number) {
  const textarea = event.target as HTMLTextAreaElement;
  updateDocument(index, { notes: textarea.value });
}

async function handleDocumentFileChange(event: Event, index: number) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  updateDocument(index, {
    fileId: undefined,
    mediaId: undefined,
    url: undefined,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    uploadedAt: undefined,
    uploadError: undefined,
    uploadProgress: 0,
    uploadStatus: 'uploading',
  });

  try {
    const uploadedDocument = await uploadSupportingDocument(file, (progress) => {
      updateDocument(index, { uploadProgress: progress });
    });

    updateDocument(index, {
      ...uploadedDocument,
      uploadError: undefined,
      uploadProgress: 100,
      uploadStatus: 'uploaded',
    });
  } catch (error) {
    updateDocument(index, {
      uploadError: error instanceof Error ? error.message : 'Unable to upload supporting document.',
      uploadStatus: 'error',
    });
  }
}

function formatFileSize(size?: number) {
  if (!size) {
    return 'Size not available';
  }

  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}
</script>

<template>
  <div class="supporting-documents">
    <p>
      Upload supporting documents for the application. Files are persisted immediately to Drupal as file entities,
      with media metadata returned to the Vue wizard before final submission.
    </p>

    <p v-if="showErrors && errors?.supportingDocuments" class="field-error">{{ errors.supportingDocuments }}</p>

    <div v-if="!documents.length" class="empty-state">
      <p>No supporting documents have been added yet.</p>
    </div>

    <div v-for="(document, index) in documents" :key="index" class="repeatable-card supporting-document-card">
      <div class="form-field">
        <label :for="`document-file-${index}`">Document file <span aria-hidden="true">*</span></label>
        <input
          :id="`document-file-${index}`"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          :aria-describedby="showErrors && errors?.[`supportingDocuments.${index}.fileName`] ? `document-file-${index}-error` : `document-file-${index}-hint`"
          :aria-invalid="Boolean(showErrors && errors?.[`supportingDocuments.${index}.fileName`])"
          @change="handleDocumentFileChange($event, index)"
        >
        <p :id="`document-file-${index}-hint`" class="helper-text">
          Accepted file types: PDF, PNG, JPG, DOC and DOCX. Maximum size: 10 MB.
        </p>
        <p v-if="document.fileName" class="helper-text">
          Selected: {{ document.fileName }} ({{ formatFileSize(document.fileSize) }})
        </p>
        <div
          v-if="document.uploadStatus === 'uploading'"
          class="upload-progress"
          role="status"
          aria-live="polite"
        >
          <progress :value="document.uploadProgress ?? 0" max="100" />
          <span>Uploading {{ document.uploadProgress ?? 0 }}%</span>
        </div>
        <p v-else-if="document.uploadStatus === 'uploaded'" class="upload-status upload-status--success">
          Uploaded to Drupal<span v-if="document.fileId"> as file {{ document.fileId }}</span><span v-if="document.mediaId"> and media {{ document.mediaId }}</span>.
        </p>
        <p v-else-if="document.uploadStatus === 'error'" class="field-error" role="alert">
          {{ document.uploadError }}
        </p>
        <p
          v-if="showErrors && errors?.[`supportingDocuments.${index}.fileName`]"
          :id="`document-file-${index}-error`"
          class="field-error"
        >
          {{ errors[`supportingDocuments.${index}.fileName`] }}
        </p>
      </div>

      <div class="form-field">
        <label :for="`document-category-${index}`">Category <span aria-hidden="true">*</span></label>
        <select
          :id="`document-category-${index}`"
          :value="document.category"
          :aria-describedby="showErrors && errors?.[`supportingDocuments.${index}.category`] ? `document-category-${index}-error` : undefined"
          :aria-invalid="Boolean(showErrors && errors?.[`supportingDocuments.${index}.category`])"
          @change="handleCategoryChange($event, index)"
        >
          <option v-for="category in documentCategories" :key="category.value" :value="category.value">
            {{ category.label }}
          </option>
        </select>
        <p
          v-if="showErrors && errors?.[`supportingDocuments.${index}.category`]"
          :id="`document-category-${index}-error`"
          class="field-error"
        >
          {{ errors[`supportingDocuments.${index}.category`] }}
        </p>
      </div>

      <div class="form-field">
        <label :for="`document-notes-${index}`">Notes</label>
        <textarea
          :id="`document-notes-${index}`"
          :value="document.notes"
          rows="3"
          @input="handleNotesInput($event, index)"
        />
      </div>

      <button class="button button--secondary" type="button" @click="removeDocument(index)">Remove document</button>
    </div>

    <button class="button button--secondary" type="button" @click="addDocument">Add supporting document</button>
  </div>
</template>
