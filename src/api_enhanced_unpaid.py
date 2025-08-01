"""
Enhanced Unpaid Procedures Logic - Crosscheck Inteligente
=========================================================

Nova lógica que diferencia tipos de pendência:
1. NÃO_ENCONTRADO: Sem demonstrativo correspondente
2. GLOSADO: Demonstrativo existe mas approved_value = 0
3. SUBTABULADO: Pago mas valor < CBHPM 
4. DISCREPANCIA: Outros casos
"""

from fastapi import HTTPException, Depends
from src.database import SessionLocal
from src.models import Guia, Demonstrativo
from src.auth import get_current_user
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

def get_enhanced_unpaid_procedures(user: dict = Depends(get_current_user)):
    """
    Retorna análise completa de pendências com crosscheck inteligente
    """
    crm = user.get("crm")
    uf = user.get("uf")

    if not crm or not uf:
        raise HTTPException(status_code=401, detail="Usuário não autenticado")

    db = SessionLocal()
    try:
        # 1. Buscar todos os procedimentos das guias do usuário
        guias_procedures = db.query(Guia).filter_by(crm=crm, uf=uf).all()
        
        # 2. Buscar todos os demonstrativos e seus procedimentos
        demonstrativos = db.query(Demonstrativo).filter_by(crm=crm, uf=uf).all()
        
        # 3. Mapear procedimentos dos demonstrativos com detalhes
        demo_procedures_map = {}
        
        for demo in demonstrativos:
            try:
                procedures_response = get_demonstrativo_procedures(demo.id, user)
                if procedures_response:
                    for proc in procedures_response:
                        key = (proc.get("codigo"), proc.get("guia"))
                        
                        financial = proc.get("financial", {})
                        approved_value = financial.get("approved_value", 0)
                        presented_value = financial.get("presented_value", 0)
                        
                        demo_procedures_map[key] = {
                            "approved_value": approved_value,
                            "presented_value": presented_value,
                            "demonstrativo_id": demo.id,
                            "demonstrativo_filename": demo.filename,
                            "procedure_data": proc
                        }
            except Exception as e:
                logger.warning(f"Erro ao processar demonstrativo {demo.id}: {e}")
                continue

        # 4. Carregar CBHPM para comparações
        from src.parsers.cbhpm_parser import CBHPMParser
        cbhpm_parser = None
        try:
            cbhpm_parser = CBHPMParser("data/cbhpm/CBHPM2015_v1.xlsx")
        except Exception as e:
            logger.warning(f"Erro ao carregar CBHPM: {e}")

        # 5. Analisar cada procedimento das guias
        analysis_results = []
        
        for guia_proc in guias_procedures:
            key = (guia_proc.codigo, guia_proc.numero_guia)
            
            # Calcular dias desde execução
            days_since = 0
            try:
                if guia_proc.data:
                    parts = guia_proc.data.split("/")
                    if len(parts) == 3:
                        proc_date = datetime(int(parts[2]), int(parts[1]), int(parts[0]))
                        days_since = (datetime.now() - proc_date).days
            except Exception:
                days_since = 0

            # Obter valor CBHPM estimado
            estimated_value = 0
            if cbhpm_parser and guia_proc.codigo and guia_proc.papel:
                try:
                    cbhpm_data = cbhpm_parser.get_procedure(str(guia_proc.codigo))
                    if cbhpm_data:
                        papel_normalizado = guia_proc.papel.lower().strip()
                        if papel_normalizado in ["cirurgiao", "cirurgião"]:
                            estimated_value = cbhpm_data.get("surgeon_value", 0.0)
                        elif papel_normalizado in ["anestesista"]:
                            estimated_value = cbhpm_data.get("anesthesiologist_value", 0.0)
                        elif papel_normalizado in ["primeiro auxiliar", "1º auxiliar", "auxiliar"]:
                            estimated_value = cbhpm_data.get("first_assistant_value", 0.0)
                        elif papel_normalizado in ["segundo auxiliar", "2º auxiliar"]:
                            estimated_value = cbhpm_data.get("first_assistant_value", 0.0)
                except Exception:
                    estimated_value = 0

            # Análise de status
            demo_data = demo_procedures_map.get(key)
            
            if demo_data is None:
                # Caso 1: NÃO ENCONTRADO - Sem demonstrativo correspondente
                status_type = "NAO_ENCONTRADO"
                status_description = "Procedimento não encontrado em demonstrativos"
                urgency = "critical" if days_since > 90 else "high" if days_since > 60 else "medium" if days_since > 30 else "normal"
                
                analysis_results.append({
                    "id": f"{guia_proc.id}_nao_encontrado",
                    "numero_guia": guia_proc.numero_guia,
                    "data": guia_proc.data,
                    "beneficiario": guia_proc.paciente or "-",
                    "codigo": guia_proc.codigo,
                    "descricao": guia_proc.descricao,
                    "papel": guia_proc.papel,
                    "qtd": guia_proc.qtd,
                    "days_since": days_since,
                    "estimated_value": estimated_value,
                    "paid_value": 0,
                    "difference": estimated_value * (guia_proc.qtd or 1),
                    "status_type": status_type,
                    "status_description": status_description,
                    "urgency": urgency,
                    "demonstrativo_info": None
                })
                
            else:
                approved_value = demo_data["approved_value"]
                presented_value = demo_data["presented_value"]
                total_estimated = estimated_value * (guia_proc.qtd or 1)
                
                if approved_value == 0:
                    # Caso 2: GLOSADO - Demonstrativo existe mas valor aprovado = 0
                    status_type = "GLOSADO"
                    status_description = "Procedimento totalmente glosado pelo convênio"
                    urgency = "critical"
                    
                elif approved_value > 0 and estimated_value > 0 and approved_value < total_estimated:
                    # Caso 3: SUBTABULADO - Pago mas valor inferior ao CBHPM
                    status_type = "SUBTABULADO" 
                    status_description = f"Pago com valor inferior à tabela CBHPM"
                    urgency = "medium"
                    
                elif approved_value > 0 and estimated_value > 0 and approved_value >= total_estimated:
                    # Caso 4: PAGO_CORRETO - Pago conforme ou acima da tabela
                    continue  # Não incluir na lista de pendências
                    
                else:
                    # Caso 5: DISCREPANCIA - Outros casos para análise
                    status_type = "DISCREPANCIA"
                    status_description = "Situação requer análise manual"
                    urgency = "medium"
                
                analysis_results.append({
                    "id": f"{guia_proc.id}_{status_type.lower()}",
                    "numero_guia": guia_proc.numero_guia,
                    "data": guia_proc.data,
                    "beneficiario": guia_proc.paciente or "-",
                    "codigo": guia_proc.codigo,
                    "descricao": guia_proc.descricao,
                    "papel": guia_proc.papel,
                    "qtd": guia_proc.qtd,
                    "days_since": days_since,
                    "estimated_value": estimated_value,
                    "paid_value": approved_value,
                    "difference": total_estimated - approved_value,
                    "status_type": status_type,
                    "status_description": status_description,
                    "urgency": urgency,
                    "demonstrativo_info": {
                        "filename": demo_data["demonstrativo_filename"],
                        "presented_value": presented_value,
                        "approved_value": approved_value
                    }
                })

        # 6. Calcular estatísticas por tipo
        stats_by_type = {
            "NAO_ENCONTRADO": {"count": 0, "total_value": 0},
            "GLOSADO": {"count": 0, "total_value": 0},
            "SUBTABULADO": {"count": 0, "total_value": 0},
            "DISCREPANCIA": {"count": 0, "total_value": 0}
        }
        
        for result in analysis_results:
            status_type = result["status_type"]
            if status_type in stats_by_type:
                stats_by_type[status_type]["count"] += 1
                stats_by_type[status_type]["total_value"] += result["difference"]

        # 7. Retornar análise completa
        return {
            "total_procedures": len(guias_procedures),
            "total_pendencies": len(analysis_results),
            "pendency_breakdown": stats_by_type,
            "oldest_procedure_days": max([r["days_since"] for r in analysis_results]) if analysis_results else 0,
            "total_estimated_loss": sum([r["difference"] for r in analysis_results]),
            "pendency_list": analysis_results,
            "analysis_summary": {
                "nao_encontrado_count": stats_by_type["NAO_ENCONTRADO"]["count"],
                "glosado_count": stats_by_type["GLOSADO"]["count"], 
                "subtabulado_count": stats_by_type["SUBTABULADO"]["count"],
                "discrepancia_count": stats_by_type["DISCREPANCIA"]["count"]
            }
        }

    except Exception as e:
        logger.error(f"Erro na análise de procedimentos pendentes: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")
    finally:
        db.close()


# Função auxiliar para buscar procedimentos de demonstrativo
def get_demonstrativo_procedures(demo_id: int, user: dict):
    """
    Busca procedimentos de um demonstrativo específico
    """
    db = SessionLocal()
    try:
        demo = db.query(Demonstrativo).filter_by(
            id=demo_id,
            crm=user["crm"],
            uf=user["uf"]
        ).first()

        if not demo:
            return []

        # Aqui você implementaria a lógica de parsing do demonstrativo
        # Por ora, retorna uma lista vazia para evitar erro
        # No código real, isso chamaria o DemonstrativoParser
        
        return []
        
    except Exception as e:
        logger.error(f"Erro ao buscar procedimentos do demonstrativo {demo_id}: {e}")
        return []
    finally:
        db.close()