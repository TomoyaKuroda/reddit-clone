import { getSession } from 'next-auth/client'
import prisma from '../../../db'
import { Prisma } from '@prisma/client'

const handler = async (req, res) => {
    const { post } = req.body

    const session = await getSession({ req })
    if (!session) {
        return res.status(500).json({ error: "You have to be logged in." })
    }

    try {
        const newPost = await prisma.post.create({
            data: {
                body: post.body,
                title: post.title,
                subreddit: {
                    connect: {
                        name: post.subReddit
                    }
                },
                user: {
                    connect: {
                        id: session.userId
                    }
                },
                votes: {
                    create: {
                        user: { connect: { id: session.userId } },
                        voteType: "UPVOTE"
                    }
                }
            }
        })

        return res.json(newPost)

    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (e.code === 'P2002') {
                console.log(
                    'There is a unique constraint violation, a new user cannot be created with this email'
                )
            }
        }
        throw e
    }
}
export default handler