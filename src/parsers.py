from typing import Any, Dict, List

import pandas as pd
import pdfplumber


class PDFParser:
    def __init__(self, file_path: str):
        self.file_path = file_path

    def extract_tables(self) -> List[List[List[str]]]:
        """Extract all tables from the PDF file"""
        tables = []
        try:
            with pdfplumber.open(self.file_path) as pdf:
                for page in pdf.pages:
                    if page.tables:
                        tables.extend(page.extract_tables())
        except Exception as e:
            print(f"Error extracting tables: {str(e)}")
            return []
        return tables


class DemonstrativoParser:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.pdf_parser = PDFParser(file_path)

    def parse(self) -> List[Dict[str, Any]]:
        """Parse demonstrativo PDF and return structured data"""
        tables = self.pdf_parser.extract_tables()
        records = []

        for table in tables:
            # Skip empty tables
            if not table:
                continue

            # Process each row
            for row in table[1:]:  # Skip header
                if not row or not any(row):  # Skip empty rows
                    continue

                # Here you'll need to adapt the indices based on your PDF structure
                record = {
                    "crm": row[0] if len(row) > 0 else None,
                    "procedure_code": row[1] if len(row) > 1 else None,
                    "procedure_description": row[2] if len(row) > 2 else None,
                    "value": row[3] if len(row) > 3 else None,
                }
                records.append(record)

        return records


class GuiaParser:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.pdf_parser = PDFParser(file_path)

    def parse(self) -> List[Dict[str, Any]]:
        """Parse guia PDF and return structured data"""
        tables = self.pdf_parser.extract_tables()
        records = []

        for table in tables:
            # Skip empty tables
            if not table:
                continue

            # Process each row
            for row in table[1:]:  # Skip header
                if not row or not any(row):  # Skip empty rows
                    continue

                # Here you'll need to adapt the indices based on your PDF structure
                record = {
                    "crm": row[0] if len(row) > 0 else None,
                    "role": row[1] if len(row) > 1 else None,
                    "procedure_code": row[2] if len(row) > 2 else None,
                    "procedure_description": row[3] if len(row) > 3 else None,
                }
                records.append(record)

        return records


class CBHPMParser:
    def __init__(self, file_path: str):
        self.file_path = file_path

    def parse(self) -> pd.DataFrame:
        """Parse CBHPM Excel file and return as DataFrame"""
        try:
            df = pd.read_excel(self.file_path)
            print("Columns in CBHPM file:", df.columns.tolist())
            return df
        except Exception as e:
            print(f"Error reading CBHPM file: {str(e)}")
            return pd.DataFrame()
