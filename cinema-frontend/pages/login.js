import { useState } from 'react';
import { useRouter } from 'next/router';
import { login } from '../lib/api';

export default function Login() {
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [erro, setErro] = useState('');
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');
        const data = await login(form.identifier, form.password);
        if (data.jwt) {
            router.push('/');
        } else {
            setErro('Email ou password incorretos.');
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-4">
                <h2>Login</h2>
                {erro && <div className="alert alert-danger">{erro}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Email ou Username</label>
                        <input className="form-control" value={form.identifier}
                               onChange={e => setForm({ ...form, identifier: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                        <label>Password</label>
                        <input type="password" className="form-control" value={form.password}
                               onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Entrar</button>
                </form>
            </div>
        </div>
    );
}