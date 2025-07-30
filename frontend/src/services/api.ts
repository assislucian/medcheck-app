// frontend/src/services/api.ts
const API_URL =
  import.meta.env.VITE_API_URL ?? 'https://medcheck-backend.onrender.com';

export type RegisterPayload = {
  uf: string;
  crm: string;
  nome: string;
  email: string;
  password: string;
  terms_accepted: boolean;
  terms_version: string;
};

export async function registerUser(payload: RegisterPayload) {
  const res = await fetch(`${API_URL}/api/v1/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) detail = JSON.stringify(data.detail);
    } catch {}
    throw new Error(detail);
  }

  return res.json(); // { message: "..." }
}

export async function loginWithPassword(email: string, password: string) {
  const form = new URLSearchParams();
  form.set('username', email);
  form.set('password', password);

  const res = await fetch(`${API_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) detail = JSON.stringify(data.detail);
    } catch {}
    throw new Error(detail);
  }

  return res.json(); // { access_token, token_type }
}
