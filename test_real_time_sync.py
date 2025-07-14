#!/usr/bin/env python3
"""
Teste de Sincronização em Tempo Real - MedCheck
===============================================

Este script testa especificamente a funcionalidade de sincronização em tempo real
que foi implementada no sistema. Simula múltiplas operações simultâneas e verifica
se o sistema mantém consistência e atualiza dados automaticamente.

Testes incluem:
- Upload simultâneo de guias e demonstrativos
- Verificação de invalidação de cache
- Teste de reatividade do crosscheck
- Simulação de operações concorrentes
- Verificação de consistência de dados
"""

import asyncio
import concurrent.futures
import json
import sys
import threading
import time
from datetime import datetime
from typing import Any, Dict, List

import aiohttp

# Configuração
LOCAL_API = "http://localhost:8000"
PROD_API = "https://backend-test-hgm1.onrender.com"

CREDENTIALS = {"uf": "AC", "crm": "6091", "password": "@Luassis90"}


class RealTimeSyncTester:
    def __init__(self, api_url: str):
        self.api_url = api_url
        self.token = None
        self.session = None

    def log(self, message: str, level: str = "INFO"):
        """Log formatado com timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        thread_id = threading.current_thread().ident
        print(f"[{timestamp}] [{thread_id}] {level}: {message}")

    async def authenticate(self) -> bool:
        """Autentica e obtém token"""
        try:
            # Prepara dados no formato correto para OAuth2
            form_data = aiohttp.FormData()
            form_data.add_field("username", CREDENTIALS["crm"])
            form_data.add_field("password", CREDENTIALS["password"])
            form_data.add_field("scope", CREDENTIALS["uf"])

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.api_url}/token",
                    data=form_data,
                    timeout=aiohttp.ClientTimeout(total=30),
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        self.token = data.get("access_token")
                        self.log("✅ Autenticação bem-sucedida")
                        return True
                    else:
                        self.log(
                            f"❌ Falha na autenticação: {response.status}", "ERROR"
                        )
                        return False
        except Exception as e:
            self.log(f"❌ Erro na autenticação: {str(e)}", "ERROR")
            return False

    async def upload_file_async(self, file_path: str, endpoint: str) -> Dict:
        """Upload assíncrono de arquivo"""
        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            async with aiohttp.ClientSession() as session:
                with open(file_path, "rb") as f:
                    data = aiohttp.FormData()
                    # Backend espera 'files' (plural) para múltiplos arquivos
                    data.add_field("files", f, filename=file_path.split("/")[-1])

                    async with session.post(
                        f"{self.api_url}/{endpoint}",
                        data=data,
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=60),
                    ) as response:
                        if response.status == 200:
                            result = await response.json()
                            self.log(f"✅ Upload concluído: {file_path.split('/')[-1]}")

                            # Parse do resultado para obter info do primeiro arquivo
                            if "results" in result and len(result["results"]) > 0:
                                first_result = result["results"][0]
                                if first_result.get("success"):
                                    return first_result
                                else:
                                    self.log(
                                        f"❌ Erro no processamento: {first_result.get('error', 'Erro desconhecido')}",
                                        "ERROR",
                                    )
                                    return {}
                            else:
                                return result
                        else:
                            text = await response.text()
                            self.log(
                                f"❌ Falha no upload: {response.status} - {text}",
                                "ERROR",
                            )
                            return {}
        except Exception as e:
            self.log(f"❌ Erro no upload de {file_path}: {str(e)}", "ERROR")
            return {}

    async def get_demonstrativo_details(self, demo_id: int) -> Dict:
        """Obtém detalhes de um demonstrativo"""
        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.api_url}/demonstrativos/{demo_id}/detalhes",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30),
                ) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        return {}
        except Exception as e:
            self.log(f"❌ Erro ao obter detalhes: {str(e)}", "ERROR")
            return {}

    async def test_concurrent_uploads(self):
        """Teste 1: Uploads concorrentes de guias"""
        self.log("\n🚀 TESTE 1: Uploads concorrentes de guias")
        self.log("=" * 50)

        guia_files = [
            "data/guias/noivana.pdf",
            "data/guias/rodrigo bernardo.pdf",
            "data/guias/nubia_katia.pdf",
            "data/guias/adriana pessoa.pdf",
        ]

        start_time = time.time()

        # Upload simultâneo de todas as guias
        tasks = []
        for file_path in guia_files:
            task = asyncio.create_task(
                self.upload_file_async(file_path, "api/v1/guias/upload")
            )
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)
        end_time = time.time()

        successful_uploads = [r for r in results if isinstance(r, dict) and r.get("id")]

        self.log(f"⏱️ Tempo total: {end_time - start_time:.2f}s")
        self.log(
            f"✅ Uploads bem-sucedidos: {len(successful_uploads)}/{len(guia_files)}"
        )

        return successful_uploads

    async def test_reactive_crosscheck(self, uploaded_guias: List[Dict]):
        """Teste 2: Reatividade do crosscheck após upload de demonstrativo"""
        self.log("\n🔄 TESTE 2: Reatividade do crosscheck")
        self.log("=" * 50)

        # Upload de demonstrativo
        demo_result = await self.upload_file_async(
            "data/demonstrativos/Demonstrativo-outubro_2024.pdf",
            "api/v1/demonstrativos/upload",
        )

        if not demo_result.get("id"):
            self.log("❌ Falha no upload do demonstrativo", "ERROR")
            return

        demo_id = demo_result["id"]
        self.log(f"📄 Demonstrativo carregado: ID {demo_id}")

        # Verifica crosscheck imediatamente
        immediate_details = await self.get_demonstrativo_details(demo_id)
        immediate_crosscheck = self.calculate_crosscheck_rate(immediate_details)

        self.log(f"📊 Crosscheck imediato: {immediate_crosscheck:.1f}%")

        # Adiciona mais guias e verifica mudança no crosscheck
        additional_guias = ["data/guias/thayse borges.pdf", "data/guias/dolores 2.pdf"]

        self.log("📤 Adicionando mais guias...")
        for guia_file in additional_guias:
            await self.upload_file_async(guia_file, "api/v1/guias/upload")

            # Verifica crosscheck após cada upload
            await asyncio.sleep(1)  # Aguarda processamento
            updated_details = await self.get_demonstrativo_details(demo_id)
            updated_crosscheck = self.calculate_crosscheck_rate(updated_details)

            self.log(
                f"📈 Crosscheck após {guia_file.split('/')[-1]}: {updated_crosscheck:.1f}%"
            )

        return demo_id

    async def test_stress_concurrent_queries(self, demo_id: int):
        """Teste 3: Múltiplas consultas simultâneas"""
        self.log("\n💪 TESTE 3: Consultas simultâneas de demonstrativo")
        self.log("=" * 50)

        start_time = time.time()

        # 20 consultas simultâneas
        tasks = []
        for i in range(20):
            task = asyncio.create_task(self.get_demonstrativo_details(demo_id))
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)
        end_time = time.time()

        successful_queries = [
            r for r in results if isinstance(r, dict) and r.get("participacoes")
        ]

        self.log(f"⏱️ Tempo total: {end_time - start_time:.2f}s")
        self.log(f"✅ Consultas bem-sucedidas: {len(successful_queries)}/20")
        self.log(f"📊 Taxa de sucesso: {(len(successful_queries) / 20) * 100:.1f}%")
        self.log(
            f"🚀 Throughput: {len(successful_queries) / (end_time - start_time):.1f} req/s"
        )

        # Verifica consistência das respostas
        if successful_queries:
            first_response = successful_queries[0]
            consistent_responses = all(
                len(r.get("participacoes", []))
                == len(first_response.get("participacoes", []))
                for r in successful_queries
            )

            self.log(
                f"🔄 Consistência das respostas: {'✅ OK' if consistent_responses else '❌ INCONSISTENTE'}"
            )

    async def test_cache_invalidation(self, demo_id: int):
        """Teste 4: Invalidação de cache"""
        self.log("\n🗄️ TESTE 4: Invalidação de cache")
        self.log("=" * 50)

        # Primeira consulta (pode ser cacheada)
        details_1 = await self.get_demonstrativo_details(demo_id)
        crosscheck_1 = self.calculate_crosscheck_rate(details_1)

        self.log(f"📊 Crosscheck inicial: {crosscheck_1:.1f}%")

        # Adiciona nova guia que pode afetar o crosscheck
        await self.upload_file_async("data/guias/dolores 3.pdf", "api/v1/guias/upload")

        # Aguarda um pouco para processamento
        await asyncio.sleep(2)

        # Segunda consulta (deve refletir mudança)
        details_2 = await self.get_demonstrativo_details(demo_id)
        crosscheck_2 = self.calculate_crosscheck_rate(details_2)

        self.log(f"📊 Crosscheck após nova guia: {crosscheck_2:.1f}%")

        # Verifica se houve mudança (indicando invalidação de cache)
        if crosscheck_2 != crosscheck_1:
            self.log("✅ Cache invalidado corretamente - dados atualizados")
        else:
            self.log("⚠️ Possível problema na invalidação de cache")

    def calculate_crosscheck_rate(self, details: Dict) -> float:
        """Calcula taxa de crosscheck"""
        participacoes = details.get("participacoes", [])
        if not participacoes:
            return 0.0

        com_guia = sum(1 for p in participacoes if p.get("guia_encontrada"))
        return (com_guia / len(participacoes)) * 100

    async def test_data_consistency(self):
        """Teste 5: Consistência de dados após operações múltiplas"""
        self.log("\n🔍 TESTE 5: Consistência de dados")
        self.log("=" * 50)

        # Obtém estado inicial
        headers = {"Authorization": f"Bearer {self.token}"}

        async with aiohttp.ClientSession() as session:
            # Lista guias
            async with session.get(
                f"{self.api_url}/guias/", headers=headers
            ) as response:
                guias = await response.json() if response.status == 200 else []

            # Lista demonstrativos
            async with session.get(
                f"{self.api_url}/demonstrativos/", headers=headers
            ) as response:
                demos = await response.json() if response.status == 200 else []

        self.log(f"📄 Total de guias: {len(guias)}")
        self.log(f"💰 Total de demonstrativos: {len(demos)}")

        # Verifica integridade dos dados
        guias_validas = [g for g in guias if g.get("numero_guia")]
        demos_validos = [d for d in demos if d.get("periodo")]

        self.log(f"✅ Guias válidas: {len(guias_validas)}/{len(guias)}")
        self.log(f"✅ Demonstrativos válidos: {len(demos_validos)}/{len(demos)}")

        # Testa crosscheck para cada demonstrativo
        for demo in demos_validos:
            details = await self.get_demonstrativo_details(demo["id"])
            crosscheck_rate = self.calculate_crosscheck_rate(details)
            self.log(
                f"📊 Demo {demo['id']} ({demo.get('periodo', 'N/A')}): {crosscheck_rate:.1f}% crosscheck"
            )

    async def run_all_tests(self):
        """Executa todos os testes"""
        self.log("🏥 Iniciando testes de sincronização em tempo real...")

        # Autentica
        if not await self.authenticate():
            self.log("❌ Falha na autenticação. Abortando testes.", "ERROR")
            return

        try:
            # Executa todos os testes em sequência
            uploaded_guias = await self.test_concurrent_uploads()
            demo_id = await self.test_reactive_crosscheck(uploaded_guias)

            if demo_id:
                await self.test_stress_concurrent_queries(demo_id)
                await self.test_cache_invalidation(demo_id)

            await self.test_data_consistency()

            self.log("\n🎉 Todos os testes de sincronização concluídos!")

        except Exception as e:
            self.log(f"❌ Erro durante os testes: {str(e)}", "ERROR")


async def main():
    """Função principal"""
    env = sys.argv[1] if len(sys.argv) > 1 else "local"

    if env not in ["local", "prod"]:
        print("❌ Ambiente deve ser 'local' ou 'prod'")
        sys.exit(1)

    api_url = LOCAL_API if env == "local" else PROD_API

    print("🔄 MedCheck - Teste de Sincronização em Tempo Real")
    print("=" * 60)
    print(f"🌐 Ambiente: {env.upper()}")
    print(f"🔗 API: {api_url}")
    print("=" * 60)

    tester = RealTimeSyncTester(api_url)
    await tester.run_all_tests()


if __name__ == "__main__":
    asyncio.run(main())
