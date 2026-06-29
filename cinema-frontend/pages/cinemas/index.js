import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCinemas, createCinema, deleteCinema, getToken } from '../../lib/api';

export default function Cinemas() {
    const [cinemas, setCinemas] = useState([]);
    const [form, setForm] = useState({ nome: '', local: '' });
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        setIsAuth(!!getToken());
        carregar();
    }, []);

    async function carregar() {
        setCinemas(await getCinemas());
    }

    async function handleCriar(e) {
        e.preventDefault();
        await createCinema(form.nome, form.local);
        setForm({ nome: '', local: '' });
        carregar();
    }

    async function handleApagar(id) {
        if (confirm('Apagar este cinema?')) {
            await deleteCinema(id);
            carregar();
        }
    }

    return (
        <div>
            <h2>Cinemas</h2>

            {/* Formulário só visível para autenticados */}
            {isAuth && (
                <div className="card mb-4 p-3">
                    <h5>Adicionar Cinema</h5>
                    <form onSubmit={handleCriar} className="row g-2">
                        <div className="col">
                            <input className="form-control" placeholder="Nome" value={form.nome}
                                   onChange={e => setForm({ ...form, nome: e.target.value })} required />
                        </div>
                        <div className="col">
                            <input className="form-control" placeholder="Local" value={form.local}
                                   onChange={e => setForm({ ...form, local: e.target.value })} required />
                        </div>
                        <div className="col-auto">
                            <button type="submit" className="btn btn-success">Adicionar</button>
                        </div>
                    </form>
                </div>
            )}

            <table className="table table-striped">
                <thead>
                <tr>
                    <th>Nome</th>
                    <th>Local</th>
                    {isAuth && <th>Ações</th>}
                </tr>
                </thead>
                <tbody>
                {cinemas.map(c => (
                    <tr key={c.id}>
                        <td>{c.nome || c.attributes?.nome}</td>
                        <td>{c.local || c.attributes?.local}</td>
                        {isAuth && (
                            <td>
                                <Link href={`/cinemas/${c.id}`} className="btn btn-sm btn-primary me-2">Editar</Link>
                                <button onClick={() => handleApagar(c.id)} className="btn btn-sm btn-danger">Apagar</button>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}