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
// Alteração na função LOGIN para garantir que apanha o nome ou o type:
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
        try {
            const meRes = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
                headers: { Authorization: `Bearer ${data.jwt}` },
            });
            const me = await meRes.json();

            // Procura por me.role.name (Ex: "Admin") ou me.role.type (Ex: "admin")
            const roleUser = me?.role?.name || me?.role?.type;
            if (roleUser) {
                localStorage.setItem('role', roleUser);
            }
        } catch (e) {
            console.error('Não foi possível obter o role do utilizador:', e);
        }
    }
    return data;
}

// Alteração na função isAdmin para aceitar "Admin" ou "admin"
export function isAdmin() {
    if (typeof window === 'undefined') return false;
    const role = localStorage.getItem('role');
    if (!role) return false;

    // O .trim() remove espaços em branco no início e no fim automaticamente!
    return role.trim().toLowerCase() === 'admin';
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
    localStorage.removeItem('role');
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