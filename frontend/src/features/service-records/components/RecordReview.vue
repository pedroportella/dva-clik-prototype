<script setup lang="ts">
import type { ServiceRecordDraft } from '@/features/service-records/types/serviceRecord';

defineProps<{
  draft: ServiceRecordDraft;
}>();

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
  <div class="review-grid">
    <section class="review-card">
      <h3>Applicant</h3>
      <dl>
        <dt>Name</dt>
        <dd>{{ draft.applicant.firstName }} {{ draft.applicant.lastName }}</dd>
        <dt>Date of birth</dt>
        <dd>{{ draft.applicant.dateOfBirth }}</dd>
      </dl>
    </section>

    <section class="review-card">
      <h3>Contact</h3>
      <dl>
        <dt>Email</dt>
        <dd>{{ draft.contact.email }}</dd>
        <dt>Phone</dt>
        <dd>{{ draft.contact.phone }}</dd>
        <dt>Residential address</dt>
        <dd>{{ draft.contact.residentialAddress }}</dd>
      </dl>
    </section>

    <section class="review-card">
      <h3>Related parties / dependants</h3>
      <ul v-if="draft.relatedParties.length">
        <li v-for="(party, index) in draft.relatedParties" :key="index">
          {{ party.relationship }} - {{ party.firstName }} {{ party.lastName }}
        </li>
      </ul>
      <p v-else>No related parties added.</p>
    </section>

    <section class="review-card">
      <h3>Supporting documents</h3>
      <ul v-if="draft.supportingDocuments.length" class="document-review-list">
        <li v-for="(document, index) in draft.supportingDocuments" :key="index">
          <strong>{{ document.category }}</strong> -
          <a
            v-if="document.url"
            :href="document.url"
            target="_blank"
            rel="noreferrer"
          >{{ document.fileName }}</a>
          <span v-else>{{ document.fileName }}</span>
          <span>({{ formatFileSize(document.fileSize) }})</span>
          <span v-if="document.fileType"> - {{ document.fileType }}</span>
          <span v-if="document.fileId"> - Drupal file {{ document.fileId }}</span>
          <span v-if="document.mediaId"> - media {{ document.mediaId }}</span>
          <span v-if="document.notes"> - {{ document.notes }}</span>
        </li>
      </ul>
      <p v-else>No documents added for this prototype submission.</p>
    </section>
  </div>
</template>
