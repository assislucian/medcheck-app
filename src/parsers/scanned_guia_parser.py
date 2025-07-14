"""
Parser Avançado para Guias Escaneadas — MedCheck
===============================================
Parser flexível para guias médicas escaneadas que combina:
- Extração de texto normal (quando disponível)
- OCR avançado (para arquivos puramente escaneados)  
- Regexes adaptáveis para diferentes layouts de guias
- Correção automática de texto mal reconhecido
"""

from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import fitz  # PyMuPDF

# Tentativa de import do OCR
try:
    import io

    import pytesseract
    from PIL import Image

    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

__all__ = ["parse_scanned_guia_pdf"]

# --------------------------------------------------------------------------- #
# Configurações e Regexes Flexíveis                                         #
# --------------------------------------------------------------------------- #

# Configuração OCR otimizada para português
OCR_CONFIG = r"--oem 3 --psm 6 -l por+eng"
OCR_CONFIG_FALLBACK = r"--oem 3 --psm 6"

# Regexes para diferentes formatos de apresentação dos dados
PRESTADOR_PATTERNS = [
    re.compile(r"Prestador:\s*([^\|]+?)(?:\s*\|\s*|$)", re.IGNORECASE),
    re.compile(r"Prestador[:\s]*(?:\d+\s*-\s*)?([^\n\|]+)", re.IGNORECASE),
    re.compile(r"LIGA\s+[A-Z\s]*CANCER[A-Z\s]*POLICLINIC", re.IGNORECASE),
]

BENEFICIARIO_PATTERNS = [
    re.compile(r"Beneficiário:\s*\d+\s*-\s*([^\n\|]+)", re.IGNORECASE),
    re.compile(r"Benefici[aá]rio[:\s]*\d+\s*-\s*([^\n]+)", re.IGNORECASE),
    re.compile(r"(?:Paciente|Beneficiário)[:\s]*([A-Z\s]+)", re.IGNORECASE),
    # Padrão específico para texto OCR escaneado
    re.compile(
        r"(\b[A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})*(?:\s+[A-Z])?)\s+B\s+---",
        re.IGNORECASE,
    ),
    re.compile(
        r"^([A-Z]{2,}(?:\s+[A-Z]{2,})*(?:\s+[A-Z]{1,2})?)\s+B?\s*---",
        re.MULTILINE | re.IGNORECASE,
    ),
    re.compile(
        r"(\b[A-Z]{2,}(?:\s+[A-Z]{2,})*(?:\s+DA\s+[A-Z]+)*(?:\s+[A-Z])?)\s+B\s",
        re.IGNORECASE,
    ),
]

# Padrões para identificar números de guia
GUIA_PATTERNS = [
    re.compile(r"Guia[:\s]*(\d{7,8})", re.IGNORECASE),
    re.compile(r"^(\d{7,8})$", re.MULTILINE),
    re.compile(r"(?:Número|Num|Nr)[\s\.:]*(\d{7,8})", re.IGNORECASE),
]

# Padrões para códigos de procedimento
CODIGO_PATTERNS = [
    re.compile(r"C[óo]d[íi]go[:\s]*(\d{8})", re.IGNORECASE),
    re.compile(r"^(\d{8})$", re.MULTILINE),
    re.compile(r"Procedimento[:\s]*(\d{8})", re.IGNORECASE),
    # Padrão específico baseado no arquivo escaneado
    re.compile(r"(\d{8})\s+M[eé]dico", re.IGNORECASE),
    re.compile(r"(\d{8})\s+[A-Z]", re.IGNORECASE),
]

# Padrões para datas
DATA_PATTERNS = [
    re.compile(r"(\d{2}/\d{2}/\d{4})", re.IGNORECASE),
    re.compile(r"(\d{2}-\d{2}-\d{4})", re.IGNORECASE),
    re.compile(r"(\d{1,2}[./]\d{1,2}[./]\d{4})", re.IGNORECASE),
]

# Padrões para participações médicas
PARTICIPACAO_PATTERNS = [
    # Formato "CRM Nome"
    re.compile(r"(\d{4,6})\s*-\s*([A-Z\s]+(?:[A-Z]+\s*)*)", re.IGNORECASE),
    # Formato inline
    re.compile(
        r"(Cirurgi[aã]o|Anestesista|Primeiro\s+Auxiliar|Auxiliar)[:\s]*(\d{4,6})\s*-\s*([A-Z\s]+)",
        re.IGNORECASE,
    ),
    # Padrão específico do arquivo escaneado
    re.compile(r"M[eé]dico\s+(\d{4,6})\s*-\s*([A-Z\s]+)", re.IGNORECASE),
]

# Mapeamento de papéis com variações de OCR
PAPEL_MAPPING = {
    "cirurgiao": ["cirurgiao", "cirurgi", "cirurg", "surgeon"],
    "anestesista": ["anestesista", "anest", "anesthesia", "anesth"],
    "primeiro_auxiliar": [
        "primeiro auxiliar",
        "primeiro aux",
        "1º auxiliar",
        "1 auxiliar",
        "aux1",
    ],
    "segundo_auxiliar": [
        "segundo auxiliar",
        "segundo aux",
        "2º auxiliar",
        "2 auxiliar",
        "aux2",
    ],
    "auxiliar": ["auxiliar", "aux", "assistant"],
}

# Correções comuns de OCR
OCR_CORRECTIONS = {
    "cirurgi": "cirurgiao",
    "anestesi": "anestesista",
    "auxiIiar": "auxiliar",
    "guai": "guia",
    "prestador.": "prestador:",
    "benefici[aá]rio": "beneficiario",
    "c[óo]digo": "codigo",
    "descri[çc][aã]o": "descricao",
}

# --------------------------------------------------------------------------- #
# Funções de Extração e Limpeza                                             #
# --------------------------------------------------------------------------- #


def _extract_text_normal(pdf_path: Path | str) -> str:
    """Extrai texto usando método normal (não-OCR)."""
    try:
        with fitz.open(str(pdf_path)) as doc:
            return "\n".join(page.get_text() for page in doc)
    except Exception:
        return ""


def _extract_text_ocr(pdf_path: Path | str) -> str:
    """Extrai texto usando OCR."""
    if not OCR_AVAILABLE:
        return ""

    try:
        text_parts = []
        with fitz.open(str(pdf_path)) as doc:
            for page_num in range(len(doc)):
                page = doc[page_num]

                # Converter página para imagem com boa resolução
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img_data = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_data))

                # Tentar OCR com português primeiro
                try:
                    page_text = pytesseract.image_to_string(image, config=OCR_CONFIG)
                except:
                    # Fallback para inglês
                    page_text = pytesseract.image_to_string(
                        image, config=OCR_CONFIG_FALLBACK
                    )

                text_parts.append(page_text)

        return "\n".join(text_parts)
    except Exception:
        return ""


def _clean_text(text: str) -> str:
    """Limpa e normaliza o texto extraído."""
    # Aplicar correções comuns de OCR
    for wrong, correct in OCR_CORRECTIONS.items():
        text = re.sub(wrong, correct, text, flags=re.IGNORECASE)

    # Normalizar espaços
    text = re.sub(r"\s+", " ", text)
    text = text.strip()

    return text


def _find_best_match(patterns: List[re.Pattern], text: str) -> Optional[re.Match]:
    """Encontra a melhor correspondência entre múltiplos padrões."""
    for pattern in patterns:
        match = pattern.search(text)
        if match:
            return match
    return None


# --------------------------------------------------------------------------- #
# Extração de Dados Específicos                                             #
# --------------------------------------------------------------------------- #


def _extract_prestador(text: str) -> str:
    """Extrai informações do prestador."""
    # Buscar padrão específico "LIGA ... CANCER POLICLINIC"
    liga_match = re.search(
        r"LIGA\s+[A-Z\s]*CANCER[A-Z\s]*POLICLINIC", text, re.IGNORECASE
    )
    if liga_match:
        return liga_match.group(0).strip()

    # Buscar prestador próximo ao número identificador
    prestador_match = re.search(
        r"prestador\s+(\d+)\s*-\s*([A-Z\s]{10,50})", text, re.IGNORECASE
    )
    if prestador_match:
        return prestador_match.group(2).strip()

    # Tentar padrões específicos
    match = _find_best_match(PRESTADOR_PATTERNS, text)
    if match:
        prestador = match.group(1).strip()
        # Limpar caracteres especiais e limitar tamanho
        prestador = re.sub(r"[^\w\s\-]", " ", prestador)
        prestador = re.sub(r"\s+", " ", prestador).strip()

        # Se muito longo, pegar apenas as primeiras palavras que fazem sentido
        if len(prestador) > 100:
            words = prestador.split()[:10]  # Máximo 10 palavras
            prestador = " ".join(words)

        return prestador

    return ""


def _extract_beneficiario(text: str) -> str:
    """Extrai informações do beneficiário."""
    # Tentar padrões específicos primeiro
    match = _find_best_match(BENEFICIARIO_PATTERNS, text)
    if match:
        beneficiario = match.group(1).strip()
        # Limpar caracteres especiais e manter apenas o nome
        beneficiario = re.sub(r"[^\w\s\-]", " ", beneficiario)
        # Limitar tamanho para evitar textos longos
        if len(beneficiario) > 100:
            # Pegar apenas as primeiras palavras que parecem um nome
            words = beneficiario.split()[:6]  # Máximo 6 palavras
            beneficiario = " ".join(words)
        # Remover sufixos desnecessários como "B -"
        beneficiario = re.sub(r"\s+B\s*-?\s*$", "", beneficiario)
        return beneficiario.strip()

    # Se não encontrou com padrões, tentar buscar nome próximo ao número da guia
    lines = text.split("\n")
    for i, line in enumerate(lines):
        # Procurar linha com número da guia
        if re.search(r"\b\d{7,8}\b", line):
            # Verificar linhas próximas para encontrar o nome
            for j in range(max(0, i - 2), min(len(lines), i + 3)):
                potential_name = lines[j].strip()
                # Verificar se parece com um nome (contém letras, não muitos números)
                if (
                    len(potential_name) > 5
                    and len(potential_name) < 100
                    and re.search(r"[A-Za-z]", potential_name)
                    and len(re.findall(r"\d", potential_name))
                    < len(potential_name) * 0.3
                ):
                    # Limpar o nome
                    clean_name = re.sub(r"[^\w\s\-]", " ", potential_name)
                    clean_name = re.sub(r"\s+", " ", clean_name).strip()
                    # Remover sufixos como "B -"
                    clean_name = re.sub(r"\s+B\s*-?\s*$", "", clean_name)
                    if len(clean_name.split()) >= 2:  # Pelo menos nome e sobrenome
                        return clean_name

    return ""


def _extract_guia_number(text: str) -> Optional[str]:
    """Extrai número da guia."""
    match = _find_best_match(GUIA_PATTERNS, text)
    if match:
        guia = match.group(1).strip()
        # Validar formato (7-8 dígitos)
        if re.match(r"^\d{7,8}$", guia):
            return guia
    return None


def _extract_procedure_info(text: str) -> List[Dict[str, Any]]:
    """Extrai informações dos procedimentos."""
    procedures = []

    # Procurar códigos de procedimento
    codigo_matches = []
    for pattern in CODIGO_PATTERNS:
        codigo_matches.extend(pattern.findall(text))

    # Procurar datas
    data_matches = []
    for pattern in DATA_PATTERNS:
        data_matches.extend(pattern.findall(text))

    for codigo in set(codigo_matches):
        # Usar primeira data encontrada como padrão
        data_execucao = (
            data_matches[0] if data_matches else datetime.now().strftime("%d/%m/%Y")
        )

        procedure = {
            "codigo": codigo,
            "descricao": None,  # CORREÇÃO: Não extrair descrição do OCR, deixar para CBHPM
            "data_execucao": data_execucao,
            "quantidade": 1,  # padrão
            "participacoes": [],
        }

        procedures.append(procedure)

    return procedures


def _extract_participacoes(text: str) -> List[Dict[str, Any]]:
    """Extrai informações das participações médicas."""
    participacoes = []

    # Procurar participações com CRM, nome e papel
    # Padrão para "8291 - EVERTON PIRES BATISTA"
    crm_nome_matches = re.findall(r"(\d{4,6})\s*-\s*([A-Z\s]{10,50})", text)

    # Procurar papéis médicos no texto
    papel_patterns = [
        r"(cirurgi[aã]o)",
        r"(anestesista)",
        r"(primeiro\s+auxiliar)",
        r"(auxiliar)",
    ]

    # Associar CRMs encontrados com papéis
    for crm, nome in crm_nome_matches:
        # Limpar nome
        nome = re.sub(r"[^\w\s\-]", " ", nome)
        nome = re.sub(r"\s+", " ", nome).strip()

        # Encontrar papel próximo ao CRM/nome no texto
        papel = "Não especificado"

        # Procurar contexto em volta do CRM para identificar o papel
        crm_pattern = rf"{crm}"
        for match in re.finditer(crm_pattern, text):
            start = max(0, match.start() - 200)
            end = min(len(text), match.end() + 200)
            context = text[start:end].lower()

            if "cirurgi" in context:
                papel = "Cirurgiao"
                break
            elif "anestesi" in context:
                papel = "Anestesista"
                break
            elif "primeiro" in context and "auxiliar" in context:
                papel = "Primeiro Auxiliar"
                break
            elif "auxiliar" in context:
                papel = "Primeiro Auxiliar"
                break

        participacoes.append(
            {
                "crm": crm,
                "nome": nome,
                "papel": _normalize_papel(papel),
                "inicio": "",
                "fim": "",
                "status": "Fechada",
            }
        )

    # Remover duplicatas baseado no CRM
    unique_participacoes = {}
    for p in participacoes:
        crm = p["crm"]
        if crm not in unique_participacoes:
            unique_participacoes[crm] = p

    return list(unique_participacoes.values())


def _normalize_papel(papel: str) -> str:
    """Normaliza o papel médico."""
    papel_lower = papel.lower().strip()

    for normalized, variations in PAPEL_MAPPING.items():
        for variation in variations:
            if variation in papel_lower:
                if normalized == "cirurgiao":
                    return "Cirurgiao"
                elif normalized == "anestesista":
                    return "Anestesista"
                elif normalized == "primeiro_auxiliar":
                    return "Primeiro Auxiliar"
                elif normalized == "segundo_auxiliar":
                    return "Segundo Auxiliar"
                elif normalized == "auxiliar":
                    return "Auxiliar"

    return "Cirurgiao"  # padrão


# --------------------------------------------------------------------------- #
# Função Principal                                                           #
# --------------------------------------------------------------------------- #


def parse_scanned_guia_pdf(
    pdf_path: str | Path, crm_filter: str
) -> List[Dict[str, Any]]:
    """
    Parser flexível para guias escaneadas que combina múltiplas técnicas de extração.

    Args:
        pdf_path: Caminho para o arquivo PDF
        crm_filter: CRM do médico logado para filtrar participações

    Returns:
        Lista de procedimentos individuais em que o CRM participou
    """

    # Tentar extração normal primeiro
    text = _extract_text_normal(pdf_path)

    # Se pouco texto foi extraído, usar OCR
    if len(text.strip()) < 100:
        ocr_text = _extract_text_ocr(pdf_path)
        if len(ocr_text.strip()) > len(text.strip()):
            text = ocr_text

    # Se ainda não temos texto suficiente, combinar ambos
    if len(text.strip()) < 200:
        ocr_text = _extract_text_ocr(pdf_path)
        text = text + "\n" + ocr_text

    # Limpar texto
    text = _clean_text(text)

    if len(text.strip()) < 50:
        print(f"[WARN] Texto insuficiente extraído de {pdf_path}")
        return []

    # Extrair dados básicos
    prestador = _extract_prestador(text)
    beneficiario = _extract_beneficiario(text)
    guia_number = _extract_guia_number(text)

    print(f"[DEBUG] Prestador: {prestador}")
    print(f"[DEBUG] Beneficiário: {beneficiario}")
    print(f"[DEBUG] Guia: {guia_number}")

    # CORREÇÃO CRÍTICA: Se beneficiário for muito longo ou contém texto OCR bruto, limpar
    if beneficiario and len(beneficiario) > 100:
        # Extrair apenas palavras que parecem ser um nome
        words = beneficiario.split()
        name_words = []
        for word in words[:8]:  # Máximo 8 palavras
            # Manter apenas palavras que parecem nomes (sem muitos números/símbolos)
            if (
                len(word) > 1
                and re.match(r"^[A-Za-z\-\.]+$", word)
                and not word.lower()
                in ["guia", "participacao", "codigo", "medico", "dtexecucao"]
            ):
                name_words.append(word)
        if name_words:
            beneficiario = " ".join(name_words[:6])  # Máximo 6 palavras para nome
        else:
            beneficiario = "NOME NÃO IDENTIFICADO"

    # Limpar sufixos desnecessários do beneficiário
    if beneficiario:
        beneficiario = re.sub(r"\s+B\s*-?\s*$", "", beneficiario).strip()

    # Se ainda está vazio ou inválido, usar padrão
    if not beneficiario or len(beneficiario) < 3:
        beneficiario = "PACIENTE NÃO IDENTIFICADO"

    # Extrair procedimentos e participações
    procedures = _extract_procedure_info(text)
    participacoes = _extract_participacoes(text)

    print(f"[DEBUG] Procedimentos encontrados: {len(procedures)}")
    print(f"[DEBUG] Participações encontradas: {len(participacoes)}")

    # NOVA ABORDAGEM: Criar um procedimento individual para cada participação do CRM
    result = []

    for procedure in procedures:
        codigo = procedure.get("codigo")

        # Encontrar participações do CRM neste procedimento
        crm_participacoes = [p for p in participacoes if p.get("crm") == crm_filter]

        # Se o CRM não participa deste procedimento, pular
        if not crm_participacoes:
            continue

        # Para cada participação do CRM, criar um registro individual
        for participacao in crm_participacoes:
            individual_procedure = {
                "guia": guia_number or "00000000",
                "codigo": codigo,
                "descricao": None,  # CORREÇÃO: Deixar None para a API buscar na CBHPM
                "data_execucao": procedure.get("data_execucao"),
                "quantidade": 1,  # Cada participação individual
                "beneficiario": beneficiario,
                "prestador": prestador or "PRESTADOR NÃO IDENTIFICADO",
                "papel_exercido": participacao.get("papel"),
                "participacoes": [participacao],  # Apenas esta participação específica
            }

            result.append(individual_procedure)

    print(
        f"[DEBUG] Procedimentos individuais criados para CRM {crm_filter}: {len(result)}"
    )

    return result
