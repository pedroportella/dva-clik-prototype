<script setup lang="ts">
import { onMounted, watch } from 'vue';
import RecordReview from '@/features/service-records/components/RecordReview.vue';
import { useServiceRecordStore } from '@/stores/serviceRecordStore';

const props = defineProps<{
  id: string;
}>();

const store = useServiceRecordStore();

function loadRecord() {
  void store.loadRecord(props.id);
}

onMounted(loadRecord);
watch(() => props.id, loadRecord);
</script>

<template>
  <section class="page-section">
    <p class="eyebrow">Submitted record</p>
    <h1>Record {{ id }}</h1>

    <p v-if="store.loading">Loading record...</p>
    <p v-else-if="store.error" class="alert" role="alert">{{ store.error }}</p>
    <div v-else-if="store.selectedRecord">
      <dl class="summary-list">
        <dt>Reference number</dt>
        <dd>{{ store.selectedRecord.referenceNumber }}</dd>
        <dt>Status</dt>
        <dd>{{ store.selectedRecord.status }}</dd>
        <dt>Submitted</dt>
        <dd>{{ store.selectedRecord.submittedAt ?? 'Not available' }}</dd>
      </dl>
      <RecordReview :draft="store.selectedRecord" />
    </div>
  </section>
</template>
