import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCinema, updateCinema } from '../../lib/api';

export default function EditarCinema() {
    const router = useRouter();
    const { id } = router.query;
    const [form, setForm] = useState({ nome: '', local: '' });
    const [sucesso, setSucesso] = useState(false);

    useEffect(() => {
        if (id) {
            getCinema(id).then(c => {
                const attrs = c?.attributes || c;
                setForm({ nome: attrs?.nome || '', local: attrs?.local || '' });
            });
        }
    }, [id]);

    async function handleSubmit(e) {
        e.preventDefault();
        await updateCinema(id, form.nome, form.local);
        setSucesso(true);
        setTimeout(() => router.push('/cinemas'), 1500);
    }

    return (
        <div className="row justify-content-center">
            <div className="col-md-5">
                <h2>Editar Cinema</h2>
                {sucesso && <div className="alert alert-success">Guardado!</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label>Nome</label>
                        <input className="form-control" value={form.nome}
                               onChange={e => setForm({ ...form, nome: e.target.value })} required />
                    </div>
                    <div className="mb-3">
                        <label>Local</label>
                        <input className="form-control" value={form.local}
                               onChange={e => setForm({ ...form, local: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Guardar</button>
                    <button type="button" className="btn btn-secondary ms-2"
                            onClick={() => router.push('/cinemas')}>Cancelar</button>
                </form>
            </div>
        </div>
    );
}