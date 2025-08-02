/**
 * Centralizador de todas as chamadas de API
 * Elimina 14+ implementações duplicadas de construção de URL
 */

// SOLUÇÃO: URL hardcoded para garantir funcionamento em produção 
// Baseado na pesquisa: problemas comuns com VITE_API_URL no Render
const API_BASE = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.origin.includes('onrender.com') 
    ? 'https://medcheck-backend.onrender.com' 
    : 'http://localhost:8000');

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
      ...userData,
      senha: userData.password
    };
    delete backendData.password;
    
    const response = await fetch(`${API_BASE}/api/v1/register`, {
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