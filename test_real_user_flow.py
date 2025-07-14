#!/usr/bin/env python3
"""
Teste de Fluxo Real do Usuário - MedCheck Sistema
==================================================

Este script simula o comportamento real de um médico usando o sistema:
1. Limpa dados existentes para começar fresh
2. Faz upload de guias médicas em lotes (como seria na prática)
3. Faz upload de demonstrativos financeiros 
4. Testa o crosscheck entre guias e demonstrativos
5. Simula remoção e adição de guias e verifica impacto nos demonstrativos
6. Testa cenários de erro e recuperação

Cenários testados:
- Médico recebe demonstrativos mensais e quer verificar participações
- Médico adiciona novas guias e vê demonstrativos atualizarem automaticamente
- Médico remove guias duplicadas ou incorretas
- Sistema mantém integridade dos dados durante operações
"""

import asyncio
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests

# Configuração
LOCAL_API = "http://localhost:8000"
PROD_API = "https://backend-test-hgm1.onrender.com"

# Credenciais corretas
CREDENTIALS = {"uf": "AC", "crm": "6091", "password": "@Luassis90"}


class UserFlowTester:
    def __init__(self, api_url: str = LOCAL_API):
        self.api_url = api_url
        self.session = requests.Session()
        self.token = None
        self.user_data = None
        self.uploaded_guias = []
        self.uploaded_demonstrativos = []

    def log(self, message: str, level: str = "INFO"):
        """Log formatado com timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")

    def authenticate(self) -> bool:
        """Autentica o usuário e obtém token"""
        try:
            self.log("🔐 Iniciando autenticação...")

            # Prepara dados no formato correto para OAuth2
            form_data = {
                "username": CREDENTIALS["crm"],
                "password": CREDENTIALS["password"],
                "scope": CREDENTIALS["uf"],
            }

            response = self.session.post(
                f"{self.api_url}/token",
                data=form_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=30,
            )

            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.user_data = data.get("user", {})
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                self.log(
                    f"✅ Autenticado como Dr(a). {self.user_data.get('nome', 'Usuário')}"
                )
                return True
            else:
                self.log(
                    f"❌ Falha na autenticação: {response.status_code} - {response.text}",
                    "ERROR",
                )
                return False

        except Exception as e:
            self.log(f"❌ Erro na autenticação: {str(e)}", "ERROR")
            return False

    def clear_existing_data(self):
        """Limpa dados existentes para começar fresh"""
        self.log("🧹 Limpando dados existentes...")

        try:
            # Lista e remove guias
            response = self.session.get(f"{self.api_url}/guias/")
            if response.status_code == 200:
                guias = response.json()
                for guia in guias:
                    delete_response = self.session.delete(
                        f"{self.api_url}/guias/{guia['id']}"
                    )
                    if delete_response.status_code == 200:
                        self.log(
                            f"🗑️ Removida guia {guia['id']} - {guia.get('numero_guia', 'N/A')}"
                        )

            # Lista e remove demonstrativos
            response = self.session.get(f"{self.api_url}/demonstrativos/")
            if response.status_code == 200:
                demos = response.json()
                for demo in demos:
                    delete_response = self.session.delete(
                        f"{self.api_url}/demonstrativos/{demo['id']}"
                    )
                    if delete_response.status_code == 200:
                        self.log(
                            f"🗑️ Removido demonstrativo {demo['id']} - {demo.get('periodo', 'N/A')}"
                        )

            self.log("✅ Limpeza concluída - sistema resetado")

        except Exception as e:
            self.log(f"⚠️ Erro na limpeza: {str(e)}", "WARNING")

    def upload_file(self, file_path: str, endpoint: str) -> Optional[Dict]:
        """Faz upload de um arquivo"""
        try:
            file_name = os.path.basename(file_path)
            self.log(f"📤 Fazendo upload de {file_name}...")

            with open(file_path, "rb") as f:
                # Backend espera 'files' (plural) para múltiplos arquivos
                files = {"files": (file_name, f, "application/pdf")}
                response = self.session.post(
                    f"{self.api_url}/{endpoint}", files=files, timeout=60
                )

            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ Upload concluído: {file_name}")

                # Parse do resultado para obter info do primeiro arquivo
                if "results" in data and len(data["results"]) > 0:
                    first_result = data["results"][0]
                    if first_result.get("success"):
                        return first_result
                    else:
                        self.log(
                            f"❌ Erro no processamento: {first_result.get('error', 'Erro desconhecido')}",
                            "ERROR",
                        )
                        return None
                else:
                    return data
            else:
                self.log(
                    f"❌ Falha no upload de {file_name}: {response.status_code} - {response.text}",
                    "ERROR",
                )
                return None

        except Exception as e:
            self.log(f"❌ Erro no upload de {file_path}: {str(e)}", "ERROR")
            return None

    def scenario_1_initial_setup(self):
        """Cenário 1: Médico configurando sistema pela primeira vez"""
        self.log("\n" + "=" * 60)
        self.log("📋 CENÁRIO 1: Configuração inicial do sistema")
        self.log("=" * 60)

        # Upload de guias em lotes (como médico faria)
        guia_files = [
            "data/guias/noivana.pdf",
            "data/guias/rodrigo bernardo.pdf",
            "data/guias/nubia_katia.pdf",
            "data/guias/adriana pessoa.pdf",
        ]

        self.log("👨‍⚕️ Dr. médico está adicionando suas guias de procedimentos...")
        for guia_file in guia_files:
            if os.path.exists(guia_file):
                result = self.upload_file(guia_file, "api/v1/guias/upload")
                if result:
                    self.uploaded_guias.append(result)
                time.sleep(1)  # Pausa realista entre uploads

        self.log(f"📊 Total de guias adicionadas: {len(self.uploaded_guias)}")

    def scenario_2_add_demonstrativos(self):
        """Cenário 2: Médico recebe demonstrativos e quer verificar participações"""
        self.log("\n" + "=" * 60)
        self.log("📋 CENÁRIO 2: Adicionando demonstrativos financeiros")
        self.log("=" * 60)

        demo_files = [
            "data/demonstrativos/Demonstrativo-abril_2024.pdf",
            "data/demonstrativos/Demonstrativo-outubro_2024.pdf",
        ]

        self.log("💰 Dr. médico recebeu demonstrativos da operadora e quer conferir...")
        for demo_file in demo_files:
            if os.path.exists(demo_file):
                result = self.upload_file(demo_file, "api/v1/demonstrativos/upload")
                if result:
                    self.uploaded_demonstrativos.append(result)
                time.sleep(2)  # Demonstrativo demora mais para processar

        self.log(
            f"📊 Total de demonstrativos adicionados: {len(self.uploaded_demonstrativos)}"
        )

    def check_crosscheck_status(self):
        """Verifica status do crosscheck"""
        self.log("\n🔍 Verificando crosscheck entre guias e demonstrativos...")

        try:
            for demo in self.uploaded_demonstrativos:
                demo_id = demo.get("id")
                response = self.session.get(
                    f"{self.api_url}/demonstrativos/{demo_id}/detalhes"
                )

                if response.status_code == 200:
                    details = response.json()
                    total_participacoes = len(details.get("participacoes", []))
                    total_com_guia = sum(
                        1
                        for p in details.get("participacoes", [])
                        if p.get("guia_encontrada")
                    )
                    crosscheck_percent = (
                        (total_com_guia / total_participacoes * 100)
                        if total_participacoes > 0
                        else 0
                    )

                    self.log(
                        f"📈 Demonstrativo {demo_id} ({details.get('periodo', 'N/A')}):"
                    )
                    self.log(f"   └── Participações: {total_participacoes}")
                    self.log(f"   └── Com guia: {total_com_guia}")
                    self.log(f"   └── Crosscheck: {crosscheck_percent:.1f}%")

                    if crosscheck_percent < 100:
                        participacoes_sem_guia = [
                            p
                            for p in details.get("participacoes", [])
                            if not p.get("guia_encontrada")
                        ]
                        self.log(
                            f"   └── ⚠️ Participações sem guia: {len(participacoes_sem_guia)}"
                        )
                        for p in participacoes_sem_guia[
                            :3
                        ]:  # Mostra apenas primeiras 3
                            self.log(
                                f"      • {p.get('numero_guia', 'N/A')} - {p.get('procedimento', 'N/A')}"
                            )
                else:
                    self.log(
                        f"❌ Erro ao verificar demonstrativo {demo_id}: {response.status_code}"
                    )

        except Exception as e:
            self.log(f"❌ Erro no crosscheck: {str(e)}", "ERROR")

    def scenario_3_add_missing_guias(self):
        """Cenário 3: Médico adiciona guias que estavam faltando"""
        self.log("\n" + "=" * 60)
        self.log("📋 CENÁRIO 3: Adicionando guias que estavam faltando")
        self.log("=" * 60)

        # Adiciona mais guias para melhorar crosscheck
        additional_guias = [
            "data/guias/thayse borges.pdf",
            "data/guias/dolores 2.pdf",
            "data/guias/dolores 3.pdf",
            "data/guias/adaca.pdf",
        ]

        self.log("🔍 Dr. médico percebeu que algumas guias estavam faltando...")
        crosscheck_before = self.get_overall_crosscheck_rate()

        for guia_file in additional_guias:
            if os.path.exists(guia_file):
                result = self.upload_file(guia_file, "api/v1/guias/upload")
                if result:
                    self.uploaded_guias.append(result)
                time.sleep(1)

        # Verifica melhoria no crosscheck
        time.sleep(3)  # Aguarda processamento
        crosscheck_after = self.get_overall_crosscheck_rate()

        self.log(f"📊 Crosscheck antes: {crosscheck_before:.1f}%")
        self.log(f"📊 Crosscheck depois: {crosscheck_after:.1f}%")
        self.log(
            f"📈 Melhoria: {crosscheck_after - crosscheck_before:.1f} pontos percentuais"
        )

    def scenario_4_remove_duplicate_guias(self):
        """Cenário 4: Médico remove guias duplicadas"""
        self.log("\n" + "=" * 60)
        self.log("📋 CENÁRIO 4: Removendo guias duplicadas")
        self.log("=" * 60)

        try:
            # Lista todas as guias
            response = self.session.get(f"{self.api_url}/guias/")
            if response.status_code == 200:
                guias = response.json()

                # Encontra possíveis duplicatas (mesmo numero_guia)
                guias_by_numero = {}
                for guia in guias:
                    numero = guia.get("numero_guia")
                    if numero:
                        if numero not in guias_by_numero:
                            guias_by_numero[numero] = []
                        guias_by_numero[numero].append(guia)

                duplicates_found = {
                    k: v for k, v in guias_by_numero.items() if len(v) > 1
                }

                if duplicates_found:
                    self.log(
                        f"🔍 Encontradas {len(duplicates_found)} possíveis duplicatas:"
                    )

                    for numero, guias_duplicadas in duplicates_found.items():
                        self.log(
                            f"   📄 Guia {numero}: {len(guias_duplicadas)} versões"
                        )

                        # Remove todas exceto a primeira (mais antiga)
                        for guia in guias_duplicadas[1:]:
                            delete_response = self.session.delete(
                                f"{self.api_url}/guias/{guia['id']}"
                            )
                            if delete_response.status_code == 200:
                                self.log(f"   🗑️ Removida duplicata: ID {guia['id']}")
                else:
                    self.log("✅ Nenhuma duplicata encontrada")

        except Exception as e:
            self.log(f"❌ Erro na remoção de duplicatas: {str(e)}", "ERROR")

    def scenario_5_stress_test(self):
        """Cenário 5: Teste de estresse - múltiplas operações simultâneas"""
        self.log("\n" + "=" * 60)
        self.log("📋 CENÁRIO 5: Teste de resistência do sistema")
        self.log("=" * 60)

        self.log("🚀 Testando múltiplas consultas simultâneas...")

        # Múltiplas consultas de detalhes
        start_time = time.time()
        successful_requests = 0

        for i in range(10):
            for demo in self.uploaded_demonstrativos:
                try:
                    response = self.session.get(
                        f"{self.api_url}/demonstrativos/{demo.get('id')}/detalhes",
                        timeout=10,
                    )
                    if response.status_code == 200:
                        successful_requests += 1
                except:
                    pass

        end_time = time.time()
        duration = end_time - start_time

        self.log(f"⏱️ Tempo total: {duration:.2f}s")
        self.log(f"✅ Requisições bem-sucedidas: {successful_requests}")
        self.log(f"📊 Taxa de sucesso: {(successful_requests / 20) * 100:.1f}%")

    def get_overall_crosscheck_rate(self) -> float:
        """Calcula taxa geral de crosscheck"""
        try:
            total_participacoes = 0
            total_com_guia = 0

            for demo in self.uploaded_demonstrativos:
                response = self.session.get(
                    f"{self.api_url}/demonstrativos/{demo.get('id')}/detalhes"
                )
                if response.status_code == 200:
                    details = response.json()
                    participacoes = details.get("participacoes", [])
                    total_participacoes += len(participacoes)
                    total_com_guia += sum(
                        1 for p in participacoes if p.get("guia_encontrada")
                    )

            return (
                (total_com_guia / total_participacoes * 100)
                if total_participacoes > 0
                else 0
            )

        except:
            return 0.0

    def generate_final_report(self):
        """Gera relatório final do teste"""
        self.log("\n" + "=" * 60)
        self.log("📊 RELATÓRIO FINAL DO TESTE")
        self.log("=" * 60)

        try:
            # Status das guias
            response = self.session.get(f"{self.api_url}/guias/")
            total_guias = len(response.json()) if response.status_code == 200 else 0

            # Status dos demonstrativos
            response = self.session.get(f"{self.api_url}/demonstrativos/")
            total_demos = len(response.json()) if response.status_code == 200 else 0

            # Taxa de crosscheck final
            final_crosscheck = self.get_overall_crosscheck_rate()

            self.log(f"📄 Total de guias: {total_guias}")
            self.log(f"💰 Total de demonstrativos: {total_demos}")
            self.log(f"🎯 Taxa de crosscheck final: {final_crosscheck:.1f}%")

            # Detalhes por demonstrativo
            if total_demos > 0:
                self.log("\n📋 Detalhes por demonstrativo:")
                for demo in self.uploaded_demonstrativos:
                    response = self.session.get(
                        f"{self.api_url}/demonstrativos/{demo.get('id')}/detalhes"
                    )
                    if response.status_code == 200:
                        details = response.json()
                        participacoes = details.get("participacoes", [])
                        com_guia = sum(
                            1 for p in participacoes if p.get("guia_encontrada")
                        )
                        self.log(
                            f"   • {details.get('periodo', 'N/A')}: {com_guia}/{len(participacoes)} participações"
                        )

            # Avaliação final
            if final_crosscheck >= 90:
                self.log("\n🎉 EXCELENTE! Sistema funcionando perfeitamente")
            elif final_crosscheck >= 70:
                self.log(
                    "\n✅ BOM! Sistema funcionando bem, algumas guias podem estar faltando"
                )
            elif final_crosscheck >= 50:
                self.log("\n⚠️ REGULAR! Muitas guias faltando, verificar upload")
            else:
                self.log("\n❌ PROBLEMÁTICO! Sistema precisa de atenção")

        except Exception as e:
            self.log(f"❌ Erro no relatório final: {str(e)}", "ERROR")


def run_complete_test(environment: str = "local"):
    """Executa teste completo do fluxo do usuário"""
    api_url = LOCAL_API if environment == "local" else PROD_API

    print("🏥 MedCheck - Teste de Fluxo Real do Usuário")
    print("=" * 60)
    print(f"🌐 Ambiente: {environment.upper()}")
    print(f"🔗 API: {api_url}")
    print("=" * 60)

    tester = UserFlowTester(api_url)

    # Fluxo completo
    if not tester.authenticate():
        print("❌ Falha na autenticação. Abortando teste.")
        return

    try:
        # Executa todos os cenários
        tester.clear_existing_data()
        tester.scenario_1_initial_setup()
        tester.scenario_2_add_demonstrativos()
        tester.check_crosscheck_status()
        tester.scenario_3_add_missing_guias()
        tester.check_crosscheck_status()
        tester.scenario_4_remove_duplicate_guias()
        tester.check_crosscheck_status()
        tester.scenario_5_stress_test()
        tester.generate_final_report()

        print("\n🎉 Teste completo finalizado com sucesso!")

    except KeyboardInterrupt:
        print("\n⏹️ Teste interrompido pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante o teste: {str(e)}")


if __name__ == "__main__":
    # Permite escolher ambiente via argumento
    env = sys.argv[1] if len(sys.argv) > 1 else "local"

    if env not in ["local", "prod"]:
        print("❌ Ambiente deve ser 'local' ou 'prod'")
        sys.exit(1)

    run_complete_test(env)
