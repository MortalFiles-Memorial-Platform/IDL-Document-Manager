export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
}

export interface DocumentType {
  id: number;
  docType: string;
  reference: string;
  status: string;
  approvalStatus: string;
  balanceDue: number;
}
