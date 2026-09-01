import { TicketStatus, TicketStatusType } from '../constants/ticket.constants.js';
import { UserRole, UserRoleType } from '../constants/roles.js';
import { StateTransitionError } from '../errors/AppError.js';

export interface TransitionRule {
  from: TicketStatusType;
  to: TicketStatusType;
  allowedRoles: UserRoleType[];
  description?: string;
}

export class TicketStateMachine {
  private static readonly rules: TransitionRule[] = [
    // From OPEN
    { from: TicketStatus.OPEN, to: TicketStatus.ASSIGNED, allowedRoles: [UserRole.AGENT, UserRole.ADMIN] },
    { from: TicketStatus.OPEN, to: TicketStatus.IN_PROGRESS, allowedRoles: [UserRole.AGENT, UserRole.ADMIN] },
    { from: TicketStatus.OPEN, to: TicketStatus.CLOSED, allowedRoles: [UserRole.CUSTOMER, UserRole.ADMIN] },

    // From ASSIGNED
    { from: TicketStatus.ASSIGNED, to: TicketStatus.IN_PROGRESS, allowedRoles: [UserRole.AGENT, UserRole.ADMIN] },
    { from: TicketStatus.ASSIGNED, to: TicketStatus.OPEN, allowedRoles: [UserRole.ADMIN] }, // Unassign

    // From IN_PROGRESS
    { from: TicketStatus.IN_PROGRESS, to: TicketStatus.WAITING_FOR_CUSTOMER, allowedRoles: [UserRole.AGENT, UserRole.ADMIN] },
    { from: TicketStatus.IN_PROGRESS, to: TicketStatus.RESOLVED, allowedRoles: [UserRole.AGENT, UserRole.ADMIN] },

    // From WAITING_FOR_CUSTOMER
    { from: TicketStatus.WAITING_FOR_CUSTOMER, to: TicketStatus.IN_PROGRESS, allowedRoles: [UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN] },
    { from: TicketStatus.WAITING_FOR_CUSTOMER, to: TicketStatus.RESOLVED, allowedRoles: [UserRole.AGENT, UserRole.ADMIN] },

    // From RESOLVED
    { from: TicketStatus.RESOLVED, to: TicketStatus.CLOSED, allowedRoles: [UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN] },
    { from: TicketStatus.RESOLVED, to: TicketStatus.REOPENED, allowedRoles: [UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN] },

    // From CLOSED
    { from: TicketStatus.CLOSED, to: TicketStatus.REOPENED, allowedRoles: [UserRole.CUSTOMER, UserRole.AGENT, UserRole.ADMIN] },

    // From REOPENED
    { from: TicketStatus.REOPENED, to: TicketStatus.IN_PROGRESS, allowedRoles: [UserRole.AGENT, UserRole.ADMIN] },
    { from: TicketStatus.REOPENED, to: TicketStatus.ASSIGNED, allowedRoles: [UserRole.AGENT, UserRole.ADMIN] },
    { from: TicketStatus.REOPENED, to: TicketStatus.RESOLVED, allowedRoles: [UserRole.AGENT, UserRole.ADMIN] },
  ];

  public static canTransition(
    from: TicketStatusType,
    to: TicketStatusType,
    role: UserRoleType
  ): boolean {
    if (from === to) return false;

    const matchedRule = this.rules.find(
      (r) => r.from === from && r.to === to && r.allowedRoles.includes(role)
    );

    return !!matchedRule;
  }

  public static validateTransition(
    from: TicketStatusType,
    to: TicketStatusType,
    role: UserRoleType
  ): void {
    if (!this.canTransition(from, to, role)) {
      throw new StateTransitionError(
        `Transition from status '${from}' to '${to}' is not permitted for role '${role}'.`
      );
    }
  }

  public static getAllowedNextStates(from: TicketStatusType, role: UserRoleType): TicketStatusType[] {
    return this.rules
      .filter((r) => r.from === from && r.allowedRoles.includes(role))
      .map((r) => r.to);
  }
}
