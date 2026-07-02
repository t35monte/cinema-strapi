const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

// Obter token guardado no localStorage
export function getToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('jwt');
    }
    return null;
}

// Headers com autenticação (se tiver token)
export function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function safeJson(res) {
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch (e) {
        data = null;
    }
    if (!res.ok) {
        const msg = data?.error?.message || `Erro ${res.status}`;
        throw new Error(msg);
    }
    return data;
}

// LOGIN
export async function login(identifier, password) {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (data.jwt) {
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
}

// REGISTO
export async function register(username, email, password) {
    const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    });
    return res.json();
}

// LOGOUT
export function logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
}

// CINEMAS
export async function getCinemas() {
    const res = await fetch(`${STRAPI_URL}/api/cinemas`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    return data.data || [];
}

export async function getCinema(id) {
    const res = await fetch(`${STRAPI_URL}/api/cinemas/${id}?populate=sessaos`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    return data.data;
}

export async function createCinema(nome, local) {
    const res = await fetch(`${STRAPI_URL}/api/cinemas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ data: { nome, local } }),
    });
    return res.json();
}

export async function updateCinema(id, nome, local) {
    const res = await fetch(`${STRAPI_URL}/api/cinemas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ data: { nome, local } }),
    });
    return res.json();
}

export async function deleteCinema(id) {
    const res = await fetch(`${STRAPI_URL}/api/cinemas/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return safeJson(res);
}

// SESSÕES
export async function getSessoes() {
    const res = await fetch(`${STRAPI_URL}/api/sessaos?populate=cinema`, {
        headers: authHeaders(),
    });
    const data = await res.json();
    return data.data || [];
}

export async function createSessao(filme, data, cinemaId) {
    const res = await fetch(`${STRAPI_URL}/api/sessaos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ data: { filme, data, cinema: cinemaId } }),
    });
    return res.json();
}

export async function updateSessao(id, filme, data, cinemaId) {
    const res = await fetch(`${STRAPI_URL}/api/sessaos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ data: { filme, data, cinema: cinemaId } }),
    });
    return res.json();
}

export async function deleteSessao(id) {
    const res = await fetch(`${STRAPI_URL}/api/sessaos/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    return safeJson(res);
}