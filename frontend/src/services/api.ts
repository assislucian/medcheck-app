/**
 * Centralizador de todas as chamadas de API
 * Elimina 14+ implementações duplicadas de construção de URL
 */

// RAILWAY + VERCEL SOLUTION: Auto-detect backend
const API_BASE = (() => {
  // Priority 1: Environment variable (for custom setups)
  if (import.meta.env.VITE_API_URL) {
    console.log('🔧 API_BASE: Using VITE_API_URL =', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }

  // Priority 2: Runtime detection
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('🔧 API_BASE: Detecting from origin =', origin);

    if (origin.includes('vercel.app')) {
      // RAILWAY INTEGRATION: Use Railway backend for Vercel frontend
      const apiUrl = 'https://medcheck-app-medcheck.up.railway.app';
      console.log('🔧 API_BASE: Vercel detected, using Railway backend =', apiUrl);
      return apiUrl;
    }

    if (origin.includes('railway.app')) {
      const apiUrl = 'https://medcheck-app-medcheck.up.railway.app';
      console.log('🔧 API_BASE: Railway detected, using =', apiUrl);
      return apiUrl;
    }

    if (origin.includes('onrender.com')) {
      const apiUrl = 'https://medcheck-backend.onrender.com';
      console.log('🔧 API_BASE: Render detected (fallback), using =', apiUrl);
      return apiUrl;
    }
  }

  // Priority 3: Development fallback
  console.log('🔧 API_BASE: Using development fallback = http://localhost:8000');
  return 'http://localhost:8000';
})();

export class ApiService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    // ✅ CORREÇÃO: Status 204 (NO_CONTENT) não tem corpo na resposta
    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  // ===== DEMONSTRATIVOS =====
  static async getDemonstratives() {
    const response = await fetch(`${API_BASE}/api/v1/demonstrativos`, {
      headers: this.getAuthHeaders(),
    });
    return ApiService.handleResponse(response);
  }

  static async deleteDemonstrative(id: number) {
    const response = await fetch(`${API_BASE}/api/v1/demonstrativos/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return ApiService.handleResponse(response);
  }

  static async uploadDemonstrative(formData: FormData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/v1/upload/demonstrativos`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return ApiService.handleResponse(response);
  }

  static async getDemonstrativeDetails(id: number) {
    const response = await fetch(`${API_BASE}/api/v1/demonstrativos/${id}/detalhes`, {
      headers: this.getAuthHeaders(),
    });
    return ApiService.handleResponse(response);
  }

  // ===== GUIAS =====
  static async getGuides(params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const url = `${API_BASE}/api/v1/guias${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    return ApiService.handleResponse(response);
  }

  static async deleteGuide(numeroGuia: string) {
    const response = await fetch(`${API_BASE}/api/v1/guias/${numeroGuia}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return ApiService.handleResponse(response);
  }

  static async uploadGuides(formData: FormData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/v1/upload/guias`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    return ApiService.handleResponse(response);
  }

  // ===== DASHBOARD =====
  static async getDashboardStats() {
    const response = await fetch(`${API_BASE}/api/v1/dashboard`, {
      headers: this.getAuthHeaders(),
    });
    return ApiService.handleResponse(response);
  }

  // ===== UNPAID PROCEDURES =====
  static async getUnpaidProcedures() {
    const response = await fetch(`${API_BASE}/api/v1/unpaid-procedures`, {
      headers: this.getAuthHeaders(),
    });
    return ApiService.handleResponse(response);
  }

  // ===== REPORTS =====
  static async exportReport(format: string = 'excel') {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/v1/reports/export?format=${format}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar relatório');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // ===== ACTIVITY LOGS =====
  static async getActivityLogs(limit: number = 100) {
    const response = await fetch(`${API_BASE}/api/v1/activity-logs?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    return ApiService.handleResponse(response);
  }

  // ===== PROFILE =====
  static async getProfile() {
    const response = await fetch(`${API_BASE}/api/v1/profile`, {
      headers: this.getAuthHeaders(),
    });
    return ApiService.handleResponse(response);
  }

  static async updateProfile(profileData: any) {
    const response = await fetch(`${API_BASE}/api/v1/profile`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return ApiService.handleResponse(response);
  }

  // ===== AUTHENTICATION =====
  static async registerUser(userData: {
    uf: string;
    crm: string;
    nome: string;
    email: string;
    password: string;
    terms_accepted: boolean;
    terms_version: string;
  }) {
    // Mapear password para senha conforme esperado pelo backend
    const backendData = {
      crm: userData.crm,
      nome: userData.nome,
      email: userData.email,
      senha: userData.password,
    };

    const response = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });
    return ApiService.handleResponse(response);
  }

  static async loginWithPassword(credentials: {
    email: string;
    password: string;
  }) {
    const response = await fetch(`${API_BASE}/api/v1/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return ApiService.handleResponse(response);
  }
}

// Exports for backward compatibility
export const registerUser = ApiService.registerUser;
export const loginWithPassword = ApiService.loginWithPassword;