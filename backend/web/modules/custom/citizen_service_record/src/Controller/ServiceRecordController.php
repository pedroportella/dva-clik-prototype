<?php
// backend/web/modules/custom/citizen_service_record/src/Controller/ServiceRecordController.php

namespace Drupal\citizen_service_record\Controller;

use Drupal\citizen_service_record\Service\ServiceRecordRepository;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Render\Markup;
use Drupal\file\FileRepositoryInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

final class ServiceRecordController implements ContainerInjectionInterface {

  public function __construct(
    private readonly ServiceRecordRepository $repository,
    private readonly FileRepositoryInterface $fileRepository,
    private readonly FileSystemInterface $fileSystem,
    private readonly EntityTypeManagerInterface $entityTypeManager,
  ) {}

  public static function create(ContainerInterface $container): self {
    return new self(
      $container->get('citizen_service_record.service_record_repository'),
      $container->get('file.repository'),
      $container->get('file_system'),
      $container->get('entity_type.manager'),
    );
  }

  public function list(): JsonResponse {
    return new JsonResponse($this->repository->findAll());
  }

  public function view(string $id): JsonResponse {
    $record = $this->repository->findById($id);

    if ($record === NULL) {
      return new JsonResponse(['message' => 'Record not found.'], 404);
    }

    return new JsonResponse($record);
  }

  public function delete(string $id): JsonResponse {
    if (!$this->repository->deleteById($id)) {
      return new JsonResponse(['message' => 'Record not found.'], 404);
    }

    return new JsonResponse(['deleted' => TRUE]);
  }

  public function store(Request $request): JsonResponse {
    $payload = json_decode($request->getContent(), TRUE);

    if (!is_array($payload)) {
      return new JsonResponse(['message' => 'Invalid JSON payload.'], 400);
    }

    $errors = $this->validatePayload($payload);

    if ($errors !== []) {
      return new JsonResponse([
        'message' => 'Validation failed.',
        'errors' => $errors,
      ], 422);
    }

    return new JsonResponse($this->repository->create($payload), 201);
  }

  public function uploadDocument(Request $request): JsonResponse {
    $uploadedFile = $request->files->get('file');

    if ($uploadedFile === NULL) {
      return new JsonResponse(['message' => 'Choose a document to upload.'], 422);
    }

    if (!$uploadedFile->isValid()) {
      return new JsonResponse(['message' => 'The document upload did not complete successfully.'], 422);
    }

    if ($uploadedFile->getSize() !== NULL && $uploadedFile->getSize() > 10 * 1024 * 1024) {
      return new JsonResponse(['message' => 'The document must be 10 MB or smaller.'], 422);
    }

    $allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'];
    $extension = strtolower((string) $uploadedFile->getClientOriginalExtension());

    if (!in_array($extension, $allowedExtensions, TRUE)) {
      return new JsonResponse(['message' => 'The document type is not supported.'], 422);
    }

    $directory = 'public://citizen-service-records';
    if (!$this->fileSystem->prepareDirectory($directory, FileSystemInterface::CREATE_DIRECTORY | FileSystemInterface::MODIFY_PERMISSIONS)) {
      return new JsonResponse(['message' => 'Unable to prepare the document storage directory.'], 500);
    }

    $contents = file_get_contents($uploadedFile->getRealPath());

    if ($contents === FALSE) {
      return new JsonResponse(['message' => 'Unable to read the uploaded document.'], 500);
    }

    $safeFilename = preg_replace('/[^A-Za-z0-9._-]/', '-', $uploadedFile->getClientOriginalName()) ?: 'document.' . $extension;
    $file = $this->fileRepository->writeData($contents, $directory . '/' . $safeFilename, FileSystemInterface::EXISTS_RENAME);
    $file->setPermanent();
    $file->save();

    $mediaId = $this->createDocumentMedia((int) $file->id(), $safeFilename);

    return new JsonResponse([
      'fileId' => (string) $file->id(),
      'mediaId' => $mediaId,
      'fileName' => $file->getFilename(),
      'fileSize' => (int) $file->getSize(),
      'fileType' => $file->getMimeType() ?: $uploadedFile->getMimeType() ?: 'application/octet-stream',
      'url' => $file->createFileUrl(FALSE),
      'uploadedAt' => date(DATE_ATOM),
    ], 201);
  }

  public function adminList(): array {
    $records = $this->repository->findAllForAdmin();
    $documentCount = 0;
    $submittedCount = 0;
    $rows = '';

    usort($records, static function (array $left, array $right): int {
      return strcmp((string) ($right['submittedAt'] ?? ''), (string) ($left['submittedAt'] ?? ''));
    });

    foreach ($records as $record) {
      $documents = $this->getList($record, 'supportingDocuments');
      $documentCount += count($documents);

      if (($record['status'] ?? '') === 'SUBMITTED') {
        $submittedCount++;
      }

      $id = $this->getString($record, 'id');
      $viewUrl = '/admin/citizen-service-records/' . rawurlencode($id);
      $fileSummary = count($documents) === 1 ? '1 file' : count($documents) . ' files';

      $rows .= '<tr>';
      $rows .= '<td><a class="csr-admin-reference" href="' . $this->escape($viewUrl) . '">' . $this->escape((string) ($record['referenceNumber'] ?? '')) . '</a></td>';
      $rows .= '<td>' . $this->escape((string) ($record['applicantName'] ?? 'Unknown applicant')) . '</td>';
      $rows .= '<td><span class="csr-admin-status">' . $this->escape((string) ($record['status'] ?? 'SUBMITTED')) . '</span></td>';
      $rows .= '<td>' . $this->escape($this->formatDate((string) ($record['submittedAt'] ?? ''))) . '</td>';
      $rows .= '<td>' . $this->escape($fileSummary) . '</td>';
      $rows .= '<td><a class="button" href="' . $this->escape($viewUrl) . '">View application</a></td>';
      $rows .= '</tr>';
    }

    if ($rows === '') {
      $rows = '<tr><td colspan="6">No applications have been submitted yet.</td></tr>';
    }

    $html = '<div class="csr-admin-hero">';
    $html .= '<p class="csr-admin-kicker">Administration</p>';
    $html .= '<h1>Citizen service applications</h1>';
    $html .= '<p>Review prototype applications, applicant details and files uploaded from the Vue frontend.</p>';
    $html .= '</div>';
    $html .= '<div class="csr-admin-summary">';
    $html .= '<div class="csr-admin-stat"><span>Applications</span><strong>' . count($records) . '</strong></div>';
    $html .= '<div class="csr-admin-stat"><span>Submitted</span><strong>' . $submittedCount . '</strong></div>';
    $html .= '<div class="csr-admin-stat"><span>Uploaded files</span><strong>' . $documentCount . '</strong></div>';
    $html .= '</div>';
    $html .= '<div class="csr-admin-panel">';
    $html .= '<h2>Application register</h2>';
    $html .= '<div class="csr-admin-table-wrap"><table><thead><tr><th>Reference</th><th>Applicant</th><th>Status</th><th>Submitted</th><th>Files</th><th>Action</th></tr></thead><tbody>' . $rows . '</tbody></table></div>';
    $html .= '</div>';

    return $this->adminMarkup($html);
  }

  public function adminView(string $id): array {
    $record = $this->repository->findById($id);

    if ($record === NULL) {
      $html = '<div class="csr-admin-hero"><h1>Application not found</h1><p>The requested application could not be found.</p></div>';
      $html .= '<p><a class="button" href="/admin/citizen-service-records">Back to applications</a></p>';

      return $this->adminMarkup($html);
    }

    $documents = $this->getList($record, 'supportingDocuments');
    $applicant = $this->getArray($record, 'applicant');
    $contact = $this->getArray($record, 'contact');
    $relatedParties = $this->getList($record, 'relatedParties');

    $html = '<p><a class="csr-admin-back-link" href="/admin/citizen-service-records">Back to applications</a></p>';
    $html .= '<div class="csr-admin-hero">';
    $html .= '<p class="csr-admin-kicker">Application</p>';
    $html .= '<h1>' . $this->escape((string) ($record['referenceNumber'] ?? 'Citizen service application')) . '</h1>';
    $html .= '<p>' . $this->escape((string) ($record['applicantName'] ?? 'Unknown applicant')) . ' · ' . $this->escape((string) ($record['status'] ?? 'SUBMITTED')) . '</p>';
    $html .= '</div>';

    $html .= '<div class="csr-admin-detail-grid">';
    $html .= $this->renderDefinitionPanel('Application details', [
      'Reference' => (string) ($record['referenceNumber'] ?? ''),
      'Status' => (string) ($record['status'] ?? 'SUBMITTED'),
      'Submitted' => $this->formatDate((string) ($record['submittedAt'] ?? '')),
      'Record ID' => (string) ($record['id'] ?? ''),
    ]);
    $html .= $this->renderDefinitionPanel('Applicant', [
      'First name' => $this->getString($applicant, 'firstName'),
      'Last name' => $this->getString($applicant, 'lastName'),
      'Date of birth' => $this->getString($applicant, 'dateOfBirth'),
    ]);
    $html .= $this->renderDefinitionPanel('Contact', [
      'Email' => $this->getString($contact, 'email'),
      'Phone' => $this->getString($contact, 'phone'),
      'Residential address' => $this->getString($contact, 'residentialAddress'),
    ]);
    $html .= '</div>';

    $html .= '<div class="csr-admin-panel">';
    $html .= '<h2>Uploaded files</h2>';
    $html .= $this->renderDocumentsTable($documents);
    $html .= '</div>';

    $html .= '<div class="csr-admin-panel">';
    $html .= '<h2>Related parties</h2>';
    $html .= $this->renderRelatedPartiesTable($relatedParties);
    $html .= '</div>';

    return $this->adminMarkup($html);
  }

  private function adminMarkup(string $html): array {
    return [
      '#markup' => Markup::create($html),
      '#attached' => [
        'library' => ['citizen_service_record/admin'],
      ],
    ];
  }

  /**
   * @param array<int, array<string, mixed>> $documents
   */
  private function renderDocumentsTable(array $documents): string {
    if ($documents === []) {
      return '<p class="csr-admin-muted">No files were uploaded with this application.</p>';
    }

    $rows = '';

    foreach ($documents as $document) {
      $fileName = $this->getString($document, 'fileName');
      $url = $this->getString($document, 'url');
      $fileLink = $url !== ''
        ? '<a href="' . $this->escape($url) . '" target="_blank" rel="noopener noreferrer">' . $this->escape($fileName) . '</a>'
        : $this->escape($fileName);

      $rows .= '<tr>';
      $rows .= '<td>' . $fileLink . '</td>';
      $rows .= '<td>' . $this->escape($this->getString($document, 'category')) . '</td>';
      $rows .= '<td>' . $this->escape($this->formatFileSize($document['fileSize'] ?? NULL)) . '</td>';
      $rows .= '<td>' . $this->escape($this->getString($document, 'fileType')) . '</td>';
      $rows .= '<td>' . $this->escape($this->formatDate($this->getString($document, 'uploadedAt'))) . '</td>';
      $rows .= '</tr>';
    }

    return '<div class="csr-admin-table-wrap"><table><thead><tr><th>File</th><th>Category</th><th>Size</th><th>Type</th><th>Uploaded</th></tr></thead><tbody>' . $rows . '</tbody></table></div>';
  }

  /**
   * @param array<int, array<string, mixed>> $relatedParties
   */
  private function renderRelatedPartiesTable(array $relatedParties): string {
    if ($relatedParties === []) {
      return '<p class="csr-admin-muted">No related parties were supplied.</p>';
    }

    $rows = '';

    foreach ($relatedParties as $party) {
      $rows .= '<tr>';
      $rows .= '<td>' . $this->escape($this->getString($party, 'relationship')) . '</td>';
      $rows .= '<td>' . $this->escape(trim($this->getString($party, 'firstName') . ' ' . $this->getString($party, 'lastName'))) . '</td>';
      $rows .= '<td>' . $this->escape($this->getString($party, 'dateOfBirth')) . '</td>';
      $rows .= '</tr>';
    }

    return '<div class="csr-admin-table-wrap"><table><thead><tr><th>Relationship</th><th>Name</th><th>Date of birth</th></tr></thead><tbody>' . $rows . '</tbody></table></div>';
  }

  /**
   * @param array<string, string> $items
   */
  private function renderDefinitionPanel(string $title, array $items): string {
    $html = '<section class="csr-admin-panel"><h2>' . $this->escape($title) . '</h2><dl class="csr-admin-definition-list">';

    foreach ($items as $label => $value) {
      $html .= '<div><dt>' . $this->escape($label) . '</dt><dd>' . $this->escape($value !== '' ? $value : 'Not provided') . '</dd></div>';
    }

    return $html . '</dl></section>';
  }

  private function formatDate(string $value): string {
    if ($value === '') {
      return 'Not available';
    }

    $timestamp = strtotime($value);

    return $timestamp === FALSE ? $value : date('d M Y, g:ia', $timestamp);
  }

  private function formatFileSize(mixed $value): string {
    if (!is_numeric($value)) {
      return 'Not available';
    }

    $bytes = (float) $value;

    if ($bytes >= 1024 * 1024) {
      return number_format($bytes / 1024 / 1024, 1) . ' MB';
    }

    if ($bytes >= 1024) {
      return number_format($bytes / 1024, 1) . ' KB';
    }

    return number_format($bytes) . ' bytes';
  }

  private function escape(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
  }

  /**
   * @param array<string, mixed> $payload
   *
   * @return array<string, string>
   */
  private function validatePayload(array $payload): array {
    $errors = [];
    $applicant = $this->getArray($payload, 'applicant');
    $contact = $this->getArray($payload, 'contact');

    if ($this->getString($applicant, 'firstName') === '') {
      $errors['applicant.firstName'] = 'Enter the applicant first name.';
    }

    if ($this->getString($applicant, 'lastName') === '') {
      $errors['applicant.lastName'] = 'Enter the applicant last name.';
    }

    if ($this->getString($applicant, 'dateOfBirth') === '') {
      $errors['applicant.dateOfBirth'] = 'Enter the applicant date of birth.';
    }

    $email = $this->getString($contact, 'email');

    if ($email === '') {
      $errors['contact.email'] = 'Enter the applicant email address.';
    }
    elseif (filter_var($email, FILTER_VALIDATE_EMAIL) === FALSE) {
      $errors['contact.email'] = 'Enter a valid email address.';
    }

    if ($this->getString($contact, 'phone') === '') {
      $errors['contact.phone'] = 'Enter the applicant phone number.';
    }

    if ($this->getString($contact, 'residentialAddress') === '') {
      $errors['contact.residentialAddress'] = 'Enter the residential address.';
    }

    foreach ($this->getList($payload, 'relatedParties') as $index => $party) {
      if (
        $this->getString($party, 'relationship') === '' ||
        $this->getString($party, 'firstName') === '' ||
        $this->getString($party, 'lastName') === ''
      ) {
        $errors['relatedParties.' . $index] = 'Complete all related party fields or remove this row.';
      }
    }

    foreach ($this->getList($payload, 'supportingDocuments') as $index => $document) {
      if ($this->getString($document, 'fileId') === '' || $this->getString($document, 'fileName') === '' || $this->getString($document, 'category') === '') {
        $errors['supportingDocuments.' . $index] = 'Upload a document and choose a category, or remove this row.';
      }
    }

    return $errors;
  }

  private function createDocumentMedia(int $fileId, string $filename): ?string {
    if (!$this->entityTypeManager->hasDefinition('media')) {
      return NULL;
    }

    try {
      $storage = $this->entityTypeManager->getStorage('media');
      $media = $storage->create([
        'bundle' => 'document',
        'name' => $filename,
        'field_media_document' => [
          'target_id' => $fileId,
        ],
        'status' => 1,
      ]);
      $media->save();

      return (string) $media->id();
    }
    catch (\Throwable) {
      return NULL;
    }
  }

  /**
   * @param array<string, mixed> $payload
   *
   * @return array<string, mixed>
   */
  private function getArray(array $payload, string $key): array {
    $value = $payload[$key] ?? [];

    return is_array($value) ? $value : [];
  }

  /**
   * @param array<string, mixed> $payload
   *
   * @return array<int, array<string, mixed>>
   */
  private function getList(array $payload, string $key): array {
    $value = $payload[$key] ?? [];

    if (!is_array($value)) {
      return [];
    }

    return array_values(array_filter($value, 'is_array'));
  }

  /**
   * @param array<string, mixed> $payload
   */
  private function getString(array $payload, string $key): string {
    $value = $payload[$key] ?? '';

    return is_scalar($value) ? trim((string) $value) : '';
  }

}
