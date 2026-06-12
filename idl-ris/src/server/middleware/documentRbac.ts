import { type Response, NextFunction } from 'express';
import type { AuthRequest } from '../types';

// Map document types to allowed roles
const documentTypeRoleMap: Record<string, string[]> = {
  // Sales documents - SALES team
  'SALES_RECEIPT': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
  'SALES_INVOICE': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
  'PROFORMA_INVOICE': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
  'QUOTATION': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
  'DELIVERY_NOTE': ['ADMIN', 'SALES', 'PROCUREMENT', 'AUDITOR'],

  // Cash/Receipt documents - SALES & FINANCE
  'CASH_RECEIPT': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],

  // Finance documents - FINANCE team only
  'PAYMENT_VOUCHER': ['ADMIN', 'FINANCE', 'AUDITOR'],
  'IMPREST_VOUCHER': ['ADMIN', 'FINANCE', 'AUDITOR'],
  'EXPENSE_VOUCHER': ['ADMIN', 'FINANCE', 'AUDITOR'],

  // Purchase documents - PROCUREMENT team
  'PURCHASE_RECEIPT': ['ADMIN', 'PROCUREMENT', 'FINANCE', 'AUDITOR'],
  'PURCHASE_INVOICE': ['ADMIN', 'PROCUREMENT', 'FINANCE', 'AUDITOR'],

  // Loan documents - FINANCE team only
  'LOAN_RECEIPT': ['ADMIN', 'FINANCE', 'AUDITOR'],
  'LOAN_REPAYMENT_RECEIPT': ['ADMIN', 'FINANCE', 'AUDITOR'],

  // Service documents - SALES/FINANCE
  'SERVICE_COMPLETION_CERTIFICATE': ['ADMIN', 'SALES', 'FINANCE', 'AUDITOR'],
};

export function authorizeDocumentAccess(req: AuthRequest, res: Response, next: NextFunction) {
  const userRole = req.user?.role;
  
  // Admin users have access to all document types
  if (userRole === 'ADMIN') {
    return next();
  }

  // For document creation, check against POST body
  if (req.method === 'POST' && req.body && req.body.docType) {
    const docType = req.body.docType;
    const allowedRoles = documentTypeRoleMap[docType] || ['ADMIN'];
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: `Forbidden: insufficient permissions to create ${docType} documents.` 
      });
    }
    return next();
  }

  // For document retrieval (GET requests), need to check document in database
  // This will be handled at the route level with actual document lookup
  return next();
}

// Helper function to check if user can access a specific document type
export function canAccessDocumentType(userRole: string, docType: string): boolean {
  if (userRole === 'ADMIN') return true;
  const allowedRoles = documentTypeRoleMap[docType] || ['ADMIN'];
  return allowedRoles.includes(userRole);
}
