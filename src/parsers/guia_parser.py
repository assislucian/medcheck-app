"""
Parser de guias médicas — MedCheck
----------------------------------
Lê PDFs no padrão TISS, extrai procedimentos, associa participações médicas e
filtra obrigatoriamente pelos procedimentos em que o CRM logado participou.
"""

from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import fitz  # PyMuPDF

__all__ = ["parse_guia_pdf"]


# --------------------------------------------------------------------------- #
# Regexes de alta precisão                                                    #
# --------------------------------------------------------------------------- #

# linha principal do procedimento
PROC_RE = re.compile(
    r"^(?P<guia>\d{8})\s+"
    r"(?P<data>\d{2}/\d{2}/\d{4})\s+"
    r"(?P<codigo>\d{8})\s+"
    r"(?P<descricao>.+?)\s+"
    r"(?P<qtd>\d+)\s+Gerado",
    re.IGNORECASE,
)

# participação médica
PART_RE = re.compile(
    r"^(?P<papel>Cirurgiao|Primeiro Auxiliar|Segundo Auxiliar|Auxiliar|Anestesista)\s+"
    r"(?P<crm>\d+)\s+-\s+"
    r"(?P<nome>.*?)\s+"
    r"(?P<data>\d{2}/\d{2}/\d{4})\s+"
    r"(?P<hora_ini>\d{2}:\d{2})\s+"
    r"(?P<hora_fim>\d{2}:\d{2})\s+Fechada",
    re.IGNORECASE,
)

# cabeçalho (beneficiário e prestador)
HEAD_PREST_RE = re.compile(
    r"Prestador:\s*(?P<cod>\d{5,})\s*-\s*(?P<prestador>[^\|\n]+)",
    re.IGNORECASE,
)
HEAD_PREST_FALLBACK_RE = re.compile(
    r"Prestador:\s*(?P<prestador>[^\|\n]+)",
    re.IGNORECASE,
)
HEAD_BENEF_RE = re.compile(
    r"Beneficiário:\s+\d+\s+-\s+(?P<beneficiario>.*)", re.IGNORECASE
)


# --------------------------------------------------------------------------- #
# Funções auxiliares                                                          #
# --------------------------------------------------------------------------- #
def _extract_text(pdf_path: Path | str) -> str:
    """Concatena o texto de todas as páginas."""
    with fitz.open(str(pdf_path)) as doc:
        return "\n".join(page.get_text() for page in doc)


def _parse_lines(lines: List[str]) -> Dict[str, Any]:
    """Percorre todas as linhas uma única vez, gerando estruturas auxiliares."""
    prestador = beneficiario = ""
    procedimentos: List[Dict[str, Any]] = []
    participacoes: List[Dict[str, Any]] = []

    for idx, line in enumerate(lines):
        line = line.strip()

        # Prestador
        m = HEAD_PREST_RE.search(line)
        if m:
            prestador = m.group("prestador").strip()
            continue

        # Beneficiário
        if not beneficiario:
            m = HEAD_BENEF_RE.search(line)
            if m:
                beneficiario = m.group("beneficiario").strip()
                continue

        # Procedimento
        m_proc = PROC_RE.match(line)
        if m_proc:
            proc_dict = {
                "guia": m_proc.group("guia"),
                "data_execucao": datetime.strptime(
                    m_proc.group("data"), "%d/%m/%Y"
                ).strftime("%d/%m/%Y"),
                "codigo": m_proc.group("codigo"),
                "descricao": m_proc.group("descricao").strip(),
                "quantidade": int(m_proc.group("qtd")),
                # preenchidos depois:
                "participacoes": [],
                "beneficiario": beneficiario,
                "prestador": prestador,
            }
            procedimentos.append(proc_dict)
            continue

        # Participação
        m_part = PART_RE.match(line)
        if m_part:
            participacoes.append(
                {
                    "papel": m_part.group("papel"),
                    "crm": m_part.group("crm"),
                    "nome": m_part.group("nome").strip(),
                    "inicio": f"{m_part.group('data')} {m_part.group('hora_ini')}",
                    "fim": f"{m_part.group('data')} {m_part.group('hora_fim')}",
                    "status": "Fechada",
                    "_idx": idx,  # posição no texto -> facilita associação
                }
            )

    return {
        "prestador": prestador,
        "beneficiario": beneficiario,
        "procedimentos": procedimentos,
        "participacoes": participacoes,
    }


def _associate_participations(data: Dict[str, Any]) -> None:
    """
    Associa participações ao procedimento mais próximo abaixo dele e,
    para cada procedimento, identifica o papel_exercido por CRM.
    """

    procs = data["procedimentos"]
    parts = data["participacoes"]

    # índice de linha -> procedimento
    proc_line_map = {i: p for i, p in enumerate(procs)}

    # construir mapa aproximado guiado pela posição relativa no texto
    current_proc_idx = -1
    for part in parts:
        # encontra o último procedimento antes da linha da participação
        while (
            current_proc_idx + 1 < len(proc_line_map)
            and part["_idx"] > list(proc_line_map.keys())[current_proc_idx + 1]
        ):
            current_proc_idx += 1

        if current_proc_idx >= 0:
            proc = procs[current_proc_idx]
            proc["participacoes"].append(part)

    # limpeza
    for part in parts:
        part.pop("_idx", None)


# --------------------------------------------------------------------------- #
# Função pública                                                              #
# --------------------------------------------------------------------------- #
def parse_guia_pdf(pdf_path: str | Path, crm_filter: str) -> List[Dict[str, Any]]:
    """
    Lê o PDF e devolve **apenas** os procedimentos em que `crm_filter` participou.
    Suporta PDFs onde cada campo do procedimento e da participação está
    em uma linha separada.
    """
    text = _extract_text(pdf_path)
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    # Captura robusta do prestador
    prestador = ""
    for line in lines:
        m = HEAD_PREST_RE.search(line)
        if m:
            prestador = m.group("prestador").strip()
            break
    if not prestador:
        for line in lines:
            m = HEAD_PREST_FALLBACK_RE.search(line)
            if m:
                prestador = m.group("prestador").strip()
                break

    # Captura do beneficiário
    beneficiario = ""
    for line in lines:
        m = HEAD_BENEF_RE.search(line)
        if m:
            beneficiario = m.group("beneficiario").strip()
            break

    procedimentos: List[Dict[str, Any]] = []
    i = 0
    papel_set = {
        "Anestesista",
        "Cirurgiao",
        "Primeiro Auxiliar",
        "Segundo Auxiliar",
        "Auxiliar",
    }

    # Títulos e linhas a serem ignoradas durante o parsing
    skip_lines = {
        "Participação",
        "Participacao",
        "Médico",
        "Medico",
        "Dt início",
        "Dt inicio",
        "Dt fim",
        "Status",
        "Guia",
        "Dt execução",
        "Dt execucao",
        "Código",
        "Codigo",
        "Descrição",
        "Descricao",
        "Qtd",
        "Execução finalizada",
        "Execucao finalizada",
        "Filtro",
        "CRM / profissional:",
        "Consultar",
        "Beneficiário:",
        "Beneficiario:",
        "Prestador:",
        "Voltar",
    }

    def is_guia_number(line_text: str) -> bool:
        """Verifica se a linha contém um número de guia (7-8 dígitos)"""
        return bool(re.match(r"^\d{7,8}$", line_text))

    def is_date(line_text: str) -> bool:
        """Verifica se a linha contém uma data no formato DD/MM/AAAA"""
        return bool(re.match(r"^\d{2}/\d{2}/\d{4}$", line_text))

    def is_code(line_text: str) -> bool:
        """Verifica se a linha contém um código de procedimento (8 dígitos)"""
        return bool(re.match(r"^\d{8}$", line_text))

    def is_quantity(line_text: str) -> bool:
        """Verifica se a linha contém uma quantidade (número simples)"""
        return bool(
            re.match(r"^\d+$", line_text) and int(line_text) < 100
        )  # limite razoável para quantidade

    def next_non_skip(idx: int) -> int:
        """Pula linhas que devem ser ignoradas"""
        while idx < len(lines) and (lines[idx] in skip_lines or not lines[idx].strip()):
            idx += 1
        return idx

    while i < len(lines):
        line = lines[i]

        # Pular linhas irrelevantes
        if line in skip_lines or not line.strip():
            i += 1
            continue

        # Identificar início de procedimento (número da guia)
        if is_guia_number(line):
            try:
                guia = line
                current_proc = None

                # Buscar próximos campos do procedimento
                j = next_non_skip(i + 1)
                if j >= len(lines):
                    break

                # Data de execução
                if is_date(lines[j]):
                    data_execucao = lines[j]
                    j = next_non_skip(j + 1)

                    # Código do procedimento
                    if j < len(lines) and is_code(lines[j]):
                        codigo = lines[j]
                        j = next_non_skip(j + 1)

                        # Descrição (pode ser em múltiplas linhas)
                        descricao = ""
                        while (
                            j < len(lines)
                            and not is_quantity(lines[j])
                            and lines[j] not in skip_lines
                        ):
                            if descricao:
                                descricao += " "
                            descricao += lines[j]
                            j = next_non_skip(j + 1)

                        # Quantidade
                        if j < len(lines) and is_quantity(lines[j]):
                            quantidade = int(lines[j])
                            j = next_non_skip(j + 1)

                            # Status (próxima linha após quantidade) - não usado
                            _ = lines[j] if j < len(lines) else "Gerado pela execução"

                            current_proc = {
                                "guia": guia,
                                "data_execucao": datetime.strptime(
                                    data_execucao, "%d/%m/%Y"
                                ).strftime("%d/%m/%Y"),
                                "codigo": codigo,
                                "descricao": descricao.strip(),
                                "quantidade": quantidade,
                                "beneficiario": beneficiario,
                                "prestador": prestador,
                                "participacoes": [],
                            }
                            procedimentos.append(current_proc)
                            i = j + 1

                            # Ler participações subsequentes
                            while i < len(lines):
                                line = lines[i]
                                if line in skip_lines or not line.strip():
                                    i += 1
                                    continue

                                if is_guia_number(line):
                                    # Novo procedimento encontrado
                                    break

                                if line in papel_set and current_proc is not None:
                                    # Participação encontrada
                                    papel = line
                                    i = next_non_skip(i + 1)

                                    if i < len(lines):
                                        crm_nome = lines[i]
                                        i = next_non_skip(i + 1)

                                        if i < len(lines):
                                            data_ini = lines[i]
                                            i = next_non_skip(i + 1)

                                            if i < len(lines):
                                                data_fim = lines[i]
                                                i = next_non_skip(i + 1)

                                                if i < len(lines):
                                                    status_part = lines[i]

                                                    # Extrair CRM e nome
                                                    m_crm = re.match(
                                                        r"(\d+)\s*-\s*(.+)", crm_nome
                                                    )
                                                    if m_crm:
                                                        crm = m_crm.group(1)
                                                        nome = m_crm.group(2).strip()
                                                    else:
                                                        crm = ""
                                                        nome = crm_nome.strip()

                                                    participacao = {
                                                        "papel": papel,
                                                        "crm": crm,
                                                        "nome": nome,
                                                        "inicio": data_ini,
                                                        "fim": data_fim,
                                                        "status": status_part,
                                                    }
                                                    current_proc[
                                                        "participacoes"
                                                    ].append(participacao)
                                                    i += 1
                                                    continue
                                i += 1
                            continue

                i += 1
            except Exception:
                # Em caso de erro, continuar para próxima linha
                i += 1
                continue
        else:
            i += 1

    # Filtra apenas os procedimentos em que o CRM participou
    result: List[Dict[str, Any]] = []
    for proc in procedimentos:
        papel_exercido: Optional[str] = None
        for part in proc["participacoes"]:
            if part["crm"] == crm_filter:
                prioridade = {
                    "Cirurgiao": 5,
                    "Primeiro Auxiliar": 4,
                    "Segundo Auxiliar": 3,
                    "Auxiliar": 2,
                    "Anestesista": 1,
                }
                if papel_exercido is None or prioridade[part["papel"]] > prioridade.get(
                    papel_exercido, 0
                ):
                    papel_exercido = part["papel"]
        if papel_exercido:
            proc["papel_exercido"] = papel_exercido
            result.append(proc)
    return result
