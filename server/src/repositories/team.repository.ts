import { Team, ITeam } from '../models/Team.js';

export class TeamRepository {
  async list(onlyActive = true): Promise<ITeam[]> {
    const filter = onlyActive ? { isActive: true } : {};
    return Team.find(filter)
      .populate('leadId', 'name email')
      .populate('memberIds', 'name email role')
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<ITeam | null> {
    return Team.findById(id)
      .populate('leadId', 'name email')
      .populate('memberIds', 'name email role')
      .exec();
  }

  async create(data: Partial<ITeam>): Promise<ITeam> {
    const team = new Team(data);
    return team.save();
  }

  async update(id: string, data: Partial<ITeam>): Promise<ITeam | null> {
    return Team.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('leadId', 'name email')
      .populate('memberIds', 'name email role')
      .exec();
  }
}

export const teamRepository = new TeamRepository();
