import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout';
import { Prisma, User } from '@prisma/client'
import SubredditPost from '../../../components/subredditPost';
import { useSession } from 'next-auth/client'
import useSWR from 'swr'
import { fetchData } from '../../../utils/utils';

export default function SubReddit(props) {
    const router = useRouter()
    const { sub } = router.query
    const [session, loading] = useSession()

    const subUrl = `/api/subreddit/findSubreddit?name=${sub}`

    const { data: fullSub, error } = useSWR(subUrl, fetchData, {
        initialData: props.fullSub
    }
    )

    console.log('do we have post', fullSub)

    const joined = fullSub.joinedUsers.filter((user: User) => user.name === session?.user.name).length > 0

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
    if (error) {
        return (
            <Layout>
                <h1>{error.message}</h1>
            </Layout>
        )
    }
    return (
        <Layout>
            <div className='bg-pprimary py-5'></div>
            <div className='py-5 bg-white'>
                <div className='container'>
                    <Link href={`/r/${sub}/submit`}>
                        <button className='btn btn-primary'>Create Post</button>
                    </Link>
                    joined? {joined ? 'yes' : 'no'}
                    {fullSub.displayName}
                    {fullSub.name}
                    {fullSub.infoBoxText}
                    <div className=''>{fullSub.createdAt}</div>
                    <div>Member: {fullSub.joinedUsers.length}</div>
                    <div>Post Numbers: {fullSub.posts.length}</div>
                    <div>
                        {fullSub.posts.map(post => <SubredditPost subUrl={subUrl} post={post} fullSub={fullSub} key={post.id} />)}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export async function getServerSideProps(ctx) {
    const url = `${process.env.NEXTAUTH_URL}/api/subreddit/findSubreddit?name=${ctx.query.sub}`
    const fullSub = await fetchData(url)
    return {
        props: {
            fullSub
        }
    }
}