import re
from typing import Dict, List

import pdfplumber


class DemonstrativoParser:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.payments: List[Dict] = []
        self.glosas_detalhadas = (
            {}
        )  # Novo: dicionário auxiliar para motivos de glosa detalhados
        self.totals = {}  # Novo: para armazenar os totais capturados
        self._parse_pdf()

    def _extract_honorarios_section(self, text: str) -> str:
        """Extrai apenas a seção de honorários do texto, delimitada por '[PM] HONORÁRIOS' até o próximo marcador de seção, 'TOTALIZADORES' ou 'Página'."""
        # Procura por diferentes variações do marcador
        markers = ["[PM] HONORÁRIOS", "[PM]HONORÁRIOS", "PM HONORÁRIOS"]
        start = -1
        for marker in markers:
            start = text.find(marker)
            if start != -1:
                break

        if start == -1:
            print("[DEBUG] Marcador [PM] HONORÁRIOS não encontrado!")
            return ""

        # Procura o próximo marcador de seção (linha que começa com '[')
        after = text[start + 1 :]
        end_match = re.search(r"\n\[[A-Z]+.*?\]", after)
        if end_match:
            end = start + 1 + end_match.start()
            return text[start:end]
        # Também pode terminar em 'TOTALIZADORES' ou 'Página'
        end_match2 = re.search(r"\n(TOTALIZADORES|Página|T otal Procedimentos)", after)
        if end_match2:
            end = start + 1 + end_match2.start()
            return text[start:end]
        return text[start:]

    def _parse_totals_line(self, line: str):
        """Extrai totais de uma linha que contém informações de totais."""
        # Padrão para linha de totais: "Total Procedimentos: X R$ Y,ZZ R$ Y,ZZ R$ Y,ZZ R$ Y,ZZ"
        total_pattern = (
            r"Total Procedimentos:\s*(\d+)\s+R\$\s*([\d.,]+)\s+R\$\s*"
            r"([\d.,]+)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)"
        )
        match = re.search(total_pattern, line)
        if match:
            return {
                "total_procedimentos": int(match.group(1)),
                "apresentado": float(match.group(2).replace(".", "").replace(",", ".")),
                "liberado": float(match.group(3).replace(".", "").replace(",", ".")),
                "pro_rata": float(match.group(4).replace(".", "").replace(",", ".")),
                "glosa": float(match.group(5).replace(".", "").replace(",", ".")),
            }

        # Padrão alternativo: "[PM] HONORÁRIOS X Y,ZZ Y,ZZ Y,ZZ Y,ZZ"
        alt_pattern = (
            r"\[PM\]\s+HONORÁRIOS\s+(\d+)\s+([\d.,]+)\s+"
            r"([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)"
        )
        match = re.search(alt_pattern, line)
        if match:
            return {
                "total_procedimentos": int(match.group(1)),
                "apresentado": float(match.group(2).replace(".", "").replace(",", ".")),
                "liberado": float(match.group(3).replace(".", "").replace(",", ".")),
                "pro_rata": float(match.group(4).replace(".", "").replace(",", ".")),
                "glosa": float(match.group(5).replace(".", "").replace(",", ".")),
            }

        return None

    def _parse_pdf(self):
        """Parse the payment statement PDF and extract payments only from the honorários section."""
        try:
            with pdfplumber.open(self.file_path) as pdf:
                # Get period information
                text = pdf.pages[0].extract_text()
                period_match = re.search(r"Período:\s*([^\n]+)", text)
                period = period_match.group(1).strip() if period_match else None

                # Extract doctor information
                doctor_pattern = r"Nome:\s*([^\n]+)\s+CRM:\s*(\d+)\s+CPF:\s*(\d+)"
                doctor_match = re.search(doctor_pattern, text)
                if doctor_match:
                    doctor_name = doctor_match.group(1).strip()
                    doctor_crm = doctor_match.group(2)
                    doctor_cpf = doctor_match.group(3)
                else:
                    doctor_name = doctor_crm = doctor_cpf = None

                honorarios_lines = []
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if not page_text:
                        continue
                    honorarios_text = self._extract_honorarios_section(page_text)
                    if honorarios_text:
                        honorarios_lines.extend(honorarios_text.splitlines())

                i = 0
                while i < len(honorarios_lines):
                    line = honorarios_lines[i]

                    # Verifica se é uma linha de totais
                    totals = self._parse_totals_line(line)
                    if totals:
                        self.totals = totals
                        print(f"[DEBUG] Totais capturados: {totals}")
                        i += 1
                        continue

                    # Pula cabeçalho
                    if (
                        line.strip().startswith("[PM]")
                        or "Lote Conta Guia" in line
                        or line.strip() == ""
                    ):
                        print(f"[DEBUG] Linha de cabeçalho ignorada: {line}")
                        i += 1
                        continue

                    parts = re.split(r"\s+", line.strip())
                    acom_idx = next(
                        (
                            j
                            for j, p in enumerate(parts)
                            if p in ["ENF", "APT", "INT", "UTI"]
                        ),
                        None,
                    )
                    if acom_idx is None or acom_idx < 6 or len(parts) < acom_idx + 7:
                        print(
                            f"[DEBUG] Linha ignorada (não encontrou campo Acom. ou poucos campos): "
                            f"{line}"
                        )
                        i += 1
                        continue
                    try:
                        lote = parts[0]
                        conta = parts[1]
                        guia = parts[2]
                        date = parts[3]
                        carteira = parts[4]
                        patient = " ".join(parts[5:acom_idx])
                        acom = parts[acom_idx]
                        code = parts[acom_idx + 1]
                        description = " ".join(parts[acom_idx + 2 : len(parts) - 5])
                        quantity = int(parts[-5])
                        presented_value = float(
                            parts[-4].replace(".", "").replace(",", ".")
                        )
                        approved_value = float(
                            parts[-3].replace(".", "").replace(",", ".")
                        )
                        pro_rata = float(parts[-2].replace(".", "").replace(",", "."))
                        glosa = float(parts[-1].replace(".", "").replace(",", "."))
                        # Busca motivo/código de glosa nas próximas linhas, se houver glosa
                        codigo_glosa = None
                        motivo_glosa = None
                        if glosa > 0 and i + 1 < len(honorarios_lines):
                            next_line = honorarios_lines[i + 1].strip()
                            match = re.match(r"Glosa (\d{4}) (.+)", next_line)
                            if match:
                                codigo_glosa = match.group(1)
                                motivo_glosa = match.group(2)
                                i += 1  # pula a linha de glosa
                        self.payments.append(
                            {
                                "period": period,
                                "doctor": {
                                    "name": doctor_name,
                                    "crm": doctor_crm,
                                    "cpf": doctor_cpf,
                                },
                                "lote": lote,
                                "conta": conta,
                                "guia": guia,
                                "date": date,
                                "carteira": carteira,
                                "patient": patient,
                                "acom": acom,
                                "code": code,
                                "description": description,
                                "quantity": quantity,
                                "financial": {
                                    "presented_value": presented_value,
                                    "approved_value": approved_value,
                                    "pro_rata": pro_rata,
                                    "glosa": glosa,
                                },
                                "codigo_glosa": codigo_glosa,
                                "motivo_glosa": motivo_glosa,
                            }
                        )
                    except Exception as e:
                        print(f"[DEBUG] Falha ao processar linha: {line} -> {e}")
                    i += 1

                # --- NOVA LÓGICA: Parsing da seção de glosa detalhada ---
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if not page_text:
                        continue
                    if "DESCRIÇÃO DETALHADA DE GLOSA" in page_text:
                        lines = page_text.splitlines()
                        in_glosa_section = False
                        last_proc = None
                        for line in lines:
                            if "DESCRIÇÃO DETALHADA DE GLOSA" in line:
                                in_glosa_section = True
                                continue
                            if not in_glosa_section:
                                continue
                            # Pula cabeçalho
                            if (
                                line.strip().startswith("Conta Guia Data Nome")
                                or not line.strip()
                            ):
                                continue
                            # Procedimento glosado
                            proc_match = re.match(
                                r"(\d+) (\d+) (\d{2}/\d{2}/\d{4}) (.+) (\d{8}) (.+)",
                                line,
                            )
                            if proc_match:
                                last_proc = {
                                    "conta": proc_match.group(1),
                                    "guia": proc_match.group(2),
                                    "data": proc_match.group(3),
                                    "nome": proc_match.group(4).strip(),
                                    "codigo": proc_match.group(5),
                                    "descricao": proc_match.group(6).strip(),
                                }
                                continue
                            # Linha de glosa
                            glosa_match = re.match(r"Glosa (\d{4}) (.+)", line)
                            if glosa_match and last_proc:
                                codigo_glosa = glosa_match.group(1)
                                motivo_glosa = glosa_match.group(2)
                                # Salva no dicionário auxiliar
                                key = (
                                    last_proc["guia"],
                                    last_proc["codigo"],
                                    last_proc["data"],
                                )
                                self.glosas_detalhadas[key] = {
                                    "codigo_glosa": codigo_glosa,
                                    "motivo_glosa": motivo_glosa,
                                }
                                last_proc = None
        except Exception as e:
            raise Exception(f"Error parsing payment statement: {str(e)}")

    def get_payments(self) -> List[Dict]:
        """Get all payments from the statement."""
        return self.payments

    def get_payment_by_code(self, code: str) -> Dict:
        """Get a specific payment by its code."""
        for payment in self.payments:
            if payment["code"] == code:
                return payment
        return None

    def get_payment_by_guia_and_code(self, guia: str, code: str) -> Dict:
        """Get a specific payment by its guia number and code."""
        for payment in self.payments:
            if payment["guia"] == guia and payment["code"] == code:
                return payment
        return None

    def get_payments_by_patient(self, patient_name: str) -> List[Dict]:
        """Get all payments for a specific patient (partial match)."""
        return [
            p for p in self.payments if patient_name.lower() in p["patient"].lower()
        ]

    def get_summary(self):
        """Retorna o resumo do demonstrativo: período, totais e quantidade de procedimentos extraídos da seção de honorários."""
        # ✅ CORREÇÃO CRÍTICA: Sempre usar contagem real de procedimentos processados
        total_procedures = len(self.payments)
        period = self.payments[0]["period"] if self.payments else None
        
        # Se temos totais capturados do PDF, usamos eles (mas com contagem real de procedimentos)
        if self.totals:
            return {
                "period": period,
                "total_presented": self.totals["apresentado"],
                "total_approved": self.totals["liberado"],
                "total_glosa": self.totals["glosa"],
                "total_procedures": total_procedures,  # ✅ SEMPRE usar contagem real
            }

        # Caso contrário, calculamos dos procedimentos
        total_presented = sum(p["financial"]["presented_value"] for p in self.payments)
        total_approved = sum(p["financial"]["approved_value"] for p in self.payments)
        total_glosa = sum(p["financial"]["glosa"] for p in self.payments)
        
        return {
            "period": period,
            "total_presented": total_presented,
            "total_approved": total_approved,
            "total_glosa": total_glosa,
            "total_procedures": total_procedures,  # ✅ SEMPRE usar contagem real
        }

    def debug_honorarios_lines(self):
        honorarios_lines = []
        with pdfplumber.open(self.file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text()
                if not text:
                    continue
                honorarios_text = self._extract_honorarios_section(text)
                if honorarios_text:
                    honorarios_lines.extend(honorarios_text.splitlines())
        for i, line in enumerate(honorarios_lines):
            print(f"{i+1:02d}: {line}")

    def get_glosa_detalhada(self, guia, codigo, data):
        """Retorna o motivo/código detalhado da glosa para um procedimento (guia, codigo, data)."""
        return self.glosas_detalhadas.get((guia, codigo, data), None)
