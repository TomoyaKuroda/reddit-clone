import { getSession } from 'next-auth/client'
import prisma from '../../../db'
import { Prisma } from '@prisma/client'

const handler = async (req, res) => {
    const { postId } = req.body
    const { type } = req.body

    const session = await getSession({ req })
    if (!session) {
        return res.status(500).json({ error: "You have to be logged in." })
    }

    try {
        const votes = await prisma.vote.findMany({
            where: {
                userId: session.userId
            }
        })


        const hasVoted = votes.find((vote) => vote.postId === postId)
        console.log("has the user voted: ", hasVoted);

        if (hasVoted) {
            if (hasVoted.voteType !== type) {
                const updatedVote = await prisma.vote.update({
                    where: {
                        id: hasVoted.id
                    },
                    data: {
                        voteType: type
                    }
                })
                return res.json(updatedVote)
            }
            const deletedVote = await prisma.vote.delete({
                where: {
                    id: hasVoted.id
                }
            })
            return res.json(deletedVote)
        }
        console.log("type: ", type);
        console.log("session.userId: ", session.userId);
        console.log("postId: ", postId);

        const newVote = await prisma.vote.create({
            data: {
                voteType: type,
                user: {
                    connect: { id: session.userId },
                },
                post: {
                    connect: { id: postId },
                },
            },
        });
        console.log("new vote: ", newVote);
        return res.json(newVote);
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