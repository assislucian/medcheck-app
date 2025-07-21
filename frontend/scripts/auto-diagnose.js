#!/usr/bin/env node
/**
 * 🔧 AUTO-DIAGNÓSTICO MEDCHECK
 * Script inteligente para detectar e reportar problemas automaticamente
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class AutoDiagnostic {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async runCommand(command, description) {
    return new Promise((resolve) => {
      this.log(`🔍 ${description}...`, 'blue');
      exec(command, { cwd: process.cwd(), maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        resolve({
          success: !error,
          stdout: stdout || '',
          stderr: stderr || '',
          error
        });
      });
    });
  }

  async checkTypeScript() {
    this.log('\n📝 VERIFICANDO TYPESCRIPT...', 'bold');
    
    const result = await this.runCommand(
      'npx tsc --noEmit --skipLibCheck',
      'Compilação TypeScript'
    );

    if (!result.success) {
      const tsErrors = result.stdout.split('\n')
        .filter(line => line.includes('error TS'))
        .slice(0, 10); // Limitar a 10 erros
      
      if (tsErrors.length > 0) {
        this.errors.push({
          type: 'TypeScript',
          count: tsErrors.length,
          details: tsErrors
        });
        
        this.log(`❌ ${tsErrors.length} erros TypeScript encontrados:`, 'red');
        tsErrors.forEach(error => this.log(`   ${error}`, 'red'));
      }
    } else {
      this.log('✅ TypeScript OK', 'green');
    }
  }

  async checkDuplicateExports() {
    this.log('\n🔍 VERIFICANDO EXPORTAÇÕES DUPLICADAS...', 'bold');
    
    const srcPath = path.join(process.cwd(), 'src');
    const duplicates = [];
    
    const checkFile = (filePath) => {
      if (!fs.existsSync(filePath) || !filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
      
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const exports = [];
      
      lines.forEach((line, index) => {
        const exportMatch = line.match(/export\s+(?:const|function|class|interface|type)\s+(\w+)/);
        const namedExportMatch = line.match(/export\s*{\s*([^}]+)\s*}/);
        
        if (exportMatch) {
          exports.push({ name: exportMatch[1], line: index + 1, type: 'direct' });
        }
        if (namedExportMatch) {
          const names = namedExportMatch[1].split(',').map(n => n.trim());
          names.forEach(name => {
            exports.push({ name, line: index + 1, type: 'named' });
          });
        }
      });
      
      // Verificar duplicatas no mesmo arquivo
      const seen = new Set();
      exports.forEach(exp => {
        if (seen.has(exp.name)) {
          duplicates.push({
            file: filePath.replace(process.cwd(), ''),
            export: exp.name,
            line: exp.line
          });
        }
        seen.add(exp.name);
      });
    };

    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          walkDir(fullPath);
        } else {
          checkFile(fullPath);
        }
      });
    };

    walkDir(srcPath);

    if (duplicates.length > 0) {
      this.errors.push({
        type: 'Duplicate Exports',
        count: duplicates.length,
        details: duplicates
      });
      
      this.log(`❌ ${duplicates.length} exportações duplicadas encontradas:`, 'red');
      duplicates.forEach(dup => {
        this.log(`   ${dup.file}:${dup.line} - ${dup.export}`, 'red');
      });
    } else {
      this.log('✅ Nenhuma exportação duplicada', 'green');
    }
  }

  async checkBuild() {
    this.log('\n🏗️ VERIFICANDO BUILD...', 'bold');
    
    const result = await this.runCommand(
      'npm run build --silent',
      'Build de produção'
    );

    if (!result.success) {
      this.errors.push({
        type: 'Build',
        details: result.stderr.split('\n').filter(line => line.trim()).slice(0, 5)
      });
      
      this.log('❌ Erro no build:', 'red');
      this.log(result.stderr, 'red');
    } else {
      this.log('✅ Build OK', 'green');
    }
  }

  async checkLinting() {
    this.log('\n🧹 VERIFICANDO LINTING...', 'bold');
    
    const result = await this.runCommand(
      'npx eslint src --ext .ts,.tsx --max-warnings 0',
      'ESLint'
    );

    if (!result.success && result.stdout) {
      const lintErrors = result.stdout.split('\n')
        .filter(line => line.includes('error') || line.includes('warning'))
        .slice(0, 10);
      
      if (lintErrors.length > 0) {
        this.warnings.push({
          type: 'ESLint',
          count: lintErrors.length,
          details: lintErrors
        });
        
        this.log(`⚠️ ${lintErrors.length} problemas de lint encontrados:`, 'yellow');
        lintErrors.forEach(error => this.log(`   ${error}`, 'yellow'));
      }
    } else {
      this.log('✅ Linting OK', 'green');
    }
  }

  generateReport() {
    this.log('\n📊 RELATÓRIO DE DIAGNÓSTICO:', 'bold');
    this.log('================================', 'cyan');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('🎉 TUDO OK! Nenhum problema encontrado.', 'green');
      return;
    }

    if (this.errors.length > 0) {
      this.log('\n🚨 ERROS CRÍTICOS:', 'red');
      this.errors.forEach(error => {
        this.log(`   • ${error.type}: ${error.count || 1} problema(s)`, 'red');
      });
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️ AVISOS:', 'yellow');
      this.warnings.forEach(warning => {
        this.log(`   • ${warning.type}: ${warning.count || 1} problema(s)`, 'yellow');
      });
    }

    this.log('\n🔧 PRÓXIMOS PASSOS:', 'cyan');
    if (this.errors.some(e => e.type === 'TypeScript')) {
      this.log('   1. Corrigir erros TypeScript', 'cyan');
    }
    if (this.errors.some(e => e.type === 'Duplicate Exports')) {
      this.log('   2. Remover exportações duplicadas', 'cyan');
    }
    if (this.errors.some(e => e.type === 'Build')) {
      this.log('   3. Corrigir erros de build', 'cyan');
    }
  }

  async diagnose() {
    this.log('🩺 INICIANDO AUTO-DIAGNÓSTICO MEDCHECK...', 'bold');
    this.log('==========================================', 'cyan');
    
    await this.checkDuplicateExports();
    await this.checkTypeScript();
    // await this.checkLinting(); // Comentado para não ser muito verboso
    // await this.checkBuild(); // Comentado para ser mais rápido
    
    this.generateReport();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const diagnostic = new AutoDiagnostic();
  diagnostic.diagnose().catch(console.error);
}

module.exports = AutoDiagnostic; 