<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  type?: string;
}>();

const model = defineModel<string>({ required: true });
</script>

<template>
  <div class="form-field">
    <label :for="id">
      {{ label }}
      <span v-if="required" aria-hidden="true">*</span>
    </label>
    <input
      :id="id"
      v-model="model"
      :type="type ?? 'text'"
      :aria-describedby="error ? `${id}-error` : undefined"
      :aria-invalid="Boolean(error)"
    >
    <p v-if="error" :id="`${id}-error`" class="field-error">{{ error }}</p>
  </div>
</template>
