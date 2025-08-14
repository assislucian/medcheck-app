const cbhpm = require('./src/data/cbhpmTable.json');

console.log('📊 CBHPM Database:');
console.log('Total de procedimentos:', cbhpm.length);
console.log('Primeiro procedimento:', cbhpm[0].codigo, '-', cbhpm[0].procedimento.substring(0,50) + '...');
console.log('Tem valores de cirurgião:', !!cbhpm.find(p => p.valor_cirurgiao));
console.log('Tem valores de anestesista:', !!cbhpm.find(p => p.valor_anestesista));

// Testar busca por código específico
const testCode = '40601080';
const found = cbhpm.find(p => String(p.codigo) === testCode);
if (found) {
  console.log(`✅ Encontrado código ${testCode}:`, found.procedimento.substring(0,60) + '...');
  console.log('   Valor cirurgião:', found.valor_cirurgiao || 'N/A');
  console.log('   Valor anestesista:', found.valor_anestesista || 'N/A');
} else {
  console.log(`❌ Código ${testCode} não encontrado`);
}

console.log('✅ Base CBHPM carregada com sucesso!');
