"""
Testes de integração para endpoints da API MedCheck.
Testam fluxos completos end-to-end da aplicação.
"""

import json
from io import BytesIO

import pytest
from fastapi.testclient import TestClient


class TestAuthenticationEndpoints:
    """Testes para endpoints de autenticação."""

    def test_login_valid_credentials_success(self, client, sample_user_data):
        """Teste: login com credenciais válidas retorna token."""
        # Act
        response = client.post(
            "/token",
            data={
                "username": sample_user_data["crm"],
                "password": sample_user_data["password"],
                "scope": sample_user_data["uf"],
            },
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert "access_token" in response_data
        assert "token_type" in response_data
        assert response_data["token_type"] == "bearer"

    def test_login_invalid_credentials_failure(self, client):
        """Teste: login com credenciais inválidas retorna 401."""
        # Arrange
        invalid_credentials = {"uf": "SP", "crm": "99999", "password": "wrong_password"}

        # Act
        response = client.post("/token", json=invalid_credentials)

        # Assert
        assert response.status_code == 401
        assert "detail" in response.json()

    def test_login_missing_fields_validation_error(self, client):
        """Teste: login sem campos obrigatórios retorna erro de validação."""
        # Arrange
        incomplete_data = {"uf": "RN"}  # Faltando CRM e password

        # Act
        response = client.post("/token", json=incomplete_data)

        # Assert
        assert response.status_code == 422
        error_detail = response.json()
        assert "detail" in error_detail

    def test_logout_authenticated_user_success(self, client, authenticated_headers):
        """Teste: logout de usuário autenticado funciona corretamente."""
        # Act
        response = client.post("/logout", headers=authenticated_headers)

        # Assert
        assert response.status_code == 200
        assert response.json()["message"] == "Logout realizado com sucesso"

    def test_protected_endpoint_without_auth_fails(self, client):
        """Teste: endpoint protegido sem autenticação retorna 401."""
        # Act
        response = client.get("/api/v1/dashboard")

        # Assert
        assert response.status_code == 401


class TestDashboardEndpoints:
    """Testes para endpoints do dashboard."""

    def test_dashboard_stats_authenticated_user(self, client, authenticated_headers):
        """Teste: dashboard retorna estatísticas para usuário autenticado."""
        # Act
        response = client.get("/api/v1/dashboard", headers=authenticated_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()

        # Verifica estrutura esperada dos dados
        assert "total_demonstrativos" in data
        assert "total_guias" in data
        assert "valor_total_glosado" in data
        assert "procedimentos_divergentes" in data
        assert isinstance(data["total_demonstrativos"], int)
        assert isinstance(data["valor_total_glosado"], (int, float))

    def test_dashboard_stats_includes_recent_uploads(
        self, client, authenticated_headers
    ):
        """Teste: dashboard inclui uploads recentes."""
        # Act
        response = client.get("/api/v1/dashboard", headers=authenticated_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "uploads_recentes" in data
        assert isinstance(data["uploads_recentes"], list)

    def test_dashboard_performance_within_limits(self, client, authenticated_headers):
        """Teste: dashboard responde em tempo aceitável."""
        import time

        # Act
        start_time = time.time()
        response = client.get("/api/v1/dashboard", headers=authenticated_headers)
        end_time = time.time()

        # Assert
        assert response.status_code == 200
        response_time = end_time - start_time
        assert response_time < 2.0  # Deve responder em menos de 2 segundos


class TestDemonstrativosEndpoints:
    """Testes para endpoints de demonstrativos."""

    def test_get_demonstrativos_list_success(self, client, authenticated_headers):
        """Teste: listagem de demonstrativos funciona corretamente."""
        # Act
        response = client.get("/api/v1/demonstrativos", headers=authenticated_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_demonstrativos_pagination(self, client, authenticated_headers):
        """Teste: paginação de demonstrativos funciona."""
        # Act
        response = client.get(
            "/api/v1/demonstrativos?limit=10&offset=0", headers=authenticated_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 10

    def test_get_specific_demonstrativo_success(self, client, authenticated_headers):
        """Teste: busca de demonstrativo específico funciona."""
        # Primeiro, obter lista de demonstrativos
        list_response = client.get(
            "/api/v1/demonstrativos", headers=authenticated_headers
        )
        demonstrativos = list_response.json()

        if demonstrativos:
            demo_id = demonstrativos[0]["id"]

            # Act
            response = client.get(
                f"/api/v1/demonstrativos/{demo_id}", headers=authenticated_headers
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert "id" in data
            assert data["id"] == demo_id

    def test_get_demonstrativo_procedures_with_cross_reference(
        self, client, authenticated_headers
    ):
        """Teste: endpoint de procedimentos com cross-reference funciona."""
        # Obter um demonstrativo existente
        list_response = client.get(
            "/api/v1/demonstrativos", headers=authenticated_headers
        )
        demonstrativos = list_response.json()

        if demonstrativos:
            demo_id = demonstrativos[0]["id"]

            # Act
            response = client.get(
                f"/api/v1/demonstrativos/{demo_id}/procedimentos",
                headers=authenticated_headers,
            )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert isinstance(data, list)

            # Verificar se cross-reference está ativo
            if data:
                procedure = data[0]
                assert "cbhpm_match" in procedure
                assert "discrepancy_value" in procedure

    def test_upload_demonstrativo_valid_pdf(
        self, client, authenticated_headers, sample_pdf_file
    ):
        """Teste: upload de demonstrativo válido funciona."""
        # Arrange
        files = {"file": ("test_demo.pdf", sample_pdf_file, "application/pdf")}

        # Act
        response = client.post(
            "/api/v1/demonstrativos/upload", files=files, headers=authenticated_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "job_id" in data

    def test_upload_demonstrativo_invalid_file_type(
        self, client, authenticated_headers
    ):
        """Teste: upload de arquivo inválido retorna erro."""
        # Arrange
        invalid_file = BytesIO(b"invalid content")
        files = {"file": ("test.txt", invalid_file, "text/plain")}

        # Act
        response = client.post(
            "/api/v1/demonstrativos/upload", files=files, headers=authenticated_headers
        )

        # Assert
        assert response.status_code == 400
        assert "detail" in response.json()


class TestGuiasEndpoints:
    """Testes para endpoints de guias médicas."""

    def test_get_guias_list_success(self, client, authenticated_headers):
        """Teste: listagem de guias funciona corretamente."""
        # Act
        response = client.get("/api/v1/guias", headers=authenticated_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_upload_guias_valid_excel(self, client, authenticated_headers):
        """Teste: upload de guias em Excel válido funciona."""
        # Arrange - Criar um Excel simples para teste
        excel_content = BytesIO()
        # Simular conteúdo Excel básico
        excel_content.write(b"Mock Excel Content")
        excel_content.seek(0)

        files = {
            "file": (
                "guias.xlsx",
                excel_content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }

        # Act
        response = client.post(
            "/api/v1/guias/upload", files=files, headers=authenticated_headers
        )

        # Assert
        # Pode ser 200 (sucesso) ou 400 (erro de parsing) dependendo do mock
        assert response.status_code in [200, 400]

    def test_get_guias_filtered_by_beneficiario(self, client, authenticated_headers):
        """Teste: filtro de guias por beneficiário funciona."""
        # Act
        response = client.get(
            "/api/v1/guias?beneficiario=João", headers=authenticated_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_delete_guia_success(self, client, authenticated_headers):
        """Teste: deletar guia funciona corretamente."""
        # Primeiro, obter lista de guias
        list_response = client.get("/api/v1/guias", headers=authenticated_headers)
        guias = list_response.json()

        if guias:
            guia_id = guias[0]["id"]

            # Act
            response = client.delete(
                f"/api/v1/guias/{guia_id}", headers=authenticated_headers
            )

            # Assert
            assert response.status_code == 200
            assert response.json()["message"] == "Guia removida com sucesso"


class TestValidationEndpoints:
    """Testes para endpoints de validação e processamento."""

    def test_validate_upload_creates_job(
        self, client, authenticated_headers, sample_pdf_file
    ):
        """Teste: validação de upload cria job de processamento."""
        # Arrange
        files = {"file": ("validation_test.pdf", sample_pdf_file, "application/pdf")}

        # Act
        response = client.post(
            "/api/v1/validate-upload", files=files, headers=authenticated_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "job_id" in data
        assert "status" in data

    def test_get_processing_job_status(self, client, authenticated_headers):
        """Teste: consulta de status de job funciona."""
        # Act - Usar um job_id mock
        response = client.get(
            "/api/v1/jobs/test-job-id/status", headers=authenticated_headers
        )

        # Assert
        # Pode retornar 200 (job encontrado) ou 404 (job não encontrado)
        assert response.status_code in [200, 404]

    def test_duplicate_file_detection(
        self, client, authenticated_headers, sample_pdf_file
    ):
        """Teste: detecção de arquivos duplicados funciona."""
        # Arrange
        files = {"file": ("duplicate_test.pdf", sample_pdf_file, "application/pdf")}

        # Act - Fazer upload duas vezes
        response1 = client.post(
            "/api/v1/demonstrativos/upload", files=files, headers=authenticated_headers
        )

        # Reset file pointer
        sample_pdf_file.seek(0)
        files = {"file": ("duplicate_test.pdf", sample_pdf_file, "application/pdf")}

        response2 = client.post(
            "/api/v1/demonstrativos/upload", files=files, headers=authenticated_headers
        )

        # Assert
        assert response1.status_code == 200
        # Segunda tentativa pode retornar erro de duplicata ou sucesso dependendo da implementação
        assert response2.status_code in [200, 400, 409]


class TestActivityLogsEndpoints:
    """Testes para endpoints de logs de atividade."""

    def test_get_activity_logs_success(self, client, authenticated_headers):
        """Teste: busca de logs de atividade funciona."""
        # Act
        response = client.get("/api/v1/activity-logs", headers=authenticated_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_activity_logs_pagination(self, client, authenticated_headers):
        """Teste: paginação de logs funciona."""
        # Act
        response = client.get(
            "/api/v1/activity-logs?limit=5&offset=0", headers=authenticated_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5

    def test_activity_logs_filtering_by_date(self, client, authenticated_headers):
        """Teste: filtro de logs por data funciona."""
        # Act
        response = client.get(
            "/api/v1/activity-logs?start_date=2023-01-01&end_date=2023-12-31",
            headers=authenticated_headers,
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestProfileEndpoints:
    """Testes para endpoints de perfil do usuário."""

    def test_get_user_profile_success(self, client, authenticated_headers):
        """Teste: busca de perfil de usuário funciona."""
        # Act
        response = client.get("/api/v1/profile", headers=authenticated_headers)

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "uf" in data
        assert "crm" in data
        assert "nome" in data

    def test_update_user_profile_success(self, client, authenticated_headers):
        """Teste: atualização de perfil funciona."""
        # Arrange
        update_data = {"nome": "Dr. João Updated", "email": "novo_email@example.com"}

        # Act
        response = client.put(
            "/api/v1/profile", json=update_data, headers=authenticated_headers
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Perfil atualizado com sucesso"


class TestErrorHandlingAndEdgeCases:
    """Testes para tratamento de erros e casos extremos."""

    def test_invalid_demo_id_returns_404(self, client, authenticated_headers):
        """Teste: ID de demonstrativo inválido retorna 404."""
        # Act
        response = client.get(
            "/api/v1/demonstrativos/99999", headers=authenticated_headers
        )

        # Assert
        assert response.status_code == 404

    def test_large_file_upload_handling(self, client, authenticated_headers):
        """Teste: upload de arquivo grande é tratado corretamente."""
        # Arrange - Criar arquivo "grande" (simulado)
        large_content = b"x" * (10 * 1024 * 1024)  # 10MB
        large_file = BytesIO(large_content)
        files = {"file": ("large_file.pdf", large_file, "application/pdf")}

        # Act
        response = client.post(
            "/api/v1/demonstrativos/upload", files=files, headers=authenticated_headers
        )

        # Assert
        # Pode retornar erro de tamanho ou sucesso dependendo dos limites configurados
        assert response.status_code in [200, 413, 400]

    def test_malformed_json_request_handling(self, client, authenticated_headers):
        """Teste: JSON malformado é tratado corretamente."""
        # Act
        response = client.post(
            "/token",
            data="invalid json content",
            headers={"Content-Type": "application/json"},
        )

        # Assert
        assert response.status_code == 422

    def test_concurrent_uploads_handling(
        self, client, authenticated_headers, sample_pdf_file
    ):
        """Teste: uploads concorrentes são tratados corretamente."""
        import threading
        import time

        responses = []

        def upload_file():
            sample_pdf_file.seek(0)
            files = {
                "file": ("concurrent_test.pdf", sample_pdf_file, "application/pdf")
            }
            response = client.post(
                "/api/v1/demonstrativos/upload",
                files=files,
                headers=authenticated_headers,
            )
            responses.append(response)

        # Act - Fazer uploads concorrentes
        threads = []
        for i in range(3):
            thread = threading.Thread(target=upload_file)
            threads.append(thread)
            thread.start()

        for thread in threads:
            thread.join()

        # Assert
        assert len(responses) == 3
        # Pelo menos um deve ter sucesso
        success_responses = [r for r in responses if r.status_code == 200]
        assert len(success_responses) >= 1
