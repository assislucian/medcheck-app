import json
import os
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

router = APIRouter()

GLOSAS_PATH = os.path.join(os.path.dirname(__file__), "glosas.json")


def load_glosas():
    try:
        with open(GLOSAS_PATH, encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erro ao carregar glosas: {str(e)}"
        )


@router.get(
    "/glosas",
    response_class=JSONResponse,
    summary="Lista de glosas",
    tags=["Knowledge Base"],
)
def get_glosas(
    grupo: Optional[str] = Query(None, description="Filtrar por grupo de glosa"),
    codigo: Optional[str] = Query(None, description="Filtrar por código da glosa"),
    descricao: Optional[str] = Query(
        None, description="Busca textual na descrição da glosa"
    ),
) -> List[dict]:
    """
    Retorna a lista de glosas, com filtros opcionais por grupo, código ou busca textual na descrição.
    """
    glosas = load_glosas()
    if grupo:
        glosas = [g for g in glosas if g["grupo"].lower() == grupo.lower()]
    if codigo:
        glosas = [g for g in glosas if g["codigo"] == codigo]
    if descricao:
        glosas = [g for g in glosas if descricao.lower() in g["descricao"].lower()]
    return glosas
