import { useState, useEffect } from 'react';
import { getToken } from '../lib/api';

export default function Bomboniere() {
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        setIsAuth(!!getToken());

        // Puxa os produtos do Strapi, incluindo as imagens
        fetch('http://localhost:1337/api/produtos?populate=*')
            .then(res => res.json())
            .then(data => setProdutos(data.data || []))
            .catch(err => console.error("Erro ao buscar produtos:", err));
    }, []);

    const adicionarAoCarrinho = (produto) => {
        setCarrinho([...carrinho, produto]);
    };

    const removerDoCarrinho = (indexParaRemover) => {
        setCarrinho(carrinho.filter((_, index) => index !== indexParaRemover));
    };

    // Helper para lidar com os atributos do Strapi
    function attr(obj, key) {
        return obj?.[key] ?? obj?.attributes?.[key];
    }

    const total = carrinho.reduce((acc, item) => acc + (attr(item, 'preco') || 0), 0);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Produtos</h2>

            <div className="row">
                {/* Lista de Produtos */}
                <div className="col-md-8">
                    <div className="row g-3">
                        {produtos.map(prod => {
                            // Monta a URL da imagem (ajustar se estiver em produção)
                            const imgRaw = attr(prod, 'img');
                            const imgData = imgRaw?.data ?? imgRaw;
                            const imgUrl = imgData ? `http://localhost:1337${attr(imgData, 'url')}` : null;

                            return (
                                <div className="col-md-4" key={prod.id}>
                                    <div className="card h-100 shadow-sm">
                                        {imgUrl ? (
                                            <img src={imgUrl} className="card-img-top" alt={attr(prod, 'descricao')} style={{ height: '150px', objectFit: 'cover' }} />
                                        ) : (
                                            <div className="card-img-top bg-secondary d-flex align-items-center justify-content-center text-white" style={{ height: '150px' }}>
                                                Sem Imagem
                                            </div>
                                        )}
                                        <div className="card-body text-center d-flex flex-column">
                                            <h6 className="card-title">{attr(prod, 'descricao')}</h6>
                                            <p className="card-text fw-bold text-success mb-3">{attr(prod, 'preco')?.toFixed(2)} €</p>

                                            <button
                                                className="btn btn-primary mt-auto"
                                                onClick={() => adicionarAoCarrinho(prod)}
                                                disabled={!isAuth}
                                            >
                                                Adicionar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Resumo do Carrinho */}
                <div className="col-md-4 mt-4 mt-md-0">
                    <div className="card shadow-sm sticky-top" style={{ top: '20px' }}>
                        <div className="card-header bg-dark text-white">
                            <h5 className="mb-0">Seu Pedido</h5>
                        </div>
                        <ul className="list-group list-group-flush">
                            {carrinho.length === 0 ? (
                                <li className="list-group-item text-muted text-center py-4">Carrinho vazio.</li>
                            ) : (
                                carrinho.map((item, index) => (
                                    <li className="list-group-item d-flex justify-content-between align-items-center" key={index}>
                                        <small>{attr(item, 'descricao')}</small>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="fw-bold">{attr(item, 'preco')?.toFixed(2)} €</span>
                                            <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => removerDoCarrinho(index)}>x</button>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                        <div className="card-footer d-flex justify-content-between align-items-center">
                            <span className="fw-bold">Total:</span>
                            <span className="fw-bold text-success fs-5">{total.toFixed(2)} €</span>
                        </div>
                        <div className="card-body">
                            {!isAuth ? (
                                <div className="alert alert-warning text-center p-2 mb-0">Faça login para comprar</div>
                            ) : (
                                <button
                                    className="btn btn-success w-100"
                                    disabled={carrinho.length === 0}
                                    onClick={() => {
                                        alert('Pedido finalizado com sucesso! Retire no balcão.');
                                        setCarrinho([]);
                                    }}
                                >
                                    Finalizar Compra
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}