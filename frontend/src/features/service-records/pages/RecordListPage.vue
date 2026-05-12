<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useServiceRecordStore } from '@/stores/serviceRecordStore';

const store = useServiceRecordStore();
const searchTerm = ref('');
const statusFilter = ref('ALL');

const filteredRecords = computed(() => {
  const search = searchTerm.value.trim().toLowerCase();

  return store.records.filter((record) => {
    const matchesStatus = statusFilter.value === 'ALL' || record.status === statusFilter.value;
    const matchesSearch =
      !search ||
      record.referenceNumber.toLowerCase().includes(search) ||
      record.applicantName.toLowerCase().includes(search);

    return matchesStatus && matchesSearch;
  });
});

onMounted(() => {
  void store.loadRecords();
});
</script>

<template>
  <section class="page-section">
    <p class="eyebrow">Staff view</p>
    <h1>Submitted records</h1>
    <p>Search and filter records submitted through the Drupal API vertical slice.</p>

    <div class="filter-panel" aria-label="Record filters">
      <div class="form-field">
        <label for="record-search">Search records</label>
        <input
          id="record-search"
          v-model="searchTerm"
          type="search"
          placeholder="Search reference or applicant"
        >
      </div>
      <div class="form-field">
        <label for="record-status">Status</label>
        <select id="record-status" v-model="statusFilter">
          <option value="ALL">All statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under review</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </div>

    <p v-if="store.loading">Loading records...</p>
    <p v-else-if="store.error" class="alert" role="alert">{{ store.error }}</p>
    <div v-else-if="filteredRecords.length" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Reference</th>
            <th scope="col">Applicant</th>
            <th scope="col">Status</th>
            <th scope="col">Submitted</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in filteredRecords" :key="record.id">
            <td><RouterLink :to="`/records/${record.id}`">{{ record.referenceNumber }}</RouterLink></td>
            <td>{{ record.applicantName }}</td>
            <td>{{ record.status }}</td>
            <td>{{ record.submittedAt ?? 'Not available' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>No matching records found.</p>
  </section>
</template>
