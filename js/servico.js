// script.js - Versão COMPLETA com sistema de tema escuro/claro
document.addEventListener('DOMContentLoaded', function(){
    console.log('=== PREDICTIVEPULSE SCRIPT INICIALIZADO ===');
    
    // 1. INICIALIZAR SISTEMA DE TEMA (PRIORIDADE)
    initThemeSystem();
    
    // 2. ELEMENTOS DA NAVBAR COM ÍCONES
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const header = document.querySelector('.navbar');
    const menuLines = navToggle ? navToggle.querySelectorAll('.menu-line') : [];
    const navItems = document.querySelectorAll('.nav-item');

    // ===== TOGGLE MENU MOBILE COM ANIMAÇÃO =====
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevenir propagação
            
            const isOpen = navLinks.classList.contains('active');
            
            if (!isOpen) {
                // Abrir menu
                navLinks.classList.add('active');
                navToggle.classList.add('active');
                
                // Animar as linhas do hamburguer
                menuLines.forEach((line, index) => {
                    line.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    if (index === 0) {
                        line.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    } else if (index === 1) {
                        line.style.opacity = '0';
                        line.style.transform = 'translateX(-10px)';
                    } else if (index === 2) {
                        line.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                    }
                });
            } else {
                // Fechar menu
                closeMobileMenu();
            }
        });
    }

    // ===== FECHAR MENU MOBILE =====
    function closeMobileMenu() {
        if (navLinks) {
            navLinks.classList.remove('active');
        }
        if (navToggle) {
            navToggle.classList.remove('active');
            
            // Resetar animação das linhas
            menuLines.forEach((line, index) => {
                line.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                line.style.transform = 'none';
                line.style.opacity = '1';
            });
        }
    }

    // ===== FECHAR MENU AO CLICAR EM UM LINK =====
    navItems.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Se for link interno (#), fazer scroll suave
            if (href && href.startsWith('#')) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const headerHeight = header ? header.offsetHeight : 80;
                    const targetPosition = target.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
            
            // Fechar menu mobile se estiver aberto
            if (window.innerWidth < 900) {
                closeMobileMenu();
            }
        });
    });

    // ===== HEADER SCROLL EFFECT =====
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
        
        // Verificar inicialmente
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        }
    }

    // ===== RESPONSIVIDADE - AJUSTAR MENU AO REDIMENSIONAR =====
    function handleResponsiveMenu() {
        if (window.innerWidth > 900) {
            // Desktop - mostrar menu normalmente
            if (navLinks) {
                navLinks.classList.add('active');
                navLinks.style.display = 'flex';
            }
        } else {
            // Mobile - esconder menu se estiver aberto
            if (navLinks && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
            if (navLinks) {
                navLinks.style.display = 'none';
            }
        }
    }

    window.addEventListener('resize', function() {
        handleResponsiveMenu();
        
        // Debounce para performance
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(function() {
            handleResponsiveMenu();
        }, 250);
    });

    // ===== FECHAR MENU AO CLICAR FORA =====
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 900 && 
            navToggle && 
            !navToggle.contains(e.target) && 
            navLinks && 
            !navLinks.contains(e.target) &&
            navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // ===== SMOOTH SCROLL PARA TODOS OS LINKS INTERNOS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (!anchor.classList.contains('nav-item')) { // Já tratamos os nav-items
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
                    
                    // Fechar menu mobile se estiver aberto
                    if (window.innerWidth < 900) {
                        closeMobileMenu();
                    }
                }
            });
        }
    });

    // ===== HIGHLIGHT NAV ITEM ATIVO BASEADO NA POSIÇÃO DE SCROLL =====
    function updateActiveNavItem() {
        if (window.innerWidth < 900) return; // Só no desktop
        
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navItems.forEach(item => {
                    item.classList.remove('active');
                    const href = item.getAttribute('href');
                    if (href && href.includes(sectionId)) {
                        item.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavItem);

    // ===== INICIALIZAÇÃO =====
    // Inicializar menu responsivo
    handleResponsiveMenu();
    
    // Adicionar classe para página inicial
    if (document.body.classList.contains('home-page')) {
        document.documentElement.classList.add('home-page');
    }

    // ===== ANIMAÇÃO DE REVEAL PARA ELEMENTOS AO SCROLL =====
    const revealElements = document.querySelectorAll('.servico, .valor-item, .section-header');
    
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('revealed');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Verificar inicialmente
});

// ===================================================
// SISTEMA DE TEMA ESCURO/CLARO - FUNÇÕES PRINCIPAIS
// ===================================================

// 1. INICIALIZAR SISTEMA DE TEMA
function initThemeSystem() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) {
        console.warn('Botão de tema não encontrado nesta página.');
        return;
    }
    
    console.log('🔧 Inicializando sistema de tema...');
    
    // Verificar tema salvo no localStorage ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Definir tema inicial
    let currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    console.log('📊 Tema inicial:', {
        salvo: savedTheme,
        sistema: prefersDark ? 'dark' : 'light',
        aplicado: currentTheme
    });
    
    // Aplicar tema inicial
    applyTheme(currentTheme);
    
    // Configurar evento do botão
    themeToggle.addEventListener('click', toggleTheme);
    
    // Escutar mudanças no tema do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            console.log('🔄 Mudança detectada no tema do sistema:', e.matches ? 'dark' : 'light');
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });
    
    console.log('✅ Sistema de tema inicializado com sucesso!');
}

// 2. APLICAR TEMA
function applyTheme(theme) {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;
    const themeText = themeToggle ? themeToggle.querySelector('.theme-text') : null;
    
    console.log('🎨 Aplicando tema:', theme);
    
    if (theme === 'dark') {
        // ===== MODO ESCURO =====
        html.setAttribute('data-theme', 'dark');
        
        // Atualizar ícone e texto do botão
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun';
            themeIcon.style.color = '#FF9A3D';
        }
        if (themeText) {
            themeText.textContent = 'MODO CLARO';
        }
        
        // Estilo do botão ativo
        if (themeToggle) {
            themeToggle.classList.add('active');
            themeToggle.style.background = 'rgba(255, 154, 61, 0.2)';
            themeToggle.style.borderColor = '#FF9A3D';
        }
        
        // Salvar preferência
        localStorage.setItem('theme', 'dark');
        
        console.log('🌙 Modo escuro ativado');
        
    } else {
        // ===== MODO CLARO =====
        html.removeAttribute('data-theme');
        
        // Atualizar ícone e texto do botão
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon';
            themeIcon.style.color = '#ffffff';
        }
        if (themeText) {
            themeText.textContent = 'MODO ESCURO';
        }
        
        // Estilo do botão inativo
        if (themeToggle) {
            themeToggle.classList.remove('active');
            themeToggle.style.background = 'rgba(255, 255, 255, 0.1)';
            themeToggle.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
        
        // Salvar preferência
        localStorage.setItem('theme', 'light');
        
        console.log('☀️ Modo claro ativado');
    }
    
    // Forçar redesenho para garantir transição
    void html.offsetWidth;
}

// 3. ALTERNAR TEMA
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const themeToggle = document.getElementById('themeToggle');
    
    console.log('🔄 Alternando tema. Atual:', isDark ? 'dark' : 'light');
    
    // Aplicar tema oposto
    applyTheme(isDark ? 'light' : 'dark');
    
    // Efeito visual no botão
    if (themeToggle) {
        themeToggle.style.transform = 'scale(1.1)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 200);
    }
}

// ===== DEBUG HELPER =====
function checkThemeSystem() {
    console.log('=== 🐛 DEBUG TEMA ===');
    console.log('1. Botão existe?', !!document.getElementById('themeToggle'));
    console.log('2. HTML data-theme:', document.documentElement.getAttribute('data-theme'));
    console.log('3. localStorage theme:', localStorage.getItem('theme'));
    console.log('4. Preferência sistema:', window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    const themeText = document.querySelector('#themeToggle .theme-text');
    const themeIcon = document.querySelector('#themeToggle i');
    
    console.log('5. Botão texto:', themeText ? themeText.textContent : 'N/A');
    console.log('6. Botão ícone:', themeIcon ? themeIcon.className : 'N/A');
    console.log('7. Botão tem classe active?', document.getElementById('themeToggle')?.classList.contains('active'));
}

// Verificar inicialização após carregamento
setTimeout(() => {
    console.log('=== ✅ VERIFICAÇÃO INICIAL ===');
    checkThemeSystem();
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        console.log('🎯 Botão de tema encontrado e funcionando!');
        
        // Adicionar listener para debug
        themeToggle.addEventListener('click', () => {
            setTimeout(checkThemeSystem, 100);
        });
    } else {
        console.warn('⚠️ Botão de tema NÃO encontrado nesta página!');
    }
}, 500);

// ===================================================
// FUNÇÕES ADICIONAIS
// ===================================================

// ===== POLYFILL PARA SMOOTH SCROLL EM TODOS OS BROWSERS =====
if (!('scrollBehavior' in document.documentElement.style)) {
    console.log('📦 Carregando polyfill para scroll suave...');
    // Aqui você poderia carregar um polyfill se necessário
}

// ===== PREVENIR COMPORTAMENTO PADRÃO DE FORMULÁRIOS =====
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Aqui você pode adicionar lógica de envio de formulário
        console.log('📧 Formulário enviado:', this.id || 'formulário sem ID');
        
        // Exemplo de feedback visual
        const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            }, 1500);
        }
    });
});

// ===== BOTÃO "VOLTAR AO TOPO" DINÂMICO =====
(function() {
    // Criar botão
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
    
    // Mostrar/ocultar botão baseado no scroll
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
    
    // Scroll suave ao topo
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Efeito hover
    backToTopBtn.addEventListener('mouseenter', () => {
        backToTopBtn.style.transform = 'translateY(-5px) scale(1.1)';
        backToTopBtn.style.boxShadow = '0 8px 25px rgba(249, 133, 19, 0.4)';
    });
    
    backToTopBtn.addEventListener('mouseleave', () => {
        backToTopBtn.style.transform = 'translateY(0) scale(1)';
        backToTopBtn.style.boxShadow = '0 4px 15px rgba(249, 133, 19, 0.3)';
    });
    
    console.log('⬆️ Botão "Voltar ao topo" criado');
})();

// ===== DETECTAR E APLICAR CORES DO TEMA =====
(function() {
    // Adicionar classe de suporte a JavaScript
    document.documentElement.classList.add('js-enabled');
    
    // Detecta preferência de tema escuro/claro
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Aplicar classe inicial baseada no tema do sistema
    if (!localStorage.getItem('theme')) {
        if (prefersDarkScheme.matches) {
            document.documentElement.classList.add('system-dark');
        } else {
            document.documentElement.classList.add('system-light');
        }
    }
    
    // Escutar mudanças no tema do sistema
    prefersDarkScheme.addListener((e) => {
        if (!localStorage.getItem('theme')) {
            document.documentElement.classList.toggle('system-dark', e.matches);
            document.documentElement.classList.toggle('system-light', !e.matches);
        }
    });
    
    console.log('🎨 Sistema de cores do tema configurado');
})();

// ===== LOADING ANIMATION =====
window.addEventListener('load', function() {
    // Remover preloader se existir
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            console.log('⏳ Preloader removido');
        }, 500);
    }
    
    // Adicionar classe de carregamento completo
    document.body.classList.add('loaded');
    
    console.log('🚀 Página completamente carregada!');
    
    // Verificação final do tema
    setTimeout(() => {
        const currentTheme = localStorage.getItem('theme') || 
                           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        console.log('🎯 Tema atual:', currentTheme);
        console.log('🎯 Botão mostra:', document.querySelector('#themeToggle .theme-text')?.textContent || 'N/A');
    }, 1000);
});

// ===== EXTRA: SISTEMA DE NOTIFICAÇÕES =====
function showNotification(message, type = 'info', duration = 3000) {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `theme-notification notification-${type}`;
    
    // Ícones por tipo
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : 
                    type === 'error' ? '#dc3545' : 
                    type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
        min-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Botão de fechar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Remover automaticamente
    const timeout = setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
    
    // Pausar timeout no hover
    notification.addEventListener('mouseenter', () => clearTimeout(timeout));
    notification.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    });
}

// ===== ADICIONAR ANIMAÇÕES CSS DINÂMICAS =====
const themeStyles = document.createElement('style');
themeStyles.textContent = `
    /* Animações para notificações */
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    /* Estilos para tema escuro em elementos específicos */
    [data-theme="dark"] .back-to-top {
        background: #FF9A3D !important;
        box-shadow: 0 4px 15px rgba(255, 154, 61, 0.3) !important;
    }
    
    [data-theme="dark"] .back-to-top:hover {
        box-shadow: 0 8px 25px rgba(255, 154, 61, 0.4) !important;
    }
    
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
                    box-shadow 0.5s ease,
                    transform 0.3s ease !important;
    }
    
    /* Botão de notificação */
    .notification-close {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    /* Responsividade do botão de tema */
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
    }
`;

document.head.appendChild(themeStyles);

console.log('✅ script.js COMPLETO carregado com sistema de tema!');