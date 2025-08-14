// Teste simples para verificar se a página carrega sem erros
const testComparison = async () => {
  console.log('🧪 Testando página de Comparison após correção...');
  
  try {
    const response = await fetch('http://localhost:5173/comparison');
    const html = await response.text();
    
    // Verificar se não há erros de JavaScript no HTML
    const hasError = html.includes('useSidebarContext must be used within a SidebarProvider');
    
    if (hasError) {
      console.log('❌ Erro ainda presente na página');
      return false;
    }
    
    // Verificar se o título correto está presente
    const hasTitle = html.includes('Centro de Tabelas e Orientação Jurídica');
    
    if (hasTitle) {
      console.log('✅ Página carregada com sucesso!');
      console.log('✅ Título encontrado no HTML');
      return true;
    } else {
      console.log('⚠️ Página carregou mas título não encontrado');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar:', error.message);
    return false;
  }
};

// Executar teste
testComparison().then(success => {
  if (success) {
    console.log('🎉 TESTE PASSOU! Página está funcionando!');
  } else {
    console.log('💥 TESTE FALHOU! Ainda há problemas.');
  }
});
