#!/usr/bin/env python3
"""
Gera o arquivo .notes/directory_structure.md com a estrutura de diretórios e arquivos do projeto.
Uso: python .notes/generate_directory_structure.py
"""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUTPUT = os.path.join(ROOT, '.notes', 'directory_structure.md')
EXCLUDE = {'.git', 'venv', 'node_modules', '__pycache__', '.pytest_cache', '.DS_Store', 'dist', 'build', '.mypy_cache'}


def list_dir(path, prefix=''):
    entries = []
    for name in sorted(os.listdir(path)):
        if name in EXCLUDE or name.startswith('.') and name != '.notes':
            continue
        full = os.path.join(path, name)
        if os.path.isdir(full):
            entries.append(f"{prefix}- **{name}/**")
            entries.extend(list_dir(full, prefix + '  '))
        else:
            entries.append(f"{prefix}- {name}")
    return entries


def main():
    lines = ["# Estrutura de Diretórios\n"]
    lines += list_dir(ROOT)
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f"Estrutura de diretórios atualizada em {OUTPUT}")

if __name__ == '__main__':
    main() 