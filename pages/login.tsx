import { signIn, useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import Layout from '../components/layout'

export default function Login() {

    const router = useRouter()
    const [session] = useSession()

    const handleLogin = () => {
        signIn()
        router.back()
    }
    if (session) {
        router.push('/')
    }
    return (
        <Layout>
            <div>
                <button onClick={handleLogin}>Login</button>
                <button onClick={() => router.back()}>Go back</button>
            </div>
        </Layout>
    )
}