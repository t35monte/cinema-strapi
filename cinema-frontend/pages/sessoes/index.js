import { useEffect, useState } from 'react';
import { getSessoes, createSessao, deleteSessao, getCinemas, getToken } from '../../lib/api';

export default function Sessoes() {
    const [sessoes, setSessoes] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [form, setForm] = useState({ filme: '', data: '', cinemaId: '' });
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        setIsAuth(!!getToken());
        carregar();
    }, []);

    async function carregar() {
        setSessoes(await getSessoes());
        setCinemas(await getCinemas());
    }

    async function handleCriar(e) {
        e.preventDefault();
        await createSessao(form.filme, form.data, form.cinemaId);
        setForm({ filme: '', data: '', cinemaId: '' });
        carregar();
    }

    async function handleApagar(id) {
        if (confirm('Apagar esta sessão?')) {
            await deleteSessao(id);
            carregar();
        }
    }

    // Helper para ler atributos (Strapi 5 vs 4)
    function attr(obj, key) {
        return obj?.[key] ?? obj?.attributes?.[key];
    }

    return (
        <div>
            <h2>Sessões</h2>

            {isAuth && (
                <div className="card mb-4 p-3">
                    <h5>Nova Sessão</h5>
                    <form onSubmit={handleCriar} className="row g-2">
                        <div className="col">
                            <input className="form-control" placeholder="Filme" value={form.filme}
                                   onChange={e => setForm({ ...form, filme: e.target.value })} required />
                        </div>
                        <div className="col">
                            <input type="datetime-local" className="form-control" value={form.data}
                                   onChange={e => setForm({ ...form, data: e.target.value })} required />
                        </div>
                        <div className="col">
                            <select className="form-select" value={form.cinemaId}
                                    onChange={e => setForm({ ...form, cinemaId: e.target.value })} required>
                                <option value="">Seleciona Cinema</option>
                                {cinemas.map(c => (
                                    <option key={c.id} value={c.id}>{attr(c, 'nome')}</option>
                                ))}
                            </select>
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
                    <th>Filme</th>
                    <th>Data</th>
                    <th>Cinema</th>
                    {isAuth && <th>Ações</th>}
                </tr>
                </thead>
                <tbody>
                {sessoes.map(s => (
                    <tr key={s.id}>
                        <td>{attr(s, 'filme')}</td>
                        <td>{new Date(attr(s, 'data')).toLocaleString('pt-PT')}</td>
                        <td>{attr(s?.cinema?.data || s?.cinema, 'nome') || '—'}</td>
                        {isAuth && (
                            <td>
                                <button onClick={() => handleApagar(s.id)} className="btn btn-sm btn-danger">Apagar</button>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}