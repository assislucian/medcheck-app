#!/usr/bin/env python3
"""
Script de Diagnóstico Completo - Crosscheck Produção
==================================================

Este script diagnostica e corrige problemas de crosscheck entre 
guias e demonstrativos no ambiente de produção do MedCheck.

Autor: MedCheck AI Assistant
Data: 2025-01-27
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests

# Configuração
BASE_URL_PROD = "https://medcheck-backend.onrender.com"
BASE_URL_LOCAL = "http://localhost:8000"

# Credenciais de teste (CRM 6091)
TEST_USER = {"username": "6091", "password": "@Luassis90", "scope": "AC"}  # CRM  # UF


class CrosscheckDiagnostic:
    """Classe para diagnóstico completo do crosscheck"""

    def __init__(self, base_url: str, user_credentials: Dict[str, str]):
        self.base_url = base_url
        self.credentials = user_credentials
        self.token = None
        self.headers = {}

    def authenticate(self) -> bool:
        """Autentica o usuário e obtém token"""
        print(f"🔐 Autenticando em {self.base_url}...")

        try:
            response = requests.post(
                f"{self.base_url}/token",
                data=self.credentials,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )

            if response.status_code == 200:
                self.token = response.json().get("access_token")
                self.headers = {"Authorization": f"Bearer {self.token}"}
                print("✅ Autenticação bem-sucedida")
                return True
            else:
                print(f"❌ Falha na autenticação: {response.text}")
                return False

        except Exception as e:
            print(f"❌ Erro na autenticação: {e}")
            return False

    def check_demonstrativos(self) -> List[Dict]:
        """Verifica demonstrativos disponíveis"""
        print("\n📊 VERIFICANDO DEMONSTRATIVOS")
        print("-" * 40)

        try:
            response = requests.get(
                f"{self.base_url}/api/v1/demonstrativos", headers=self.headers
            )

            if response.status_code != 200:
                print(f"❌ Erro ao acessar demonstrativos: {response.text}")
                return []

            demonstrativos = response.json()
            print(f"📈 Total demonstrativos: {len(demonstrativos)}")

            for i, demo in enumerate(demonstrativos, 1):
                print(f"\n   Demo {i}: ID {demo['id']}")
                print(f"   📅 Período: {demo.get('periodo', 'N/A')}")
                print(f"   📄 Arquivo: {demo.get('filename', 'N/A')}")
                print(f"   🧮 Procedimentos: {demo.get('total_procedimentos', 0)}")
                print(f"   💰 Apresentado: {demo.get('apresentado', 'R$ 0,00')}")
                print(f"   💚 Liberado: {demo.get('liberado', 'R$ 0,00')}")
                print(f"   🔴 Glosa: {demo.get('glosa', 'R$ 0,00')}")

            return demonstrativos

        except Exception as e:
            print(f"❌ Erro ao verificar demonstrativos: {e}")
            return []

    def check_guias(self) -> List[Dict]:
        """Verifica guias disponíveis"""
        print("\n📋 VERIFICANDO GUIAS")
        print("-" * 40)

        try:
            response = requests.get(
                f"{self.base_url}/api/v1/guias",
                headers=self.headers,
                params={"pageSize": 100},  # Buscar todas as guias
            )

            if response.status_code != 200:
                print(f"❌ Erro ao acessar guias: {response.text}")
                return []

            data = response.json()
            # O endpoint retorna formato: {"procedures": [...], "total": N}
            if isinstance(data, dict) and "procedures" in data:
                guias = data["procedures"]
            else:
                guias = data if isinstance(data, list) else []

            print(f"📈 Total guias: {len(guias)}")

            # Agrupar guias por número
            guias_agrupadas = {}
            for guia in guias:
                numero = guia.get("numero_guia")
                if numero not in guias_agrupadas:
                    guias_agrupadas[numero] = []
                guias_agrupadas[numero].append(guia)

            print(f"📊 Guias únicas: {len(guias_agrupadas)}")

            for numero, lista_guias in guias_agrupadas.items():
                print(f"\n   Guia {numero}:")
                print(f"   📝 Procedimentos: {len(lista_guias)}")
                print(f"   📅 Data: {lista_guias[0].get('data', 'N/A')}")
                print(f"   👤 Paciente: {lista_guias[0].get('beneficiario', 'N/A')}")

                # Mostrar códigos únicos
                codigos = set(g.get("codigo") for g in lista_guias)
                print(f"   🔢 Códigos: {sorted(codigos)}")

            return guias

        except Exception as e:
            print(f"❌ Erro ao verificar guias: {e}")
            return []

    def test_demonstrativo_details(self, demo_id: int) -> Dict[str, Any]:
        """Testa detalhes de um demonstrativo específico"""
        print(f"\n🔍 TESTANDO DETALHES DO DEMO {demo_id}")
        print("-" * 40)

        try:
            response = requests.get(
                f"{self.base_url}/api/v1/demonstrativos/{demo_id}/detalhes",
                headers=self.headers,
            )

            if response.status_code != 200:
                print(f"❌ Erro nos detalhes: {response.text}")
                return {"error": response.text, "status_code": response.status_code}

            detalhes = response.json()

            if isinstance(detalhes, dict) and "detail" in detalhes:
                print(f"❌ Erro retornado: {detalhes['detail']}")
                return {"error": detalhes["detail"]}

            # Análise dos dados
            total_proc = len(detalhes)
            com_participacao = len([p for p in detalhes if p.get("participacoes", [])])
            com_cbhpm = len([p for p in detalhes if p.get("valor_cbhpm")])
            participacoes_total = sum(len(p.get("participacoes", [])) for p in detalhes)

            print(f"📊 RESULTADOS:")
            print(f"   Total procedimentos: {total_proc}")
            print(
                f"   Com participação: {com_participacao} ({com_participacao/total_proc*100:.1f}%)"
            )
            print(f"   Com valor CBHPM: {com_cbhpm} ({com_cbhpm/total_proc*100:.1f}%)")
            print(f"   Total participações: {participacoes_total}")

            # Amostra dos dados
            print(f"\n📝 AMOSTRA DOS DADOS:")
            for i, proc in enumerate(detalhes[:3], 1):
                print(f"\n   Procedimento {i}:")
                print(f"   🏥 Guia: {proc.get('guia', 'N/A')}")
                print(f"   📅 Data: {proc.get('data', 'N/A')}")
                print(f"   👤 Paciente: {proc.get('paciente', 'N/A')}")
                print(f"   🔢 Código: {proc.get('codigo', 'N/A')}")
                print(f"   📋 Descrição: {proc.get('descricao', 'N/A')}")
                print(f"   🎭 Papel: {proc.get('papel_exercido', 'N/A')}")
                print(f"   👥 Participações: {len(proc.get('participacoes', []))}")
                print(f"   💰 CBHPM: R$ {proc.get('valor_cbhpm', 0):.2f}")
                print(
                    f"   💚 Liberado: R$ {proc.get('financial', {}).get('approved_value', 0):.2f}"
                )

            return {
                "success": True,
                "total_procedures": total_proc,
                "with_participation": com_participacao,
                "with_cbhpm": com_cbhpm,
                "participation_rate": (
                    com_participacao / total_proc * 100 if total_proc > 0 else 0
                ),
                "data": detalhes,
            }

        except Exception as e:
            print(f"❌ Erro ao testar detalhes: {e}")
            return {"error": str(e)}

    def compare_with_expected_guias(self, procedimentos: List[Dict]) -> Dict[str, Any]:
        """Compara procedimentos com guias esperadas"""
        print(f"\n🔍 ANALISANDO CROSSCHECK COM GUIAS")
        print("-" * 40)

        # Guias esperadas baseadas no demonstrativo de outubro 2024
        guias_esperadas = ["10467538", "10507705", "10696456", "10714706"]

        # Códigos esperados
        codigos_esperados = ["30602203", "30602246", "30602076", "30602173", "30602289"]

        # Análise
        guias_encontradas = set()
        codigos_encontrados = set()
        procedimentos_com_guia = 0

        for proc in procedimentos:
            guia = str(proc.get("guia", ""))
            codigo = str(proc.get("codigo", ""))

            if guia:
                guias_encontradas.add(guia)
            if codigo:
                codigos_encontrados.add(codigo)
            if proc.get("participacoes", []):
                procedimentos_com_guia += 1

        guias_faltando = set(guias_esperadas) - guias_encontradas
        codigos_faltando = set(codigos_esperados) - codigos_encontrados

        print(f"📊 ANÁLISE DE CROSSCHECK:")
        print(f"   Guias esperadas: {len(guias_esperadas)}")
        print(f"   Guias encontradas: {len(guias_encontradas)}")
        print(f"   Guias faltando: {list(guias_faltando)}")
        print(f"   Códigos esperados: {len(codigos_esperados)}")
        print(f"   Códigos encontrados: {len(codigos_encontrados)}")
        print(f"   Códigos faltando: {list(codigos_faltando)}")
        print(
            f"   Procedimentos com participação: {procedimentos_com_guia}/{len(procedimentos)}"
        )

        return {
            "expected_guides": guias_esperadas,
            "found_guides": list(guias_encontradas),
            "missing_guides": list(guias_faltando),
            "expected_codes": codigos_esperados,
            "found_codes": list(codigos_encontrados),
            "missing_codes": list(codigos_faltando),
            "procedures_with_participation": procedimentos_com_guia,
            "total_procedures": len(procedimentos),
        }

    def generate_detailed_report(self) -> Dict[str, Any]:
        """Gera relatório completo de diagnóstico"""
        print(f"\n🏥 DIAGNÓSTICO COMPLETO - {self.base_url}")
        print("=" * 60)

        if not self.authenticate():
            return {"error": "Falha na autenticação"}

        # 1. Verificar demonstrativos
        demonstrativos = self.check_demonstrativos()

        # 2. Verificar guias
        guias = self.check_guias()

        # 3. Testar detalhes do primeiro demonstrativo
        detalhes_result = {}
        if demonstrativos:
            demo_id = demonstrativos[0]["id"]
            detalhes_result = self.test_demonstrativo_details(demo_id)

            # 4. Comparar com dados esperados
            if detalhes_result.get("success") and detalhes_result.get("data"):
                crosscheck_analysis = self.compare_with_expected_guias(
                    detalhes_result["data"]
                )
                detalhes_result["crosscheck_analysis"] = crosscheck_analysis

        return {
            "environment": self.base_url,
            "demonstrativos": demonstrativos,
            "guias": guias,
            "detalhes_test": detalhes_result,
            "summary": {
                "total_demonstrativos": len(demonstrativos),
                "total_guias": len(guias),
                "crosscheck_working": detalhes_result.get("participation_rate", 0) > 50,
            },
        }


def compare_environments():
    """Compara produção vs local"""
    print("\n🔄 COMPARAÇÃO PRODUÇÃO vs LOCAL")
    print("=" * 60)

    # Teste produção
    print("\n1️⃣ TESTANDO PRODUÇÃO")
    prod_diagnostic = CrosscheckDiagnostic(BASE_URL_PROD, TEST_USER)
    prod_report = prod_diagnostic.generate_detailed_report()

    # Teste local (se disponível)
    print("\n2️⃣ TESTANDO LOCAL")
    local_diagnostic = CrosscheckDiagnostic(BASE_URL_LOCAL, TEST_USER)
    local_report = local_diagnostic.generate_detailed_report()

    # Comparação
    print("\n📊 COMPARAÇÃO FINAL")
    print("-" * 40)

    prod_working = prod_report.get("summary", {}).get("crosscheck_working", False)
    local_working = local_report.get("summary", {}).get("crosscheck_working", False)

    print(f"🏭 Produção: {'✅' if prod_working else '❌'}")
    print(f"💻 Local: {'✅' if local_working else '❌'}")

    if not prod_working and local_working:
        print("\n❗ PROBLEMA IDENTIFICADO: Produção não funciona, local funciona")
        print("   📋 Possíveis causas:")
        print("   - Guias não foram enviadas para produção")
        print("   - Dados inconsistentes no banco de produção")
        print("   - Problema de sincronização de arquivos")

        # Sugerir correções
        suggest_fixes(prod_report, local_report)

    elif prod_working and local_working:
        print("\n✅ TUDO FUNCIONANDO: Ambos ambientes OK")

    elif not prod_working and not local_working:
        print("\n❗ PROBLEMA GERAL: Ambos ambientes com falha")
        print("   📋 Verificar lógica de crosscheck no código")

    return prod_report, local_report


def suggest_fixes(prod_report: Dict, local_report: Dict):
    """Sugere correções baseadas no diagnóstico"""
    print("\n🔧 SUGESTÕES DE CORREÇÃO")
    print("-" * 40)

    prod_demos = len(prod_report.get("demonstrativos", []))
    prod_guias = len(prod_report.get("guias", []))
    local_demos = len(local_report.get("demonstrativos", []))
    local_guias = len(local_report.get("guias", []))

    print(f"📊 Demonstrativos - Prod: {prod_demos}, Local: {local_demos}")
    print(f"📋 Guias - Prod: {prod_guias}, Local: {local_guias}")

    if prod_guias < local_guias:
        print("\n💡 AÇÃO NECESSÁRIA: Upload das guias para produção")
        print("   Execute: python sync_production_data.py")

    if prod_demos < local_demos:
        print("\n💡 AÇÃO NECESSÁRIA: Upload dos demonstrativos para produção")

    # Análise específica do crosscheck
    prod_detalhes = prod_report.get("detalhes_test", {})
    if prod_detalhes.get("participation_rate", 0) == 0:
        print("\n❗ CROSSCHECK ZERADO NA PRODUÇÃO")
        print("   🔍 Verificar:")
        print("   1. Se arquivos de guias existem no servidor")
        print("   2. Se banco está com dados corretos")
        print("   3. Se endpoint está funcionando")


def main():
    """Função principal"""
    print("🩺 DIAGNÓSTICO MEDCHECK - CROSSCHECK PRODUÇÃO")
    print("=" * 60)
    print("Verificando problemas de crosscheck entre guias e demonstrativos")
    print("Desenvolvido para garantir funcionamento 100% na produção")
    print()

    try:
        # Executar diagnóstico completo
        prod_report, local_report = compare_environments()

        # Salvar relatórios
        with open("diagnostic_report_production.json", "w", encoding="utf-8") as f:
            json.dump(prod_report, f, indent=2, ensure_ascii=False)

        with open("diagnostic_report_local.json", "w", encoding="utf-8") as f:
            json.dump(local_report, f, indent=2, ensure_ascii=False)

        print(f"\n💾 Relatórios salvos:")
        print(f"   📄 diagnostic_report_production.json")
        print(f"   📄 diagnostic_report_local.json")

    except KeyboardInterrupt:
        print("\n\n⏹️  Diagnóstico interrompido pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante diagnóstico: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    main()
