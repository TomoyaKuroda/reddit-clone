import Link from 'next/link';
import { options, signIn, signOut, useSession } from 'next-auth/client';
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { fetchData } from '../utils/utils';

export default function Nav() {
    const [session, loading] = useSession();
    const router = useRouter();
    const { data } = useSWR("/api/subreddit/allSubReddits", fetchData);


    const subToOptions = () => {
        if (!data) return
        const options = data.map((sub) => ({
            value: sub.id,
            label: sub.name
        }))
        return options
    }

    return (
        <nav className='d-flex align-items-center justify-content-between py-4 bg-dark'>
            <div className='d-flex align-items-center'>
                <Link href='/'>
                    <div className='bg-primary rounded-circle mx-4 p-4'></div>
                </Link>
                <Link href=''>
                    <a className='text-white fw-bold d-none d-md-block'>reddit</a>
                </Link>
            </div>
            <div className='col-sm-4'>
                <select className="form-select" aria-label="Default select example" onChange={e => {
                    router.push(`/r/${subToOptions()[Number(e.target.selectedIndex) - 1].label}`)
                }}>
                    <option disabled selected hidden>Choose option</option>
                    {subToOptions()?.map(option => (
                        <option value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>
            <h3 className='text-white d-hidden d-md-block'>
                Welcome {loading ? '' : session?.user?.name}
            </h3>
            {!session && <button onClick={signIn}>Login</button>}
            {session && <button onClick={() => {
                router.push('/')
                signOut()
            }}>Logout</button>}
        </nav>
    )
}
