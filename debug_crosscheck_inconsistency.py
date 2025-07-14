#!/usr/bin/env python3
"""
Diagnóstico de Inconsistência no Crosscheck
===========================================

Este script investiga a inconsistência crítica reportada pelo usuário:
- Apenas 1 guia (Nubia) está sendo reconhecida corretamente
- As outras guias (Thayse, Rodrigo, Noivana) não estão refletindo no crosscheck
- O sistema parece estar "adivinhando" ao invés de usar lógica exata

Vamos diagnosticar:
1. Quais guias estão no banco
2. Como os parsers estão extraindo os dados
3. Como o matching está sendo feito
4. Onde está a quebra de lógica
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List

import requests

# Configuração
LOCAL_API = "http://localhost:8000"
CREDENTIALS = {"uf": "AC", "crm": "6091", "password": "@Luassis90"}


class CrosscheckDebugger:
    def __init__(self, api_url: str = LOCAL_API):
        self.api_url = api_url
        self.session = requests.Session()
        self.token = None

    def log(self, message: str, level: str = "INFO"):
        """Log formatado"""
        print(f"[{level}] {message}")

    def authenticate(self) -> bool:
        """Autentica e obtém token"""
        try:
            self.log("🔐 Autenticando...")
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
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                self.log("✅ Autenticado com sucesso")
                return True
            else:
                self.log(f"❌ Falha na autenticação: {response.status_code}", "ERROR")
                return False

        except Exception as e:
            self.log(f"❌ Erro na autenticação: {str(e)}", "ERROR")
            return False

    def get_guias_from_db(self) -> List[Dict]:
        """Obtém todas as guias do banco de dados"""
        try:
            response = self.session.get(f"{self.api_url}/api/v1/guias?pageSize=1000")
            if response.status_code == 200:
                data = response.json()
                # O endpoint retorna em formato específico
                if isinstance(data, dict):
                    return data.get("procedures", [])
                elif isinstance(data, list):
                    return data
                else:
                    return []
            else:
                self.log(f"❌ Erro ao buscar guias: {response.status_code}", "ERROR")
                return []
        except Exception as e:
            self.log(f"❌ Erro ao buscar guias: {str(e)}", "ERROR")
            return []

    def get_demonstrativos_from_db(self) -> List[Dict]:
        """Obtém todos os demonstrativos do banco de dados"""
        try:
            response = self.session.get(f"{self.api_url}/api/v1/demonstrativos")
            if response.status_code == 200:
                return response.json()
            else:
                self.log(
                    f"❌ Erro ao buscar demonstrativos: {response.status_code}", "ERROR"
                )
                return []
        except Exception as e:
            self.log(f"❌ Erro ao buscar demonstrativos: {str(e)}", "ERROR")
            return []

    def get_demonstrativo_details(self, demo_id: int) -> List[Dict]:
        """Obtém detalhes de um demonstrativo específico"""
        try:
            response = self.session.get(
                f"{self.api_url}/api/v1/demonstrativos/{demo_id}/detalhes"
            )
            if response.status_code == 200:
                return response.json()
            else:
                self.log(
                    f"❌ Erro ao buscar detalhes do demo {demo_id}: {response.status_code}",
                    "ERROR",
                )
                return []
        except Exception as e:
            self.log(f"❌ Erro ao buscar detalhes do demo {demo_id}: {str(e)}", "ERROR")
            return []

    def test_parser_directly(self, file_path: str) -> List[Dict]:
        """Testa o parser de guia diretamente"""
        try:
            # Importar o parser local
            import sys

            sys.path.append("src")
            from parsers.guia_parser import parse_guia_pdf

            self.log(f"🔍 Testando parser diretamente em: {file_path}")
            procedures = parse_guia_pdf(file_path, CREDENTIALS["crm"])
            self.log(f"📊 Parser direto encontrou: {len(procedures)} procedimentos")

            return procedures
        except Exception as e:
            self.log(f"❌ Erro no parser direto: {str(e)}", "ERROR")
            return []

    def analyze_guias_data(self):
        """Analisa dados das guias de forma detalhada"""
        self.log("\n" + "=" * 80)
        self.log("📋 ANÁLISE DETALHADA DAS GUIAS NO BANCO DE DADOS")
        self.log("=" * 80)

        guias = self.get_guias_from_db()

        if not guias:
            self.log("❌ Nenhuma guia encontrada no banco de dados!")
            return

        self.log(f"📊 Total de guias no banco: {len(guias)}")

        # Agrupar por número da guia
        guias_por_numero = {}
        for guia in guias:
            numero = guia.get("numero_guia") or guia.get("guia")
            if numero not in guias_por_numero:
                guias_por_numero[numero] = []
            guias_por_numero[numero].append(guia)

        self.log(f"📊 Números de guias únicos: {len(guias_por_numero)}")

        for numero_guia, procedimentos in guias_por_numero.items():
            self.log(f"\n🔸 Guia {numero_guia}:")
            self.log(f"   └── Procedimentos: {len(procedimentos)}")

            # Mostrar detalhes dos primeiros procedimentos
            for i, proc in enumerate(procedimentos[:3]):
                codigo = proc.get("codigo") or proc.get("code")
                descricao = proc.get("descricao") or proc.get("description")
                papel = proc.get("papel") or proc.get("role")
                paciente = proc.get("paciente") or proc.get("patient")
                data = proc.get("data") or proc.get("date")

                self.log(f"   └── [{i+1}] Código: {codigo}")
                self.log(f"       └── Descrição: {descricao}")
                self.log(f"       └── Papel: {papel}")
                self.log(f"       └── Paciente: {paciente}")
                self.log(f"       └── Data: {data}")

                # Verificar campos chave para matching
                self.log(
                    f"       └── [MATCH KEY] Guia: {numero_guia}, Código: {codigo}"
                )

            if len(procedimentos) > 3:
                self.log(f"   └── ... e mais {len(procedimentos) - 3} procedimentos")

    def analyze_demonstrativos_data(self):
        """Analisa dados dos demonstrativos"""
        self.log("\n" + "=" * 80)
        self.log("💰 ANÁLISE DETALHADA DOS DEMONSTRATIVOS")
        self.log("=" * 80)

        demonstrativos = self.get_demonstrativos_from_db()

        if not demonstrativos:
            self.log("❌ Nenhum demonstrativo encontrado!")
            return

        self.log(f"📊 Total de demonstrativos: {len(demonstrativos)}")

        for demo in demonstrativos:
            demo_id = demo.get("id")
            periodo = demo.get("periodo")
            self.log(f"\n💰 Demonstrativo {demo_id} - {periodo}:")

            # Buscar detalhes
            detalhes = self.get_demonstrativo_details(demo_id)

            if not detalhes:
                self.log("   ❌ Nenhum detalhe encontrado!")
                continue

            self.log(f"   📊 Total de procedimentos: {len(detalhes)}")

            # Contar participações
            com_participacao = 0
            sem_participacao = 0

            # Analisar cada procedimento
            for proc in detalhes[:5]:  # Primeiros 5 apenas
                guia = proc.get("guia")
                codigo = proc.get("codigo") or proc.get("code")
                participacoes = proc.get("participacoes", [])
                papel_exercido = proc.get("papel_exercido", "")

                if participacoes and len(participacoes) > 0:
                    com_participacao += 1
                    self.log(
                        f"   ✅ Guia {guia}, Código {codigo}: {len(participacoes)} participações"
                    )
                    self.log(f"      └── Papel exercido: {papel_exercido}")
                else:
                    sem_participacao += 1
                    self.log(f"   ❌ Guia {guia}, Código {codigo}: SEM participações")
                    self.log(f"      └── [MATCH KEY] Guia: {guia}, Código: {codigo}")

            total_com_participacao = sum(1 for p in detalhes if p.get("participacoes"))
            total_sem_participacao = len(detalhes) - total_com_participacao

            self.log(f"   📊 RESUMO:")
            self.log(f"      ✅ Com participação: {total_com_participacao}")
            self.log(f"      ❌ Sem participação: {total_sem_participacao}")
            self.log(
                f"      📈 Taxa de crosscheck: {(total_com_participacao / len(detalhes) * 100):.1f}%"
            )

    def test_matching_logic(self):
        """Testa a lógica de matching manualmente"""
        self.log("\n" + "=" * 80)
        self.log("🔍 TESTE MANUAL DA LÓGICA DE MATCHING")
        self.log("=" * 80)

        # Obter dados
        guias = self.get_guias_from_db()
        demonstrativos = self.get_demonstrativos_from_db()

        if not guias or not demonstrativos:
            self.log("❌ Dados insuficientes para teste de matching")
            return

        # Criar mapa de matching similar ao que o backend faz
        participacoes_map = {}

        for guia in guias:
            numero_guia = guia.get("numero_guia") or guia.get("guia")
            codigo = guia.get("codigo") or guia.get("code")
            papel = guia.get("papel") or guia.get("role")
            crm = guia.get("crm")

            key = (numero_guia, codigo)

            if key not in participacoes_map:
                participacoes_map[key] = []

            participacao = {
                "papel": papel,
                "crm": crm,
                "nome": guia.get("nome_medico", ""),
            }
            participacoes_map[key].append(participacao)

        self.log(f"🗺️ Mapa de participações criado: {len(participacoes_map)} chaves")

        # Mostrar algumas chaves do mapa
        for i, (key, participacoes) in enumerate(list(participacoes_map.items())[:10]):
            guia_num, codigo = key
            self.log(
                f"   🔑 [{i+1}] Chave: (Guia {guia_num}, Código {codigo}) → {len(participacoes)} participações"
            )

        # Testar matching com demonstrativo
        for demo in demonstrativos:
            demo_id = demo.get("id")
            detalhes = self.get_demonstrativo_details(demo_id)

            self.log(f"\n🧪 Testando matching para demonstrativo {demo_id}:")

            matches_found = 0
            matches_missing = 0

            for proc in detalhes[:10]:  # Teste nos primeiros 10
                guia = proc.get("guia")
                codigo = proc.get("codigo") or proc.get("code")
                key = (guia, codigo)

                if key in participacoes_map:
                    matches_found += 1
                    participacoes = participacoes_map[key]
                    self.log(
                        f"   ✅ MATCH: Guia {guia}, Código {codigo} → {len(participacoes)} participações"
                    )
                else:
                    matches_missing += 1
                    self.log(f"   ❌ NO MATCH: Guia {guia}, Código {codigo}")

                    # Tentar encontrar matches parciais
                    partial_matches = []
                    for map_key in participacoes_map.keys():
                        map_guia, map_codigo = map_key
                        if map_guia == guia:
                            partial_matches.append(f"Código {map_codigo}")
                        elif map_codigo == codigo:
                            partial_matches.append(f"Guia {map_guia}")

                    if partial_matches:
                        self.log(
                            f"      🔍 Matches parciais: {', '.join(partial_matches[:3])}"
                        )

            self.log(
                f"   📊 Resultado: {matches_found} matches, {matches_missing} sem match"
            )

            if matches_missing > 0:
                self.log("   ⚠️ PROBLEMA DETECTADO: Há procedimentos sem match!")

    def test_file_parsers(self):
        """Testa os parsers dos arquivos de guia diretamente"""
        self.log("\n" + "=" * 80)
        self.log("🔧 TESTE DIRETO DOS PARSERS DE ARQUIVO")
        self.log("=" * 80)

        guia_files = [
            "data/guias/nubia_katia.pdf",
            "data/guias/thayse borges.pdf",
            "data/guias/rodrigo bernardo.pdf",
            "data/guias/noivana.pdf",
        ]

        for guia_file in guia_files:
            if os.path.exists(guia_file):
                self.log(f"\n📄 Testando: {guia_file}")
                procedures = self.test_parser_directly(guia_file)

                if procedures:
                    self.log(f"   ✅ Parser extraiu {len(procedures)} procedimentos")

                    # Mostrar detalhes dos primeiros procedimentos
                    for i, proc in enumerate(procedures[:3]):
                        guia = proc.get("guia")
                        codigo = proc.get("codigo")
                        papel = proc.get("papel_exercido")

                        self.log(
                            f"   └── [{i+1}] Guia: {guia}, Código: {codigo}, Papel: {papel}"
                        )
                else:
                    self.log(f"   ❌ Parser não extraiu nenhum procedimento!")
            else:
                self.log(f"   ❌ Arquivo não encontrado: {guia_file}")

    def run_complete_diagnosis(self):
        """Executa diagnóstico completo"""
        self.log("🏥 DIAGNÓSTICO COMPLETO DA INCONSISTÊNCIA DE CROSSCHECK")
        self.log("=" * 80)

        if not self.authenticate():
            self.log("❌ Falha na autenticação. Abortando diagnóstico.")
            return

        try:
            # 1. Analisar dados no banco
            self.analyze_guias_data()
            self.analyze_demonstrativos_data()

            # 2. Testar lógica de matching
            self.test_matching_logic()

            # 3. Testar parsers diretamente
            self.test_file_parsers()

            self.log("\n" + "=" * 80)
            self.log("🎯 DIAGNÓSTICO CONCLUÍDO")
            self.log("=" * 80)
            self.log("📋 Verifique os logs acima para identificar:")
            self.log("   1. Se as guias estão sendo salvas corretamente no banco")
            self.log("   2. Se os parsers estão extraindo dados corretos dos PDFs")
            self.log("   3. Se a lógica de matching (guia, código) está funcionando")
            self.log("   4. Onde exatamente está a quebra na cadeia de crosscheck")

        except Exception as e:
            self.log(f"❌ Erro durante diagnóstico: {str(e)}", "ERROR")


if __name__ == "__main__":
    debugger = CrosscheckDebugger()
    debugger.run_complete_diagnosis()
