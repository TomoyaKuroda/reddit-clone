import 'react-quill/dist/quill.snow.css'
import { useState } from 'react'
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import { mutate } from 'swr';
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const ReactQuill = typeof window === 'object' ? require('react-quill') : () => false;

const modules = {
    toolbar: [
        ['bold', 'italic'],
        ['link', 'blockquote', 'code', 'image'],
        [
            { list: 'ordered' },
            { list: 'bullet' }
        ]
    ]
}
export default function Submit() {
    const [reactQuillText, setReactQuillText] = useState('')
    const [title, setTitle] = useState('')
    const router = useRouter()
    const { sub } = router.query
    const [session, loading] = useSession()
    const subUrl = `/api/subreddit/findSubreddit?name=${sub}`

    const handleNewPost = async (e) => {
        e.preventDefault()

        const newPost = {
            title,
            body: reactQuillText,
            subReddit: sub,
            votes: [{
                voteType: "UPVOTE",
                userId: session.userId

            }],
            user: session.user
        }

        mutate(
            subUrl,
            async (state) => {
                return {
                    ...state,
                    posts: [...state.posts, newPost]
                }
            }, false)
        NProgress.start()
        await fetch('/api/post/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ post: newPost })
        })
        NProgress.done()

        mutate(subUrl)
        router.push(`/r/${sub}`)
    }

    return (
        <div className='container'>
            <form onSubmit={handleNewPost}>
                <label htmlFor='title'>Title</label>
                <input id='title' className='' type='text' value={title} onChange={e => setTitle(e.target.value)} />
                <ReactQuill value={reactQuillText} onChange={value => setReactQuillText(value)}
                    theme='snow'
                    className='w-100'
                    modules={modules}
                />
                <button className='btn btn-primary'>Post</button>
                <button onClick={e => {
                    e.preventDefault()
                    router.back()
                }} className='btn btn-primary ms-4'>Abort</button>
            </form>
        </div>
    )
}
