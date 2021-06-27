import { Prisma } from '@prisma/client'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { mutate } from 'swr'

type FullPost = Prisma.PostGetPayload<{
    include: { user: true; subreddit: true; votes: true }
}>

type SubWithPosts = Prisma.SubredditGetPayload<{
    include: { posts: { include: { user: true; subreddit: true; votes: true } }, joinedUsers: true }
}>
interface Props {
    post: FullPost,
    subUrl: string,
    fullSub: SubWithPosts
}
export default function SubredditPost({ post, subUrl, fullSub }: Props) {

    const [session, loading] = useSession()
    const router = useRouter()

    const hasVoted = post.votes.find(vote => vote.userId === session?.userId)

    const votePost = async (type) => {
        if (!session && !loading) {
            router.push('/login')
            return
        }

        if (hasVoted) {
            if (hasVoted.voteType !== type) {
                mutate(subUrl, async (state = fullSub) => {
                    return {
                        ...state,
                        posts: state.posts.map(currentPost => {
                            if (currentPost.id === post.id) {
                                return {
                                    ...currentPost, votes: currentPost.votes.map(vote => {
                                        if (vote.userId === session.userId) {

                                            return {
                                                ...vote,
                                                voteType: type
                                            }
                                        } else {
                                            return vote
                                        }
                                    })
                                }
                            } else {
                                return currentPost
                            }
                        })
                    }
                }, false)
            } else {


                mutate(subUrl, async (state = fullSub) => {
                    return {
                        ...state,
                        posts: state.posts.map(currentPost => {
                            if (currentPost.id === post.id) {
                                return {
                                    ...currentPost,
                                    votes: currentPost.votes.filter(vote => vote.userId === session.userId)
                                }
                            } else {
                                return currentPost
                            }
                        })
                    }
                }, false)
            }
        } else {
            mutate(subUrl, async (state = fullSub) => {
                return {
                    ...state,
                    posts: state.posts.map(currentPost => {
                        if (currentPost.id === post.id) {
                            return {
                                ...currentPost, votes: [...currentPost.votes, {
                                    voteType: type,
                                    userId: session.userId,
                                    postId: currentPost.id
                                }]
                            }
                        } else {
                            return currentPost
                        }
                    })
                }
            }, false)
        }

        const fetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ postId: post.id, type })
        }
        await fetch('/api/post/vote', fetchOptions)

        mutate(subUrl)
    }

    const calculatevoteCount = (votes) => {
        const upVotes = votes.filter(vote => vote.voteType === 'UPVOTE')
        const downVotes = votes.filter(vote => vote.voteType === 'DOWNVOTE')

        const voteCount = upVotes.length - downVotes.length
        return voteCount
    }
    return (
        <div>
            <button className={`${hasVoted?.voteType === 'UPVOTE' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => votePost('UPVOTE')}>upvote</button>
            <button className={`${hasVoted?.voteType === 'DOWNVOTE' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => votePost('DOWNVOTE')}>DOWNVOTE</button>
            <div>{calculatevoteCount(post.votes)}</div>
            <div>{post.user.name}</div>
            <div>{post.title}</div>
            <div>{post.body}</div>
        </div>
    )
}