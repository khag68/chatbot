import prisma from './prisma.service'

export class SessionService {
  async createSession(data: {
    userId?: string
    shopId: string
  }) {
    return prisma.session.create({
      data: {
        ...data,
        startedAt: new Date()
      }
    })
  }

  async endSession(id: string) {
    return prisma.session.update({
      where: { id },
      data: { endedAt: new Date() }
    })
  }

  async getSession(id: string) {
    return prisma.session.findUnique({ where: { id } })
  }

  async getActiveSessions(userId?: string, shopId?: string) {
    return prisma.session.findMany({
      where: {
        endedAt: null,
        ...(userId && { userId }),
        ...(shopId && { shopId })
      },
      orderBy: { startedAt: 'desc' }
    })
  }

  async deleteSession(id: string) {
    return prisma.session.delete({ where: { id } })
  }
}
