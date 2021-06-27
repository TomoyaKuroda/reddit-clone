import Nav from './nav'

export default function Layout({ children }) {
    return (
        <div>
            <Nav />
            <div>{children}</div>
        </div>
    )
}