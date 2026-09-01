export type UserRole = 'CUSTOMER' | 'AGENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  teamIds?: string[];
  avatar?: string;
}

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_CUSTOMER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type PrioritySource = 'HUMAN' | 'AI' | 'SYSTEM';
export type MessageType = 'CUSTOMER_MESSAGE' | 'AGENT_MESSAGE' | 'INTERNAL_NOTE' | 'SYSTEM_EVENT';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

export interface Category {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Team {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  leadId?: User;
  memberIds?: User[];
  isActive: boolean;
}

export interface Attachment {
  _id?: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  uploadedBy?: string;
  createdAt: string;
}

export interface TicketMessage {
  _id?: string;
  id: string;
  ticketId: string;
  authorId: User;
  authorRole: UserRole;
  type: MessageType;
  message: string;
  attachments?: Attachment[];
  createdAt: string;
}

export interface AIAnalysis {
  _id?: string;
  id: string;
  ticketId: string;
  category: string;
  priority: TicketPriority;
  sentiment: Sentiment;
  confidence: number;
  reason: string;
  model: string;
  createdAt: string;
}

export interface Ticket {
  _id?: string;
  id: string;
  ticketNumber: string;
  customerId: User;
  subject: string;
  description: string;
  categoryId: Category;
  priority: TicketPriority;
  prioritySource: PrioritySource;
  status: TicketStatus;
  assignedAgentId?: User;
  teamId?: Team;
  aiAnalysisId?: AIAnalysis;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  reopenedAt?: string;
  lastCustomerMessageAt?: string;
  lastAgentMessageAt?: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeBaseArticle {
  _id?: string;
  id: string;
  title: string;
  content: string;
  categoryId: Category;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdBy?: User;
  updatedBy?: User;
  createdAt: string;
}

export interface TicketFeedback {
  _id?: string;
  id: string;
  ticketId: string;
  customerId: User;
  rating: number;
  feedback?: string;
  createdAt: string;
}

export interface NotificationItem {
  _id?: string;
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  ticketId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  error?: {
    code: string;
    message: string;
    errors?: any[];
  };
}
