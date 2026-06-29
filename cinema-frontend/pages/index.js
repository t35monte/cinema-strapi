import Link from 'next/link';

export default function Home() {
  return (
      <div className="text-center mt-5">
        <h1>🎬 Bem-vindo ao CinemaApp</h1>
        <p className="lead">Consulta cinemas e sessões disponíveis.</p>
        <Link href="/cinemas" className="btn btn-primary me-2">Ver Cinemas</Link>
        <Link href="/sessoes" className="btn btn-secondary">Ver Sessões</Link>
      </div>
  );
}