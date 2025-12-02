// script.js - Sistema de Tema ESCURO/CLARO corrigido e MENU MOBILE FUNCIONAL
document.addEventListener('DOMContentLoaded', function(){
    console.log('=== PREDICTIVEPULSE SCRIPT INICIALIZADO ===');
    
    // 1. INICIALIZAR SISTEMA DE TEMA (PRIMEIRO!)
    initThemeSystem();
    
    // 2. ELEMENTOS DA NAVBAR
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

    // ===== MENU MOBILE =====
    if (navToggle && navLinks) {
        console.log('📱 Configurando menu mobile...');
        
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = navLinks.classList.contains('active');
            console.log('🔄 Alternando menu:', isOpen ? 'FECHAR' : 'ABRIR');
            
            if (!isOpen) {
                // ABRIR MENU
                navLinks.classList.add('active');
                navToggle.classList.add('active');
                document.body.classList.add('menu-open');
                
                menuLines.forEach((line, index) => {
                    line.style.transition = 'all 0.3s ease';
                    if (index === 0) line.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) line.style.opacity = '0';
                    if (index === 2) line.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                });
                
                // Fechar ao clicar em um link
                navItems.forEach(item => {
                    item.addEventListener('click', closeMobileMenu, { once: true });
                });
                
                // Fechar ao clicar fora
                document.addEventListener('click', closeMenuOnClickOutside, { once: true });
                document.addEventListener('keydown', closeMenuOnEscape);
                
            } else {
                // FECHAR MENU
                closeMobileMenu();
            }
        });
    }

    function closeMobileMenu() {
        console.log('✖️ Fechando menu mobile...');
        
        if (navLinks) {
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
        
        if (navToggle) {
            navToggle.classList.remove('active');
            menuLines.forEach(line => {
                line.style.transform = 'none';
                line.style.opacity = '1';
            });
        }
        
        // Remover listeners
        document.removeEventListener('click', closeMenuOnClickOutside);
        document.removeEventListener('keydown', closeMenuOnEscape);
    }

    function closeMenuOnClickOutside(e) {
        if (navLinks && navToggle && 
            !navLinks.contains(e.target) && 
            !navToggle.contains(e.target)) {
            closeMobileMenu();
        }
    }

    function closeMenuOnEscape(e) {
        if (e.key === 'Escape') {
            closeMobileMenu();
        }
    }

    // ===== HEADER SCROLL EFFECT =====
    if (header) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 40;
            header.classList.toggle('scrolled', scrolled);
        });
        
        // Verificar estado inicial
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        }
    }

    // ===== RESPONSIVIDADE =====
    function handleResponsiveMenu() {
        if (window.innerWidth > 768) {
            // DESKTOP - mostrar menu normalmente
            if (navLinks) {
                navLinks.classList.remove('active');
                navLinks.style.display = 'flex';
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        } else {
            // MOBILE - esconder menu inicialmente
            if (navLinks && !navLinks.classList.contains('active')) {
                navLinks.style.display = 'none';
            }
        }
    }

    // Verificar ao carregar e redimensionar
    window.addEventListener('resize', handleResponsiveMenu);
    handleResponsiveMenu();

    // ===== SMOOTH SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (!anchor.classList.contains('nav-item')) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Fechar menu mobile após clique
                    if (window.innerWidth < 768) {
                        closeMobileMenu();
                    }
                }
            });
        }
    });

    // ===== ANIMAÇÕES =====
    const revealElements = document.querySelectorAll('.servico, .valor-item, .section-header');
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            if (element.getBoundingClientRect().top < window.innerHeight - 150) {
                element.classList.add('revealed');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll();
    
    console.log('✅ Script inicializado com sucesso!');
});

// ============================================
// SISTEMA DE TEMA ESCURO/CLARO - FUNÇÕES
// ============================================

function initThemeSystem() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) {
        console.warn('⚠️ Botão de tema não encontrado!');
        return;
    }
    
    console.log('🎯 Inicializando sistema de tema...');
    
    // Verificar tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Definir tema inicial
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    console.log('📊 Configuração inicial:', {
        'Tema salvo': savedTheme || 'nenhum',
        'Preferência sistema': prefersDark ? 'escuro' : 'claro',
        'Tema aplicado': initialTheme
    });
    
    // Aplicar tema inicial
    applyTheme(initialTheme);
    
    // Configurar clique no botão
    themeToggle.addEventListener('click', toggleTheme);
    
    // Escutar mudanças no sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            console.log('🔄 Sistema mudou para:', e.matches ? 'escuro' : 'claro');
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    console.log('✅ Sistema de tema pronto!');
}

function applyTheme(theme) {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    const themeText = themeToggle?.querySelector('.theme-text');
    
    console.log(`🎨 Aplicando tema: ${theme === 'dark' ? 'ESCURO 🌙' : 'CLARO ☀️'}`);
    
    if (theme === 'dark') {
        // ===== ATIVAR MODO ESCURO =====
        html.setAttribute('data-theme', 'dark');
        
        // Atualizar botão para mostrar "MODO CLARO"
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
            themeIcon.style.color = '#FF9A3D';
        }
        if (themeText) {
            themeText.textContent = 'MODO CLARO';
            console.log('🔄 Botão alterado para: MODO CLARO');
        }
        
        if (themeToggle) {
            themeToggle.classList.add('active');
            themeToggle.style.background = 'rgba(255, 154, 61, 0.2)';
            themeToggle.style.borderColor = '#FF9A3D';
        }
        
        localStorage.setItem('theme', 'dark');
        
    } else {
        // ===== ATIVAR MODO CLARO =====
        html.removeAttribute('data-theme');
        
        // Atualizar botão para mostrar "MODO ESCURO"
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
            themeIcon.style.color = '#ffffff';
        }
        if (themeText) {
            themeText.textContent = 'MODO ESCURO';
            console.log('🔄 Botão alterado para: MODO ESCURO');
        }
        
        if (themeToggle) {
            themeToggle.classList.remove('active');
            themeToggle.style.background = 'rgba(255, 255, 255, 0.1)';
            themeToggle.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
        
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    
    console.log(`🔄 Alternando de ${isDark ? 'ESCURO para CLARO' : 'CLARO para ESCURO'}`);
    
    applyTheme(isDark ? 'light' : 'dark');
    
    // Efeito visual
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.style.transform = 'scale(1.1)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 200);
    }
}

// ============================================
// FUNÇÕES ADICIONAIS
// ============================================

// Botão "Voltar ao Topo"
(function() {
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.setAttribute('aria-label', 'Voltar ao topo');
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--orange);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        box-shadow: 0 4px 15px rgba(249, 133, 19, 0.3);
    `;
    
    document.body.appendChild(backToTopBtn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.style.opacity = '1';
            backToTopBtn.style.visibility = 'visible';
            backToTopBtn.style.transform = 'translateY(0)';
        } else {
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
            backToTopBtn.style.transform = 'translateY(20px)';
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    backToTopBtn.addEventListener('mouseenter', () => {
        backToTopBtn.style.transform = 'translateY(-5px) scale(1.1)';
        backToTopBtn.style.boxShadow = '0 8px 25px rgba(249, 133, 19, 0.4)';
    });
    
    backToTopBtn.addEventListener('mouseleave', () => {
        backToTopBtn.style.transform = 'translateY(0) scale(1)';
        backToTopBtn.style.boxShadow = '0 4px 15px rgba(249, 133, 19, 0.3)';
    });
})();

// Verificação de carregamento
window.addEventListener('load', function() {
    console.log('🚀 Página carregada completamente!');
    
    // Verificar tema final
    setTimeout(() => {
        const currentTheme = localStorage.getItem('theme') || 
                           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const buttonText = document.querySelector('#themeToggle .theme-text')?.textContent;
        
        console.log('🎯 VERIFICAÇÃO FINAL:');
        console.log('   • Tema atual:', currentTheme);
        console.log('   • Botão mostra:', buttonText || 'N/A');
        console.log('   • HTML data-theme:', document.documentElement.getAttribute('data-theme'));
        
        // Forçar verificação visual
        if (!buttonText) {
            console.error('❌ ERRO: Texto do botão não encontrado!');
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                const textSpan = document.createElement('span');
                textSpan.className = 'theme-text';
                textSpan.textContent = currentTheme === 'dark' ? 'MODO CLARO' : 'MODO ESCURO';
                themeToggle.appendChild(textSpan);
                console.log('✅ Texto do botão criado dinamicamente');
            }
        }
    }, 1000);
});

// Adicionar estilos CSS dinâmicos para menu mobile
const mobileMenuStyles = document.createElement('style');
mobileMenuStyles.textContent = `
    /* Transições suaves para tema */
    body,
    .navbar,
    .servico,
    .valor-item,
    .conteudo img,
    .section-header,
    .footer,
    .hero-overlay,
    .servicos,
    .quem-somos,
    .barra-top,
    .theme-toggle,
    .nav-item,
    .logo-img {
        transition: background-color 0.5s ease, 
                    color 0.5s ease, 
                    border-color 0.5s ease,
                    box-shadow 0.5s ease !important;
    }
    
    /* Botão de tema responsivo */
    @media (max-width: 768px) {
        .theme-toggle .theme-text {
            display: none !important;
        }
        
        .theme-toggle {
            padding: 10px !important;
            width: 50px !important;
            min-width: 50px !important;
            justify-content: center !important;
        }
        
        .theme-toggle i {
            font-size: 1.2rem !important;
            margin: 0 !important;
        }
        
        /* Prevenir scroll quando menu aberto */
        body.menu-open {
            overflow: hidden !important;
        }
        
        /* Estilos específicos para menu mobile ativo */
        .nav-links.active {
            animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    }
`;

document.head.appendChild(mobileMenuStyles);

console.log('✅ script.js CORRIGIDO carregado com sucesso! Menu mobile FUNCIONAL!');