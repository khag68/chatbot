// services/agent.service.ts
import { PrismaClient } from '@prisma/client';
import { AgentResponse, CreateAgentDto, UpdateAgentDto } from '../types/agent.type';
//import { CreateAgentDto, UpdateAgentDto, AgentResponse, SearchParams } from '../types';

export class AgentService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createAgent(data: CreateAgentDto): Promise<AgentResponse> {
    try {
      // Vérifier que le shop existe
      const shopExists = await this.prisma.shop.findUnique({
        where: { id: data.shopId },
      });

      if (!shopExists) {
        throw new Error('Shop introuvable');
      }

      const agent = await this.prisma.agent.create({
        data: {
          shopId: data.shopId,
          identification: data.identification,
          role: data.role,
        },
        include: {
          shop: true,
        },
      });

      return agent;
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'agent: ${error.message}`);
    }
  }

  async getAgentById(id: string): Promise<AgentResponse | null> {
    try {
      const agent = await this.prisma.agent.findUnique({
        where: { id },
        include: {
          shop: true,
        },
      });

      return agent;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'agent: ${error.message}`);
    }
  }

  async getAgentsByShop(shopId: string, params: SearchParams = {}): Promise<AgentResponse[]> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      const agents = await this.prisma.agent.findMany({
        where: { shopId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          shop: true,
        },
      });

      return agents;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des agents: ${error.message}`);
    }
  }

  async getAllAgents(params: SearchParams = {}): Promise<AgentResponse[]> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      const agents = await this.prisma.agent.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          shop: true,
        },
      });

      return agents;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des agents: ${error.message}`);
    }
  }

  async updateAgent(id: string, data: UpdateAgentDto): Promise<AgentResponse> {
    try {
      const agent = await this.prisma.agent.update({
        where: { id },
        data: {
          ...(data.identification && { identification: data.identification }),
          ...(data.role !== undefined && { role: data.role }),
        },
        include: {
          shop: true,
        },
      });

      return agent;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'agent: ${error.message}`);
    }
  }

  async deleteAgent(id: string): Promise<void> {
    try {
      await this.prisma.agent.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'agent: ${error.message}`);
    }
  }

  async getAgentByIdentification(identification: string, shopId: string): Promise<AgentResponse | null> {
    try {
      const agent = await this.prisma.agent.findFirst({
        where: {
          identification,
          shopId,
        },
        include: {
          shop: true,
        },
      });

      return agent;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de l'agent: ${error.message}`);
    }
  }

  async getAgentsByRole(role: string, shopId?: string): Promise<AgentResponse[]> {
    try {
      const where: any = { role };
      
      if (shopId) {
        where.shopId = shopId;
      }

      const agents = await this.prisma.agent.findMany({
        where,
        include: {
          shop: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return agents;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche des agents par rôle: ${error.message}`);
    }
  }

  async countAgentsByShop(shopId: string): Promise<number> {
    try {
      const count = await this.prisma.agent.count({
        where: { shopId },
      });

      return count;
    } catch (error) {
      throw new Error(`Erreur lors du comptage des agents: ${error.message}`);
    }
  }
}