export interface User {
  id: number;
  email: string;
  full_name: string;
  mobile_number?: string | null;
  is_active: boolean;
  is_verified: boolean;
  roles: string[];
  has_profile: boolean;
  created_at: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  applicant_type?: string | null;
  state?: string | null;
  district?: string | null;
  business_name?: string | null;
  business_stage?: string | null;
  sector?: string | null;
  registration_status?: string | null;
  business_age_months?: number | null;
  ownership_category?: string | null;
  annual_turnover_inr?: number | null;
  total_investment_inr?: number | null;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface SchemeSource {
  id: number;
  source_title: string;
  source_url: string;
  source_type: string;
  extracted_passage: string;
  provenance_fact: string;
  last_verified_date: string;
}

export interface SchemeDocument {
  id: number;
  document_name: string;
  document_category: string;
  is_mandatory: boolean;
  issuing_authority?: string | null;
  instructions?: string | null;
}

export interface SchemeRule {
  id: number;
  rule_code: string;
  rule_name: string;
  target_field: string;
  operator: string;
  expected_value: any;
  is_hard_requirement: boolean;
  failure_reason: string;
  source_reference?: string | null;
}

export interface Scheme {
  id: number;
  code: string;
  name: string;
  ministry: string;
  department?: string | null;
  brief_description: string;
  detailed_description?: string;
  target_beneficiaries?: string | null;
  benefits_summary: string;
  application_procedure?: string;
  official_portal_url: string;
  verification_status: 'Candidate' | 'Needs Review' | 'Verified' | 'Stale' | 'Superseded' | 'Rejected';
  verification_notes?: string | null;
  last_checked_date: string;
  effective_date?: string | null;
  sources?: SchemeSource[];
  documents?: SchemeDocument[];
  rules?: SchemeRule[];
}

export interface ConditionResult {
  rule_code: string;
  rule_name: string;
  target_field: string;
  status: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT_APPLICABLE';
  user_value: any;
  expected_value: any;
  reason: string;
  is_hard_requirement: boolean;
  source_reference?: string | null;
}

export interface Assessment {
  id: number;
  user_id: number;
  scheme_id: number;
  scheme: Scheme;
  overall_result: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT_APPLICABLE';
  match_score: number;
  passed_conditions: ConditionResult[];
  failed_conditions: ConditionResult[];
  missing_conditions: ConditionResult[];
  ai_explanation?: string | null;
  ai_provider_used?: string | null;
  sources_cited?: Array<{
    id: number;
    title: string;
    url: string;
    fact: string;
    type: string;
  }>;
  created_at: string;
}

export interface RecommendationItem {
  scheme: Scheme;
  overall_result: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT_APPLICABLE';
  match_score: number;
  passed_count: number;
  failed_count: number;
  missing_count: number;
}

export interface SavedScheme {
  id: number;
  user_id: number;
  scheme_id: number;
  scheme: Scheme;
  notes?: string | null;
  created_at: string;
}

export interface DocumentChecklistItem {
  id: number;
  user_id: number;
  scheme_id: number;
  document_id: number;
  document_name: string;
  document_category: string;
  is_mandatory: boolean;
  issuing_authority?: string | null;
  instructions?: string | null;
  status: 'missing' | 'in_progress' | 'available' | 'not_applicable';
  notes?: string | null;
  updated_at: string;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  deactivated_users: number;
  total_schemes: number;
  verification_breakdown: Record<string, number>;
  total_assessments: number;
  total_sources: number;
  total_audit_events: number;
  recent_activity_count: number;
}

export interface AdminUserItem {
  id: number;
  email: string;
  full_name: string;
  mobile_number?: string | null;
  is_active: boolean;
  roles: string[];
  has_profile: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export interface AuditLogItem {
  id: number;
  user_id?: number | null;
  user_email?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  ip_address?: string | null;
  details?: Record<string, any> | null;
  created_at: string;
}

export interface ScoreFactorBreakdown {
  eligibility_factor: number;
  profile_affinity_factor: number;
  verification_credibility_factor: number;
  evidence_completeness_factor: number;
  raw_score: number;
  has_hard_fail: boolean;
}

export interface ActionableNextStep {
  step_number: number;
  title: string;
  description: string;
  action_type: 'UPDATE_PROFILE' | 'DOCUMENT_PREPARATION' | 'PORTAL_APPLICATION' | 'CHECK_ELIGIBILITY';
  action_url?: string | null;
  deadline_note?: string | null;
}

export interface EnhancedRecommendationItem {
  scheme: Scheme;
  overall_result: 'PASS' | 'FAIL' | 'UNKNOWN' | 'NOT_APPLICABLE';
  match_score: number;
  passed_count: number;
  failed_count: number;
  missing_count: number;
  match_category: 'Strong potential match' | 'Potential match requiring more information' | 'Low match based on known conditions' | 'Unable to assess because reliable evidence is insufficient';
  score_factors: ScoreFactorBreakdown;
  next_steps: ActionableNextStep[];
  highlighted_reason: string;
}

export interface MissingProfileFieldItem {
  field: string;
  rule_name: string;
  prompt: string;
  why_it_matters: string;
}

export interface DocumentReadinessSummary {
  total_documents: number;
  mandatory_count: number;
  documents: SchemeDocument[];
}

export interface EligibilityGapAnalysis {
  scheme_id: number;
  scheme_name: string;
  overall_result: string;
  match_score: number;
  passed_rules: ConditionResult[];
  failed_rules: ConditionResult[];
  missing_profile_fields: MissingProfileFieldItem[];
  document_readiness: DocumentReadinessSummary;
  recommended_action: string;
  official_portal_url: string;
}

export interface MatchedSchemeBrief {
  id: number;
  code: string;
  name: string;
  ministry: string;
  portal_url: string;
  verification_status: string;
  relevance_summary: string;
}

export interface SchemeMatchCitation {
  scheme_id: number;
  scheme_name: string;
  source_title: string;
  source_url: string;
  evidence_excerpt: string;
}

export interface SuggestedAction {
  label: string;
  action_type: 'VIEW_SCHEME' | 'APPLY_FILTER' | 'UPDATE_PROFILE' | 'VISIT_PORTAL' | string;
  target_id?: number | null;
  url?: string | null;
  target_url?: string | null;
}

export interface AIQueryResponse {
  query?: string;
  answer?: string;
  answer_markdown: string;
  thought_process?: string | null;
  matched_schemes: MatchedSchemeBrief[];
  citations: SchemeMatchCitation[];
  suggested_actions: SuggestedAction[];
  evidence_sufficiency: 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';
  provider_used: string;
  retrieval_count: number;
  latency_ms: number;
}

export interface AIProviderStatusResponse {
  default_provider: string;
  ollama_available: boolean;
  gemini_available: boolean;
  active_provider: string;
  model_name: string;
  deterministic_fallback_ready: boolean;
  provider?: string;
  is_available?: boolean;
  details?: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  thought_process?: string | null;
  matched_schemes?: MatchedSchemeBrief[];
  citations?: SchemeMatchCitation[];
  suggested_actions?: SuggestedAction[];
  provider_used?: string;
  evidence_sufficiency?: 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';
  latency_ms?: number;
  timestamp?: string;
}

export interface AIChatRequest {
  message: string;
  history?: Array<{ role: string; content: string }>;
  scheme_id?: number | null;
  verified_only?: boolean;
  top_k?: number;
}

export interface AIChatResponse {
  reply: string;
  answer_markdown: string;
  thought_process?: string | null;
  matched_schemes: MatchedSchemeBrief[];
  citations: SchemeMatchCitation[];
  suggested_actions: SuggestedAction[];
  provider_used: string;
  evidence_sufficiency: 'SUFFICIENT' | 'PARTIAL' | 'INSUFFICIENT';
  is_fallback: boolean;
  retrieval_count: number;
  latency_ms: number;
  timestamp: string;
}

export interface PromptItem {
  title: string;
  query: string;
}

export interface PromptCategory {
  category: string;
  icon: string;
  prompts: PromptItem[];
}

export interface SuggestedPromptsResponse {
  categories: PromptCategory[];
}

export interface CatalogueCoverageStats {
  dataset_name: string;
  dataset_license: string;
  total_source_files_discovered: number;
  unique_source_files: number;
  duplicate_copies_detected: number;
  total_schemes_in_db: number;
  verified_count: number;
  candidate_count: number;
  needs_review_count: number;
  stale_count: number;
  superseded_count: number;
  rejected_count: number;
  total_sources_cited: number;
  total_rules_defined: number;
  total_documents_required: number;
  schemes_with_specific_portal_links: number;
}

