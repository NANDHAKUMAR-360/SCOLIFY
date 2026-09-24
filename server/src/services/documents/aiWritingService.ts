import { groqClient } from '../../integrations/groqClient.js';
import { FullCanonicalProfile, EducationRecord, SkillRecord, InterestRecord } from '../../types/profile.js';
import { ServerOpportunity } from '../../types/opportunity.js';
import { AIDraftType, AIDraftResult } from '../../types/readiness.js';
import { logger } from '../../utils/logger.js';

export class AIWritingService {
  /**
   * Generates application drafting assistance using ONLY verified student facts.
   * If Groq fails or is unavailable, returns null or throws.
   * NEVER invents facts, certificates, work experience, or scores.
   */
  async generateDraft(
    student: FullCanonicalProfile,
    opportunity: ServerOpportunity,
    draftType: AIDraftType,
    additionalContext?: {
      questionText?: string;
      promptGuidance?: string;
    }
  ): Promise<AIDraftResult> {

    if (!groqClient.isAvailable()) {
      throw new Error(
        'Groq AI writing assistance is currently unavailable. No simulated drafts are permitted.'
      );
    }

    // 1. Compile strictly verified student facts
    const verifiedFacts = this.compileVerifiedFacts(student);

    // 2. Build system and user prompt with strict trust boundary
    const systemPrompt = `You are Scolify's Application Writing Assistant.
STRICT TRUTH CONSTRAINTS:
1. You may ONLY use the student facts explicitly listed under "VERIFIED STUDENT FACTS".
2. NEVER invent work experience, employers, GPA, awards, certificates, or projects that are not listed.
3. If specific information is needed that is not provided, use explicit square bracket placeholders, such as:
   - [Add your project details here]
   - [Insert team or leadership experience]
   - [Detail any relevant coursework]
4. Draft in a professional, compelling, and academic/professional tone tailored to the target opportunity.
5. All drafts are proposals for the student to edit, review, and approve.
6. The very first line of your response MUST BE:
"AI-generated draft — review before use."`;

    const userPrompt = `TARGET OPPORTUNITY:
Title: ${opportunity.title}
Organization: ${opportunity.organization_name}
Category: ${opportunity.category}
Description: ${opportunity.description}

VERIFIED STUDENT FACTS:
- Name: ${student.profile?.full_name || '[Student Name]'}
- Degree & Education: ${verifiedFacts.educationSummary}
- Verified Skills: ${verifiedFacts.skillsList}
- Academic/Career Interests: ${verifiedFacts.interestsList}
- GPA: ${verifiedFacts.gpaSummary}

TASK:
Draft type requested: ${draftType}
${additionalContext?.questionText ? `Application Question: "${additionalContext.questionText}"` : ''}
${additionalContext?.promptGuidance ? `Student Guidance/Notes: "${additionalContext.promptGuidance}"` : ''}

Draft the requested ${this.getDraftTypeName(draftType)} adhering strictly to the above facts and rules.`;

    const result = await groqClient.generateCompletion(userPrompt, systemPrompt);

    if (!result || !result.text) {
      throw new Error('Groq AI generation call failed to produce content. Please try again.');
    }

    // Verify first line requirement
    let finalContent = result.text;
    if (!finalContent.includes('AI-generated draft — review before use.')) {
      finalContent = `AI-generated draft — review before use.\n\n${finalContent}`;
    }

    return {
      draftType,
      content: finalContent,
      generatedAt: new Date().toISOString(),
      model: 'llama-3.3-70b-versatile',
      disclaimer: 'AI-generated draft — review before use. Scolify requires explicit human approval before any external application action.',
      studentFactsUsed: {
        educationProvided: (student.education?.length || 0) > 0,
        skillsCount: student.skills?.length || 0,
        experienceProvided: false, // strictly tracked
        certificationsCount: 0,
      },
      humanApproved: false,
    };
  }

  private compileVerifiedFacts(student: FullCanonicalProfile) {
    const educationSummary =
      student.education && student.education.length > 0
        ? student.education
            .map(
              (e: EducationRecord) =>
                `${e.degree || 'Degree'} in ${e.field_of_study || 'Field'} at ${e.institution_name || 'Institution'} (${e.start_date?.slice(0, 4) || ''} - ${e.end_date?.slice(0, 4) || 'Present'})`
            )
            .join('; ')
        : 'Not provided in profile';

    const skillsList =
      student.skills && student.skills.length > 0
        ? student.skills.map((s: SkillRecord) => s.skill_name).join(', ')
        : 'None listed';

    const interestsList =
      student.interests && student.interests.length > 0
        ? student.interests.map((i: InterestRecord) => i.interest_tag).join(', ')
        : 'General academic opportunities';

    const gpaSummary =
      student.education && student.education.length > 0 && student.education[0].gpa
        ? `${student.education[0].gpa} / ${student.education[0].max_gpa || 4.0}`
        : 'Not specified in profile';

    return {
      educationSummary,
      skillsList,
      interestsList,
      gpaSummary,
    };
  }


  private getDraftTypeName(type: AIDraftType): string {
    switch (type) {
      case 'resume_tailoring':
        return 'Tailored Resume Summary & Key Highlights';
      case 'statement_of_purpose':
        return 'Statement of Purpose / Personal Statement';
      case 'scholarship_essay':
        return 'Scholarship Application Essay';
      case 'internship_email':
        return 'Professional Internship Cover Letter / Inquiry Email';
      case 'application_answer':
        return 'Application Short Answer Response';
      default:
        return 'Application Draft';
    }
  }
}

export const aiWritingService = new AIWritingService();
