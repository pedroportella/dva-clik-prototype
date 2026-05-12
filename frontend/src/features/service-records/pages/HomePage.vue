<template>
  <div class="workspace">
    <section class="hero-panel" aria-labelledby="page-title">
      <div>
        <p class="eyebrow">DVA CLIK Drupal 10 + GovCMS prototype</p>
        <h1 id="page-title">Policy publishing and platform health console</h1>
        <p class="lead">
          A senior Drupal developer prototype for coordinating the urgent upload of
          2,000 policy pages into CLIK while improving content quality, accessibility,
          platform health and CLIKChat readiness.
        </p>
      </div>
      <dl class="hero-facts" aria-label="Role facts">
        <div>
          <dt>Priority stream</dt>
          <dd>Policy upload</dd>
        </div>
        <div>
          <dt>Platform</dt>
          <dd>Drupal 10 + GovCMS</dd>
        </div>
        <div>
          <dt>Front end fit</dt>
          <dd>Twig, Bootstrap, React AI widget</dd>
        </div>
      </dl>
    </section>

    <section class="metric-grid" aria-label="Program status">
      <article v-for="metric in metrics" :key="metric.label" class="metric-card">
        <span class="metric-card__label">{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <span>{{ metric.detail }}</span>
      </article>
    </section>

    <div class="operations-layout">
      <section class="panel panel--span" aria-labelledby="queue-title">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Publishing control</p>
            <h2 id="queue-title">2,000-page policy upload queue</h2>
          </div>
          <button class="icon-button" type="button" aria-label="Refresh upload queue">↻</button>
        </div>

        <div class="toolbar" aria-label="Queue filters">
          <label>
            Library
            <select v-model="selectedLibrary">
              <option>All libraries</option>
              <option>Compensation & Support</option>
              <option>Rehabilitation</option>
              <option>Military Compensation</option>
              <option>Legislation</option>
            </select>
          </label>
          <label>
            Workflow state
            <select v-model="selectedState">
              <option>All states</option>
              <option>Policy owner review</option>
              <option>Ready to publish</option>
              <option>Needs remediation</option>
            </select>
          </label>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th scope="col">Batch</th>
                <th scope="col">Library</th>
                <th scope="col">Owner</th>
                <th scope="col">Progress</th>
                <th scope="col">Risk</th>
                <th scope="col">Next action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="batch in filteredBatches" :key="batch.name">
                <td>
                  <strong>{{ batch.name }}</strong>
                  <span>{{ batch.pages }} pages</span>
                </td>
                <td>{{ batch.library }}</td>
                <td>{{ batch.owner }}</td>
                <td>
                  <div class="progress-cell">
                    <span>{{ batch.progress }}%</span>
                    <meter min="0" max="100" :value="batch.progress">{{ batch.progress }}%</meter>
                  </div>
                </td>
                <td><span :class="['status-pill', `status-pill--${batch.risk}`]">{{ batch.riskLabel }}</span></td>
                <td>{{ batch.action }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel" aria-labelledby="health-title">
        <p class="eyebrow">Health assessment</p>
        <h2 id="health-title">Drupal platform checks</h2>
        <ul class="check-list">
          <li v-for="check in healthChecks" :key="check.label">
            <span :class="['check-dot', `check-dot--${check.state}`]" aria-hidden="true" />
            <div>
              <strong>{{ check.label }}</strong>
              <span>{{ check.detail }}</span>
            </div>
          </li>
        </ul>
      </section>

      <section class="panel" aria-labelledby="audit-title">
        <p class="eyebrow">Content audit</p>
        <h2 id="audit-title">Quality and CLIKChat readiness</h2>
        <div class="audit-stack">
          <article v-for="item in auditFindings" :key="item.label" class="audit-item">
            <div>
              <strong>{{ item.label }}</strong>
              <span>{{ item.detail }}</span>
            </div>
            <b>{{ item.count }}</b>
          </article>
        </div>
      </section>

      <section class="panel panel--span" aria-labelledby="architecture-title">
        <p class="eyebrow">Strategic platform planning</p>
        <h2 id="architecture-title">CLIK and DVA website alignment options</h2>
        <div class="option-grid">
          <article v-for="option in architectureOptions" :key="option.title" class="option-card">
            <span>{{ option.mode }}</span>
            <h3>{{ option.title }}</h3>
            <p>{{ option.summary }}</p>
            <dl>
              <div>
                <dt>Risk</dt>
                <dd>{{ option.risk }}</dd>
              </div>
              <div>
                <dt>Best for</dt>
                <dd>{{ option.bestFor }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section class="panel" aria-labelledby="workflow-title">
        <p class="eyebrow">Workflow support</p>
        <h2 id="workflow-title">Policy owner confirmation</h2>
        <ol class="timeline">
          <li v-for="step in workflowSteps" :key="step.title">
            <span>{{ step.short }}</span>
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.detail }}</p>
            </div>
          </li>
        </ol>
      </section>

      <section class="panel" aria-labelledby="support-title">
        <p class="eyebrow">Ticket management</p>
        <h2 id="support-title">User support focus</h2>
        <div class="support-grid">
          <button v-for="support in supportActions" :key="support" type="button">
            {{ support }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const selectedLibrary = ref('All libraries');
const selectedState = ref('All states');

const metrics = [
  { label: 'Uploaded', value: '742 / 2,000', detail: '37% complete across priority policy batches' },
  { label: 'Owner approvals', value: '118', detail: 'items waiting on business confirmation' },
  { label: 'Audit issues', value: '326', detail: 'metadata, broken links and accessibility checks' },
  { label: 'Health roadmap', value: '9', detail: 'remediation items ready for ICT triage' },
];

const uploadBatches = [
  {
    name: 'MRCA compensation procedures',
    library: 'Military Compensation',
    owner: 'Policy Operations',
    progress: 64,
    pages: 420,
    risk: 'medium',
    riskLabel: 'Medium',
    state: 'Policy owner review',
    action: 'Confirm decision tables before publication',
  },
  {
    name: 'Rehabilitation provider guidance',
    library: 'Rehabilitation',
    owner: 'Rehab Policy',
    progress: 82,
    pages: 310,
    risk: 'low',
    riskLabel: 'Low',
    state: 'Ready to publish',
    action: 'Publish approved pages in next release window',
  },
  {
    name: 'Compensation support reference',
    library: 'Compensation & Support',
    owner: 'Benefits Policy',
    progress: 29,
    pages: 610,
    risk: 'high',
    riskLabel: 'High',
    state: 'Needs remediation',
    action: 'Fix duplicate headings and missing taxonomy',
  },
  {
    name: 'Legislation cross-reference refresh',
    library: 'Legislation',
    owner: 'Legal Services',
    progress: 51,
    pages: 260,
    risk: 'medium',
    riskLabel: 'Medium',
    state: 'Policy owner review',
    action: 'Validate Federal Register links',
  },
];

const filteredBatches = computed(() =>
  uploadBatches.filter((batch) => {
    const libraryMatch = selectedLibrary.value === 'All libraries' || batch.library === selectedLibrary.value;
    const stateMatch = selectedState.value === 'All states' || batch.state === selectedState.value;
    return libraryMatch && stateMatch;
  }),
);

const healthChecks = [
  { label: 'Drupal core and GovCMS posture', detail: 'Drupal 10 public footprint confirmed; patch cadence to be validated in environment.', state: 'review' },
  { label: 'Custom theme surface', detail: 'CLIK uses a custom Twig theme with Bootstrap Barrio conventions.', state: 'good' },
  { label: 'Accessibility', detail: 'Automated WCAG checks plus manual keyboard review proposed for high-traffic templates.', state: 'review' },
  { label: 'Performance', detail: 'Cache strategy, image styles and search pages queued for profiling.', state: 'watch' },
];

const auditFindings = [
  { label: 'Missing metadata', detail: 'Policy type, owner or review date absent', count: '141' },
  { label: 'Broken references', detail: 'Legacy ComLaw and stale internal links', count: '76' },
  { label: 'Heading structure', detail: 'Skipped levels affecting accessibility and chatbot chunking', count: '63' },
  { label: 'Duplicate content', detail: 'Near-duplicate policy pages requiring owner decision', count: '46' },
];

const architectureOptions = [
  {
    mode: 'Option A',
    title: 'Stabilise CLIK in place',
    summary: 'Keep CLIK on its current Drupal 10/GovCMS track, prioritising migration tooling, editor workflow, accessibility and health remediation.',
    risk: 'Lowest delivery risk',
    bestFor: 'Immediate 2,000-page program',
  },
  {
    mode: 'Option B',
    title: 'Shared design and search layer',
    summary: 'Align navigation, Bootstrap 5 components, metadata and AI search conventions with the main DVA website while preserving CLIK information architecture.',
    risk: 'Moderate integration risk',
    bestFor: 'Consistent user experience',
  },
  {
    mode: 'Option C',
    title: 'Progressive platform convergence',
    summary: 'Define a staged path for shared GovCMS services, content APIs and common AI assistant signals after the time-critical migration is stable.',
    risk: 'Higher governance risk',
    bestFor: 'Long-term platform strategy',
  },
];

const workflowSteps = [
  { short: '1', title: 'Ingest', detail: 'Import policy source files with content type, library, owner and priority metadata.' },
  { short: '2', title: 'Validate', detail: 'Run automated link, heading, accessibility, taxonomy and duplicate-content checks.' },
  { short: '3', title: 'Confirm', detail: 'Route batches to policy owners before publication, reflecting the established review workflow pattern.' },
  { short: '4', title: 'Publish', detail: 'Release approved pages and report progress, exceptions and risks to the project lead.' },
];

const supportActions = [
  'Triage editor tickets',
  'Run content clinics',
  'Prepare release notes',
  'Report migration risks',
  'Document remediation',
  'Brief ICT stakeholders',
];
</script>
