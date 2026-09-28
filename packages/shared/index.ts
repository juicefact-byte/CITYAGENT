export type Role = 'guest' | 'seeker' | 'owner' | 'hotel' | 'agent' | 'admin';
export type VerificationLevel = 'L1' | 'L2' | 'L3' | 'L4';
export type ListerKind = 'owner' | 'agent' | 'hotel' | 'manager';
export type PropertyStatus =
  | 'draft' | 'submitted' | 'in_review' | 'verified'
  | 'published' | 'viewing' | 'rented' | 'expired' | 'rejected';
export type ViewingStatus =
  | 'requested' | 'accepted' | 'rejected' | 'countered' | 'completed' | 'cancelled';
