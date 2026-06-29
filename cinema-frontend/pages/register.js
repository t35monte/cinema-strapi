import { useState } from 'react';
import { useRouter } from 'next/router';
import { register, getToken } from '../lib/api';

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [erro, setErro] = useState('');
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setErro('');
        const data = await register(form.username, form.email, form.password);
        if (data.jwt) {
            localStorage.setItem('jwt', data.jwt);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/');
        } else {
            setErro(data?.error?.message || 'Erro ao registar.');
        }
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-4">
                <h2>Criar Conta</h2>
                {erro && <div className="alert alert-danger">{erro}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Username</label>
                        <input className="form-control" value={form.username}
                               onChange={e => setForm({ ...form, username: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                        <label>Email</label>
                        <input type="email" className="form-control" value={form.email}
                               onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                        <label>Password</label>
                        <input type="password" className="form-control" value={form.password}
                               onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-success w-100">Registar</button>
                </form>
            </div>
        </div>
    );
}