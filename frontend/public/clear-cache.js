// Script para forçar limpeza de cache de favicon
(function() {
    console.log('🔄 Limpando cache de favicon...');
    
    // Remove todos os links de favicon existentes
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(link => link.remove());
    
    // Adiciona novos favicons com timestamp para forçar reload
    const timestamp = Date.now();
    const favicons = [
        { href: `/favicon-analytics.svg?v=${timestamp}`, type: 'image/svg+xml' },
        { href: `/favicon-alt.svg?v=${timestamp}`, type: 'image/svg+xml', sizes: '16x16' },
        { href: `/favicon.ico?v=${timestamp}`, type: 'image/x-icon', sizes: '32x32' },
        { href: `/logo-medcheck.png?v=${timestamp}`, rel: 'apple-touch-icon' }
    ];
    
    favicons.forEach(favicon => {
        const link = document.createElement('link');
        link.rel = favicon.rel || 'icon';
        link.href = favicon.href;
        if (favicon.type) link.type = favicon.type;
        if (favicon.sizes) link.sizes = favicon.sizes;
        document.head.appendChild(link);
    });
    
    console.log('✅ Cache de favicon limpo e novos ícones carregados!');
    
    // Força reload da página após 1 segundo
    setTimeout(() => {
        console.log('🔄 Recarregando página...');
        window.location.reload(true);
    }, 1000);
})();


