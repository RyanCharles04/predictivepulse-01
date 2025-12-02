// script.js - Sistema de Tema ESCURO/CLARO e MENU MOBILE FUNCIONAL
document.addEventListener('DOMContentLoaded', function(){
    console.log('=== PREDICTIVEPULSE SCRIPT INICIALIZADO ===');
    
    // 1. ELEMENTOS DA NAVBAR (PRIMEIRO - para evitar erros)
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const header = document.querySelector('.navbar');
    const menuLines = navToggle ? navToggle.querySelectorAll('.menu-line') : [];
    const navItems = document.querySelectorAll('.nav-item');
    
    console.log('🔍 Elementos encontrados:', {
        navToggle: !!navToggle,
        navLinks: !!navLinks,
        header: !!header,
        menuLines: menuLines.length,
        navItems: navItems.length
    });

    // ===== MENU MOBILE CORRIGIDO =====
    if (navToggle && navLinks) {
        console.log('📱 Configurando menu mobile...');
        
        // Função para verificar se estamos em mobile
        function isMobile() {
            return window.innerWidth <= 768;
        }
        
        // Função para abrir o menu
        function openMobileMenu() {
            console.log('📱 Abrindo menu mobile...');
            navLinks.classList.add('active');
            navToggle.classList.add('active');
            document.body.style.overflow = 'hidden'; // Previne scroll do body
            
            // Animar as linhas do hambúrguer
            menuLines.forEach((line, index) => {
                line.style.transition = 'all 0.3s ease';
                if (index === 0) line.style.transform = 'rotate(45deg) translate(6px, 6px)';
                if (index === 1) line.style.opacity = '0';
                if (index === 2) line.style.transform = 'rotate(-45deg) translate(6px, -6px)';
            });
            
            // Adicionar overlay para fechar ao clicar fora
            createOverlay();
            
            // Fechar ao pressionar ESC
            document.addEventListener('keydown', handleEscapeKey);
        }
        
        // Função para fechar o menu
        function closeMobileMenu() {
            console.log('✖️ Fechando menu mobile...');
            navLinks.classList.remove('active');
            navToggle.classList.remove('active');
            document.body.style.overflow = ''; // Restaura scroll
            
            // Restaurar as linhas do hambúrguer
            menuLines.forEach(line => {
                line.style.transform = '';
                line.style.opacity = '';
            });
            
            // Remover overlay
            removeOverlay();
            
            // Remover listeners
            document.removeEventListener('keydown', handleEscapeKey);
        }
        
        // Função para criar overlay
        function createOverlay() {
            let overlay = document.querySelector('.menu-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'menu-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 998;
                    display: block;
                `;
                document.body.appendChild(overlay);
                
                // Fechar menu ao clicar no overlay
                overlay.addEventListener('click', closeMobileMenu);
            }
        }
        
        // Função para remover overlay
        function removeOverlay() {
            const overlay = document.querySelector('.menu-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
        
        // Função para lidar com tecla ESC
        function handleEscapeKey(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                closeMobileMenu();
            }
        }
        
        // Toggle do menu
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (navLinks.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Fechar menu ao clicar em um link (mobile apenas)
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                if (isMobile() && navLinks.classList.contains('active')) {
                    setTimeout(closeMobileMenu, 300); // Pequeno delay para smooth transition
                }
            });
        });
        
        // Fechar menu ao redimensionar para desktop
        window.addEventListener('resize', function() {
            if (!isMobile() && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // ===== HEADER SCROLL EFFECT =====
    if (header) {
        function updateHeaderScroll() {
            const scrolled = window.scrollY > 40;
            header.classList.toggle('scrolled', scrolled);
        }
        
        window.addEventListener('scroll', updateHeaderScroll);
        updateHeaderScroll(); // Verificar estado inicial
    }

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '' || href.startsWith('#!')) return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                // Fechar menu mobile se aberto
                if (navLinks && navLinks.classList.contains('active')) {
                    closeMobileMenu();
                }
                
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== ANIMAÇÕES DE REVELAÇÃO =====
    const revealElements = document.querySelectorAll('.servico, .valor-item, .section-header');
    
    function checkReveal() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - revealPoint) {
                element.classList.add('revealed');
            }
        });
    }
    
    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Verificar elementos visíveis inicialmente

    // ===== 2. INICIALIZAR SISTEMA DE TEMA =====
    initThemeSystem();
    
    console.log('✅ Script inicializado com sucesso!');
});

// ============================================
// SISTEMA DE TEMA ESCURO/CLARO - CORRIGIDO
// ============================================

function initThemeSystem() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) {
        console.warn('⚠️ Botão de tema não encontrado!');
        return;
    }
    
    console.log('🎯 Inicializando sistema de tema...');
    
    // Verificar tema salvo
    const savedTheme = localStorage.getItem('pp-theme');
    
    // Verificar preferência do sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Definir tema inicial
    let initialTheme;
    if (savedTheme) {
        initialTheme = savedTheme;
    } else {
        initialTheme = prefersDark ? 'dark' : 'light';
    }
    
    console.log('📊 Configuração inicial:', {
        'Tema salvo': savedTheme || 'nenhum',
        'Preferência sistema': prefersDark ? 'escuro' : 'claro',
        'Tema aplicado': initialTheme
    });
    
    // Aplicar tema inicial
    applyTheme(initialTheme);
    
    // Configurar clique no botão
    themeToggle.addEventListener('click', toggleTheme);
    
    // Escutar mudanças no sistema (apenas se não houver tema salvo)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('pp-theme')) {
            console.log('🔄 Sistema mudou para:', e.matches ? 'escuro' : 'claro');
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    console.log('✅ Sistema de tema pronto!');
}

function applyTheme(theme) {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) return;
    
    const themeIcon = themeToggle.querySelector('i');
    const themeText = themeToggle.querySelector('.theme-text');
    
    console.log(`🎨 Aplicando tema: ${theme === 'dark' ? 'ESCURO 🌙' : 'CLARO ☀️'}`);
    
    if (theme === 'dark') {
        // ===== ATIVAR MODO ESCURO =====
        html.setAttribute('data-theme', 'dark');
        
        // Atualizar botão
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
            themeIcon.style.color = '#FF9A3D';
        }
        if (themeText) {
            themeText.textContent = 'MODO CLARO';
        }
        
        themeToggle.classList.add('active');
        themeToggle.style.background = 'rgba(255, 154, 61, 0.2)';
        themeToggle.style.borderColor = '#FF9A3D';
        
        // Salvar preferência
        localStorage.setItem('pp-theme', 'dark');
        
    } else {
        // ===== ATIVAR MODO CLARO =====
        html.removeAttribute('data-theme');
        
        // Atualizar botão
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
            themeIcon.style.color = '#ffffff';
        }
        if (themeText) {
            themeText.textContent = 'MODO ESCURO';
        }
        
        themeToggle.classList.remove('active');
        themeToggle.style.background = 'rgba(255, 255, 255, 0.1)';
        themeToggle.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        
        // Salvar preferência
        localStorage.setItem('pp-theme', 'light');
    }
    
    // Adicionar transição suave
    document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
    
    // Forçar repaint para transição suave
    setTimeout(() => {
        document.body.style.transition = '';
    }, 500);
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log(`🔄 Alternando tema: ${currentTheme || 'claro'} → ${newTheme}`);
    
    applyTheme(newTheme);
    
    // Efeito visual no botão
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 150);
    }
}

// ============================================
// BOTÃO "VOLTAR AO TOPO"
// ============================================

(function createBackToTopButton() {
    // Verificar se já existe
    if (document.querySelector('.back-to-top')) return;
    
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Voltar ao topo');
    backToTopBtn.setAttribute('title', 'Voltar ao topo');
    
    // Estilos inline (para evitar problemas com CSS)
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--orange, #F98513);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        box-shadow: 0 4px 15px rgba(249, 133, 19, 0.3);
        transform: translateY(20px);
    `;
    
    document.body.appendChild(backToTopBtn);
    
    // Mostrar/ocultar botão
    function toggleBackToTop() {
        if (window.scrollY > 500) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
            backToTopBtn.style.transform = 'translateY(0)';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
            backToTopBtn.style.transform = 'translateY(20px)';
        }
    }
    
    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop(); // Estado inicial
    
    // Scroll suave ao topo
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Efeitos hover
    backToTopBtn.addEventListener('mouseenter', () => {
        backToTopBtn.style.transform = 'translateY(-5px) scale(1.1)';
        backToTopBtn.style.boxShadow = '0 8px 25px rgba(249, 133, 19, 0.4)';
    });
    
    backToTopBtn.addEventListener('mouseleave', () => {
        if (window.scrollY > 500) {
            backToTopBtn.style.transform = 'translateY(0) scale(1)';
        }
        backToTopBtn.style.boxShadow = '0 4px 15px rgba(249, 133, 19, 0.3)';
    });
    
    console.log('⬆️ Botão "Voltar ao topo" criado');
})();

// ============================================
// VERIFICAÇÃO DE CARREGAMENTO
// ============================================

window.addEventListener('load', function() {
    console.log('🚀 Página carregada completamente!');
    
    // Adicionar classe para animações após carregamento
    document.body.classList.add('page-loaded');
    
    // Verificar tema final
    setTimeout(() => {
        const currentTheme = localStorage.getItem('pp-theme') || 
                           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const buttonText = document.querySelector('#themeToggle .theme-text')?.textContent;
        
        console.log('🎯 VERIFICAÇÃO FINAL:');
        console.log('   • Tema atual:', currentTheme);
        console.log('   • Botão mostra:', buttonText || 'N/A');
        console.log('   • HTML data-theme:', document.documentElement.getAttribute('data-theme') || 'light');
    }, 500);
});

// ============================================
// FUNÇÃO AUXILIAR PARA FECHAR MENU MOBILE
// ============================================

// Esta função precisa ser global para ser acessada por outros eventos
function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const navToggle = document.getElementById('navToggle');
    const menuLines = navToggle ? navToggle.querySelectorAll('.menu-line') : [];
    const overlay = document.querySelector('.menu-overlay');
    
    if (navLinks) {
        navLinks.classList.remove('active');
    }
    
    if (navToggle) {
        navToggle.classList.remove('active');
        menuLines.forEach(line => {
            line.style.transform = '';
            line.style.opacity = '';
        });
    }
    
    if (overlay) {
        overlay.remove();
    }
    
    document.body.style.overflow = '';
}

// ============================================
// ADICIONAR ESTILOS DINÂMICOS PARA MENU MOBILE
// ============================================

// Adicionar estilos CSS apenas uma vez
if (!document.querySelector('#mobile-menu-styles')) {
    const mobileMenuStyles = document.createElement('style');
    mobileMenuStyles.id = 'mobile-menu-styles';
    mobileMenuStyles.textContent = `
        /* Overlay para menu mobile */
        .menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* Animações para elementos revelados */
        .servico, .valor-item, .section-header {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .servico.revealed, .valor-item.revealed, .section-header.revealed {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* Transições suaves para tema */
        body.page-loaded {
            transition: background-color 0.5s ease, color 0.5s ease !important;
        }
        
        /* Botão de tema responsivo */
        @media (max-width: 768px) {
            .theme-toggle .theme-text {
                display: none !important;
            }
            
            .theme-toggle {
                padding: 10px !important;
                min-width: 44px !important;
                width: 44px !important;
                height: 44px !important;
                justify-content: center !important;
                display: flex !important;
                align-items: center !important;
            }
            
            .theme-toggle i {
                font-size: 1.2rem !important;
                margin: 0 !important;
            }
            
            /* Prevenir scroll quando menu aberto */
            body:has(.nav-links.active) {
                overflow: hidden !important;
            }
        }
    `;
    
    document.head.appendChild(mobileMenuStyles);
    console.log('🎨 Estilos dinâmicos para mobile adicionados');
}

console.log('✅ script.js CORRIGIDO e otimizado!');