import { useEffect, useState } from 'react';
import { getSessoes, createSessao, deleteSessao, getCinemas, getToken } from '../../lib/api';

export default function Sessoes() {
    const [sessoes, setSessoes] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    // Adicionado 'vagas_disponiveis' no form inicial (opcional, caso adicione no Strapi)
    const [form, setForm] = useState({ filme: '', data: '', cinemaId: '', vagas_disponiveis: 50 });
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState(null); // Novo estado para guardar os dados do usuário logado

    useEffect(() => {
        const token = getToken();
        setIsAuth(!!token);

        // Se estiver logado, busca o ID do usuário no Strapi para podermos vinculá-lo à reserva
        if (token) {
            fetch('http://localhost:1337/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setUser(data))
                .catch(err => console.error("Erro ao buscar usuário:", err));
        }

        carregar();
    }, []);

    async function carregar() {
        setSessoes(await getSessoes());
        setCinemas(await getCinemas());
    }

    async function handleCriar(e) {
        e.preventDefault();
        // Nota: Se quiser que a criação defina as vagas, lembre-se de atualizar a função createSessao no lib/api.js para aceitar esse parâmetro.
        await createSessao(form.filme, form.data, form.cinemaId);
        setForm({ filme: '', data: '', cinemaId: '', vagas_disponiveis: 50 });
        carregar();
    }

    async function handleApagar(id) {
        if (confirm('Apagar esta sessão?')) {
            try {
                await deleteSessao(id);
                carregar();
            } catch (err) {
                alert('Não foi possível apagar a sessão: ' + err.message);
            }
        }
    }

    // NOVA FUNÇÃO: Reservar o ingresso
    async function handleReservar(sessaoId, vagasAtuais) {
        if (!user) {
            alert('Você precisa estar logado para reservar.');
            return;
        }

        // Se o campo existir e as vagas acabarem
        if (vagasAtuais !== undefined && vagasAtuais <= 0) {
            alert('Sessão esgotada!');
            return;
        }

        try {
            const token = getToken();
            const response = await fetch(`http://localhost:1337/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessaos: { connect: [sessaoId] }
                })
            });

            if (response.ok) {
                alert('Lugar reservado com sucesso!');
                carregar();
            } else {
                const errData = await response.json().catch(() => null);
                console.error('Erro ao reservar:', errData);
                alert('Erro ao realizar a reserva: ' + (errData?.error?.message || response.status));
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
        }
    }

    // Helper para ler atributos (Strapi 5 vs 4)
    function attr(obj, key) {
        return obj?.[key] ?? obj?.attributes?.[key];
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Sessões</h2>

            {isAuth && (
                <div className="card mb-4 p-3 shadow-sm">
                    <h5>Nova Sessão (Admin)</h5>
                    <form onSubmit={handleCriar} className="row g-2 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Filme</label>
                            <input className="form-control" placeholder="Ex: Matrix" value={form.filme}
                                   onChange={e => setForm({ ...form, filme: e.target.value })} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Data e Hora</label>
                            <input type="datetime-local" className="form-control" value={form.data}
                                   onChange={e => setForm({ ...form, data: e.target.value })} required />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Cinema</label>
                            <select className="form-select" value={form.cinemaId}
                                    onChange={e => setForm({ ...form, cinemaId: e.target.value })} required>
                                <option value="">Seleciona Cinema</option>
                                {cinemas.map(c => (
                                    <option key={c.id} value={c.documentId}>{attr(c, 'nome')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-auto">
                            <button type="submit" className="btn btn-success w-100">Adicionar</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-responsive">
                <table className="table table-striped table-hover align-middle">
                    <thead className="table-dark">
                    <tr>
                        <th>Filme</th>
                        <th>Data</th>
                        <th>Cinema</th>
                        <th>Vagas</th>
                        {isAuth && <th>Ações</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {sessoes.map(s => {
                        const vagas = attr(s, 'vagas_disponiveis');
                        return (
                            <tr key={s.id}>
                                <td className="fw-bold">{attr(s, 'filme')}</td>
                                <td>{new Date(attr(s, 'data')).toLocaleString('pt-PT')}</td>
                                <td>{attr(s?.cinema?.data || s?.cinema, 'nome') || '—'}</td>
                                <td>
                                    {vagas !== undefined ? (
                                        <span className={`badge ${vagas > 0 ? 'bg-success' : 'bg-danger'}`}>
                                            {vagas} livres
                                        </span>
                                    ) : '—'}
                                </td>
                                {isAuth && (
                                    <td>
                                        <div className="d-flex gap-2">
                                            {/* Botão de Reservar para o cliente */}
                                            <button
                                                onClick={() => handleReservar(s.documentId, vagas)}
                                                className="btn btn-sm btn-primary"
                                                disabled={vagas !== undefined && vagas <= 0}
                                            >
                                                Reservar Lugar
                                            </button>

                                            <button
                                                onClick={() => handleApagar(s.documentId)}
                                                className="btn btn-sm btn-outline-danger"
                                            >
                                                Apagar
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}