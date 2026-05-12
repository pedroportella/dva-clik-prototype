<?php

namespace Drupal\citizen_service_record\Service;

use Drupal\Core\Database\Connection;

final class ServiceRecordRepository {

  private const TABLE = 'citizen_service_record_application';

  public function __construct(
    private readonly Connection $database,
  ) {}

  /**
   * @return array<int, array<string, mixed>>
   */
  public function findAll(): array {
    return array_map(static fn (array $record): array => self::toSummary($record), $this->readRecords());
  }

  /**
   * @return array<int, array<string, mixed>>
   */
  public function findAllForAdmin(): array {
    return $this->readRecords();
  }

  /**
   * @return array<string, mixed>|null
   */
  public function findById(string $id): ?array {
    foreach ($this->readRecords() as $record) {
      if (($record['id'] ?? NULL) === $id) {
        return $record;
      }
    }

    return NULL;
  }

  /**
   * @param array<string, mixed> $payload
   *
   * @return array<string, mixed>
   */
  public function create(array $payload): array {
    $id = 'csr-' . date('YmdHis') . '-' . bin2hex(random_bytes(3));
    $referenceNumber = 'CSR-' . date('Y') . '-' . strtoupper(bin2hex(random_bytes(3)));
    $submittedAt = date(DATE_ATOM);

    $record = [
      'id' => $id,
      'referenceNumber' => $referenceNumber,
      'applicantName' => $this->getApplicantName($payload),
      'status' => 'SUBMITTED',
      'submittedAt' => $submittedAt,
      'applicant' => $this->getArray($payload, 'applicant'),
      'contact' => $this->getArray($payload, 'contact'),
      'relatedParties' => $this->getList($payload, 'relatedParties'),
      'supportingDocuments' => $this->getList($payload, 'supportingDocuments'),
    ];

    $this->database->insert(self::TABLE)
      ->fields([
        'id' => $id,
        'reference_number' => $referenceNumber,
        'applicant_name' => $record['applicantName'],
        'status' => $record['status'],
        'submitted_at' => $submittedAt,
        'payload' => json_encode($record, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
      ])
      ->execute();

    return $record;
  }

  public function deleteById(string $id): bool {
    return (bool) $this->database->delete(self::TABLE)
      ->condition('id', $id)
      ->execute();
  }

  /**
   * @return array<int, array<string, mixed>>
   */
  private function readRecords(): array {
    $query = $this->database->select(self::TABLE, 'record')
      ->fields('record', [
        'id',
        'reference_number',
        'applicant_name',
        'status',
        'submitted_at',
        'payload',
      ])
      ->orderBy('submitted_at', 'DESC');

    $records = [];

    foreach ($query->execute() as $row) {
      $records[] = $this->rowToRecord((array) $row);
    }

    return $records;
  }

  /**
   * @param array<string, mixed> $record
   *
   * @return array<string, mixed>
   */
  private static function toSummary(array $record): array {
    return [
      'id' => $record['id'] ?? '',
      'referenceNumber' => $record['referenceNumber'] ?? '',
      'applicantName' => $record['applicantName'] ?? 'Unknown applicant',
      'status' => $record['status'] ?? 'SUBMITTED',
      'submittedAt' => $record['submittedAt'] ?? NULL,
    ];
  }

  /**
   * @param array<string, mixed> $row
   *
   * @return array<string, mixed>
   */
  private function rowToRecord(array $row): array {
    $payload = json_decode((string) ($row['payload'] ?? '{}'), TRUE);
    $record = is_array($payload) ? $payload : [];

    $record['id'] = (string) ($row['id'] ?? $record['id'] ?? '');
    $record['referenceNumber'] = (string) ($row['reference_number'] ?? $record['referenceNumber'] ?? '');
    $record['applicantName'] = (string) ($row['applicant_name'] ?? $record['applicantName'] ?? 'Unknown applicant');
    $record['status'] = (string) ($row['status'] ?? $record['status'] ?? 'SUBMITTED');
    $record['submittedAt'] = (string) ($row['submitted_at'] ?? $record['submittedAt'] ?? '');

    return $record;
  }

  /**
   * @param array<string, mixed> $payload
   */
  private function getApplicantName(array $payload): string {
    $applicant = $this->getArray($payload, 'applicant');
    $firstName = is_string($applicant['firstName'] ?? NULL) ? $applicant['firstName'] : '';
    $lastName = is_string($applicant['lastName'] ?? NULL) ? $applicant['lastName'] : '';
    $name = trim($firstName . ' ' . $lastName);

    return $name !== '' ? $name : 'Unknown applicant';
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

}
