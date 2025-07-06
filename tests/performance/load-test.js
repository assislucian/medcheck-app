/**
 * Teste de carga para API MedCheck usando k6
 * Simula 100 usuários virtuais por 5 minutos
 * Valida response time < 300ms (avg) e < 500ms (95th percentile)
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Métricas customizadas
export const errorRate = new Rate("errors");

// Configuração do teste
export const options = {
  stages: [
    { duration: "30s", target: 20 }, // Warm-up: 20 usuários
    { duration: "2m", target: 50 }, // Ramp-up: 50 usuários
    { duration: "5m", target: 100 }, // Load test: 100 usuários
    { duration: "2m", target: 50 }, // Ramp-down: 50 usuários
    { duration: "30s", target: 0 }, // Cool-down: 0 usuários
  ],
  thresholds: {
    http_req_duration: ["avg<300", "p(95)<500"], // Response time requirements
    http_req_failed: ["rate<0.1"], // Error rate < 10%
    errors: ["rate<0.05"], // Application errors < 5%
  },
};

// Configuração base
const BASE_URL = __ENV.BASE_URL || "http://localhost:8000";

// Dados de teste
const TEST_USER = {
  uf: "RN",
  crm: "6091",
  password: "@Luassis90",
};

/**
 * Função principal do teste
 */
export default function () {
  // 1. Teste de Login
  const loginResponse = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify(TEST_USER),
    {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "login" },
    },
  );

  const loginSuccess = check(loginResponse, {
    "login status is 200": (r) => r.status === 200,
    "login response time < 2s": (r) => r.timings.duration < 2000,
    "login returns access token": (r) => r.json("access_token") !== undefined,
  });

  if (!loginSuccess) {
    errorRate.add(1);
    return;
  }

  const token = loginResponse.json("access_token");
  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // 2. Teste de Dashboard
  const dashboardResponse = http.get(`${BASE_URL}/api/v1/dashboard`, {
    headers: authHeaders,
    tags: { endpoint: "dashboard" },
  });

  check(dashboardResponse, {
    "dashboard status is 200": (r) => r.status === 200,
    "dashboard response time < 1s": (r) => r.timings.duration < 1000,
    "dashboard has required fields": (r) => {
      const data = r.json();
      return (
        data.total_demonstrativos !== undefined &&
        data.total_guias !== undefined &&
        data.valor_total_glosado !== undefined
      );
    },
  }) || errorRate.add(1);

  // 3. Teste de Demonstrativos
  const demonstrativosResponse = http.get(`${BASE_URL}/api/v1/demonstrativos`, {
    headers: authHeaders,
    tags: { endpoint: "demonstrativos" },
  });

  check(demonstrativosResponse, {
    "demonstrativos status is 200": (r) => r.status === 200,
    "demonstrativos response time < 1.5s": (r) => r.timings.duration < 1500,
    "demonstrativos returns array": (r) => Array.isArray(r.json()),
  }) || errorRate.add(1);

  // 4. Teste de Guias
  const guiasResponse = http.get(`${BASE_URL}/api/v1/guias`, {
    headers: authHeaders,
    tags: { endpoint: "guias" },
  });

  check(guiasResponse, {
    "guias status is 200": (r) => r.status === 200,
    "guias response time < 1.5s": (r) => r.timings.duration < 1500,
    "guias returns array": (r) => Array.isArray(r.json()),
  }) || errorRate.add(1);

  // 5. Teste de Activity Logs
  const logsResponse = http.get(`${BASE_URL}/api/v1/activity-logs?limit=10`, {
    headers: authHeaders,
    tags: { endpoint: "activity-logs" },
  });

  check(logsResponse, {
    "logs status is 200": (r) => r.status === 200,
    "logs response time < 1s": (r) => r.timings.duration < 1000,
    "logs returns array": (r) => Array.isArray(r.json()),
  }) || errorRate.add(1);

  // 6. Teste de Perfil
  const profileResponse = http.get(`${BASE_URL}/api/v1/profile`, {
    headers: authHeaders,
    tags: { endpoint: "profile" },
  });

  check(profileResponse, {
    "profile status is 200": (r) => r.status === 200,
    "profile response time < 500ms": (r) => r.timings.duration < 500,
    "profile has user data": (r) => {
      const data = r.json();
      return data.uf !== undefined && data.crm !== undefined;
    },
  }) || errorRate.add(1);

  // Simular tempo de leitura do usuário
  sleep(1 + Math.random() * 2); // 1-3 segundos
}

/**
 * Função executada uma vez no setup
 */
export function setup() {
  console.log("🚀 Iniciando teste de carga MedCheck");
  console.log(`📍 Target: ${BASE_URL}`);

  // Verificar se API está disponível
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error(`❌ API não está disponível: ${healthCheck.status}`);
  }

  console.log("✅ API está disponível");
  return {};
}

/**
 * Função executada uma vez no teardown
 */
export function teardown(data) {
  console.log("🏁 Teste de carga finalizado");
}

/**
 * Cenário específico para teste de upload
 */
export function uploadScenario() {
  // Simular upload de arquivo pequeno
  const formData = {
    file: http.file("test.pdf", "fake-pdf-content", "application/pdf"),
  };

  const uploadResponse = http.post(
    `${BASE_URL}/api/v1/validate-upload`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${__ENV.TOKEN}`,
      },
      tags: { endpoint: "upload" },
    },
  );

  check(uploadResponse, {
    "upload status is 200 or 400": (r) => [200, 400].includes(r.status),
    "upload response time < 5s": (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);
}

/**
 * Cenário de stress test para demonstrativos com procedimentos
 */
export function demonstrativosStressTest() {
  const token = __ENV.TOKEN;
  if (!token) return;

  // Buscar demonstrativo específico
  const detailResponse = http.get(
    `${BASE_URL}/api/v1/demonstrativos/3/procedimentos`,
    {
      headers: { Authorization: `Bearer ${token}` },
      tags: { endpoint: "demonstrativo-details" },
    },
  );

  check(detailResponse, {
    "demo details status is 200": (r) => r.status === 200,
    "demo details response time < 2s": (r) => r.timings.duration < 2000,
    "demo details has cross-reference": (r) => {
      const data = r.json();
      return Array.isArray(data) && data.length > 0;
    },
  }) || errorRate.add(1);
}
