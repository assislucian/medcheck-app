"""
Smart Papel Extractor - Extração inteligente de papéis médicos por procedimento
Resolve o problema de associar corretamente papéis a procedimentos específicos
"""

import re
from typing import Dict, List, Any


def extract_papel_by_procedure(text: str, codigo_procedimento: str, crm_target: str) -> str:
    """
    Extrai o papel específico de um CRM para um procedimento específico.
    
    Esta função resolve o problema crítico de determinar qual papel 
    um médico exerce em cada procedimento individual.
    """
    
    # Estratégia 1: Análise de contexto sequencial
    papel = _extract_by_sequential_context(text, codigo_procedimento, crm_target)
    if papel:
        return papel
    
    # Estratégia 2: Análise de blocos de procedimento
    papel = _extract_by_procedure_blocks(text, codigo_procedimento, crm_target)
    if papel:
        return papel
    
    # Estratégia 3: Análise de proximidade textual
    papel = _extract_by_proximity(text, codigo_procedimento, crm_target)
    if papel:
        return papel
    
    # Fallback: Cirurgião (papel mais comum)
    return "Cirurgiao"


def _extract_by_sequential_context(text: str, codigo: str, crm: str) -> str:
    """Extrai papel baseado na ordem sequencial no documento."""
    
    # Dividir texto em seções por código de procedimento
    proc_sections = re.split(r'(306\d{5})', text)
    
    target_section = ""
    found_code = False
    
    for section in proc_sections:
        if section == codigo:
            found_code = True
        elif found_code and not re.match(r'306\d{5}', section):
            target_section = section
            break
    
    if not target_section:
        return ""
    
    # Analisar estrutura da seção
    lines = target_section.split('\n')
    
    # Encontrar linha com o CRM
    crm_line_idx = -1
    for i, line in enumerate(lines):
        if crm in line:
            crm_line_idx = i
            break
    
    if crm_line_idx == -1:
        return ""
    
    # Buscar papéis em um contexto de ±3 linhas
    context_start = max(0, crm_line_idx - 3)
    context_end = min(len(lines), crm_line_idx + 4)
    
    context_lines = lines[context_start:context_end]
    context_text = '\n'.join(context_lines)
    
    # Procurar papéis no contexto (incluindo variações de OCR)
    papel_matches = re.findall(
        r'\b(Anestesista|Cirurgiao|Pri[^\s]*ro\s+Auxiliar|Primeiro\s+Auxiliar)\b',
        context_text,
        re.IGNORECASE
    )
    
    if papel_matches:
        # Se há múltiplos papéis, usar heurística de posição
        if len(papel_matches) == 1:
            return _normalize_papel(papel_matches[0])
        else:
            # Estratégia: o papel mais próximo à linha do CRM
            best_papel = ""
            min_distance = float('inf')
            
            for line_idx in range(context_start, context_end):
                if line_idx >= len(lines):
                    continue
                    
                line = lines[line_idx]
                # Incluir variações de OCR
                papeis_patterns = [
                    (r'Anestesista', 'Anestesista'),
                    (r'Cirurgiao', 'Cirurgiao'), 
                    (r'Pri[^\s]*ro\s+Auxiliar', 'Primeiro Auxiliar'),
                    (r'Primeiro\s+Auxiliar', 'Primeiro Auxiliar')
                ]
                
                for pattern, papel_nome in papeis_patterns:
                    if re.search(pattern, line, re.IGNORECASE):
                        distance = abs(line_idx - crm_line_idx)
                        if distance < min_distance:
                            min_distance = distance
                            best_papel = papel_nome
            
            return _normalize_papel(best_papel) if best_papel else ""
    
    return ""


def _extract_by_procedure_blocks(text: str, codigo: str, crm: str) -> str:
    """Extrai papel analisando blocos estruturados por procedimento."""
    
    # Estratégia: encontrar padrões tabulares comuns em guias médicas
    # Exemplo: Código -> Lista de participações em ordem
    
    codigo_pos = text.find(codigo)
    if codigo_pos == -1:
        return ""
    
    # Buscar contexto ao redor do código (±500 chars)
    context_start = max(0, codigo_pos - 200)
    context_end = min(len(text), codigo_pos + 500)
    context = text[context_start:context_end]
    
    # Procurar estruturas como:
    # Anestesista
    # 6241 - LUIZ CARLOS
    # Cirurgiao  
    # 4999 - FLAVIO ROCHA
    # Primeiro Auxiliar
    # 6091 - MOISES DE OLIVEIRA
    
    lines = context.split('\n')
    papel_atual = ""
    
    for line in lines:
        line = line.strip()
        
        # Verificar se é uma linha de papel (incluindo variações de OCR)
        papel_match = re.search(r'\b(Anestesista|Cirurgiao|Pri[^\s]*ro\s+Auxiliar|Primeiro\s+Auxiliar)\b', line, re.IGNORECASE)
        if papel_match and len(line) < 50:  # Linha curta = provavelmente só o papel
            papel_atual = papel_match.group(1)
            continue
        
        # Verificar se é linha com CRM
        if crm in line and papel_atual:
            return _normalize_papel(papel_atual)
    
    return ""


def _extract_by_proximity(text: str, codigo: str, crm: str) -> str:
    """Extrai papel baseado na proximidade textual entre elementos."""
    
    # Encontrar todas as posições do CRM e do código
    crm_positions = [m.start() for m in re.finditer(re.escape(crm), text)]
    codigo_positions = [m.start() for m in re.finditer(re.escape(codigo), text)]
    
    if not crm_positions or not codigo_positions:
        return ""
    
    # Encontrar CRM mais próximo do código
    min_distance = float('inf')
    best_crm_pos = crm_positions[0]
    
    for crm_pos in crm_positions:
        for codigo_pos in codigo_positions:
            distance = abs(crm_pos - codigo_pos)
            if distance < min_distance:
                min_distance = distance
                best_crm_pos = crm_pos
    
    # Buscar papéis próximos a esta posição do CRM
    context_start = max(0, best_crm_pos - 300)
    context_end = min(len(text), best_crm_pos + 300)
    context = text[context_start:context_end]
    
    # Encontrar papéis no contexto (incluindo variações de OCR)
    papel_matches = re.findall(
        r'\b(Anestesista|Cirurgiao|Pri[^\s]*ro\s+Auxiliar|Primeiro\s+Auxiliar)\b',
        context,
        re.IGNORECASE
    )
    
    if papel_matches:
        # Retornar o papel mais comum (mais provável de estar correto)
        from collections import Counter
        papel_counts = Counter(papel_matches)
        most_common_papel = papel_counts.most_common(1)[0][0]
        return _normalize_papel(most_common_papel)
    
    return ""


def _normalize_papel(papel: str) -> str:
    """Normaliza o papel médico para formato padrão."""
    if not papel:
        return "Cirurgiao"
    
    papel_lower = papel.lower().strip()
    
    if "cirurgi" in papel_lower:
        return "Cirurgiao"
    elif "anestesista" in papel_lower:
        return "Anestesista" 
    elif "auxiliar" in papel_lower:
        # CORREÇÃO: Sempre normalizar qualquer variação de "Auxiliar" para "Primeiro Auxiliar"
        # Isso inclui "Pri~tro Auxiliar", "Primeiro Auxiliar", etc.
        return "Primeiro Auxiliar"
    elif re.search(r'pri[^\s]*ro.*auxiliar', papel_lower):
        # Captura variações de OCR como "Pri~tro Auxiliar"
        return "Primeiro Auxiliar"
    else:
        return "Cirurgiao"  # Default


def get_all_procedures_with_roles(text: str, crm_target: str) -> List[Dict[str, Any]]:
    """
    Extrai todos os procedimentos com seus papéis específicos.
    
    Função principal que resolve o problema de papéis incorretos.
    """
    
    # Encontrar todos os códigos de procedimento
    proc_codes = re.findall(r'306\d{5}', text)
    
    results = []
    
    for codigo in proc_codes:
        papel = extract_papel_by_procedure(text, codigo, crm_target)
        
        results.append({
            'codigo': codigo,
            'papel_exercido': papel,
            'crm': crm_target,
            'status': 'extracted_by_smart_extractor'
        })
    
    return results


# Função de teste para validação
def test_smart_extractor():
    """Testa o extrator inteligente com dados reais."""
    from pathlib import Path
    import fitz
    
    # Testar com v.pdf.pdf
    file_path = Path('/Users/luciandeassis/medcheck-app/data/scans/v.pdf.pdf')
    
    if file_path.exists():
        with fitz.open(str(file_path)) as doc:
            text = doc[0].get_text()
        
        results = get_all_procedures_with_roles(text, '6091')
        
        print("🎯 SMART EXTRACTOR RESULTS:")
        for result in results:
            print(f"  - {result['codigo']}: {result['papel_exercido']}")
        
        return results
    
    return []


if __name__ == "__main__":
    test_smart_extractor()
