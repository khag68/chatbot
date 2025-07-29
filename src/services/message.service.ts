import prisma from "./prisma.service"


export class MessageService {
  async createMessage(data: {
    conversationId?: string
  }) {
    return prisma.message.create({ data})
  }

  async getMessage(id: string) {
    return prisma.message.findUnique({ where: { id } })
  }

  async getMessagesByConversation(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    })
  }

  async deleteMessage(id: string) {
    return prisma.message.delete({ where: { id } })
  }
}
