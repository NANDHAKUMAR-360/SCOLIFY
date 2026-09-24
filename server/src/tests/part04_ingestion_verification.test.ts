import { sourceRegistry } from '../services/ingestion/sourceRegistry.js';
import { normalizationService } from '../services/ingestion/normalizationService.js';
import { validationService } from '../services/ingestion/validationService.js';
import { verificationService } from '../services/ingestion/verificationService.js';
import { ingestionService } from '../services/ingestion/ingestionService.js';
import { detectDuplicateStatus } from '../utils/duplicateDetector.js';
import { calculateExpiryStatus } from '../utils/expiryEngine.js';
import { RawOpportunity, ServerOpportunity, SourceMetadata } from '../types/opportunity.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedCount++;
  }
}

async function runPart04TestSuite() {
  console.log('\n==================================================');
  console.log('SCOLIFY PART 04 INGESTION & VERIFICATION TEST SUITE');
  console.log('==================================================\n');

  // 1. SOURCE ADAPTER TESTS
  console.log('--- 1. SOURCE ADAPTER TESTS ---');
  const demoAdapter = sourceRegistry.getAdapter('DEMO');
  const demoMeta = demoAdapter.getSourceMetadata();
  assert(demoMeta.sourceType === 'DEMO', 'DemoSourceAdapter returns DEMO sourceType');

  const demoItems = await demoAdapter.collect();
  assert(Array.isArray(demoItems) && demoItems.length >= 3, 'DemoSourceAdapter collects >= 3 sample records');

  const manualAdapter = sourceRegistry.getAdapter('MANUAL', {
    title: 'Test Manual Opp',
    organizationName: 'Test Org',
    officialUrl: 'https://test.org',
    description: 'Valid test description text for manual adapter',
  });
  const manualItems = await manualAdapter.collect();
  assert(manualItems.length === 1 && manualItems[0].title === 'Test Manual Opp', 'ManualSourceAdapter returns payload');

  // 2. NORMALIZATION TESTS
  console.log('\n--- 2. NORMALIZATION TESTS ---');
  const rawSample: RawOpportunity = {
    title: '   global   stem   scholarship 2026  ',
    organizationName: '  future leaders   foundation ',
    category: 'Scholarship Programs',
    officialUrl: 'https://example.org/path/#fragment',
    description: '  Test description  ',
    rewardAmount: 5000,
    applicationDeadline: '2026-11-30T00:00:00Z',
  };
  const normalized = normalizationService.normalize(rawSample);
  assert(normalized.title === 'Global Stem Scholarship 2026', 'Normalizes title whitespace & casing');
  assert(normalized.organization_name === 'future leaders   foundation', 'Trims organization name');
  assert(normalized.category === 'scholarship', 'Normalizes category string to canonical enum');
  assert(normalized.official_url === 'https://example.org/path/', 'Normalizes URL fragment');

  // 3. VALIDATION TESTS
  console.log('\n--- 3. VALIDATION TESTS ---');
  const invalidSample: Partial<ServerOpportunity> = {
    title: 'Short',
    organization_name: '',
    category: 'invalid_cat' as any,
    official_url: 'not-a-url',
    description: 'Short',
  };
  const valResult = validationService.validate(invalidSample, 'INVALID_TYPE');
  assert(!valResult.isValid, 'Validation fails for invalid fields');
  assert(valResult.errors.length >= 4, 'Reports errors for title length, org, category, and URL format');

  const validSample: Partial<ServerOpportunity> = {
    title: 'Valid International STEM Scholarship 2026',
    organization_name: 'Global Science Foundation',
    category: 'scholarship',
    official_url: 'https://example.org/stem-grant',
    description: 'Comprehensive research fellowship covering tuition and living expenses for students.',
    reward_amount: 10000,
    application_deadline: '2026-12-31T00:00:00Z',
  };
  const valValid = validationService.validate(validSample, 'OFFICIAL_FOUNDATION');
  assert(valValid.isValid, 'Validation succeeds for valid metadata');

  // 4. DUPLICATE DETECTOR TESTS
  console.log('\n--- 4. DUPLICATE DETECTOR TESTS ---');
  const catalog: ServerOpportunity[] = [
    {
      id: 'opp-100',
      title: 'Global STEM Fellowship',
      organization_name: 'Tech Foundation',
      category: 'fellowship',
      description: 'Existing catalog entry description text',
      official_url: 'https://example.org/stem-fellowship',
      is_remote: false,
      verification_status: 'verified',
      confidence_score: 0.95,
      lifecycle_status: 'published',
      duplicate_status: 'unique',
      expiry_status: 'active',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const exactDup = detectDuplicateStatus({ official_url: 'https://example.org/stem-fellowship' }, catalog);
  assert(exactDup.status === 'exact_duplicate', 'Detects exact duplicate URL');

  const possibleDup = detectDuplicateStatus({ title: 'Global STEM Fellowship 2026', organization_name: 'Tech Foundation' }, catalog);
  assert(possibleDup.status === 'possible_duplicate', 'Detects possible duplicate title/organization match');

  const uniqueOpp = detectDuplicateStatus({ official_url: 'https://example.org/unique-link', title: 'Unique Innovation Prize', organization_name: 'Different Org' }, catalog);
  assert(uniqueOpp.status === 'unique', 'Identifies unique opportunity');

  // 5. EXPIRY ENGINE TESTS
  console.log('\n--- 5. EXPIRY ENGINE TESTS ---');
  const pastDeadline = calculateExpiryStatus('2020-01-01T00:00:00Z');
  assert(pastDeadline.status === 'expired' && pastDeadline.isExpired, 'Identifies expired deadline');

  const futureDeadline = calculateExpiryStatus('2029-12-31T00:00:00Z');
  assert(futureDeadline.status === 'active' && !futureDeadline.isExpired, 'Identifies active future deadline');

  const noDeadline = calculateExpiryStatus(undefined);
  assert(noDeadline.status === 'no_deadline', 'Handles undefined deadline');

  // 6. VERIFICATION ENGINE TESTS
  console.log('\n--- 6. VERIFICATION ENGINE TESTS ---');

  // Rule: High confidence score MUST NEVER override a failed mandatory check
  const sourceMetaMissing: SourceMetadata = { sourceName: '', sourceType: 'DEMO', sourceUrl: '' };
  const verResultMissingSource = verificationService.evaluate(
    validSample,
    sourceMetaMissing,
    'unique',
    'active'
  );
  assert(
    verResultMissingSource.status !== 'verified',
    'CRITICAL TRUST: Missing mandatory source check prevents VERIFIED status'
  );

  const officialSourceMeta: SourceMetadata = {
    sourceName: 'Global Science Foundation Portal',
    sourceType: 'OFFICIAL_FOUNDATION',
    sourceUrl: 'https://example.org/stem-grant',
  };
  const verResultValid = verificationService.evaluate(
    validSample,
    officialSourceMeta,
    'unique',
    'active'
  );
  assert(
    verResultValid.status === 'verified' && verResultValid.lifecycleStatus === 'published',
    'Official trusted source with unique active data produces VERIFIED + PUBLISHED'
  );

  // 7. INGESTION PIPELINE & RESILIENCE TESTS
  console.log('\n--- 7. INGESTION PIPELINE TESTS ---');
  const ingestionResult = await ingestionService.executeIngestion('DEMO');
  assert(ingestionResult.run.status === 'completed', 'Ingestion run completes successfully');
  assert(ingestionResult.run.total_records >= 3, 'Ingestion run processes all demo batch items');
  assert(ingestionResult.processedItems.length === ingestionResult.run.total_records, 'Returns all processed items in output');

  console.log('\n==================================================');
  console.log(`TEST SUITE SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPart04TestSuite();
