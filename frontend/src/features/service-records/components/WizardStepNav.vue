<script setup lang="ts">
defineProps<{
  steps: string[];
  currentStep: number;
}>();
</script>

<template>
  <ol class="step-nav" aria-label="Create service record progress">
    <li
      v-for="(step, index) in steps"
      :key="step"
      class="step-nav__item"
      :class="{ 'step-nav__item--active': index === currentStep, 'step-nav__item--complete': index < currentStep }"
    >
      <span class="step-nav__number">{{ index + 1 }}</span>
      <span>{{ step }}</span>
    </li>
  </ol>
</template>
