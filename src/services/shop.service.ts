import prisma from './prisma.service';



export class ShopService {
  async createShop(data: {
    name: string,
    domain: string,
    agent: [],
    description?: string,
  }) {
    return prisma.shop.create({ data })
  }

  async getShop(id: string) {
    return prisma.shop.findUnique({ where: { id } })
  }

  async getAllShop() {
    return prisma.shop.findMany()
  }

  async updateShop(id: string, data: string) {
    return prisma.shop.update({ where: { id }, data })
  }

  async deleteShop(id: string) {
    return prisma.shop.delete({ where: { id } })
  }
}
