export const TicketStatus = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_FOR_CUSTOMER: 'WAITING_FOR_CUSTOMER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
} as const;

export type TicketStatusType = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TicketPriorityType = (typeof TicketPriority)[keyof typeof TicketPriority];

export const PrioritySource = {
  HUMAN: 'HUMAN',
  AI: 'AI',
  SYSTEM: 'SYSTEM',
} as const;

export type PrioritySourceType = (typeof PrioritySource)[keyof typeof PrioritySource];

export const MessageType = {
  CUSTOMER_MESSAGE: 'CUSTOMER_MESSAGE',
  AGENT_MESSAGE: 'AGENT_MESSAGE',
  INTERNAL_NOTE: 'INTERNAL_NOTE',
  SYSTEM_EVENT: 'SYSTEM_EVENT',
} as const;

export type MessageTypeType = (typeof MessageType)[keyof typeof MessageType];

export const KBStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type KBStatusType = (typeof KBStatus)[keyof typeof KBStatus];

export const Sentiment = {
  POSITIVE: 'POSITIVE',
  NEUTRAL: 'NEUTRAL',
  NEGATIVE: 'NEGATIVE',
} as const;

export type SentimentType = (typeof Sentiment)[keyof typeof Sentiment];
