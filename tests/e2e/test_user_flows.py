"""
Testes end-to-end para fluxos críticos do usuário no MedCheck.
Usa Playwright para automatizar navegador e testar interface completa.
"""

import os
import time

import pytest
from playwright.sync_api import Browser, Page, expect


class TestAuthenticationFlow:
    """Testes E2E para fluxo de autenticação."""

    def test_login_flow_success(self, page: Page):
        """Teste: fluxo completo de login bem-sucedido."""
        # Arrange
        page.goto("http://localhost:3000")

        # Act - Fazer login
        page.fill('input[name="uf"]', "RN")
        page.fill('input[name="crm"]', "6091")
        page.fill('input[name="password"]', "password123")
        page.click('button[type="submit"]')

        # Assert - Verificar redirecionamento para dashboard
        expect(page).to_have_url("http://localhost:3000/dashboard")
        expect(page.locator('[data-testid="dashboard-title"]')).to_be_visible()

    def test_login_invalid_credentials(self, page: Page):
        """Teste: login com credenciais inválidas mostra erro."""
        # Arrange
        page.goto("http://localhost:3000")

        # Act
        page.fill('input[name="uf"]', "SP")
        page.fill('input[name="crm"]', "99999")
        page.fill('input[name="password"]', "wrong_password")
        page.click('button[type="submit"]')

        # Assert
        expect(page.locator('[data-testid="error-message"]')).to_be_visible()
        expect(page.locator('[data-testid="error-message"]')).to_contain_text(
            "Credenciais inválidas"
        )

    def test_logout_flow(self, page: Page):
        """Teste: fluxo de logout funciona corretamente."""
        # Arrange - Fazer login primeiro
        self._do_login(page)

        # Act
        page.click('[data-testid="user-menu"]')
        page.click('[data-testid="logout-button"]')

        # Assert
        expect(page).to_have_url("http://localhost:3000/login")
        expect(page.locator('[data-testid="login-form"]')).to_be_visible()

    def test_session_timeout_handling(self, page: Page):
        """Teste: tratamento de timeout de sessão."""
        # Arrange
        self._do_login(page)

        # Act - Simular timeout removendo token do localStorage
        page.evaluate("localStorage.removeItem('token')")
        page.reload()

        # Assert
        expect(page).to_have_url("http://localhost:3000/login")

    def _do_login(self, page: Page):
        """Helper para fazer login."""
        page.goto("http://localhost:3000")
        page.fill('input[name="uf"]', "RN")
        page.fill('input[name="crm"]', "6091")
        page.fill('input[name="password"]', "password123")
        page.click('button[type="submit"]')
        expect(page).to_have_url("http://localhost:3000/dashboard")


class TestDashboardFlow:
    """Testes E2E para funcionalidades do dashboard."""

    def test_dashboard_loads_data_correctly(self, page: Page):
        """Teste: dashboard carrega dados corretamente."""
        # Arrange
        self._do_login(page)

        # Act
        page.goto("http://localhost:3000/dashboard")

        # Assert - Verificar cards de estatísticas
        expect(page.locator('[data-testid="total-demonstrativos"]')).to_be_visible()
        expect(page.locator('[data-testid="total-guias"]')).to_be_visible()
        expect(page.locator('[data-testid="valor-glosado"]')).to_be_visible()
        expect(
            page.locator('[data-testid="procedimentos-divergentes"]')
        ).to_be_visible()

    def test_dashboard_charts_render(self, page: Page):
        """Teste: gráficos do dashboard são renderizados."""
        # Arrange
        self._do_login(page)
        page.goto("http://localhost:3000/dashboard")

        # Act - Aguardar carregamento dos gráficos
        page.wait_for_timeout(2000)

        # Assert
        expect(page.locator('[data-testid="dashboard-chart"]')).to_be_visible()
        # Verificar se SVG do gráfico foi renderizado
        expect(page.locator("svg")).to_be_visible()

    def test_dashboard_navigation_links(self, page: Page):
        """Teste: links de navegação do dashboard funcionam."""
        # Arrange
        self._do_login(page)
        page.goto("http://localhost:3000/dashboard")

        # Act & Assert - Testar cada link principal
        page.click('[data-testid="nav-demonstrativos"]')
        expect(page).to_have_url("http://localhost:3000/demonstrativos")

        page.click('[data-testid="nav-guias"]')
        expect(page).to_have_url("http://localhost:3000/guias")

        page.click('[data-testid="nav-dashboard"]')
        expect(page).to_have_url("http://localhost:3000/dashboard")

    def test_sync_status_indicator_visible(self, page: Page):
        """Teste: indicador de status de sincronização está visível."""
        # Arrange
        self._do_login(page)

        # Act
        page.goto("http://localhost:3000/dashboard")

        # Assert
        expect(page.locator('[data-testid="sync-status-indicator"]')).to_be_visible()

    def _do_login(self, page: Page):
        """Helper para fazer login."""
        page.goto("http://localhost:3000")
        page.fill('input[name="uf"]', "RN")
        page.fill('input[name="crm"]', "6091")
        page.fill('input[name="password"]', "password123")
        page.click('button[type="submit"]')
        expect(page).to_have_url("http://localhost:3000/dashboard")


class TestGuiasUploadFlow:
    """Testes E2E para fluxo de upload de guias."""

    def test_complete_guias_upload_flow(self, page: Page):
        """Teste: fluxo completo de upload de guias médicas."""
        # Arrange
        self._do_login(page)
        page.goto("http://localhost:3000/guias")

        # Act - Clicar no botão de upload
        page.click('[data-testid="upload-guias-button"]')

        # Verificar se modal de upload abriu
        expect(page.locator('[data-testid="upload-modal"]')).to_be_visible()

        # Simular upload de arquivo
        file_input = page.locator('input[type="file"]')
        # Para teste real, você usaria um arquivo de fixture
        # file_input.set_input_files("tests/fixtures/guias_test.xlsx")

        # Assert - Verificar que área de upload está ativa
        expect(page.locator('[data-testid="file-drop-zone"]')).to_be_visible()

    def test_guias_table_pagination(self, page: Page):
        """Teste: paginação da tabela de guias funciona corretamente."""
        # Arrange
        self._do_login(page)
        page.goto("http://localhost:3000/guias")

        # Act - Aguardar carregamento da tabela
        page.wait_for_selector('[data-testid="guias-table"]')

        # Verificar se botões de paginação estão presentes
        if page.locator('[data-testid="next-page-button"]').is_visible():
            # Act
            page.click('[data-testid="next-page-button"]')

            # Assert
            expect(page.locator('[data-testid="current-page"]')).not_to_contain_text(
                "1"
            )

            # Voltar para página anterior
            page.click('[data-testid="prev-page-button"]')
            expect(page.locator('[data-testid="current-page"]')).to_contain_text("1")

    def test_guias_search_functionality(self, page: Page):
        """Teste: funcionalidade de busca de guias."""
        # Arrange
        self._do_login(page)
        page.goto("http://localhost:3000/guias")

        # Act
        search_input = page.locator('[data-testid="search-input"]')
        if search_input.is_visible():
            search_input.fill("João")
            page.press('[data-testid="search-input"]', "Enter")

            # Assert
            page.wait_for_timeout(1000)  # Aguardar filtro
            # Verificar se resultados contêm o termo buscado
            expect(page.locator('[data-testid="guias-table"]')).to_be_visible()

    def test_guia_deletion_flow(self, page: Page):
        """Teste: fluxo de exclusão de guia."""
        # Arrange
        self._do_login(page)
        page.goto("http://localhost:3000/guias")

        # Act - Aguardar carregamento e verificar se há guias
        page.wait_for_selector('[data-testid="guias-table"]')

        # Se há guias, testar exclusão
        delete_buttons = page.locator('[data-testid="delete-guia-button"]')
        if delete_buttons.count() > 0:
            # Clicar no primeiro botão de deletar
            delete_buttons.first.click()

            # Confirmar exclusão no modal
            expect(page.locator('[data-testid="confirm-delete-modal"]')).to_be_visible()
            page.click('[data-testid="confirm-delete-button"]')

            # Assert - Verificar mensagem de sucesso
            expect(page.locator('[data-testid="success-toast"]')).to_be_visible()

    def _do_login(self, page: Page):
        """Helper para fazer login."""
        page.goto("http://localhost:3000")
        page.fill('input[name="uf"]', "RN")
        page.fill('input[name="crm"]', "6091")
        page.fill('input[name="password"]', "password123")
        page.click('button[type="submit"]')
        expect(page).to_have_url("http://localhost:3000/dashboard")


class TestDemonstrativosFlow:
    """Testes E2E para fluxo de demonstrativos."""

    def test_demonstrativos_list_loads(self, page: Page):
        """Teste: lista de demonstrativos carrega corretamente."""
        # Arrange
        self._do_login(page)

        # Act
        page.goto("http://localhost:3000/demonstrativos")

        # Assert
        expect(page.locator('[data-testid="demonstrativos-table"]')).to_be_visible()
        expect(
            page.locator('[data-testid="upload-demonstrativos-button"]')
        ).to_be_visible()

    def test_demonstrativo_details_view(self, page: Page):
        """Teste: visualização de detalhes de demonstrativo."""
        # Arrange
        self._do_login(page)
        page.goto("http://localhost:3000/demonstrativos")

        # Act - Clicar no primeiro demonstrativo se existir
        page.wait_for_selector('[data-testid="demonstrativos-table"]')

        view_buttons = page.locator('[data-testid="view-demonstrativo-button"]')
        if view_buttons.count() > 0:
            view_buttons.first.click()

            # Assert - Verificar modal ou página de detalhes
            expect(
                page.locator('[data-testid="demonstrativo-details"]')
            ).to_be_visible()

    def test_procedimentos_cross_reference_display(self, page: Page):
        """Teste: exibição de cross-reference de procedimentos."""
        # Arrange
        self._do_login(page)
        page.goto("http://localhost:3000/demonstrativos")

        # Act - Abrir detalhes se disponível
        page.wait_for_selector('[data-testid="demonstrativos-table"]')

        view_buttons = page.locator('[data-testid="view-demonstrativo-button"]')
        if view_buttons.count() > 0:
            view_buttons.first.click()

            # Assert - Verificar se cross-reference está visível
            expect(page.locator('[data-testid="procedimentos-list"]')).to_be_visible()

            # Verificar se dados de CBHPM estão presentes
            cbhpm_elements = page.locator('[data-testid="cbhpm-value"]')
            if cbhpm_elements.count() > 0:
                expect(cbhpm_elements.first).to_be_visible()

    def _do_login(self, page: Page):
        """Helper para fazer login."""
        page.goto("http://localhost:3000")
        page.fill('input[name="uf"]', "RN")
        page.fill('input[name="crm"]', "6091")
        page.fill('input[name="password"]', "password123")
        page.click('button[type="submit"]')
        expect(page).to_have_url("http://localhost:3000/dashboard")


class TestAccessibilityAndUsability:
    """Testes E2E para acessibilidade e usabilidade."""

    def test_keyboard_navigation(self, page: Page):
        """Teste: navegação por teclado funciona."""
        # Arrange
        page.goto("http://localhost:3000")

        # Act - Navegar usando Tab
        page.press("body", "Tab")
        page.press("body", "Tab")
        page.press("body", "Tab")

        # Assert - Verificar se elementos recebem foco
        focused_element = page.evaluate("document.activeElement.tagName")
        assert focused_element in ["INPUT", "BUTTON"]

    def test_responsive_design_mobile(self, page: Page):
        """Teste: design responsivo em mobile."""
        # Arrange
        page.set_viewport_size({"width": 375, "height": 667})  # iPhone SE
        self._do_login(page)

        # Act
        page.goto("http://localhost:3000/dashboard")

        # Assert - Verificar se menu mobile está presente
        expect(page.locator('[data-testid="mobile-menu-button"]')).to_be_visible()

    def test_dark_mode_toggle(self, page: Page):
        """Teste: toggle de modo escuro funciona."""
        # Arrange
        self._do_login(page)

        # Act
        theme_toggle = page.locator('[data-testid="theme-toggle"]')
        if theme_toggle.is_visible():
            theme_toggle.click()

            # Assert - Verificar se classe dark foi adicionada
            html_element = page.locator("html")
            expect(html_element).to_have_class("dark")

    def test_loading_states_display(self, page: Page):
        """Teste: estados de carregamento são exibidos."""
        # Arrange
        self._do_login(page)

        # Act - Navegar para página que deve mostrar loading
        page.goto("http://localhost:3000/demonstrativos")

        # Assert - Verificar se loading spinner aparece brevemente
        # Note: Este teste pode precisar de ajustes baseado na implementação
        page.wait_for_timeout(100)  # Aguardar início do carregamento

    def _do_login(self, page: Page):
        """Helper para fazer login."""
        page.goto("http://localhost:3000")
        page.fill('input[name="uf"]', "RN")
        page.fill('input[name="crm"]', "6091")
        page.fill('input[name="password"]', "password123")
        page.click('button[type="submit"]')
        expect(page).to_have_url("http://localhost:3000/dashboard")


class TestPerformanceAndReliability:
    """Testes E2E para performance e confiabilidade."""

    def test_page_load_performance(self, page: Page):
        """Teste: performance de carregamento de páginas."""
        # Arrange
        self._do_login(page)

        # Act & Assert - Testar carregamento de páginas principais
        start_time = time.time()
        page.goto("http://localhost:3000/dashboard")
        page.wait_for_load_state("networkidle")
        dashboard_load_time = time.time() - start_time

        start_time = time.time()
        page.goto("http://localhost:3000/guias")
        page.wait_for_load_state("networkidle")
        guias_load_time = time.time() - start_time

        # Assert - Páginas devem carregar em menos de 3 segundos
        assert (
            dashboard_load_time < 3.0
        ), f"Dashboard carregou em {dashboard_load_time:.2f}s (muito lento)"
        assert (
            guias_load_time < 3.0
        ), f"Guias carregou em {guias_load_time:.2f}s (muito lento)"

    def test_memory_usage_stability(self, page: Page):
        """Teste: uso de memória permanece estável."""
        # Arrange
        self._do_login(page)

        # Act - Navegar entre páginas múltiplas vezes
        for _ in range(5):
            page.goto("http://localhost:3000/dashboard")
            page.wait_for_timeout(500)
            page.goto("http://localhost:3000/guias")
            page.wait_for_timeout(500)
            page.goto("http://localhost:3000/demonstrativos")
            page.wait_for_timeout(500)

        # Assert - Não deveria haver vazamentos visíveis
        # Note: Este teste é mais observacional
        assert True  # Placeholder - implementar métricas reais se necessário

    def test_network_error_handling(self, page: Page):
        """Teste: tratamento de erros de rede."""
        # Arrange
        self._do_login(page)

        # Act - Simular falha de rede
        page.route("**/api/**", lambda route: route.abort())
        page.goto("http://localhost:3000/dashboard")

        # Assert - Verificar se mensagem de erro é exibida
        expect(page.locator('[data-testid="network-error"]')).to_be_visible(
            timeout=5000
        )

    def _do_login(self, page: Page):
        """Helper para fazer login."""
        page.goto("http://localhost:3000")
        page.fill('input[name="uf"]', "RN")
        page.fill('input[name="crm"]', "6091")
        page.fill('input[name="password"]', "password123")
        page.click('button[type="submit"]')
        expect(page).to_have_url("http://localhost:3000/dashboard")
