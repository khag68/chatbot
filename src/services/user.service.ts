// services/user.service.ts
import { PrismaClient } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserResponse } from '../types/user.type';
import { SearchParams } from '../types/search.type';
//import { CreateUserDto, UpdateUserDto, UserResponse, SearchParams } from '../types';

export class UserService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createUser(data: CreateUserDto): Promise<UserResponse> {
    try {
      // Vérifier que le shop existe
      const shopExists = await this.prisma.shop.findUnique({
        where: { id: data.shopId },
      });

      if (!shopExists) {
        throw new Error('Shop introuvable');
      }

      // Vérifier l'unicité de l'externalId
      const existingUser = await this.prisma.user.findUnique({
        where: { externalId: data.externalId },
      });

      if (existingUser) {
        throw new Error('Un utilisateur avec cet externalId existe déjà');
      }

      const user = await this.prisma.user.create({
        data: {
          shopId: data.shopId,
          externalId: data.externalId,
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
        },
        include: {
          shop: true,
          conversations: {
            include: {
              messages: true,
            },
          },
          session: true,
        },
      });

      return (user as UserResponse);
    } catch (error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
  }

  async getUserById(id: string): Promise<UserResponse | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        include: {
          shop: true,
          conversations: {
            include: {
              messages: true,
              session: true,
            },
            orderBy: {
              updatedAt: 'desc',
            },
          },
          session: true,
        },
      });

      return (user as UserResponse) || null;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }
  }

  async getUserByExternalId(externalId: string): Promise<UserResponse | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { externalId },
        include: {
          shop: true,
          conversations: {
            include: {
              messages: true,
            },
          },
          session: true,
        },
      });

      return user ? (user as UserResponse) : null;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }
  }

  async getUsersByShop(shopId: string, params: SearchParams = {}): Promise<UserResponse[]> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      const users = await this.prisma.user.findMany({
        where: { shopId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          shop: true,
          conversations: {
            include: {
              messages: true,
            },
          },
          session: true,
        },
      });

      return users .map(user => user as UserResponse);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }
  }

  async getAllUsers(params: SearchParams = {}): Promise<UserResponse[]> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      const users = await this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          shop: true,
          conversations: {
            include: {
              messages: true,
            },
          },
          session: true,
        },
      });

      return users.map(user => user as UserResponse);
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }
  }

  async updateUser(id: string, data: UpdateUserDto): Promise<UserResponse> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.nom !== undefined && { nom: data.nom }),
          ...(data.prenom !== undefined && { prenom: data.prenom }),
          ...(data.email !== undefined && { email: data.email }),
        },
        include: {
          shop: true,
          conversations: {
            include: {
              messages: true,
            },
          },
          session: true,
        },
      });

      return  (user as UserResponse) || null;
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      // Supprimer d'abord les conversations et messages associés
      await this.prisma.message.deleteMany({
        where: {
          conversation: {
            userId: id,
          },
        },
      });

      await this.prisma.conversation.deleteMany({
        where: { userId: id },
      });

      // Supprimer les sessions
      await this.prisma.session.deleteMany({
        where: { userId: id },
      });

      // Supprimer l'utilisateur
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
  }

  async searchUsers(query: string, shopId?: string): Promise<UserResponse[]> {
    try {
      const where: any = {
        OR: [
          { nom: { contains: query, mode: 'insensitive' } },
          { prenom: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { externalId: { contains: query, mode: 'insensitive' } },
        ],
      };

      if (shopId) {
        where.shopId = shopId;
      }

      const users = await this.prisma.user.findMany({
        where,
        include: {
          shop: true,
          conversations: {
            include: {
              messages: true,
            },
          },
          session: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      return users;
    } catch (error) {
      throw new Error(`Erreur lors de la recherche d'utilisateurs: ${error.message}`);
    }
  }

  async countUsersByShop(shopId: string): Promise<number> {
    try {
      const count = await this.prisma.user.count({
        where: { shopId },
      });

      return count;
    } catch (error) {
      throw new Error(`Erreur lors du comptage des utilisateurs: ${error.message}`);
    }
  }

  async getUserActivity(userId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    totalSessions: number;
    lastActivity: Date | null;
  }> {
    try {
      const [
        totalConversations,
        totalMessages,
        totalSessions,
        lastMessage,
      ] = await Promise.all([
        this.prisma.conversation.count({ where: { userId } }),
        this.prisma.message.count({
          where: {
            conversation: { userId },
          },
        }),
        this.prisma.session.count({ where: { userId } }),
        this.prisma.message.findFirst({
          where: {
            conversation: { userId },
          },
          orderBy: { timestamp: 'desc' },
        }),
      ]);

      return {
        totalConversations,
        totalMessages,
        totalSessions,
        lastActivity: lastMessage?.timestamp || null,
      };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'activité utilisateur: ${error.message}`);
    }
  }
}