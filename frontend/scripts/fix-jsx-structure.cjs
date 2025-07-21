#!/usr/bin/env node
/**
 * 🔧 JSX STRUCTURE FIXER
 * Script para corrigir automaticamente problemas de estrutura JSX
 */

const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function analyzeJSXStructure(filePath) {
  if (!fs.existsSync(filePath)) return null;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let inReturn = false;
  let bracesCount = 0;
  let divStack = [];
  let returnLineStart = -1;
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Detectar início do return
    if (trimmedLine.startsWith('return (')) {
      inReturn = true;
      returnLineStart = index;
      return;
    }
    
    if (inReturn) {
      // Contar divs abertas
      const openDivs = (line.match(/<div[^>]*>/g) || []).length;
      const openComponents = (line.match(/<[A-Z][a-zA-Z]*[^>]*>/g) || []).filter(tag => !tag.includes('/>')).length;
      
      // Contar divs fechadas
      const closeDivs = (line.match(/<\/div>/g) || []).length;
      const closeComponents = (line.match(/<\/[A-Z][a-zA-Z]*>/g) || []).length;
      
      // Atualizar stack
      for (let i = 0; i < openDivs; i++) divStack.push('div');
      for (let i = 0; i < openComponents; i++) {
        const match = line.match(/<([A-Z][a-zA-Z]*)/);
        if (match) divStack.push(match[1]);
      }
      
      for (let i = 0; i < closeDivs; i++) {
        if (divStack.length > 0 && divStack[divStack.length - 1] === 'div') {
          divStack.pop();
        }
      }
      
      for (let i = 0; i < closeComponents; i++) {
        if (divStack.length > 0) divStack.pop();
      }
      
      // Detectar fim do return
      if (trimmedLine.includes(');')) {
        inReturn = false;
      }
    }
  });
  
  return {
    unclosedTags: divStack,
    returnStart: returnLineStart,
    needsFix: divStack.length > 0
  };
}

function fixJSXFile(filePath) {
  log(`🔧 Analisando ${filePath}...`, 'blue');
  
  const analysis = analyzeJSXStructure(filePath);
  if (!analysis || !analysis.needsFix) {
    log(`  ✅ Estrutura OK`, 'green');
    return false;
  }
  
  log(`  ⚠️ Tags não fechadas: ${analysis.unclosedTags.join(', ')}`, 'yellow');
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Encontrar onde inserir os fechamentos
  let insertIndex = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].trim().includes(');')) {
      insertIndex = i;
      break;
    }
  }
  
  if (insertIndex === -1) return false;
  
  // Gerar fechamentos necessários
  const closingTags = [];
  analysis.unclosedTags.reverse().forEach(tag => {
    if (tag === 'div') {
      closingTags.push('      </div>');
    } else {
      closingTags.push(`    </${tag}>`);
    }
  });
  
  // Inserir fechamentos
  const newLines = [
    ...lines.slice(0, insertIndex),
    ...closingTags,
    ...lines.slice(insertIndex)
  ];
  
  // Backup do arquivo original
  fs.writeFileSync(filePath + '.backup', content);
  
  // Escrever arquivo corrigido
  fs.writeFileSync(filePath, newLines.join('\n'));
  
  log(`  ✅ Corrigido! (backup salvo como ${path.basename(filePath)}.backup)`, 'green');
  return true;
}

function fixAllPages() {
  log('🩺 CORRIGINDO ESTRUTURAS JSX...', 'bold');
  log('================================', 'cyan');
  
  const pagesDir = path.join(__dirname, '../src/pages');
  const files = fs.readdirSync(pagesDir)
    .filter(file => file.endsWith('.tsx'))
    .map(file => path.join(pagesDir, file));
  
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixJSXFile(file)) {
      fixedCount++;
    }
  });
  
  log(`\n📊 RESULTADO:`, 'bold');
  log(`   • ${files.length} arquivos verificados`, 'cyan');
  log(`   • ${fixedCount} arquivos corrigidos`, fixedCount > 0 ? 'green' : 'cyan');
  
  if (fixedCount > 0) {
    log('\n🔧 Execute novamente o build para verificar!', 'yellow');
  } else {
    log('\n🎉 Todas as estruturas JSX estão corretas!', 'green');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixAllPages();
}

module.exports = { fixJSXFile, analyzeJSXStructure }; 