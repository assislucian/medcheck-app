from typing import List, Dict
from src.parsers.cbhpm_parser import CBHPMParser
from src.parsers.demonstrativo_parser import DemonstrativoParser

class ProcedureComparator:
    def __init__(self, cbhpm_parser: CBHPMParser, guia_parser, demonstrativo_parser: DemonstrativoParser):
        """
        guia_parser: qualquer objeto com método get_procedures() -> List[dict]
        """
        self.cbhpm_parser = cbhpm_parser
        self.guia_parser = guia_parser
        self.demonstrativo_parser = demonstrativo_parser
        self.comparison_results: List[Dict] = []
    
    def compare_all(self):
        """Compare all procedures between guide and payment statement."""
        guide_procedures = self.guia_parser.get_procedures()
        
        for procedure in guide_procedures:
            code = procedure.get('code') or procedure.get('codigo')
            guia = procedure.get('guia')
            # Find matching payment in demonstrativo
            payment = self.demonstrativo_parser.get_payment_by_guia_and_code(guia, code)
            
            if not payment:
                self.comparison_results.append({
                    'procedure': procedure,
                    'payment': None,
                    'cbhpm_values': None,
                    'status': 'NOT_PAID',
                    'validation': {
                        'expected_total': 0.0,
                        'actual_total': 0.0,
                        'difference': 0.0
                    }
                })
                continue
            
            # Get CBHPM values for each role
            cbhpm_procedure = self.cbhpm_parser.get_procedure(code)
            if not cbhpm_procedure:
                self.comparison_results.append({
                    'procedure': procedure,
                    'payment': payment,
                    'cbhpm_values': None,
                    'status': 'NOT_IN_CBHPM',
                    'validation': {
                        'expected_total': 0.0,
                        'actual_total': payment['financial']['approved_value'],
                        'difference': 0.0
                    }
                })
                continue
            
            # Calculate expected total based on roles
            total_expected = 0.0
            role_values = {}
            for role in procedure.get('roles', []):
                role_name = role.get('role')
                if role_name == 'Cirurgiao':
                    role_value = cbhpm_procedure['surgeon_value']
                elif role_name == 'Anestesista':
                    role_value = cbhpm_procedure['anesthesiologist_value']
                elif role_name == 'Primeiro Auxiliar':
                    role_value = cbhpm_procedure['first_assistant_value']
                else:
                    role_value = 0.0
                total_expected += role_value
                role_values[role_name] = {
                    'expected': role_value,
                    'doctor': {
                        'id': role.get('id'),
                        'name': role.get('name')
                    }
                }
            # Allow 1% tolerance for rounding differences
            actual_total = payment['financial']['approved_value']
            difference = actual_total - total_expected
            tolerance = total_expected * 0.01
            is_valid = abs(difference) <= tolerance
            self.comparison_results.append({
                'procedure': procedure,
                'payment': payment,
                'cbhpm_values': {
                    'procedure': cbhpm_procedure,
                    'roles': role_values
                },
                'status': 'VALID' if is_valid else 'INVALID_VALUE',
                'validation': {
                    'expected_total': total_expected,
                    'actual_total': actual_total,
                    'difference': difference,
                    'within_tolerance': is_valid,
                    'tolerance': tolerance
                }
            })
    
    def get_results(self) -> List[Dict]:
        """Get comparison results."""
        return self.comparison_results
    
    def get_summary(self) -> Dict:
        """Get summary of comparison results."""
        total = len(self.comparison_results)
        valid = sum(1 for r in self.comparison_results if r['status'] == 'VALID')
        not_paid = sum(1 for r in self.comparison_results if r['status'] == 'NOT_PAID')
        invalid_value = sum(1 for r in self.comparison_results if r['status'] == 'INVALID_VALUE')
        not_in_cbhpm = sum(1 for r in self.comparison_results if r['status'] == 'NOT_IN_CBHPM')
        total_expected = sum(r['validation']['expected_total'] for r in self.comparison_results)
        total_actual = sum(r['validation']['actual_total'] for r in self.comparison_results)
        total_difference = total_actual - total_expected
        return {
            'total_procedures': total,
            'valid_payments': valid,
            'not_paid': not_paid,
            'invalid_value': invalid_value,
            'not_in_cbhpm': not_in_cbhpm,
            'financial_summary': {
                'total_expected': total_expected,
                'total_actual': total_actual,
                'total_difference': total_difference
            }
        } 