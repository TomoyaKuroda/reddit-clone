import NextAuth, { User as NextAuthUser } from 'next-auth'
import Providers from "next-auth/providers"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
interface NextAuthUserWithStringId extends NextAuthUser {
  id: string
}
export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
        } as NextAuthUserWithStringId
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session: async (session, user) => {
      session.userId = user.id
      return Promise.resolve(session)
    }
  }
})