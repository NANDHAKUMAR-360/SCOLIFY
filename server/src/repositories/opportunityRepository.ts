import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { BaseRepository } from './baseRepository.js';
import { ServerOpportunity, OpportunityFilterQuery, VerificationStatus, LifecycleStatus } from '../types/opportunity.js';

export class OpportunityRepository extends BaseRepository<ServerOpportunity> {
  constructor() {
    super('opportunities');
  }

  async queryOpportunities(filter: OpportunityFilterQuery): Promise<{ items: ServerOpportunity[]; total: number }> {
    let query = supabaseAdmin.from('opportunities').select('*, opportunity_sources(*), opportunity_requirements(*)', { count: 'exact' });

    // Determine if this is an admin query bypass for verification/review workflows
    const isAdminQuery = Boolean(
      filter.verificationStatus || filter.lifecycleStatus || filter.includeUnpublished
    );

    if (!isAdminQuery) {
      // Student-facing default: Only active published opportunities
      query = query.eq('is_active', true);
      // Default student view MUST strictly expose ONLY fully VERIFIED opportunities
      query = query.eq('verification_status', 'verified');
      // Expose only PUBLISHED opportunities to normal student feed
      query = query.or('lifecycle_status.eq.published,lifecycle_status.is.null');
      // Filter out expired opportunities from default feed
      query = query.neq('expiry_status', 'expired');
    } else {
      if (filter.verificationStatus) {
        query = query.eq('verification_status', filter.verificationStatus);
      }
      if (filter.lifecycleStatus) {
        query = query.eq('lifecycle_status', filter.lifecycleStatus);
      }
    }

    if (filter.category) {
      query = query.eq('category', filter.category);
    }

    if (filter.isRemote !== undefined) {
      query = query.eq('is_remote', filter.isRemote);
    }

    if (filter.search) {
      const searchTerm = `%${filter.search}%`;
      query = query.or(`title.ilike.${searchTerm},description.ilike.${searchTerm},organization_name.ilike.${searchTerm}`);
    }

    query = query.order('created_at', { ascending: false });

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      return { items: [], total: 0 };
    }

    return {
      items: (data as any[]) || [],
      total: count || 0,
    };
  }

  async createOpportunity(opportunity: Partial<ServerOpportunity>): Promise<ServerOpportunity> {
    const { data, error } = await supabaseAdmin
      .from('opportunities')
      .insert({
        title: opportunity.title,
        organization_name: opportunity.organization_name,
        category: opportunity.category,
        description: opportunity.description,
        reward_amount: opportunity.reward_amount,
        currency: opportunity.currency || 'USD',
        location: opportunity.location,
        is_remote: Boolean(opportunity.is_remote),
        application_deadline: opportunity.application_deadline,
        official_url: opportunity.official_url,
        verification_status: opportunity.verification_status || 'unverified',
        confidence_score: opportunity.confidence_score || 0.85,
        verification_reasoning: opportunity.verification_reasoning || '',
        lifecycle_status: opportunity.lifecycle_status || 'admin_review',
        duplicate_status: opportunity.duplicate_status || 'unique',
        expiry_status: opportunity.expiry_status || 'active',
        is_active: opportunity.is_active !== undefined ? opportunity.is_active : true,
      })
      .select()
      .single();

    if (error) throw error;
    return data as ServerOpportunity;
  }

  async updateVerification(
    id: string,
    verificationStatus: VerificationStatus,
    verificationReasoning: string,
    adminUserId: string,
    lifecycleStatus: LifecycleStatus = 'verified'
  ): Promise<ServerOpportunity> {
    const { data, error } = await supabaseAdmin
      .from('opportunities')
      .update({
        verification_status: verificationStatus,
        verification_reasoning: verificationReasoning,
        verified_by: adminUserId,
        verified_at: new Date().toISOString(),
        lifecycle_status: lifecycleStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const opportunityRepository = new OpportunityRepository();
