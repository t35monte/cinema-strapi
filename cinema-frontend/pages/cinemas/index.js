import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCinemas, createCinema, deleteCinema } from '../../lib/api';

export default function Cinemas() {
    const [cinemas, setCinemas] = useState([]);
    const [form, setForm] = useState({ nome: '', local: '' });
    const [admin, setAdmin] = useState(false);

    useEffect(() => {
        // 1. Força a validação do admin diretamente no cliente de forma segura
        const role = localStorage.getItem('role');
        if (role && role.toLowerCase() === 'admin') {
            setAdmin(true);
        } else {
            setAdmin(false);
        }
        carregar();
    }, []);

    async function carregar() {
        const dados = await getCinemas();
        setCinemas(dados || []);
    }

    async function handleCriar(e) {
        e.preventDefault();
        await createCinema(form.nome, form.local);
        setForm({ nome: '', local: '' });
        carregar();
    }

    async function handleApagar(id) {
        if (!id) return alert('ID do cinema inválido ou não encontrado.');

        if (confirm('Apagar este cinema?')) {
            try {
                await deleteCinema(id);
                carregar();
            } catch (err) {
                alert('Não foi possível apagar o cinema: ' + err.message);
            }
        }
    }

    return (
        <div>
            <h2>Cinemas</h2>

            {/* Formulário só visível para admin */}
            {admin && (
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
                    {admin && <th>Ações</th>}
                </tr>
                </thead>
                <tbody>
                {cinemas.map(c => {
                    // 2. Extração segura dos dados (Trata o padrão do Strapi v4 e v5)
                    const nome = c.nome || c.attributes?.nome;
                    const local = c.local || c.attributes?.local;

                    // Descobre onde está o ID correto (se na raiz ou dentro de attributes)
                    const idParaAcoes = c.documentId || c.id || c.attributes?.documentId || c.attributes?.id;

                    return (
                        <tr key={c.id || idParaAcoes}>
                            <td>{nome}</td>
                            <td>{local}</td>
                            {/* Botões só visíveis para admin */}
                            {admin && (
                                <td>
                                    <Link href={`/cinemas/${idParaAcoes}`} className="btn btn-sm btn-primary me-2">
                                        Editar
                                    </Link>
                                    <button onClick={() => handleApagar(idParaAcoes)} className="btn btn-sm btn-danger">
                                        Apagar
                                    </button>
                                </td>
                            )}
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}