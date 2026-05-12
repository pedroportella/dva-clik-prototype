import { expect, type Page } from '@playwright/test';
import { gotoAppPage } from './e2ePage';
import { ReviewAssertionsPO } from './assertions/ReviewAssertionsPO';
import type { CitizenServiceRecordScenario } from '../utils/generateCitizenServiceRecordData';

export class CitizenServiceRecordPO {
  readonly review: ReviewAssertionsPO;

  constructor(private readonly page: Page) {
    this.review = new ReviewAssertionsPO(page);
  }

  async gotoCreateRecord() {
    await gotoAppPage(this.page, '/records/new');
    await expect(this.page.getByRole('heading', { name: 'Create service record' })).toBeVisible({ timeout: 15_000 });
  }

  async completeApplicantDetails(scenario: CitizenServiceRecordScenario) {
    await this.page.getByLabel('First name').fill(scenario.draft.applicant.firstName);
    await this.page.getByLabel('Last name').fill(scenario.draft.applicant.lastName);
    await this.page.getByLabel('Date of birth').fill(scenario.draft.applicant.dateOfBirth);
    await this.next();
  }

  async completeContactDetails(scenario: CitizenServiceRecordScenario) {
    await this.page.getByLabel('Email').fill(scenario.draft.contact.email);
    await this.page.getByLabel('Phone').fill(scenario.draft.contact.phone);
    await this.page.getByLabel('Residential address').fill(scenario.draft.contact.residentialAddress);
    await this.next();
  }

  async completeRelatedParties(scenario: CitizenServiceRecordScenario) {
    for (const [index, party] of scenario.draft.relatedParties.entries()) {
      await this.page.getByRole('button', { name: 'Add related party' }).click();
      await this.page.locator(`#party-relationship-${index}`).fill(party.relationship);
      await this.page.locator(`#party-first-name-${index}`).fill(party.firstName);
      await this.page.locator(`#party-last-name-${index}`).fill(party.lastName);
    }

    await this.next();
  }

  async completeSupportingDocuments(scenario: CitizenServiceRecordScenario) {
    for (const [index, document] of scenario.documents.entries()) {
      await this.page.getByRole('button', { name: 'Add supporting document' }).click();
      const documentCard = this.page.locator('.supporting-document-card').nth(index);
      await this.page.locator(`#document-file-${index}`).setInputFiles(document.file);
      await expect(documentCard.locator('.upload-status--success').filter({ hasText: 'Uploaded to Drupal' })).toBeVisible();
      await this.page.locator(`#document-category-${index}`).selectOption(document.category);
      await this.page.locator(`#document-notes-${index}`).fill(document.notes);
    }

    await this.next();
  }

  async expectReview(scenario: CitizenServiceRecordScenario) {
    await this.review.expectReviewPage(scenario);
  }

  async submitAndExpectSubmittedRecord(scenario: CitizenServiceRecordScenario) {
    await this.page.getByRole('button', { name: 'Submit record' }).click();
    await this.review.expectSubmittedRecord(scenario);
  }

  async completeAndSubmitScenario(scenario: CitizenServiceRecordScenario) {
    await this.gotoCreateRecord();
    await this.completeApplicantDetails(scenario);
    await this.completeContactDetails(scenario);
    await this.completeRelatedParties(scenario);
    await this.completeSupportingDocuments(scenario);
    await this.expectReview(scenario);
    await this.submitAndExpectSubmittedRecord(scenario);
  }

  private async next() {
    await this.page.getByRole('button', { name: 'Next' }).click();
  }
}
