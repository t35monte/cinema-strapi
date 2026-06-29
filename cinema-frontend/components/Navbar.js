import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { logout } from '../lib/api';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const u = localStorage.getItem('user');
        if (u) setUser(JSON.parse(u));
    }, [router.pathname]); // atualiza ao mudar de página

    function handleLogout() {
        logout();
        setUser(null);
        router.push('/');
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
            <Link className="navbar-brand" href="/">🎬 CinemaApp</Link>
            <div className="navbar-nav me-auto">
                <Link className="nav-link" href="/cinemas">Cinemas</Link>
                <Link className="nav-link" href="/sessoes">Sessões</Link>
            </div>
            <div className="navbar-nav">
                {user ? (
                    <>
                        <span className="nav-link text-light">Olá, {user.username}</span>
                        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Sair</button>
                    </>
                ) : (
                    <>
                        <Link className="nav-link" href="/login">Login</Link>
                        <Link className="nav-link" href="/register">Registar</Link>
                    </>
                )}
            </div>
        </nav>
    );
}