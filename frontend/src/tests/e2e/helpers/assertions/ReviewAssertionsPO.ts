import { expect, type Locator, type Page } from '@playwright/test';
import type { CitizenServiceRecordScenario } from '../../utils/generateCitizenServiceRecordData';

export class ReviewAssertionsPO {
  constructor(private readonly page: Page) {}

  async expectReviewPage(scenario: CitizenServiceRecordScenario) {
    await expect(this.page.getByRole('heading', { name: 'Review and submit' })).toBeVisible();
    await this.expectApplicantDetails(scenario);
    await this.expectContactDetails(scenario);
    await this.expectRelatedParties(scenario);
    await this.expectSupportingDocuments(scenario);
  }

  async expectSubmittedRecord(scenario: CitizenServiceRecordScenario) {
    await expect(this.page.getByRole('heading', { name: /Record/i })).toBeVisible();
    await this.expectRecordStatus('SUBMITTED');
    await this.expectApplicantDetails(scenario);
    await this.expectContactDetails(scenario);
    await this.expectRelatedParties(scenario);
    await expect(this.page.getByRole('heading', { name: 'Supporting documents' })).toBeVisible();
    await this.expectSupportingDocuments(scenario);
  }

  async expectRecordStatus(status: string) {
    await expect(this.page.locator('dl.summary-list').locator('dd').filter({ hasText: new RegExp(`^${status}$`) })).toBeVisible();
  }

  private async expectApplicantDetails(scenario: CitizenServiceRecordScenario) {
    await expect(this.page.getByText(this.fullName(scenario), { exact: true })).toBeVisible();
    await expect(this.page.getByText(scenario.draft.applicant.dateOfBirth, { exact: true })).toBeVisible();
  }

  private async expectContactDetails(scenario: CitizenServiceRecordScenario) {
    await expect(this.page.getByText(scenario.draft.contact.email, { exact: true })).toBeVisible();
    await expect(this.page.getByText(scenario.draft.contact.phone, { exact: true })).toBeVisible();
    await expect(this.page.getByText(scenario.draft.contact.residentialAddress, { exact: true })).toBeVisible();
  }

  private async expectRelatedParties(scenario: CitizenServiceRecordScenario) {
    if (scenario.draft.relatedParties.length === 0) {
      await expect(this.page.getByText('No related parties added.', { exact: true })).toBeVisible();
      return;
    }

    for (const party of scenario.draft.relatedParties) {
      await expect(
        this.page.getByText(`${party.relationship} - ${party.firstName} ${party.lastName}`, { exact: true }),
      ).toBeVisible();
    }
  }

  private async expectSupportingDocuments(scenario: CitizenServiceRecordScenario) {
    for (const document of scenario.documents) {
      await expect(this.documentReviewItem(document.file.name)).toBeVisible();
      await expect(this.page.getByRole('link', { name: document.file.name })).toBeVisible();
      await expect(this.page.getByText(document.notes, { exact: false })).toBeVisible();
    }
  }

  private documentReviewItem(fileName: string): Locator {
    return this.page.locator('.document-review-list li').filter({ has: this.page.getByRole('link', { name: fileName }) });
  }

  private fullName(scenario: CitizenServiceRecordScenario) {
    return `${scenario.draft.applicant.firstName} ${scenario.draft.applicant.lastName}`;
  }
}
