// jogo.js - Animações simples para a página do jogo

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Página simplificada do jogo carregada!');
    
    // Criar partículas de fundo
    function createParticles() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles';
        
        // Criar 15 partículas
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Tamanho aleatório entre 5px e 20px
            const size = Math.random() * 15 + 5;
            
            // Posição aleatória
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            
            // Delay e duração aleatórios para animação
            const delay = Math.random() * 10;
            const duration = Math.random() * 10 + 15;
            
            // Aplicar estilos
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${left}%;
                top: ${top}%;
                animation-delay: ${delay}s;
                animation-duration: ${duration}s;
                opacity: ${Math.random() * 0.1 + 0.05};
            `;
            
            particlesContainer.appendChild(particle);
        }
        
        // Adicionar ao container principal
        const mainSection = document.querySelector('.jogo-main-section');
        if (mainSection) {
            mainSection.appendChild(particlesContainer);
        }
    }
    
    // Efeito no botão de jogar
    const jogoBtn = document.querySelector('.jogo-btn');
    if (jogoBtn) {
        // Efeito de hover
        jogoBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
            this.style.boxShadow = '0 25px 50px rgba(249, 133, 19, 0.4)';
        });
        
        jogoBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 15px 40px rgba(249, 133, 19, 0.3)';
        });
        
        // Efeito de clique (ripple effect)
        jogoBtn.addEventListener('click', function(e) {
            // Criar elemento de ripple
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                top: ${y}px;
                left: ${x}px;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            
            // Remover após animação
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
        
        // Adicionar animação ripple ao CSS
        const rippleStyle = document.createElement('style');
        rippleStyle.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .jogo-btn {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(rippleStyle);
    }
    
    // Efeito de brilho no ícone
    const jogoIcon = document.querySelector('.jogo-icon');
    if (jogoIcon) {
        setInterval(() => {
            jogoIcon.style.boxShadow = `
                0 15px 40px rgba(249, 133, 19, 0.3),
                0 0 60px rgba(249, 133, 19, 0.2)
            `;
            
            setTimeout(() => {
                jogoIcon.style.boxShadow = '0 15px 40px rgba(249, 133, 19, 0.3)';
            }, 500);
        }, 3000);
    }
    
    // Adicionar efeito de digitação ao título (opcional)
    const title = document.querySelector('.jogo-content h2');
    if (title) {
        const text = title.textContent;
        title.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                title.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Iniciar efeito após 1 segundo
        setTimeout(typeWriter, 1000);
    }
    
    // Feedback visual ao passar o mouse sobre o card
    const jogoCard = document.querySelector('.jogo-card');
    if (jogoCard) {
        jogoCard.addEventListener('mouseenter', function() {
            this.style.transform = 'perspective(1000px) rotateY(5deg)';
            this.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.2)';
        });
        
        jogoCard.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateY(0deg)';
            this.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.15)';
        });
    }
    
    // Inicializar animações
    createParticles();
    
    // Log para desenvolvimento
    console.log('✅ Página do jogo simplificada pronta!');
    console.log('🔗 Link atual do jogo: https://seusite.com/jogo-real');
    console.log('💡 Dica: Para alterar o link, edite o href do botão "ACESSAR JOGO COMPLETO" no jogo.html');
    
    // Efeito de entrada dos elementos
    const elements = document.querySelectorAll('.jogo-card > *');
    elements.forEach((element, index) => {
        element.style.animation = `fadeInUp 0.8s ease-out ${index * 0.2 + 0.2}s both`;
    });
    
    // Adicionar mensagem no console sobre como alterar o link
    console.log(`
    ==========================================
    INSTRUÇÕES PARA ALTERAR O LINK DO JOGO:
    
    1. Abra o arquivo jogo.html
    2. Encontre a linha com:
       <a href="https://seusite.com/jogo-real" target="_blank" class="jogo-btn">
    
    3. Substitua "https://seusite.com/jogo-real" pela URL do seu jogo real
    
    4. Salve o arquivo
    ==========================================
    `);
});