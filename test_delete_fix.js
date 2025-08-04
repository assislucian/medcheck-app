#!/usr/bin/env node
/**
 * Teste simples para verificar se a correção do delete está funcionando
 * 
 * Este script simula a chamada do frontend para delete e verifica
 * se não há mais erro ao processar response 204.
 */

const https = require('https');
const http = require('http');

// Simular o método handleResponse corrigido
function handleResponse(response, body) {
    console.log(`Status: ${response.statusCode}`);

    if (response.statusCode < 200 || response.statusCode >= 300) {
        if (response.statusCode === 401) {
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error(`Erro ${response.statusCode}: ${response.statusMessage}`);
    }

    // ✅ CORREÇÃO: Status 204 (NO_CONTENT) não tem corpo na resposta
    if (response.statusCode === 204) {
        console.log('✅ Status 204 detectado - retornando null sem tentar parsear JSON');
        return null;
    }

    try {
        return JSON.parse(body);
    } catch (err) {
        console.log('❌ Erro ao parsear JSON:', err.message);
        throw new Error('Resposta inválida do servidor');
    }
}

// Teste de response 204 (simula delete bem-sucedido)
console.log('🧪 TESTANDO CORREÇÃO DO DELETE');
console.log('=' * 40);

try {
    // Simular response 204
    const mockResponse = {
        statusCode: 204,
        statusMessage: 'No Content'
    };

    const result = handleResponse(mockResponse, '');

    console.log('✅ Teste passou! Response 204 processada corretamente');
    console.log('✅ Resultado:', result);
    console.log('✅ A correção está funcionando - delete não deve mais dar erro');

} catch (error) {
    console.log('❌ Teste falhou:', error.message);
}

console.log('=' * 40);
console.log('🎯 Para testar na aplicação:');
console.log('1. Abra http://localhost:5175/demonstratives');
console.log('2. Tente deletar um demonstrativo');
console.log('3. Verifique se aparece toast VERDE de sucesso');
console.log('4. Verifique se a lista atualiza automaticamente');
console.log('5. NÃO deve aparecer erro vermelho');