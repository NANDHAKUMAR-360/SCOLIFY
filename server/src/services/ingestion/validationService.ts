import { ServerOpportunity } from '../../types/opportunity.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ValidationService {
  public validate(normalized: Partial<ServerOpportunity>, sourceType?: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Title validation
    if (!normalized.title || normalized.title.trim().length === 0) {
      errors.push('Title is required');
    } else if (normalized.title.length < 5) {
      errors.push('Title must be at least 5 characters long');
    } else if (normalized.title.length > 255) {
      errors.push('Title exceeds maximum length of 255 characters');
    }

    // Organization name validation
    if (!normalized.organization_name || normalized.organization_name.trim().length === 0) {
      errors.push('Organization name is required');
    } else if (normalized.organization_name.length > 255) {
      errors.push('Organization name exceeds maximum length of 255 characters');
    }

    // Category validation
    const validCategories = [
      'scholarship',
      'internship',
      'fellowship',
      'competition',
      'grant',
      'research',
      'apprenticeship',
      'career',
      'other',
    ];
    if (!normalized.category || !validCategories.includes(normalized.category)) {
      errors.push(`Invalid category: '${normalized.category}'. Must be one of: ${validCategories.join(', ')}`);
    }

    // Description validation
    if (!normalized.description || normalized.description.trim().length === 0) {
      errors.push('Description is required');
    } else if (normalized.description.length < 15) {
      errors.push('Description must be at least 15 characters long');
    }

    // Official URL syntax & protocol validation
    if (!normalized.official_url || normalized.official_url.trim().length === 0) {
      errors.push('Official URL is required');
    } else {
      try {
        const urlObj = new URL(normalized.official_url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          errors.push(`Official URL must use http or https protocol (got '${urlObj.protocol}')`);
        }
      } catch {
        errors.push(`Official URL '${normalized.official_url}' is not a valid URL format`);
      }
    }

    // Reward amount validation
    if (normalized.reward_amount !== undefined) {
      if (normalized.reward_amount < 0) {
        errors.push('Reward amount cannot be negative');
      } else if (normalized.reward_amount > 10000000) {
        warnings.push('Reward amount exceeds $10,000,000 - please verify accuracy');
      }
    }

    // Deadline validation
    if (normalized.application_deadline) {
      const deadlineDate = new Date(normalized.application_deadline);
      if (isNaN(deadlineDate.getTime())) {
        errors.push('Application deadline is not a valid ISO date');
      }
    } else {
      warnings.push('No application deadline specified');
    }

    // Source type validation
    const validSourceTypes = [
      'OFFICIAL_GOVERNMENT',
      'OFFICIAL_COMPANY',
      'OFFICIAL_UNIVERSITY',
      'OFFICIAL_FOUNDATION',
      'AUTHORIZED_PARTNER',
      'CURATED',
      'MANUAL',
      'API',
      'RSS',
      'DEMO',
    ];
    if (sourceType && !validSourceTypes.includes(sourceType.toUpperCase())) {
      errors.push(`Unsupported source type: '${sourceType}'`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export const validationService = new ValidationService();
