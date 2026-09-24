import { StructuredRequirement } from '../../types/opportunity.js';
import { FullCanonicalProfile } from '../../types/profile.js';
import { EvaluatedRequirement, RuleEvaluationStatus, RequirementOperator } from '../../types/eligibility.js';

export class RequirementEvaluator {
  public evaluate(
    requirement: StructuredRequirement,
    profile: FullCanonicalProfile
  ): EvaluatedRequirement {
    const type = (requirement.requirement_type || '').toLowerCase().trim();
    const criteria = requirement.criteria_json || {};
    const isMandatory = requirement.is_mandatory !== undefined ? requirement.is_mandatory : true;
    const operator: RequirementOperator = (criteria.operator as RequirementOperator) || 'EQUALS';
    const targetValue = criteria.value;
    const desc = criteria.description || `${type.toUpperCase()} requirement: ${operator} ${JSON.stringify(targetValue)}`;

    switch (type) {
      case 'gpa':
        return this.evaluateGpa(requirement, criteria, profile, isMandatory, operator, targetValue, desc);

      case 'degree':
        return this.evaluateDegree(requirement, profile, isMandatory, operator, targetValue, desc);

      case 'field_of_study':
      case 'major':
      case 'course':
        return this.evaluateFieldOfStudy(requirement, profile, isMandatory, operator, targetValue, desc);

      case 'year':
      case 'academic_year':
        return this.evaluateAcademicYear(requirement, profile, isMandatory, operator, targetValue, desc);

      case 'skill':
      case 'skills':
        return this.evaluateSkill(requirement, profile, isMandatory, operator, targetValue, desc);

      case 'location':
      case 'country':
        return this.evaluateLocation(requirement, profile, isMandatory, operator, targetValue, desc);

      case 'income':
      case 'family_income':
        return this.evaluateIncome(requirement, profile, isMandatory, operator, targetValue, desc);

      case 'age':
        return this.evaluateAge(requirement, profile, isMandatory, operator, targetValue, desc);

      case 'experience':
        return this.evaluateExperience(requirement, profile, isMandatory, operator, targetValue, desc);

      case 'mandatory_profile_field':
        return this.evaluateMandatoryField(requirement, criteria, profile, isMandatory, desc);

      case 'document':
      case 'certificate':
      case 'resume':
      case 'cv':
      case 'transcript':
      case 'marksheet':
      case 'essay':
      case 'income_certificate':
      case 'community_certificate':
      case 'bonafide_certificate':
      case 'college_id':
      case 'recommendation':
      case 'portfolio':
        // Application document and certificate requirements are handled by Document Intelligence & Gap Engine
        return {
          requirementId: requirement.id,
          type,
          description: desc,
          isMandatory,
          status: 'PASS',
          operator,
          requiredValue: targetValue,
          actualStudentValue: 'Handled via Document Intelligence Vault',
          evidence: 'Document requirement evaluated and verified via Document Intelligence layer.',
          sourceField: type,
        };

      default:
        return {
          requirementId: requirement.id,
          type,
          description: desc,
          isMandatory,
          status: 'MORE_INFO',

          operator,
          requiredValue: targetValue,
          actualStudentValue: undefined,
          evidence: `Requirement type '${type}' requires additional manual clarification.`,
          sourceField: type,
          reason: `Requirement type '${type}' is currently evaluated under MORE_INFO rule boundary.`,
        };
    }
  }

  // 1. GPA Evaluator
  private evaluateGpa(
    req: StructuredRequirement,
    criteria: any,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    operator: RequirementOperator,
    targetValue: any,
    desc: string
  ): EvaluatedRequirement {
    const primaryEdu = profile.education[0];
    if (!primaryEdu || primaryEdu.gpa === undefined || primaryEdu.gpa === null) {
      return {
        requirementId: req.id,
        type: 'gpa',
        description: desc,
        isMandatory,
        status: 'MORE_INFO',
        operator,
        requiredValue: targetValue,
        actualStudentValue: undefined,
        evidence: 'No GPA recorded in student academic education profile.',
        sourceField: 'education.gpa',
        reason: 'GPA details are missing. Please complete your academic education details to evaluate this requirement.',
      };
    }

    const studentGpa = Number(primaryEdu.gpa);
    const studentMaxGpa = Number(primaryEdu.max_gpa || 4.0);
    const reqValue = Number(targetValue);

    // Scale safety check: Prompt #16 ("If conversion is required but no trustworthy conversion rule exists, return MORE_INFO.")
    if (reqValue > 4.0 && studentMaxGpa <= 4.0) {
      return {
        requirementId: req.id,
        type: 'gpa',
        description: desc,
        isMandatory,
        status: 'MORE_INFO',
        operator,
        requiredValue: targetValue,
        actualStudentValue: `${studentGpa} / ${studentMaxGpa}`,
        evidence: `Student GPA scale (${studentMaxGpa}.0) differs from requirement scale (${reqValue} threshold) without explicit conversion policy.`,
        sourceField: 'education.gpa',
        reason: 'GPA scale mismatch without explicit conversion rule.',
      };
    }

    let passed = false;
    if (operator === 'GREATER_THAN_OR_EQUAL') passed = studentGpa >= reqValue;
    else if (operator === 'LESS_THAN_OR_EQUAL') passed = studentGpa <= reqValue;
    else passed = studentGpa === reqValue;

    const status: RuleEvaluationStatus = passed ? 'PASS' : 'FAIL';

    return {
      requirementId: req.id,
      type: 'gpa',
      description: desc,
      isMandatory,
      status,
      operator,
      requiredValue: `${operator} ${reqValue}`,
      actualStudentValue: studentGpa,
      evidence: `Student GPA = ${studentGpa} (Max ${studentMaxGpa}). Required: ${operator} ${reqValue}.`,
      sourceField: 'education.gpa',
    };
  }

  // 2. Degree Evaluator
  private evaluateDegree(
    req: StructuredRequirement,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    operator: RequirementOperator,
    targetValue: any,
    desc: string
  ): EvaluatedRequirement {
    if (profile.education.length === 0) {
      return {
        requirementId: req.id,
        type: 'degree',
        description: desc,
        isMandatory,
        status: 'MORE_INFO',
        operator,
        requiredValue: targetValue,
        actualStudentValue: undefined,
        evidence: 'No education records found in student profile.',
        sourceField: 'education.degree',
        reason: 'Education profile is incomplete.',
      };
    }

    const studentDegrees = profile.education.map((e) => e.degree.toLowerCase().trim());
    const targetStr = String(targetValue).toLowerCase().trim();

    let passed = false;
    if (operator === 'EQUALS') {
      passed = studentDegrees.some((d) => d === targetStr);
    } else if (operator === 'CONTAINS') {
      passed = studentDegrees.some((d) => d.includes(targetStr) || targetStr.includes(d));
    } else if (operator === 'IN_LIST' && Array.isArray(targetValue)) {
      const targetList = targetValue.map((t) => String(t).toLowerCase().trim());
      passed = studentDegrees.some((d) => targetList.includes(d));
    } else {
      passed = studentDegrees.some((d) => d.includes(targetStr));
    }

    const actualDegree = profile.education[0]?.degree || 'None';

    return {
      requirementId: req.id,
      type: 'degree',
      description: desc,
      isMandatory,
      status: passed ? 'PASS' : 'FAIL',
      operator,
      requiredValue: targetValue,
      actualStudentValue: actualDegree,
      evidence: `Student degree: '${actualDegree}'. Required: '${targetValue}'.`,
      sourceField: 'education.degree',
    };
  }

  // 3. Field of Study Evaluator
  private evaluateFieldOfStudy(
    req: StructuredRequirement,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    operator: RequirementOperator,
    targetValue: any,
    desc: string
  ): EvaluatedRequirement {
    if (profile.education.length === 0) {
      return {
        requirementId: req.id,
        type: 'field_of_study',
        description: desc,
        isMandatory,
        status: 'MORE_INFO',
        operator,
        requiredValue: targetValue,
        actualStudentValue: undefined,
        evidence: 'No academic field of study recorded.',
        sourceField: 'education.field_of_study',
        reason: 'Academic field of study is required to evaluate eligibility.',
      };
    }

    const studentFields = profile.education.map((e) => e.field_of_study.toLowerCase().trim());
    const targetStr = String(targetValue).toLowerCase().trim();

    let passed = false;
    if (operator === 'EQUALS') {
      passed = studentFields.some((f) => f === targetStr);
    } else if (operator === 'CONTAINS') {
      passed = studentFields.some((f) => f.includes(targetStr) || targetStr.includes(f));
    } else if (operator === 'IN_LIST' && Array.isArray(targetValue)) {
      const targetList = targetValue.map((t) => String(t).toLowerCase().trim());
      passed = studentFields.some((f) => targetList.some((t) => f.includes(t) || t.includes(f)));
    } else {
      passed = studentFields.some((f) => f.includes(targetStr) || targetStr.includes(f));
    }

    const actualField = profile.education[0]?.field_of_study || 'None';

    return {
      requirementId: req.id,
      type: 'field_of_study',
      description: desc,
      isMandatory,
      status: passed ? 'PASS' : 'FAIL',
      operator,
      requiredValue: targetValue,
      actualStudentValue: actualField,
      evidence: `Student field of study: '${actualField}'. Required: '${targetValue}'.`,
      sourceField: 'education.field_of_study',
    };
  }

  // 4. Academic Year Evaluator
  private evaluateAcademicYear(
    req: StructuredRequirement,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    operator: RequirementOperator,
    targetValue: any,
    desc: string
  ): EvaluatedRequirement {
    const primaryEdu = profile.education[0];
    if (!primaryEdu || !primaryEdu.start_date) {
      return {
        requirementId: req.id,
        type: 'year',
        description: desc,
        isMandatory,
        status: 'MORE_INFO',
        operator,
        requiredValue: targetValue,
        actualStudentValue: undefined,
        evidence: 'Education start date missing from profile.',
        sourceField: 'education.start_date',
        reason: 'Academic year cannot be determined without education start date.',
      };
    }

    const startYear = new Date(primaryEdu.start_date).getFullYear();
    const currentYear = new Date().getFullYear();
    const studentYearOfStudy = Math.max(1, currentYear - startYear + 1);

    const targetNum = Number(targetValue);
    let passed = false;

    if (!isNaN(targetNum)) {
      if (operator === 'GREATER_THAN_OR_EQUAL') passed = studentYearOfStudy >= targetNum;
      else if (operator === 'LESS_THAN_OR_EQUAL') passed = studentYearOfStudy <= targetNum;
      else passed = studentYearOfStudy === targetNum;
    } else {
      const textSearch = `${studentYearOfStudy} Year`.toLowerCase();
      passed = textSearch.includes(String(targetValue).toLowerCase());
    }

    return {
      requirementId: req.id,
      type: 'year',
      description: desc,
      isMandatory,
      status: passed ? 'PASS' : 'FAIL',
      operator,
      requiredValue: targetValue,
      actualStudentValue: `Year ${studentYearOfStudy}`,
      evidence: `Calculated student academic year: Year ${studentYearOfStudy} (Started ${startYear}). Required: ${targetValue}.`,
      sourceField: 'education.start_date',
    };
  }

  // 5. Skill Evaluator
  private evaluateSkill(
    req: StructuredRequirement,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    operator: RequirementOperator,
    targetValue: any,
    desc: string
  ): EvaluatedRequirement {
    const studentSkills = profile.skills.map((s) => s.skill_name.toLowerCase().trim());

    if (studentSkills.length === 0) {
      return {
        requirementId: req.id,
        type: 'skill',
        description: desc,
        isMandatory,
        status: 'MORE_INFO',
        operator,
        requiredValue: targetValue,
        actualStudentValue: [],
        evidence: 'No skills listed in student profile.',
        sourceField: 'skills.skill_name',
        reason: 'Please add your technical/domain skills to evaluate skill requirements.',
      };
    }

    const targetStr = String(targetValue).toLowerCase().trim();
    let passed = false;

    if (operator === 'IN_LIST' && Array.isArray(targetValue)) {
      const list = targetValue.map((t) => String(t).toLowerCase().trim());
      passed = studentSkills.some((s) => list.includes(s));
    } else {
      passed = studentSkills.some((s) => s.includes(targetStr) || targetStr.includes(s));
    }

    return {
      requirementId: req.id,
      type: 'skill',
      description: desc,
      isMandatory,
      status: passed ? 'PASS' : 'FAIL',
      operator,
      requiredValue: targetValue,
      actualStudentValue: profile.skills.map((s) => s.skill_name),
      evidence: `Student skills: [${profile.skills.map((s) => s.skill_name).join(', ')}]. Required skill: '${targetValue}'.`,
      sourceField: 'skills.skill_name',
    };
  }

  // 6. Location Evaluator
  private evaluateLocation(
    req: StructuredRequirement,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    operator: RequirementOperator,
    targetValue: any,
    desc: string
  ): EvaluatedRequirement {
    const studentCountry = profile.student.country || '';
    const studentState = profile.student.state || '';
    const studentCity = profile.student.city || '';

    if (!studentCountry && !studentState && !studentCity) {
      return {
        requirementId: req.id,
        type: 'location',
        description: desc,
        isMandatory,
        status: 'MORE_INFO',
        operator,
        requiredValue: targetValue,
        actualStudentValue: undefined,
        evidence: 'Location information missing from student profile.',
        sourceField: 'students.country',
        reason: 'Country/Location details are missing in your profile.',
      };
    }

    const locCombined = `${studentCity} ${studentState} ${studentCountry}`.toLowerCase().trim();
    const targetStr = String(targetValue).toLowerCase().trim();

    let passed = false;
    if (targetStr.includes('global') || targetStr.includes('remote') || targetStr.includes('any')) {
      passed = true;
    } else if (operator === 'IN_LIST' && Array.isArray(targetValue)) {
      const list = targetValue.map((t) => String(t).toLowerCase().trim());
      passed = list.some((loc) => locCombined.includes(loc));
    } else {
      passed = locCombined.includes(targetStr) || targetStr.includes(studentCountry.toLowerCase());
    }

    return {
      requirementId: req.id,
      type: 'location',
      description: desc,
      isMandatory,
      status: passed ? 'PASS' : 'FAIL',
      operator,
      requiredValue: targetValue,
      actualStudentValue: `${studentCity}, ${studentState}, ${studentCountry}`.replace(/^,\s*|,\s*$/g, ''),
      evidence: `Student location: '${studentCountry}'. Required location: '${targetValue}'.`,
      sourceField: 'students.country',
    };
  }

  // 7. Income Evaluator
  private evaluateIncome(
    req: StructuredRequirement,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    operator: RequirementOperator,
    targetValue: any,
    desc: string
  ): EvaluatedRequirement {
    // Prompt #21: Treat income as sensitive. If missing -> MORE_INFO.
    return {
      requirementId: req.id,
      type: 'income',
      description: desc,
      isMandatory,
      status: 'MORE_INFO',
      operator,
      requiredValue: targetValue,
      actualStudentValue: undefined,
      evidence: 'Family income information is required to evaluate financial threshold criteria.',
      sourceField: 'students.income',
      reason: 'Family income information is missing or unverified. Please provide income documentation for financial grant eligibility.',
    };
  }

  // 8. Age Evaluator
  private evaluateAge(
    req: StructuredRequirement,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    operator: RequirementOperator,
    targetValue: any,
    desc: string
  ): EvaluatedRequirement {
    const dobStr = profile.student.date_of_birth;
    if (!dobStr) {
      return {
        requirementId: req.id,
        type: 'age',
        description: desc,
        isMandatory,
        status: 'MORE_INFO',
        operator,
        requiredValue: targetValue,
        actualStudentValue: undefined,
        evidence: 'Date of birth is missing from student profile.',
        sourceField: 'students.date_of_birth',
        reason: 'Date of birth is required to calculate age eligibility.',
      };
    }

    const dob = new Date(dobStr);
    if (isNaN(dob.getTime())) {
      return {
        requirementId: req.id,
        type: 'age',
        description: desc,
        isMandatory,
        status: 'MORE_INFO',
        operator,
        requiredValue: targetValue,
        actualStudentValue: dobStr,
        evidence: 'Invalid Date of birth format.',
        sourceField: 'students.date_of_birth',
        reason: 'Invalid date of birth format.',
      };
    }

    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    const calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);

    const targetAge = Number(targetValue);
    let passed = false;

    if (operator === 'GREATER_THAN_OR_EQUAL') passed = calculatedAge >= targetAge;
    else if (operator === 'LESS_THAN_OR_EQUAL') passed = calculatedAge <= targetAge;
    else passed = calculatedAge === targetAge;

    return {
      requirementId: req.id,
      type: 'age',
      description: desc,
      isMandatory,
      status: passed ? 'PASS' : 'FAIL',
      operator,
      requiredValue: `${operator} ${targetAge}`,
      actualStudentValue: calculatedAge,
      evidence: `Calculated student age: ${calculatedAge} years. Required: ${operator} ${targetAge}.`,
      sourceField: 'students.date_of_birth',
    };
  }

  // 9. Experience Evaluator
  private evaluateExperience(
    req: StructuredRequirement,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    operator: RequirementOperator,
    targetValue: any,
    desc: string
  ): EvaluatedRequirement {
    // Prompt #23: Structured experience missing -> MORE_INFO
    return {
      requirementId: req.id,
      type: 'experience',
      description: desc,
      isMandatory,
      status: 'MORE_INFO',
      operator,
      requiredValue: targetValue,
      actualStudentValue: undefined,
      evidence: 'Structured work experience records require additional profile detail.',
      sourceField: 'experience',
      reason: 'Work experience requirements require manual verification or resume parsing.',
    };
  }

  // 10. Mandatory Profile Field Evaluator
  private evaluateMandatoryField(
    req: StructuredRequirement,
    criteria: any,
    profile: FullCanonicalProfile,
    isMandatory: boolean,
    desc: string
  ): EvaluatedRequirement {
    const fieldName = criteria.field || 'profile';
    let val: any = undefined;

    if (fieldName === 'gpa') val = profile.education[0]?.gpa;
    else if (fieldName === 'country') val = profile.student.country;
    else if (fieldName === 'bio') val = profile.student.bio;
    else if (fieldName === 'skills') val = profile.skills.length > 0 ? profile.skills : undefined;

    const hasVal = val !== undefined && val !== null && val !== '';

    return {
      requirementId: req.id,
      type: 'mandatory_profile_field',
      description: desc,
      isMandatory,
      status: hasVal ? 'PASS' : 'MORE_INFO',
      operator: 'EQUALS',
      requiredValue: `Populated ${fieldName}`,
      actualStudentValue: hasVal ? 'Populated' : 'Missing',
      evidence: hasVal ? `Profile field '${fieldName}' is populated.` : `Profile field '${fieldName}' is missing.`,
      sourceField: `student.${fieldName}`,
    };
  }
}

export const requirementEvaluator = new RequirementEvaluator();
