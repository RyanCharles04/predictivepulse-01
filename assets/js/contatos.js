// contatos.js - VERSÃO FINAL COM IDs CORRETOS
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de contatos carregada');
    
    const contactForm = document.getElementById('contactForm');
    
    // Verificar se EmailJS carregou
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS não carregou');
        showMessage('Erro: EmailJS não carregou. Recarregue a página.', 'error');
        return;
    }
    
    console.log('EmailJS carregado com sucesso');

    // Elementos do formulário
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const subjectInput = document.getElementById('subject');
    const messageInput = document.getElementById('message');

    // Validação em tempo real
    fullNameInput.addEventListener('blur', validateFullName);
    emailInput.addEventListener('blur', validateEmail);
    messageInput.addEventListener('blur', validateMessage);
    phoneInput.addEventListener('input', formatPhoneNumber);

    [fullNameInput, emailInput, phoneInput, subjectInput, messageInput].forEach(input => {
        input.addEventListener('input', clearFieldError);
    });

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Formulário submetido');

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const subject = subjectInput.value;
        const message = messageInput.value.trim();

        console.log('Dados do formulário:', { fullName, email, phone, subject, message });

        // Validar todos os campos obrigatórios
        const isFullNameValid = validateFullName();
        const isEmailValid = validateEmail();
        const isSubjectValid = validateSubject();
        const isMessageValid = validateMessage();

        if (!fullName || !email || !subject || !message) {
            showMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            if (!fullName) showFieldError(fullNameInput, 'Nome completo é obrigatório.');
            if (!email) showFieldError(emailInput, 'E-mail é obrigatório.');
            if (!subject) showFieldError(subjectInput, 'Assunto é obrigatório.');
            if (!message) showFieldError(messageInput, 'Mensagem é obrigatória.');
            return;
        }

        if (!isFullNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
            showMessage('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        // Enviar formulário
        sendEmail(fullName, email, phone, subject, message);
    });

    function validateFullName() {
        const fullName = fullNameInput.value.trim();
        if (!fullName) {
            showFieldError(fullNameInput, 'Nome completo é obrigatório.');
            return false;
        } else if (fullName.length < 2) {
            showFieldError(fullNameInput, 'Nome deve ter pelo menos 2 caracteres.');
            return false;
        } else {
            clearFieldError(fullNameInput);
            return true;
        }
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        if (!email) {
            showFieldError(emailInput, 'E-mail é obrigatório.');
            return false;
        } else if (!isValidEmail(email)) {
            showFieldError(emailInput, 'Por favor, insira um email válido.');
            return false;
        } else {
            clearFieldError(emailInput);
            return true;
        }
    }

    function validateSubject() {
        const subject = subjectInput.value;
        if (!subject) {
            showFieldError(subjectInput, 'Assunto é obrigatório.');
            return false;
        } else {
            clearFieldError(subjectInput);
            return true;
        }
    }

    function validateMessage() {
        const message = messageInput.value.trim();
        if (!message) {
            showFieldError(messageInput, 'Mensagem é obrigatória.');
            return false;
        } else if (message.length < 10) {
            showFieldError(messageInput, 'A mensagem deve ter pelo menos 10 caracteres.');
            return false;
        } else {
            clearFieldError(messageInput);
            return true;
        }
    }

    function formatPhoneNumber() {
        let value = phoneInput.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, '($1');
        }
        
        phoneInput.value = value;
    }

    function showFieldError(input, message) {
        clearFieldError(input);
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #c33; font-size: 12px; margin-top: 5px;';
        input.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(e) {
        const input = e.target || e;
        input.classList.remove('error');
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function sendEmail(fullName, email, phone, subject, message) {
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        
        // Mostrar estado de loading
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'ENVIANDO...';
        
        showMessage('Enviando sua mensagem...', 'loading');

        // Preparar dados para o EmailJS
        const templateParams = {
            from_name: fullName,
            from_email: email,
            phone: phone || 'Não informado',
            subject: subject,
            message: message
        };

        console.log('Enviando para EmailJS:', {
            service: 'service_wwdrvar',
            template: 'template_obplqrk',
            params: templateParams
        });

        // ✅ IDs CORRETOS - Service: service_wwdrvar, Template: template_obplqrk
        emailjs.send('service_wwdrvar', 'template_obplqrk', templateParams)
            .then(function(response) {
                console.log('SUCESSO! Status:', response.status, 'Texto:', response.text);
                showMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
                
                // Restaurar botão
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
                
                // Limpar formulário
                contactForm.reset();
            }, function(error) {
                console.error('ERRO EmailJS:', error);
                
                let errorMessage = 'Erro ao enviar mensagem. ';
                
                if (error.status === 0) {
                    errorMessage += 'Problema de conexão. Verifique sua internet.';
                } else if (error.status === 400) {
                    errorMessage += 'Dados inválidos no formulário.';
                } else {
                    errorMessage += 'Tente novamente ou entre em contato diretamente.';
                }
                
                showMessage(errorMessage, 'error');
                
                // Restaurar botão
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');
                submitBtn.textContent = originalText;
            });
    }

    function showMessage(message, type) {
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message message-${type}`;
        messageDiv.textContent = message;

        contactForm.parentNode.insertBefore(messageDiv, contactForm);

        if (type !== 'loading') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }

        return messageDiv;
    }
});