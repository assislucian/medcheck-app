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
import hashlib
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import fitz  # PyMuPDF

# Tentativa de import do OCR
try:
    import io

    import pytesseract
    from PIL import Image, ImageFilter, ImageOps

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
OCR_CONFIG_DENSE = r"--oem 3 --psm 3 -l por+eng"

# Regexes para diferentes formatos de apresentação dos dados
PRESTADOR_PATTERNS = [
    re.compile(r"Prestador:\s*([^\|]+?)(?:\s*\|\s*|$)", re.IGNORECASE),
    re.compile(r"Prestador[:\s]*(?:\d+\s*-\s*)?([^\n\|]+)", re.IGNORECASE),
    re.compile(r"LIGA\s+[A-Z\s]*CANCER[A-Z\s]*POLICLINIC", re.IGNORECASE),
]

BENEFICIARIO_PATTERNS = [
    re.compile(r"Beneficiário:\s*\d+\s*-\s*([^\n\|]+)", re.IGNORECASE),
    re.compile(r"Benefici[aá]rio[:\s]*\d+\s*-\s*([^\n]+)", re.IGNORECASE),
    # Padrão específico para o formato "00620040000652997 -NOME COMPLETO"
    re.compile(r"Benefici[aá]rio:\s*\d+\s*-([A-Z\s]+)", re.IGNORECASE),
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


def _preprocess_image(img: Image.Image) -> Image.Image:
    """Aplica pré-processamento para melhorar OCR: escala, grayscale, binarização e sharpen."""
    # Upscale para 300-450 DPI equivalente
    upscale = img.resize((int(img.width * 1.5), int(img.height * 1.5)), Image.LANCZOS)
    gray = ImageOps.grayscale(upscale)
    # Binarização adaptativa simples
    enhanced = ImageOps.autocontrast(gray)
    # Leve sharpen
    sharpened = enhanced.filter(ImageFilter.SHARPEN)
    return sharpened


def _image_to_text_best(img: Image.Image) -> str:
    """Roda OCR com múltiplas rotações e configs e retorna o texto com melhor score."""
    candidates: list[tuple[str, int]] = []

    def score(text: str) -> int:
        # Heurística: prioriza presença de códigos de 8 dígitos, CRMs e datas
        codes = len(re.findall(r"\b\d{8}\b", text))
        crms = len(re.findall(r"\b\d{4,6}\b", text))
        dates = len(re.findall(r"\b\d{1,2}[\-/]\d{1,2}[\-/]\d{2,4}\b", text))
        return codes * 5 + crms * 2 + dates

    variants = [img, img.rotate(90, expand=True), img.rotate(180, expand=True), img.rotate(270, expand=True)]
    for variant in variants:
        pre = _preprocess_image(variant)
        for cfg in (OCR_CONFIG, OCR_CONFIG_DENSE, OCR_CONFIG_FALLBACK):
            try:
                txt = pytesseract.image_to_string(pre, config=cfg)
            except Exception:
                txt = ""
            candidates.append((txt, score(txt)))

    # Seleciona melhor texto
    best = max(candidates, key=lambda x: x[1]) if candidates else ("", 0)
    return best[0]


def _extract_text_ocr(pdf_path: Path | str) -> str:
    """Extrai texto usando OCR robusto com rotação e múltiplas configs."""
    if not OCR_AVAILABLE:
        return ""

    try:
        text_parts = []
        with fitz.open(str(pdf_path)) as doc:
            for page_num in range(len(doc)):
                page = doc[page_num]
                # Tentar primeiro em 2x; se fraco, tentar 3x no fluxo de seleção do _image_to_text_best
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
                img_data = pix.tobytes("png")
                image = Image.open(io.BytesIO(img_data))

                page_text = _image_to_text_best(image)
                # Se muito curto, tentar com render 3x
                if len(page_text.strip()) < 50:
                    pix3 = page.get_pixmap(matrix=fitz.Matrix(3, 3))
                    img3 = Image.open(io.BytesIO(pix3.tobytes("png")))
                    page_text = _image_to_text_best(img3)

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
    # Buscar padrão específico do v.pdf.pdf: sequência de números seguida de hífen e nome
    specific_match = re.search(r"(\d{10,})\s*-([A-Z\s]{20,80})", text)
    if specific_match:
        nome_candidate = specific_match.group(2).strip()
        # Limpar e validar
        nome_candidate = re.sub(r"[^\w\s\-]", " ", nome_candidate)
        nome_candidate = re.sub(r"\s+", " ", nome_candidate).strip()
        if len(nome_candidate.split()) >= 2:  # Pelo menos nome e sobrenome
            return nome_candidate
    
    # Tentar padrões específicos primeiro
    match = _find_best_match(BENEFICIARIO_PATTERNS, text)
    if match:
        beneficiario = match.group(1).strip()
        # Remover trechos que claramente não pertencem ao nome
        lower = beneficiario.lower()
        if "prestador" in lower:
            beneficiario = beneficiario[: lower.index("prestador")].strip()
        # Remover sequências numéricas longas
        beneficiario = re.sub(r"\s*\d{5,}\s*", " ", beneficiario)
        # Limpar caracteres especiais e manter apenas o nome
        beneficiario = re.sub(r"[^\w\s\-]", " ", beneficiario)
        # Normalizar espaços
        beneficiario = re.sub(r"\s+", " ", beneficiario).strip()
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
    """Extrai número da guia baseado na estrutura real dos PDFs."""
    # CORREÇÃO: Buscar números de 8 dígitos na coluna "B" (estrutura tabular)
    # Pattern específico para encontrar número após "B" no início da linha
    b_pattern = re.search(r"(?:^|\n)\s*B\s+(\d{8})", text, re.MULTILINE)
    if b_pattern:
        guia_candidate = b_pattern.group(1)
        # Excluir códigos de procedimento que começam com 306
        if not guia_candidate.startswith("306"):
            return guia_candidate
    
    # Buscar padrões tradicionais
    match = _find_best_match(GUIA_PATTERNS, text)
    if match:
        guia = match.group(1).strip()
        # Validar formato (7-8 dígitos) e não ser código de procedimento
        if re.match(r"^\d{7,8}$", guia) and not guia.startswith("306"):
            return guia
    
    # Buscar todos os números de 8 dígitos e filtrar
    all_numbers = re.findall(r"(?<!\d)(\d{8})(?!\d)", text)
    for num in all_numbers:
        # Excluir códigos conhecidos: 306xxxxx (procedimentos), 110xxxx (prestador)
        if not num.startswith(("306", "110")):
            return num
    
    return None


def _extract_procedure_info(text: str) -> List[Dict[str, Any]]:
    """Extrai informações dos procedimentos."""
    procedures = []

    # Procurar códigos de procedimento
    codigo_matches = []
    for pattern in CODIGO_PATTERNS:
        codigo_matches.extend(pattern.findall(text))

    # Normalizar e filtrar códigos: preferir códigos que começam com '30'
    unique_codes = {str(c).strip() for c in codigo_matches if str(c).strip()}
    preferred_codes = {c for c in unique_codes if re.match(r"^30\d{6}$", c)}
    codes = preferred_codes if preferred_codes else unique_codes

    # Procurar datas
    data_matches = []
    for pattern in DATA_PATTERNS:
        data_matches.extend(pattern.findall(text))

    for codigo in codes:
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

    # Procurar participações com CRM, nome e papel (evitar capturar números de guia como CRM)
    # Padrão para "8291 - NOME" limitado por contexto de participação
    crm_nome_matches = re.findall(r"(?:(?:medico|cirurgi[aã]o|anestesista|auxiliar)[^\d]{0,30})?(\d{4,6})\s*-\s*([A-Z\s]{8,60})", text, flags=re.IGNORECASE)

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

    # Remover duplicatas baseado em (CRM, papel) para evitar multiplicação indevida
    seen = set()
    deduped = []
    for p in participacoes:
        key = (p.get("crm"), p.get("papel"))
        if key in seen:
            continue
        seen.add(key)
        deduped.append(p)

    return deduped


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


def _find_participacoes_for_procedure(text: str, codigo: str, crm_filter: str, all_participacoes: List[Dict]) -> List[Dict]:
    """
    Encontra participações específicas para um procedimento baseado na proximidade no texto.
    
    Esta função resolve o problema de associar corretamente os papéis médicos
    a cada procedimento específico em vez de usar todos os papéis do documento.
    """
    if not codigo or not all_participacoes:
        return []
    
    # Encontrar posição do código no texto
    codigo_matches = list(re.finditer(re.escape(codigo), text))
    if not codigo_matches:
        return []
    
    # Para cada ocorrência do código, buscar participações próximas
    best_participacoes = []
    
    for match in codigo_matches:
        codigo_pos = match.start()
        
        # Buscar em um contexto de ±300 caracteres ao redor do código
        context_start = max(0, codigo_pos - 300)
        context_end = min(len(text), codigo_pos + 300)
        context = text[context_start:context_end]
        
        # Encontrar participações do CRM neste contexto
        context_participacoes = []
        
        for participacao in all_participacoes:
            if participacao.get("crm") != crm_filter:
                continue
                
            # Verificar se a participação está neste contexto
            papel = participacao.get("papel", "")
            if papel and papel.lower() in context.lower():
                context_participacoes.append(participacao)
        
        # Se encontrou participações neste contexto, usar estas
        if context_participacoes:
            # Remover duplicatas baseadas no papel
            seen_papeis = set()
            unique_participacoes = []
            for p in context_participacoes:
                papel = p.get("papel")
                if papel not in seen_papeis:
                    seen_papeis.add(papel)
                    unique_participacoes.append(p)
            
            if len(unique_participacoes) > len(best_participacoes):
                best_participacoes = unique_participacoes
    
    # Se não encontrou contexto específico, usar uma abordagem sequencial
    if not best_participacoes:
        # Dividir texto em blocos por procedimento
        procedure_blocks = re.split(r'(?=306\d{5})', text)
        
        for block in procedure_blocks:
            if codigo in block:
                # Encontrar participações neste bloco
                block_participacoes = []
                for participacao in all_participacoes:
                    if participacao.get("crm") == crm_filter:
                        papel = participacao.get("papel", "")
                        if papel and papel.lower() in block.lower():
                            block_participacoes.append(participacao)
                
                if block_participacoes:
                    best_participacoes = block_participacoes
                    break
    
    return best_participacoes or [p for p in all_participacoes if p.get("crm") == crm_filter][:1]  # Fallback


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

    # CORREÇÃO CRÍTICA: Criar apenas UM procedimento por (código, CRM), não por participação
    result = []
    seen_proc_crm = set()  # Para evitar duplicatas de (codigo, crm)

    # Gerar fallback determinístico de número de guia se ausente
    fallback_guia = None
    if not guia_number:
        # hash do texto para gerar 8 dígitos estáveis
        h = hashlib.sha1(text.encode("utf-8")).hexdigest()
        # usar os primeiros 8 dígitos numéricos do hash
        numeric = re.sub(r"[^0-9]", "", str(int(h, 16)))[0:8]
        fallback_guia = numeric.zfill(8) if numeric else "99999999"

    for procedure in procedures:
        codigo = procedure.get("codigo")

        # CORREÇÃO: Encontrar participações do CRM especificamente para ESTE procedimento
        # Filtrar participações por CRM E por proximidade ao código do procedimento
        crm_participacoes = []
        
        # Se procedure tem informações de participação específica, usar
        if procedure.get("participacoes"):
            crm_participacoes = [p for p in procedure.get("participacoes") if p.get("crm") == crm_filter]
        else:
            # Fallback: buscar participações próximas ao código no texto
            crm_participacoes = _find_participacoes_for_procedure(text, codigo, crm_filter, participacoes)

        # Se o CRM não participa deste procedimento, pular
        if not crm_participacoes:
            continue

        # CRUCIAL: Criar apenas UM registro por (codigo, crm), mesmo que CRM tenha múltiplos papéis
        proc_crm_key = (codigo, crm_filter)
        if proc_crm_key in seen_proc_crm:
            continue
        seen_proc_crm.add(proc_crm_key)

        # CORREÇÃO CRÍTICA: Usar Smart Extractor para determinar papel real
        from .smart_papel_extractor import extract_papel_by_procedure
        papel_correto = extract_papel_by_procedure(text, codigo, crm_filter)
        
        # Criar participação principal baseada no papel correto
        participacao_principal = {
            "crm": crm_filter,
            "papel": papel_correto,
            "nome": next((p.get("nome", "") for p in crm_participacoes), ""),
            "inicio": "",
            "fim": "",
            "status": "Fechada"
        }
        
        # Atualizar crm_participacoes para refletir o papel correto
        crm_participacoes = [participacao_principal]

        individual_procedure = {
            "guia": guia_number or fallback_guia or "99999999",
            "codigo": codigo,
            "descricao": None,  # CORREÇÃO: Deixar None para a API buscar na CBHPM
            "data_execucao": procedure.get("data_execucao"),
            "quantidade": 1,  # Um procedimento por código
            "beneficiario": beneficiario,
            "prestador": prestador or "PRESTADOR NÃO IDENTIFICADO",
            "papel_exercido": participacao_principal.get("papel"),
            "participacoes": crm_participacoes,  # Todas as participações do CRM neste procedimento
        }

        result.append(individual_procedure)

    print(
        f"[DEBUG] Procedimentos individuais criados para CRM {crm_filter}: {len(result)}"
    )

    return result
