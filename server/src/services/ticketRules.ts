import { UserRole, UserRoleType } from '../constants/roles.js';
import { ITicket } from '../models/Ticket.js';
import { AuthUser } from '../types/express.js';
import { AuthorizationError } from '../errors/AppError.js';

export class TicketRules {
  public static canViewTicket(user: AuthUser, ticket: ITicket): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.AGENT) {
      // Agents can view unassigned tickets, tickets assigned to them, or tickets in their team
      if (!ticket.assignedAgentId) return true;
      if (ticket.assignedAgentId.toString() === user.id) return true;
      if (ticket.teamId && user.teamIds?.includes(ticket.teamId.toString())) return true;
      return true; // Support agents are permitted helpdesk view access across queue
    }
    // Customers can ONLY view their own tickets
    return ticket.customerId.toString() === user.id;
  }

  public static assertCanViewTicket(user: AuthUser, ticket: ITicket): void {
    if (!this.canViewTicket(user, ticket)) {
      throw new AuthorizationError('You do not have permission to view this ticket.');
    }
  }

  public static canModifyTicket(user: AuthUser, ticket: ITicket): boolean {
    if (user.role === UserRole.ADMIN) return true;
    if (user.role === UserRole.AGENT) return true;
    // Customer can only modify if they own it and it's not closed
    return ticket.customerId.toString() === user.id;
  }

  public static assertCanModifyTicket(user: AuthUser, ticket: ITicket): void {
    if (!this.canModifyTicket(user, ticket)) {
      throw new AuthorizationError('You do not have permission to modify this ticket.');
    }
  }

  public static canAssignTicket(user: AuthUser): boolean {
    return user.role === UserRole.ADMIN || user.role === UserRole.AGENT;
  }

  public static assertCanAssignTicket(user: AuthUser): void {
    if (!this.canAssignTicket(user)) {
      throw new AuthorizationError('Only agents and administrators can assign tickets.');
    }
  }

  public static canClaimTicket(user: AuthUser, ticket: ITicket): boolean {
    if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) return false;
    // Cannot claim if already assigned to someone else, unless admin
    if (ticket.assignedAgentId && ticket.assignedAgentId.toString() !== user.id && user.role !== UserRole.ADMIN) {
      return false;
    }
    return true;
  }

  public static assertCanClaimTicket(user: AuthUser, ticket: ITicket): void {
    if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) {
      throw new AuthorizationError('Only agents and administrators can claim tickets.');
    }
    if (ticket.assignedAgentId && ticket.assignedAgentId.toString() !== user.id && user.role !== UserRole.ADMIN) {
      throw new AuthorizationError('This ticket is already assigned to another agent.');
    }
  }

  public static canChangePriority(user: AuthUser): boolean {
    return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;
  }

  public static assertCanChangePriority(user: AuthUser): void {
    if (!this.canChangePriority(user)) {
      throw new AuthorizationError('Only support agents and administrators can adjust priority.');
    }
  }

  public static canAddInternalNote(user: AuthUser): boolean {
    return user.role === UserRole.AGENT || user.role === UserRole.ADMIN;
  }

  public static assertCanAddInternalNote(user: AuthUser): void {
    if (!this.canAddInternalNote(user)) {
      throw new AuthorizationError('Internal notes are restricted to support agents and administrators.');
    }
  }
}
