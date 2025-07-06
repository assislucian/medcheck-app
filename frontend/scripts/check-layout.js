#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Páginas para verificar
const pages = [
  'src/pages/Dashboard.tsx',
  'src/pages/Guides.tsx',
  'src/pages/Demonstratives.tsx',
  'src/pages/UnpaidProcedures.tsx',
];

// Classes que devem estar presentes
const requiredClasses = ['content-layout', 'section-spacing'];

// Classes que não devem estar presentes no nível da página
const forbiddenClasses = [/px-[0-9]/, /mx-[0-9]/, /max-w-/, /space-y-[0-9]/];

console.log('🔍 Verificando consistência de layout...\n');

let allGood = true;

pages.forEach((pagePath) => {
  const fullPath = path.join(process.cwd(), pagePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Arquivo não encontrado: ${pagePath}`);
    allGood = false;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const pageName = path.basename(pagePath, '.tsx');

  console.log(`📄 Verificando ${pageName}...`);

  // Verificar se usa content-layout
  if (!content.includes('content-layout')) {
    console.log(`  ❌ Não usa content-layout`);
    allGood = false;
  } else {
    console.log(`  ✅ Usa content-layout`);
  }

  // Verificar se usa section-spacing
  if (!content.includes('section-spacing')) {
    console.log(`  ❌ Não usa section-spacing`);
    allGood = false;
  } else {
    console.log(`  ✅ Usa section-spacing`);
  }

  // Verificar se tem classes proibidas no nível da página
  forbiddenClasses.forEach((pattern) => {
    const matches = content.match(pattern);
    if (matches) {
      console.log(`  ❌ Tem classe proibida: ${matches[0]}`);
      allGood = false;
    }
  });

  console.log('');
});

if (allGood) {
  console.log('🎉 Todas as páginas estão usando o layout correto!');
  process.exit(0);
} else {
  console.log('⚠️  Algumas páginas precisam ser corrigidas.');
  process.exit(1);
}
