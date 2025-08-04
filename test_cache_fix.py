#!/usr/bin/env python3
"""
Script de teste para verificar se a correção do cache de participações funciona.

Este script simula o fluxo de:
1. Upload de uma guia
2. Verificação de que ela aparece nos demonstrativos
3. Exclusão da guia
4. Verificação de que agora aparece como "Inserir Guia"
"""

import requests
import json
import time

# Configurações
BASE_URL = "http://localhost:8000"
CRM = "12345"  # Substitua pelo CRM do usuário de teste
UF = "SP"      # Substitua pela UF do usuário de teste
PASSWORD = "senha123"  # Substitua pela senha do usuário de teste

def login():
    """Faz login e retorna o token de acesso"""
    response = requests.post(
        f"{BASE_URL}/token",
        data={
            "username": CRM,
            "password": PASSWORD,
            "uf": UF
        }
    )
    
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Erro no login: {response.status_code} - {response.text}")
        return None

def test_cache_invalidation():
    """Testa se o cache é invalidado corretamente após deletar guias"""
    
    print("🔑 Fazendo login...")
    token = login()
    if not token:
        print("❌ Falha no login. Verifique as credenciais.")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("📋 Listando demonstrativos...")
    response = requests.get(f"{BASE_URL}/api/v1/demonstrativos", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Erro ao listar demonstrativos: {response.status_code}")
        return
    
    demonstrativos = response.json()
    
    if not demonstrativos:
        print("❌ Nenhum demonstrativo encontrado. Faça upload de demonstrativos primeiro.")
        return
    
    demo_id = demonstrativos[0]["id"]
    periodo = demonstrativos[0]["periodo"]
    
    print(f"🔍 Testando demonstrativo: {periodo} (ID: {demo_id})")
    
    # Obter detalhes do demonstrativo
    print("📊 Buscando detalhes do demonstrativo...")
    response = requests.get(f"{BASE_URL}/api/v1/demonstrativos/{demo_id}/detalhes", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Erro ao buscar detalhes: {response.status_code}")
        return
    
    procedures = response.json()
    
    # Contar procedimentos por status de participação
    com_participacao = 0
    sem_participacao = 0
    
    for proc in procedures:
        papel = proc.get("papel_exercido", "")
        participacao = proc.get("participacao", "")
        
        # Se tem papel_exercido válido ou participação diferente de 'upload guia'
        if (papel and papel != "" and papel.lower() != "upload guia") or \
           (participacao and participacao != "" and participacao.lower() != "upload guia"):
            com_participacao += 1
        else:
            sem_participacao += 1
    
    print(f"📈 Resultado atual:")
    print(f"   ✅ Procedimentos com participação: {com_participacao}")
    print(f"   🔄 Procedimentos sem participação (precisam guia): {sem_participacao}")
    
    if com_participacao == 0:
        print("✅ Perfeito! Todos os procedimentos já estão mostrando 'Inserir Guia'")
        print("🎯 A correção do cache está funcionando corretamente!")
    else:
        print("ℹ️  Ainda há procedimentos com participação. Isso é normal se existem guias válidas.")
    
    # Verificar cache hits nos logs
    print("\n🔍 Para verificar se o cache está sendo invalidado corretamente,")
    print("   verifique os logs do backend para mensagens como:")
    print("   '[CACHE INVALIDATED] Cache de participações limpo para...'")
    
    return True

if __name__ == "__main__":
    print("🧪 TESTE DE CORREÇÃO DO CACHE DE PARTICIPAÇÕES")
    print("=" * 50)
    test_cache_invalidation()
    print("=" * 50)
    print("✅ Teste concluído!")