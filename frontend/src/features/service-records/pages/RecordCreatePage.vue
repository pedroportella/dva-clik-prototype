<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import FormField from '@/features/service-records/components/FormField.vue';
import RecordReview from '@/features/service-records/components/RecordReview.vue';
import SupportingDocumentsUpload from '@/features/service-records/components/SupportingDocumentsUpload.vue';
import WizardStepNav from '@/features/service-records/components/WizardStepNav.vue';
import {
  serviceRecordWizardSteps,
  validateServiceRecordDraft,
  validateServiceRecordStep,
} from '@/features/service-records/validation/serviceRecordValidation';
import { useServiceRecordStore } from '@/stores/serviceRecordStore';

const router = useRouter();
const store = useServiceRecordStore();

const steps = ['Applicant details', 'Contact details', 'Related parties', 'Supporting documents', 'Review and submit'];
const currentStep = ref(0);
const attemptedSubmit = ref(false);
const attemptedSteps = ref<number[]>([]);
const validation = computed(() => validateServiceRecordDraft(store.draft));
const currentStepValidation = computed(() => validateServiceRecordStep(store.draft, serviceRecordWizardSteps[currentStep.value]));

onMounted(() => {
  store.restoreDraft();
});

watch(
  () => store.draft,
  () => store.persistDraft(),
  { deep: true },
);

function hasAttemptedStep(step: number) {
  return attemptedSubmit.value || attemptedSteps.value.includes(step);
}

function markCurrentStepAttempted() {
  if (!attemptedSteps.value.includes(currentStep.value)) {
    attemptedSteps.value.push(currentStep.value);
  }
}

function nextStep() {
  markCurrentStepAttempted();

  if (!currentStepValidation.value.valid) {
    return;
  }

  if (currentStep.value < steps.length - 1) {
    currentStep.value += 1;
  }
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value -= 1;
  }
}

function addRelatedParty() {
  store.draft.relatedParties.push({ relationship: '', firstName: '', lastName: '' });
}

function removeRelatedParty(index: number) {
  store.draft.relatedParties.splice(index, 1);
}

async function submitRecord() {
  attemptedSubmit.value = true;

  if (!validation.value.valid) {
    return;
  }

  const record = await store.submitDraft();
  await router.push(`/records/${record.id}`);
}
</script>

<template>
  <section class="page-section">
    <p class="eyebrow">Phase 3 frontend hardening</p>
    <h1>Create service record</h1>
    <p>Complete the wizard, review the payload, then submit the record to the Drupal API.</p>

    <WizardStepNav :steps="steps" :current-step="currentStep" />

    <form class="wizard-form" @submit.prevent="submitRecord">
      <fieldset v-if="currentStep === 0">
        <legend>Applicant details</legend>
        <FormField
          id="applicant-first-name"
          v-model="store.draft.applicant.firstName"
          label="First name"
          required
          :error="hasAttemptedStep(0) ? validation.errors['applicant.firstName'] : undefined"
        />
        <FormField
          id="applicant-last-name"
          v-model="store.draft.applicant.lastName"
          label="Last name"
          required
          :error="hasAttemptedStep(0) ? validation.errors['applicant.lastName'] : undefined"
        />
        <FormField
          id="applicant-date-of-birth"
          v-model="store.draft.applicant.dateOfBirth"
          label="Date of birth"
          type="date"
          required
          :error="hasAttemptedStep(0) ? validation.errors['applicant.dateOfBirth'] : undefined"
        />
      </fieldset>

      <fieldset v-else-if="currentStep === 1">
        <legend>Contact details</legend>
        <FormField
          id="contact-email"
          v-model="store.draft.contact.email"
          label="Email"
          type="email"
          required
          :error="hasAttemptedStep(1) ? validation.errors['contact.email'] : undefined"
        />
        <FormField
          id="contact-phone"
          v-model="store.draft.contact.phone"
          label="Phone"
          type="tel"
          required
          :error="hasAttemptedStep(1) ? validation.errors['contact.phone'] : undefined"
        />
        <FormField
          id="contact-residential-address"
          v-model="store.draft.contact.residentialAddress"
          label="Residential address"
          required
          :error="hasAttemptedStep(1) ? validation.errors['contact.residentialAddress'] : undefined"
        />
      </fieldset>

      <fieldset v-else-if="currentStep === 2">
        <legend>Related parties / dependants</legend>
        <p>Add dependants, nominees or other related parties where relevant.</p>
        <div v-for="(party, index) in store.draft.relatedParties" :key="index" class="repeatable-card">
          <FormField :id="`party-relationship-${index}`" v-model="party.relationship" label="Relationship" />
          <FormField :id="`party-first-name-${index}`" v-model="party.firstName" label="First name" />
          <FormField :id="`party-last-name-${index}`" v-model="party.lastName" label="Last name" />
          <p v-if="hasAttemptedStep(2) && validation.errors[`relatedParties.${index}`]" class="field-error">
            {{ validation.errors[`relatedParties.${index}`] }}
          </p>
          <button class="button button--secondary" type="button" @click="removeRelatedParty(index)">Remove related party</button>
        </div>
        <button class="button button--secondary" type="button" @click="addRelatedParty">Add related party</button>
      </fieldset>

      <fieldset v-else-if="currentStep === 3">
        <legend>Supporting documents</legend>
        <SupportingDocumentsUpload
          v-model:documents="store.draft.supportingDocuments"
          :errors="validation.errors"
          :show-errors="hasAttemptedStep(3)"
        />
      </fieldset>

      <section v-else class="review-section" aria-labelledby="review-heading">
        <h2 id="review-heading">Review and submit</h2>
        <p>Confirm the details before submitting to the backend API.</p>
        <p v-if="attemptedSubmit && !validation.valid" class="alert" role="alert">Fix validation errors before submitting.</p>
        <RecordReview :draft="store.draft" />
      </section>

      <p v-if="store.error" class="alert" role="alert">{{ store.error }}</p>

      <div class="wizard-actions">
        <button
          class="button button--secondary"
          type="button"
          :disabled="currentStep === 0"
          @click="previousStep"
        >
          Back
        </button>
        <button
          v-if="currentStep < steps.length - 1"
          class="button"
          type="button"
          @click="nextStep"
        >
          Next
        </button>
        <button
          v-else
          class="button"
          type="submit"
          :disabled="store.submitting"
        >
          {{ store.submitting ? 'Submitting...' : 'Submit record' }}
        </button>
      </div>
    </form>
  </section>
</template>
