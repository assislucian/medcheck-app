#!/usr/bin/env python3
"""
Investigação do Problema de Filename Mapping
============================================

Baseado nos logs, sabemos que:
1. Parsers funcionam perfeitamente  
2. Lógica de matching está correta
3. Mapa de participações está sendo criado
4. MAS o endpoint retorna participações vazias

Vamos descobrir EXATAMENTE onde está a desconexão.
"""

import os
import sqlite3
import sys
from typing import Dict, List

import requests

# Configuração
LOCAL_API = "http://localhost:8000"
CREDENTIALS = {"uf": "AC", "crm": "6091", "password": "@Luassis90"}


class FilenameMapper:
    def __init__(self):
        self.session = requests.Session()
        self.token = None

    def log(self, message: str, level: str = "INFO"):
        """Log formatado"""
        print(f"[{level}] {message}")

    def authenticate(self) -> bool:
        """Autentica e obtém token"""
        try:
            form_data = {
                "username": CREDENTIALS["crm"],
                "password": CREDENTIALS["password"],
                "scope": CREDENTIALS["uf"],
            }

            response = self.session.post(
                f"{LOCAL_API}/token",
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

    def check_database_directly(self):
        """Verifica o banco de dados SQLite diretamente"""
        self.log("\n🔍 INVESTIGAÇÃO DIRETA NO BANCO DE DADOS")
        self.log("=" * 80)

        db_path = "medcheck.db"  # Assumindo que é o nome padrão
        if not os.path.exists(db_path):
            self.log(f"❌ Banco de dados não encontrado: {db_path}")
            return

        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()

            # Verificar guias
            self.log("\n📋 GUIAS NO BANCO:")
            cursor.execute(
                """
                SELECT id, numero_guia, filename, crm, uf, codigo, papel, data 
                FROM guias 
                WHERE crm = ? AND uf = ?
                ORDER BY numero_guia, codigo
            """,
                (CREDENTIALS["crm"], CREDENTIALS["uf"]),
            )

            guias = cursor.fetchall()
            self.log(f"📊 Total de guias no banco: {len(guias)}")

            # Agrupar por número da guia
            guias_por_numero = {}
            for guia in guias:
                id_guia, numero_guia, filename, crm, uf, codigo, papel, data = guia
                if numero_guia not in guias_por_numero:
                    guias_por_numero[numero_guia] = []
                guias_por_numero[numero_guia].append(
                    {
                        "id": id_guia,
                        "numero_guia": numero_guia,
                        "filename": filename,
                        "codigo": codigo,
                        "papel": papel,
                        "data": data,
                    }
                )

            for numero_guia, procedimentos in guias_por_numero.items():
                filename = procedimentos[0]["filename"] if procedimentos else "N/A"
                self.log(f"\n🔸 Guia {numero_guia} (arquivo: {filename}):")
                self.log(f"   📄 Filename no banco: '{filename}'")

                # Verificar se arquivo existe
                if filename:
                    arquivo_uploads = os.path.join("uploads", filename)
                    existe_uploads = os.path.exists(arquivo_uploads)
                    self.log(f"   🔍 Existe em uploads/: {existe_uploads}")

                    # Verificar em data/guias/ também
                    arquivo_data = os.path.join("data/guias", filename)
                    existe_data = os.path.exists(arquivo_data)
                    self.log(f"   🔍 Existe em data/guias/: {existe_data}")

                    if not existe_uploads and not existe_data:
                        self.log(f"   ❌ ARQUIVO NÃO ENCONTRADO EM LUGAR NENHUM!")

                        # Procurar arquivos similares
                        self.log(f"   🔍 Procurando arquivos similares...")
                        uploads_files = (
                            os.listdir("uploads") if os.path.exists("uploads") else []
                        )
                        data_files = (
                            os.listdir("data/guias")
                            if os.path.exists("data/guias")
                            else []
                        )

                        all_files = uploads_files + data_files

                        # Procurar por similaridade
                        for file in all_files:
                            if any(
                                word in file.lower()
                                for word in filename.lower().split()
                            ):
                                self.log(f"      → Similar encontrado: {file}")

                # Mostrar procedimentos
                for proc in procedimentos[:3]:  # Primeiros 3
                    self.log(f"   └── Código: {proc['codigo']}, Papel: {proc['papel']}")

                if len(procedimentos) > 3:
                    self.log(
                        f"   └── ... e mais {len(procedimentos) - 3} procedimentos"
                    )

            # Verificar demonstrativos
            self.log(f"\n💰 DEMONSTRATIVOS NO BANCO:")
            cursor.execute(
                """
                SELECT id, periodo, filename, crm, uf, total_procedimentos
                FROM demonstrativos 
                WHERE crm = ? AND uf = ?
                ORDER BY id
            """,
                (CREDENTIALS["crm"], CREDENTIALS["uf"]),
            )

            demos = cursor.fetchall()
            self.log(f"📊 Total de demonstrativos no banco: {len(demos)}")

            for demo in demos:
                id_demo, periodo, filename, crm, uf, total_proc = demo
                self.log(f"\n💰 Demo {id_demo} - {periodo}:")
                self.log(f"   📄 Filename: {filename}")

                arquivo_demo = os.path.join("uploads", filename)
                existe_demo = os.path.exists(arquivo_demo)
                self.log(f"   🔍 Arquivo existe: {existe_demo}")
                self.log(f"   📊 Total procedimentos: {total_proc}")

            conn.close()

        except Exception as e:
            self.log(f"❌ Erro ao acessar banco: {str(e)}", "ERROR")

    def test_backend_guia_processing(self):
        """Testa como o backend está processando as guias"""
        self.log("\n🔧 SIMULANDO PROCESSAMENTO DO BACKEND")
        self.log("=" * 80)

        # Simular exatamente o que o backend faz
        sys.path.append("src")
        from parsers.guia_parser import parse_guia_pdf

        # Testar com diferentes caminhos
        test_files = [
            "uploads/thayse borges.pdf",
            "data/guias/thayse borges.pdf",
            "uploads/nubia_katia.pdf",
            "data/guias/nubia_katia.pdf",
        ]

        for test_file in test_files:
            self.log(f"\n🧪 Testando: {test_file}")

            if os.path.exists(test_file):
                try:
                    procedures = parse_guia_pdf(test_file, CREDENTIALS["crm"])
                    self.log(f"   ✅ Parser funcionou: {len(procedures)} procedimentos")

                    for i, proc in enumerate(procedures[:2]):
                        guia = proc.get("guia")
                        codigo = proc.get("codigo")
                        participacoes = proc.get("participacoes", [])
                        self.log(
                            f"   └── [{i+1}] Guia {guia}, Código {codigo}: {len(participacoes)} participações"
                        )

                except Exception as e:
                    self.log(f"   ❌ Erro no parser: {str(e)}")
            else:
                self.log(f"   ❌ Arquivo não existe")

    def run_complete_investigation(self):
        """Executa investigação completa"""
        self.log("🔍 INVESTIGAÇÃO COMPLETA DO PROBLEMA DE FILENAME MAPPING")
        self.log("=" * 100)

        if not self.authenticate():
            self.log("❌ Falha na autenticação. Abortando investigação.")
            return

        try:
            # 1. Verificar banco de dados diretamente
            self.check_database_directly()

            # 2. Testar processamento de guias
            self.test_backend_guia_processing()

            self.log("\n🎯 INVESTIGAÇÃO CONCLUÍDA")
            self.log("=" * 80)
            self.log("📋 Pontos para verificar:")
            self.log("   1. Se filenames no banco correspondem aos arquivos reais")
            self.log("   2. Se o backend está procurando nos diretórios corretos")
            self.log("   3. Se os parsers conseguem acessar os arquivos")
            self.log("   4. Se há inconsistências nos paths de arquivo")

        except Exception as e:
            self.log(f"❌ Erro durante investigação: {str(e)}", "ERROR")


if __name__ == "__main__":
    mapper = FilenameMapper()
    mapper.run_complete_investigation()
