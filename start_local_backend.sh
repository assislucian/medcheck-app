#!/bin/bash
# Script para rodar o backend localmente de forma compatível com deploy
# Usa PYTHONPATH=. para garantir que imports absolutos funcionem

export PYTHONPATH=.
uvicorn src.api:app --reload --host 0.0.0.0 --port 8000 