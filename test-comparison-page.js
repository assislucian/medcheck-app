const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    console.log('🚀 Iniciando teste da página Comparison...');
    
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Interceptar logs do console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    // Interceptar erros de rede
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`❌ Network Error: ${response.status()} ${response.url()}`);
      }
    });
    
    console.log('📍 Navegando para http://localhost:5173/comparison...');
    await page.goto('http://localhost:5173/comparison', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Aguardar elementos críticos
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Verificar título da página
    const title = await page.title();
    console.log('📖 Título da página:', title);
    
    // Verificar se o texto principal está presente
    const mainHeading = await page.$eval('h1', el => el.textContent);
    console.log('📝 Título principal:', mainHeading);
    
    // Verificar se as abas estão presentes
    const tabs = await page.$$('[role="tab"]');
    console.log('📑 Número de abas encontradas:', tabs.length);
    
    if (tabs.length >= 4) {
      console.log('✅ Todas as abas foram renderizadas corretamente!');
    }
    
    // Verificar se o componente Base CBHPM está presente
    const cbhpmSection = await page.$('input[placeholder*="Digite o nome do procedimento"]');
    if (cbhpmSection) {
      console.log('✅ Seção Base CBHPM carregada!');
    }
    
    // Verificar se a calculadora está presente
    const calculator = await page.$('input[placeholder*="Ex: 40601080"]');
    if (calculator) {
      console.log('✅ Calculadora de honorários carregada!');
    }
    
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
