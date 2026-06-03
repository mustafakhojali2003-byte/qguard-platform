export interface Tenant {
  slug: string;
  companyName: string;
  companyNameEn: string;
  logo?: string;
  maxUsers: number;
  active: boolean;
  subscriptionEnd: string;
  createdAt: string;
  ownerEmail?: string;
  ownerName?: string;
  notes?: string;
}
