import {
  ServerOpportunity,
  VerificationResult,
  VerificationCheck,
  VerificationStatus,
  LifecycleStatus,
  SourceMetadata,
  DuplicateStatus,
  ExpiryStatus,
} from '../../types/opportunity.js';

export class VerificationService {
  public evaluate(
    opportunity: Partial<ServerOpportunity>,
    sourceMeta: SourceMetadata,
    duplicateStatus: DuplicateStatus,
    expiryStatus: ExpiryStatus,
    validationErrors: string[] = []
  ): VerificationResult {
    const checks: VerificationCheck[] = [];
    const warnings: string[] = [];
    const errors: string[] = [...validationErrors];

    // 1. Source Exists Check (Mandatory)
    const sourceExists = Boolean(sourceMeta && sourceMeta.sourceName && sourceMeta.sourceUrl);
    checks.push({
      name: 'SOURCE_EXISTS',
      passed: sourceExists,
      isMandatory: true,
      details: sourceExists
        ? `Provenanced source recorded: '${sourceMeta.sourceName}' (${sourceMeta.sourceUrl})`
        : 'Missing source provenance metadata',
    });
    if (!sourceExists) errors.push('Missing source provenance metadata');

    // 2. URL Validity Check (Mandatory)
    let urlValid = false;
    if (opportunity.official_url) {
      try {
        const u = new URL(opportunity.official_url);
        urlValid = ['http:', 'https:'].includes(u.protocol);
      } catch {
        urlValid = false;
      }
    }
    checks.push({
      name: 'URL_VALIDITY',
      passed: urlValid,
      isMandatory: true,
      details: urlValid
        ? `Official URL is valid: ${opportunity.official_url}`
        : `Invalid or missing official URL: ${opportunity.official_url}`,
    });
    if (!urlValid) errors.push('Official URL is invalid or malformed');

    // 3. Required Fields Exist Check (Mandatory)
    const hasRequiredFields = Boolean(
      opportunity.title &&
        opportunity.organization_name &&
        opportunity.category &&
        opportunity.description
    );
    checks.push({
      name: 'REQUIRED_FIELDS',
      passed: hasRequiredFields,
      isMandatory: true,
      details: hasRequiredFields
        ? 'All mandatory opportunity metadata fields are populated'
        : 'One or more required fields (title, org, category, description) missing',
    });
    if (!hasRequiredFields) errors.push('Required metadata fields missing');

    // 4. Expiry Check (Mandatory for Active/Verified state)
    const isNotExpired = expiryStatus !== 'expired';
    checks.push({
      name: 'EXPIRY_CHECK',
      passed: isNotExpired,
      isMandatory: true,
      details: isNotExpired
        ? `Opportunity is ${expiryStatus}`
        : 'Opportunity application deadline has passed',
    });
    if (!isNotExpired) errors.push('Opportunity is expired');

    // 5. Duplicate Check
    const isUnique = duplicateStatus === 'unique';
    checks.push({
      name: 'DUPLICATE_CHECK',
      passed: isUnique,
      isMandatory: false,
      details: isUnique
        ? 'Opportunity is unique in catalog'
        : `Duplicate status flag: ${duplicateStatus}`,
    });
    if (duplicateStatus === 'exact_duplicate') errors.push('Exact duplicate opportunity detected');
    if (duplicateStatus === 'possible_duplicate') warnings.push('Possible duplicate opportunity flagged for admin review');

    // 6. Source Trust Level Check
    const officialTypes: string[] = [
      'OFFICIAL_GOVERNMENT',
      'OFFICIAL_COMPANY',
      'OFFICIAL_UNIVERSITY',
      'OFFICIAL_FOUNDATION',
      'AUTHORIZED_PARTNER',
    ];
    const isOfficialTrust = officialTypes.includes(sourceMeta.sourceType.toUpperCase());
    checks.push({
      name: 'SOURCE_TRUST_LEVEL',
      passed: isOfficialTrust,
      isMandatory: false,
      details: isOfficialTrust
        ? `High trust source classification: ${sourceMeta.sourceType}`
        : `Standard trust classification: ${sourceMeta.sourceType}`,
    });
    if (!isOfficialTrust) {
      warnings.push(`Source '${sourceMeta.sourceName}' has type '${sourceMeta.sourceType}' requiring admin review.`);
    }

    // 7. Provenance Traceability Check
    const hasAuditTrail = Boolean(sourceMeta.sourceUrl && sourceMeta.sourceName);
    checks.push({
      name: 'PROVENANCE_TRACEABILITY',
      passed: hasAuditTrail,
      isMandatory: true,
      details: hasAuditTrail ? 'Full source provenance attached' : 'Incomplete provenance audit trail',
    });

    // 8. Data Consistency Check
    const rewardValid = opportunity.reward_amount === undefined || opportunity.reward_amount >= 0;
    checks.push({
      name: 'DATA_CONSISTENCY',
      passed: rewardValid,
      isMandatory: true,
      details: rewardValid ? 'Data consistency verified' : 'Inconsistent monetary reward values',
    });
    if (!rewardValid) errors.push('Inconsistent reward data');

    // Evaluate mandatory checks pass status
    const mandatoryChecks = checks.filter((c) => c.isMandatory);
    const allMandatoryPassed = mandatoryChecks.every((c) => c.passed);

    // Calculate baseline confidence
    const passedCount = checks.filter((c) => c.passed).length;
    let confidence = Number((passedCount / checks.length).toFixed(2));

    // Determine final status
    let status: VerificationStatus = 'unverified';
    let lifecycleStatus: LifecycleStatus = 'admin_review';

    if (!allMandatoryPassed || errors.length > 0) {
      // ABSOLUTE RULE: Failed mandatory check -> CANNOT BE VERIFIED
      if (expiryStatus === 'expired') {
        status = 'unverified';
        lifecycleStatus = 'expired';
      } else if (duplicateStatus === 'exact_duplicate') {
        status = 'unverified';
        lifecycleStatus = 'duplicate';
      } else {
        status = 'unverified';
        lifecycleStatus = 'rejected';
      }
    } else if (isOfficialTrust && warnings.length === 0 && duplicateStatus === 'unique') {
      status = 'verified';
      lifecycleStatus = 'published';
      confidence = Math.max(confidence, 0.95);
    } else if (isOfficialTrust || duplicateStatus === 'unique') {
      status = 'partially_verified';
      lifecycleStatus = 'admin_review';
      confidence = Math.min(confidence, 0.88);
    } else {
      status = 'unverified';
      lifecycleStatus = 'admin_review';
    }

    return {
      status,
      lifecycleStatus,
      confidence,
      checks,
      evidence: {
        sourceName: sourceMeta.sourceName,
        sourceUrl: sourceMeta.sourceUrl,
        sourceType: sourceMeta.sourceType,
        collectedAt: new Date().toISOString(),
        duplicateStatus,
        expiryStatus,
      },
      warnings,
      errors,
      verifiedAt: new Date().toISOString(),
    };
  }
}

export const verificationService = new VerificationService();
