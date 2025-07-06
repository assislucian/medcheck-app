import re
from typing import Dict, Optional

import pandas as pd


class CBHPMParser:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.procedures: Dict[str, Dict] = {}
        self.df = pd.read_excel(file_path)
        # Corrigir todos os valores monetários para float
        for col in ["valor_cirurgiao", "valor_anestesista", "valor_primeiro_auxiliar"]:
            if col in self.df.columns:
                self.df[col] = self.df[col].apply(self._parse_money)
        self._load_data()

    def _load_data(self):
        """Load and parse the CBHPM table from Excel."""
        try:
            for _, row in self.df.iterrows():
                code = str(row["codigo"]).strip()
                if pd.isna(code) or code == "":
                    continue

                self.procedures[code] = {
                    "description": row["procedimento"],
                    "surgeon_value": row["valor_cirurgiao"],
                    "anesthesiologist_value": row["valor_anestesista"],
                    "first_assistant_value": row["valor_primeiro_auxiliar"],
                }
        except Exception as e:
            raise Exception(f"Error loading CBHPM data: {str(e)}")

    def _parse_money(self, value):
        if pd.isna(value) or value == "":
            return 0.0
        s = str(value)
        s = s.replace("R$", "").replace(" ", "").replace(",", ".")
        try:
            return float(s)
        except Exception:
            return 0.0

    def get_procedure(self, code: str) -> Optional[Dict]:
        """Get procedure details by code."""
        row = self.df[self.df["codigo"].astype(str) == str(code)]
        if row.empty:
            return None
        row = row.iloc[0]
        return {
            "description": row.get("procedimento", ""),
            "surgeon_value": row.get("valor_cirurgiao", 0.0),
            "anesthesiologist_value": row.get("valor_anestesista", 0.0),
            "first_assistant_value": row.get("valor_primeiro_auxiliar", 0.0),
        }

    def validate_procedure_value(self, code: str, value: float, role: str) -> bool:
        """Validate if the procedure value matches CBHPM table."""
        procedure = self.get_procedure(code)
        if not procedure:
            return False

        expected_value = 0.0
        if role == "surgeon":
            expected_value = procedure["surgeon_value"]
        elif role == "anesthesiologist":
            expected_value = procedure["anesthesiologist_value"]
        elif role == "first_assistant":
            expected_value = procedure["first_assistant_value"]

        # Allow 1% tolerance for rounding differences
        tolerance = expected_value * 0.01
        return abs(expected_value - value) <= tolerance
