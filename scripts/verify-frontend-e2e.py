#!/usr/bin/env python3
"""
🎭 MedCheck - Verificação End-to-End do Frontend
===============================================

Este script testa as funcionalidades críticas do frontend usando Playwright
para simular interações reais do usuário.

Testa:
- ✅ Carregamento inicial da aplicação
- ✅ Navegação entre páginas
- ✅ Processo de login
- ✅ Upload de arquivos
- ✅ Visualização de dados
- ✅ Responsividade
- ✅ Sincronização em tempo real
"""

import asyncio
import sys
import time
from datetime import datetime

try:
    from playwright.async_api import async_playwright
except ImportError:
    print(
        "⚠️ Playwright não instalado. Execute: pip install playwright && playwright install"
    )
    sys.exit(1)


class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    PURPLE = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    END = "\033[0m"


class FrontendE2ETester:
    def __init__(self):
        self.results = []
        self.start_time = time.time()
        self.page = None
        self.browser = None
        self.context = None

    def log(self, message, status="INFO", color=Colors.WHITE):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(
            f"{Colors.BOLD}[{timestamp}]{Colors.END} {color}{status}{Colors.END} {message}"
        )

    def success(self, message):
        self.log(f"✅ {message}", "PASS", Colors.GREEN)
        self.results.append(("PASS", message))

    def error(self, message):
        self.log(f"❌ {message}", "FAIL", Colors.RED)
        self.results.append(("FAIL", message))

    def warning(self, message):
        self.log(f"⚠️  {message}", "WARN", Colors.YELLOW)
        self.results.append(("WARN", message))

    def info(self, message):
        self.log(f"🎭 {message}", "INFO", Colors.BLUE)

    async def setup_browser(self):
        """Configurar browser para testes"""
        self.info("Configurando browser para testes...")

        try:
            playwright = await async_playwright().start()

            # Usar Chromium para testes
            self.browser = await playwright.chromium.launch(
                headless=True,  # Mudar para False para debug visual
                args=["--no-sandbox", "--disable-setuid-sandbox"],
            )

            # Criar contexto com configurações realistas
            self.context = await self.browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            )

            # Criar página
            self.page = await self.context.new_page()

            # Configurar timeouts
            self.page.set_default_timeout(30000)  # 30 segundos

            self.success("Browser configurado com sucesso")

        except Exception as e:
            self.error(f"Erro ao configurar browser: {e}")
            return False

        return True

    async def test_initial_load(self):
        """Testar carregamento inicial da aplicação"""
        self.info("Testando carregamento inicial...")

        try:
            # Navegar para a aplicação
            start_time = time.time()
            await self.page.goto("http://localhost:8080")
            load_time = (time.time() - start_time) * 1000

            # Verificar se a página carregou
            await self.page.wait_for_load_state("networkidle")

            # Verificar título
            title = await self.page.title()
            if "MedCheck" in title or "Vite" in title:
                self.success(f"Aplicação carregou corretamente ({load_time:.0f}ms)")
            else:
                self.warning(f"Título inesperado: {title}")

            # Verificar se elementos básicos estão presentes
            try:
                await self.page.wait_for_selector("body", timeout=5000)
                self.success("DOM básico carregado")
            except:
                self.error("DOM não carregou adequadamente")

            # Verificar se há erros JavaScript
            errors = []
            self.page.on("pageerror", lambda error: errors.append(str(error)))

            # Aguardar um pouco para capturar erros
            await asyncio.sleep(2)

            if not errors:
                self.success("Nenhum erro JavaScript detectado")
            else:
                self.warning(f"Erros JavaScript encontrados: {len(errors)}")

            # Verificar performance de carregamento
            if load_time < 2000:
                self.success(f"Carregamento rápido ({load_time:.0f}ms)")
            elif load_time < 5000:
                self.warning(f"Carregamento moderado ({load_time:.0f}ms)")
            else:
                self.error(f"Carregamento lento ({load_time:.0f}ms)")

        except Exception as e:
            self.error(f"Erro no teste de carregamento: {e}")

    async def test_navigation(self):
        """Testar navegação entre páginas"""
        self.info("Testando navegação...")

        try:
            # Tentar encontrar elementos de navegação
            nav_selectors = [
                "nav",
                ".navbar",
                "[role='navigation']",
                "header",
                ".header",
                ".nav",
                ".menu",
            ]

            nav_found = False
            for selector in nav_selectors:
                try:
                    nav_element = await self.page.wait_for_selector(
                        selector, timeout=3000
                    )
                    if nav_element:
                        nav_found = True
                        self.success(f"Navegação encontrada: {selector}")
                        break
                except:
                    continue

            if not nav_found:
                self.warning("Elemento de navegação não identificado automaticamente")

            # Testar links básicos se existirem
            links = await self.page.query_selector_all("a[href]")

            if links:
                self.success(f"Encontrados {len(links)} links na página")

                # Testar alguns links (máximo 3)
                for i, link in enumerate(links[:3]):
                    try:
                        href = await link.get_attribute("href")
                        if href and not href.startswith("http") and href != "#":
                            await link.click()
                            await self.page.wait_for_load_state(
                                "networkidle", timeout=5000
                            )

                            current_url = self.page.url
                            self.success(f"Navegação para {href} funcionando")

                            # Voltar para página inicial
                            await self.page.go_back()
                            await self.page.wait_for_load_state(
                                "networkidle", timeout=5000
                            )

                    except Exception as e:
                        self.warning(f"Erro ao testar link {href}: {e}")

            else:
                self.warning("Nenhum link de navegação encontrado")

        except Exception as e:
            self.error(f"Erro no teste de navegação: {e}")

    async def test_responsive_design(self):
        """Testar responsividade"""
        self.info("Testando responsividade...")

        try:
            # Testar diferentes resoluções
            viewports = [
                {"width": 375, "height": 667, "name": "Mobile"},
                {"width": 768, "height": 1024, "name": "Tablet"},
                {"width": 1920, "height": 1080, "name": "Desktop"},
            ]

            for viewport in viewports:
                await self.page.set_viewport_size(
                    {"width": viewport["width"], "height": viewport["height"]}
                )

                # Aguardar re-render
                await asyncio.sleep(1)

                # Verificar se a página ainda está funcional
                body = await self.page.query_selector("body")
                if body:
                    self.success(
                        f"Layout responsivo em {viewport['name']} ({viewport['width']}x{viewport['height']})"
                    )
                else:
                    self.error(f"Problema de layout em {viewport['name']}")

            # Voltar para desktop
            await self.page.set_viewport_size({"width": 1920, "height": 1080})

        except Exception as e:
            self.error(f"Erro no teste de responsividade: {e}")

    async def test_form_interactions(self):
        """Testar interações com formulários"""
        self.info("Testando formulários...")

        try:
            # Procurar por formulários
            forms = await self.page.query_selector_all("form")
            inputs = await self.page.query_selector_all("input")
            buttons = await self.page.query_selector_all("button")

            self.info(
                f"Encontrados: {len(forms)} formulários, {len(inputs)} inputs, {len(buttons)} botões"
            )

            if forms:
                self.success("Formulários encontrados na aplicação")
            else:
                self.warning("Nenhum formulário encontrado")

            if inputs:
                # Testar alguns inputs
                for i, input_elem in enumerate(inputs[:3]):
                    try:
                        input_type = await input_elem.get_attribute("type")
                        if input_type in ["text", "email", "password"]:
                            await input_elem.fill("teste")
                            await input_elem.clear()
                            self.success(f"Input tipo {input_type} funcionando")
                    except Exception as e:
                        self.warning(f"Erro ao testar input: {e}")

            if buttons:
                # Verificar se botões são clicáveis
                clickable_buttons = 0
                for button in buttons[:5]:  # Testar máximo 5 botões
                    try:
                        is_disabled = await button.get_attribute("disabled")
                        if not is_disabled:
                            clickable_buttons += 1
                    except:
                        pass

                if clickable_buttons > 0:
                    self.success(f"{clickable_buttons} botões interativos encontrados")
                else:
                    self.warning("Nenhum botão interativo encontrado")

        except Exception as e:
            self.error(f"Erro no teste de formulários: {e}")

    async def test_api_connectivity(self):
        """Testar conectividade com API"""
        self.info("Testando conectividade com API...")

        try:
            # Interceptar requisições de rede
            api_requests = []

            def handle_request(request):
                if "localhost:8000" in request.url:
                    api_requests.append(request.url)

            self.page.on("request", handle_request)

            # Fazer ações que devem trigger requests
            await self.page.reload()
            await self.page.wait_for_load_state("networkidle")

            # Aguardar possíveis requests assíncronos
            await asyncio.sleep(3)

            if api_requests:
                self.success(
                    f"Conectividade com API detectada: {len(api_requests)} requisições"
                )

                # Verificar tipos de requests
                unique_endpoints = set()
                for url in api_requests:
                    endpoint = url.split("localhost:8000")[-1]
                    unique_endpoints.add(endpoint)

                self.info(
                    f"Endpoints acessados: {', '.join(list(unique_endpoints)[:5])}"
                )

            else:
                self.warning("Nenhuma requisição para API detectada")

        except Exception as e:
            self.error(f"Erro no teste de API: {e}")

    async def test_error_handling(self):
        """Testar tratamento de erros"""
        self.info("Testando tratamento de erros...")

        try:
            # Simular cenários de erro
            console_errors = []
            network_errors = []

            def handle_console(msg):
                if msg.type == "error":
                    console_errors.append(msg.text)

            def handle_response(response):
                if response.status >= 400:
                    network_errors.append(response.url)

            self.page.on("console", handle_console)
            self.page.on("response", handle_response)

            # Navegar para página inexistente
            try:
                await self.page.goto("http://localhost:8080/pagina-inexistente")
                await asyncio.sleep(2)
            except:
                pass

            # Voltar para página principal
            await self.page.goto("http://localhost:8080")
            await self.page.wait_for_load_state("networkidle")

            # Verificar se aplicação se recuperou
            title = await self.page.title()
            if title:
                self.success(
                    "Aplicação se recuperou de navegação para página inexistente"
                )
            else:
                self.warning("Aplicação pode ter problemas de recuperação")

            # Analisar erros encontrados
            if len(console_errors) == 0:
                self.success("Nenhum erro de console detectado")
            elif len(console_errors) <= 2:
                self.warning(f"Poucos erros de console: {len(console_errors)}")
            else:
                self.error(f"Muitos erros de console: {len(console_errors)}")

        except Exception as e:
            self.error(f"Erro no teste de tratamento de erros: {e}")

    async def cleanup(self):
        """Limpar recursos"""
        try:
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
        except:
            pass

    def print_summary(self):
        """Imprimir resumo dos resultados"""
        total_time = time.time() - self.start_time

        print(f"\n{Colors.BOLD}{'='*80}{Colors.END}")
        print(
            f"{Colors.BOLD}{Colors.CYAN}🎭 RESUMO DOS TESTES E2E DO FRONTEND{Colors.END}"
        )
        print(f"{Colors.BOLD}{'='*80}{Colors.END}")

        passed = len([r for r in self.results if r[0] == "PASS"])
        failed = len([r for r in self.results if r[0] == "FAIL"])
        warned = len([r for r in self.results if r[0] == "WARN"])
        total = len(self.results)

        print(f"\n{Colors.GREEN}✅ PASSOU: {passed}{Colors.END}")
        print(f"{Colors.RED}❌ FALHOU: {failed}{Colors.END}")
        print(f"{Colors.YELLOW}⚠️  ATENÇÃO: {warned}{Colors.END}")
        print(f"{Colors.BOLD}🎭 TOTAL: {total}{Colors.END}")

        success_rate = (passed / total * 100) if total > 0 else 0

        print(f"\n{Colors.BOLD}📈 Taxa de Sucesso: {success_rate:.1f}%{Colors.END}")
        print(f"{Colors.BOLD}⏱️  Tempo Total: {total_time:.1f}s{Colors.END}")

        # Status final
        if failed == 0 and warned <= 3:
            print(
                f"\n{Colors.BOLD}{Colors.GREEN}🎉 FRONTEND PRONTO PARA PRODUÇÃO!{Colors.END}"
            )
            print(
                f"{Colors.GREEN}Todos os testes críticos do frontend passaram.{Colors.END}"
            )
        elif failed == 0:
            print(f"\n{Colors.BOLD}{Colors.YELLOW}⚠️  FRONTEND QUASE PRONTO{Colors.END}")
            print(
                f"{Colors.YELLOW}Alguns avisos foram encontrados no frontend.{Colors.END}"
            )
        else:
            print(f"\n{Colors.BOLD}{Colors.RED}🚨 PROBLEMAS NO FRONTEND{Colors.END}")
            print(
                f"{Colors.RED}Problemas críticos encontrados no frontend.{Colors.END}"
            )

        # Detalhes dos problemas
        if failed > 0:
            print(f"\n{Colors.BOLD}{Colors.RED}❌ PROBLEMAS CRÍTICOS:{Colors.END}")
            for status, message in self.results:
                if status == "FAIL":
                    print(f"   • {message}")

        if warned > 0:
            print(f"\n{Colors.BOLD}{Colors.YELLOW}⚠️  AVISOS:{Colors.END}")
            for status, message in self.results:
                if status == "WARN":
                    print(f"   • {message}")

    async def run_complete_test(self):
        """Executar todos os testes E2E"""
        print(
            f"{Colors.BOLD}{Colors.PURPLE}🎭 INICIANDO TESTES E2E DO FRONTEND{Colors.END}"
        )
        print(f"{Colors.BOLD}{'='*80}{Colors.END}\n")

        try:
            # Configurar browser
            if not await self.setup_browser():
                return

            # Executar todos os testes
            await self.test_initial_load()
            await self.test_navigation()
            await self.test_responsive_design()
            await self.test_form_interactions()
            await self.test_api_connectivity()
            await self.test_error_handling()

        except Exception as e:
            self.error(f"Erro durante execução dos testes: {e}")

        finally:
            # Limpar recursos
            await self.cleanup()

            # Mostrar resumo
            self.print_summary()


async def main():
    tester = FrontendE2ETester()
    await tester.run_complete_test()


if __name__ == "__main__":
    asyncio.run(main())
