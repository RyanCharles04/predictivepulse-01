// login.js - versão otimizada para GitHub Pages
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO SISTEMA DE LOGIN (GitHub Pages) ===');
    
    // Configurar URLs base para GitHub Pages
    const isGitHubPages = window.location.hostname.includes('github.io');
    const basePath = isGitHubPages ? '/seu-repositorio' : ''; // ← ALTERAR para seu nome de repositório
    const rootPath = window.location.origin + basePath;
    
    // ===== BOTÃO VOLTAR PARA HOME =====
    const backToHomeBtn = document.getElementById('backToHome');
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', function() {
            if (isGitHubPages) {
                window.location.href = rootPath + '/index.html';
            } else {
                window.location.href = '../index.html';
            }
        });
    }
    
    // ===== VERIFICAR LOGIN PRÉVIO =====
    const checkLoginSession = () => {
        const lastLogin = localStorage.getItem('lastLogin');
        const currentTime = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (lastLogin && (currentTime - parseInt(lastLogin)) < twentyFourHours) {
            console.log('Sessão de login ativa nas últimas 24 horas');
            
            // Verificar Firebase
            if (typeof auth !== 'undefined') {
                auth.onAuthStateChanged((user) => {
                    if (user) {
                        console.log('Usuário já autenticado no Firebase');
                        
                        const userSession = {
                            uid: user.uid,
                            name: user.displayName || user.email.split('@')[0],
                            email: user.email,
                            photoURL: user.photoURL,
                            provider: user.providerData[0]?.providerId || 'email'
                        };
                        
                        sessionStorage.setItem('currentUser', JSON.stringify(userSession));
                        
                        setTimeout(() => {
                            window.location.href = rootPath + '/pages/area-cliente.html';
                        }, 500);
                    }
                });
            } else {
                const currentUser = sessionStorage.getItem('currentUser');
                if (currentUser) {
                    console.log('Usuário encontrado na sessão');
                    setTimeout(() => {
                        window.location.href = rootPath + '/pages/area-cliente.html';
                    }, 500);
                }
            }
        } else {
            console.log('Sessão expirada, mostrar tela de login');
            localStorage.removeItem('lastLogin');
            sessionStorage.removeItem('currentUser');
        }
    };
    
    // Executar verificação
    checkLoginSession();
    
    // ===== VARIÁVEIS DO FORMULÁRIO =====
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    const showSignupBtn = document.getElementById('showSignup');
    const showLoginBtn = document.getElementById('showLogin');
    
    // Elementos do login
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const loginBtn = document.getElementById('loginBtn');
    
    // Elementos do cadastro
    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const signupEmailInput = document.getElementById('signupEmail');
    const signupPasswordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const signupBtn = document.getElementById('signupBtn');
    
    // Botões do Google
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    const googleSignupBtn = document.getElementById('googleSignupBtn');

    // Verificar credenciais salvas
    const savedEmail = localStorage.getItem('savedEmail');
    const rememberMe = localStorage.getItem('rememberMe');

    if (rememberMe === 'true' && savedEmail) {
        emailInput.value = savedEmail;
        rememberCheckbox.checked = true;
    }

    // Alternar entre login e cadastro
    showSignupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        switchToSignup();
    });

    showLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        switchToLogin();
    });

    function switchToSignup() {
        loginCard.style.display = 'none';
        signupCard.style.display = 'block';
        clearAllMessages();
        clearAllFieldErrors();
        setTimeout(() => fullNameInput.focus(), 300);
    }

    function switchToLogin() {
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
        clearAllMessages();
        clearAllFieldErrors();
        setTimeout(() => emailInput.focus(), 300);
    }

    // ===== SISTEMA DE LOGIN =====
    emailInput.addEventListener('blur', validateLoginEmail);
    passwordInput.addEventListener('blur', validateLoginPassword);
    emailInput.addEventListener('input', clearFieldErrorOnType);
    passwordInput.addEventListener('input', clearFieldErrorOnType);

    function validateLoginEmail() {
        const email = emailInput.value.trim();
        if (email && !isValidEmail(email)) {
            showFieldError(emailInput, 'Por favor, insira um email válido.');
            return false;
        } else {
            clearFieldError(emailInput);
            return true;
        }
    }

    function validateLoginPassword() {
        const password = passwordInput.value.trim();
        if (password && password.length < 6) {
            showFieldError(passwordInput, 'A senha deve ter pelo menos 6 caracteres.');
            return false;
        } else {
            clearFieldError(passwordInput);
            return true;
        }
    }

    // Formulário de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const remember = rememberCheckbox.checked;

        const isEmailValid = validateLoginEmail();
        const isPasswordValid = validateLoginPassword();

        if (!email || !password) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            if (!email) showFieldError(emailInput, 'Email é obrigatório.');
            if (!password) showFieldError(passwordInput, 'Senha é obrigatória.');
            return;
        }

        if (!isEmailValid || !isPasswordValid) {
            showMessage('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        firebaseLogin(email, password, remember, rootPath);
    });

    // ===== SISTEMA DE CADASTRO =====
    fullNameInput.addEventListener('blur', validateFullName);
    signupEmailInput.addEventListener('blur', validateSignupEmail);
    signupPasswordInput.addEventListener('blur', validateSignupPassword);
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);
    
    [fullNameInput, signupEmailInput, signupPasswordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('input', clearFieldErrorOnType);
    });

    function validateFullName() {
        const fullName = fullNameInput.value.trim();
        if (fullName && fullName.length < 2) {
            showFieldError(fullNameInput, 'Nome deve ter pelo menos 2 caracteres.');
            return false;
        } else {
            clearFieldError(fullNameInput);
            return true;
        }
    }

    function validateSignupEmail() {
        const email = signupEmailInput.value.trim();
        if (email && !isValidEmail(email)) {
            showFieldError(signupEmailInput, 'Por favor, insira um email válido.');
            return false;
        } else {
            clearFieldError(signupEmailInput);
            return true;
        }
    }

    function validateSignupPassword() {
        const password = signupPasswordInput.value.trim();
        if (password && password.length < 6) {
            showFieldError(signupPasswordInput, 'A senha deve ter pelo menos 6 caracteres.');
            return false;
        } else {
            clearFieldError(signupPasswordInput);
            return true;
        }
    }

    function validateConfirmPassword() {
        const password = signupPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        if (confirmPassword && password !== confirmPassword) {
            showFieldError(confirmPasswordInput, 'As senhas não coincidem.');
            return false;
        } else {
            clearFieldError(confirmPasswordInput);
            return true;
        }
    }

    // Formulário de cadastro
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const fullName = fullNameInput.value.trim();
        const email = signupEmailInput.value.trim();
        const password = signupPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        const isFullNameValid = validateFullName();
        const isEmailValid = validateSignupEmail();
        const isPasswordValid = validateSignupPassword();
        const isConfirmValid = validateConfirmPassword();

        if (!fullName || !email || !password || !confirmPassword) {
            showMessage('Por favor, preencha todos os campos.', 'error');
            if (!fullName) showFieldError(fullNameInput, 'Nome completo é obrigatório.');
            if (!email) showFieldError(signupEmailInput, 'Email é obrigatório.');
            if (!password) showFieldError(signupPasswordInput, 'Senha é obrigatória.');
            if (!confirmPassword) showFieldError(confirmPasswordInput, 'Confirmação de senha é obrigatória.');
            return;
        }

        if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
            showMessage('Por favor, corrija os erros no formulário.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showFieldError(confirmPasswordInput, 'As senhas não coincidem.');
            showMessage('As senhas não coincidem.', 'error');
            return;
        }

        firebaseSignup(fullName, email, password, rootPath);
    });

    // ===== SISTEMA DE LOGIN COM GOOGLE =====
    function setupGoogleButton(button) {
        if (button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                handleGoogleLogin(rootPath);
            });
        }
    }
    
    setupGoogleButton(googleLoginBtn);
    setupGoogleButton(googleSignupBtn);
    
    function handleGoogleLogin(rootPath) {
        console.log('Iniciando login com Google...');
        
        // Mostrar mensagem de loading
        showMessage('Conectando com Google...', 'loading');
        
        // Desabilitar botões do Google
        const googleBtns = document.querySelectorAll('.google-btn');
        googleBtns.forEach(btn => {
            btn.disabled = true;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
            btn.dataset.originalHTML = originalHTML;
        });
        
        // Verificar se authFunctions existe
        if (typeof authFunctions === 'undefined') {
            console.error('authFunctions não está definido');
            showMessage('Erro: Sistema de autenticação não carregado', 'error');
            restoreGoogleButtons();
            return;
        }
        
        // Executar login com Google
        authFunctions.signInWithGoogle()
            .then(result => {
                console.log('Resultado do login Google:', result);
                
                if (result.success) {
                    // Salvar timestamp do último login
                    localStorage.setItem('lastLogin', new Date().getTime().toString());
                    
                    // Criar mensagem de sucesso
                    const successMsg = result.isNewUser ? 
                        'Conta criada com sucesso via Google!' : 
                        'Login realizado com sucesso via Google!';
                    
                    showMessage(successMsg + ' Redirecionando...', 'success');
                    
                    // Criar sessão
                    const user = result.user;
                    const userSession = {
                        uid: user.uid,
                        name: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        photoURL: user.photoURL,
                        provider: 'google'
                    };
                    
                    sessionStorage.setItem('currentUser', JSON.stringify(userSession));
                    
                    // Redirecionar
                    setTimeout(() => {
                        window.location.href = rootPath + '/pages/area-cliente.html';
                    }, 1500);
                    
                } else {
                    console.error('Erro no login Google:', result.error);
                    showMessage(result.error || 'Erro ao fazer login com Google', 'error');
                    restoreGoogleButtons();
                }
            })
            .catch(error => {
                console.error('Erro no login com Google:', error);
                
                // Mensagem de erro mais amigável
                let errorMessage = 'Erro ao conectar com Google. ';
                
                if (error.code === 'auth/popup-blocked') {
                    errorMessage += 'O popup foi bloqueado. Por favor, permita popups para este site.';
                } else if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage += 'O popup foi fechado. Tente novamente.';
                } else if (error.code === 'auth/unauthorized-domain') {
                    errorMessage += 'Domínio não autorizado. Configure seu domínio no Firebase Console.';
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage += 'Erro de conexão. Verifique sua internet.';
                } else {
                    errorMessage += 'Tente novamente.';
                }
                
                showMessage(errorMessage, 'error');
                restoreGoogleButtons();
            });
    }
    
    function restoreGoogleButtons() {
        const googleBtns = document.querySelectorAll('.google-btn');
        googleBtns.forEach(btn => {
            btn.disabled = false;
            if (btn.dataset.originalHTML) {
                btn.innerHTML = btn.dataset.originalHTML;
            }
        });
    }

    // ===== SISTEMA DE RECUPERAÇÃO DE SENHA =====
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }

    // ===== FUNÇÕES COMPARTILHADAS =====
    function clearFieldErrorOnType(e) {
        clearFieldError(e.target);
        e.target.classList.remove('error');
    }

    function showFieldError(input, message) {
        clearFieldError(input);
        input.classList.add('error');
        input.style.borderColor = '#c33';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #c33; font-size: 12px; margin-top: 5px;';
        input.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(input) {
        input.classList.remove('error');
        input.style.borderColor = '';
        const existingError = input.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }
});

// ===== FUNÇÕES FIREBASE =====

// Função para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Função de login com Firebase
async function firebaseLogin(email, password, remember, rootPath) {
    const loginBtn = document.querySelector('.login-form .login-btn');
    
    if (!loginBtn) {
        showMessage('Erro: Botão de login não encontrado', 'error');
        return;
    }
    
    // Mostrar estado de loading
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');
    loginBtn.textContent = 'ENTRANDO...';
    
    showMessage('Entrando...', 'loading');

    try {
        // Verificar se authFunctions existe
        if (typeof authFunctions === 'undefined') {
            throw new Error('Sistema de autenticação não carregado');
        }

        const result = await authFunctions.signIn(email, password);
        
        if (result.success) {
            const user = result.user;
            
            console.log('Login bem-sucedido:', user.email);
            
            // Salvar timestamp do último login
            localStorage.setItem('lastLogin', new Date().getTime().toString());
            
            // Buscar dados do usuário
            let userData = null;
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    userData = userDoc.data();
                } else {
                    // Criar documento do usuário se não existir
                    if (authFunctions.initializeUserData) {
                        const initResult = await authFunctions.initializeUserData(user, user.displayName || user.email.split('@')[0]);
                        userData = initResult.data;
                    }
                }
            } catch (firestoreError) {
                console.warn('Erro ao acessar Firestore:', firestoreError);
                userData = { 
                    name: user.displayName || user.email.split('@')[0], 
                    company: `Empresa ${user.email.split('@')[0]}` 
                };
            }

            // Salvar usuário na sessão
            const userSession = {
                uid: user.uid,
                name: userData?.name || user.displayName || user.email.split('@')[0],
                email: user.email,
                company: userData?.company || `Empresa ${user.email.split('@')[0]}`,
                provider: 'email'
            };
            sessionStorage.setItem('currentUser', JSON.stringify(userSession));

            // Salvar credenciais se "Lembrar-me" estiver marcado
            if (remember) {
                localStorage.setItem('savedEmail', email);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('savedEmail');
                localStorage.removeItem('rememberMe');
            }

            showMessage('Login realizado com sucesso! Redirecionando...', 'success');
            
            // Redirecionar para a área do cliente
            setTimeout(() => {
                window.location.href = rootPath + '/pages/area-cliente.html';
            }, 1500);
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Erro no login:', error);
        let errorMessage = 'Erro ao fazer login. Tente novamente.';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Usuário não encontrado.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Senha incorreta.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        } else if (error.code === 'auth/invalid-login-credentials') {
            errorMessage = 'Credenciais de login inválidas.';
        }
        
        showMessage(errorMessage, 'error');
    } finally {
        // Restaurar botão
        const loginBtn = document.querySelector('.login-form .login-btn');
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            loginBtn.textContent = 'ENTRAR';
        }
    }
}

// Função de cadastro com Firebase
async function firebaseSignup(fullName, email, password, rootPath) {
    const signupBtn = document.querySelector('.signup-form .login-btn');
    
    if (!signupBtn) {
        showMessage('Erro: Botão de cadastro não encontrado', 'error');
        return;
    }
    
    signupBtn.disabled = true;
    signupBtn.classList.add('loading');
    signupBtn.textContent = 'CRIANDO...';
    
    showMessage('Criando sua conta...', 'loading');

    try {
        // Verificar se authFunctions existe
        if (typeof authFunctions === 'undefined') {
            throw new Error('Sistema de autenticação não carregado');
        }

        const result = await authFunctions.signUp(email, password, fullName);
        
        if (result.success) {
            const user = result.user;
            
            console.log('Usuário criado:', user.uid);
            
            // Salvar timestamp do último login
            localStorage.setItem('lastLogin', new Date().getTime().toString());
            
            // Criar máquinas de exemplo
            try {
                if (authFunctions.createSampleMachines) {
                    await authFunctions.createSampleMachines(user.uid);
                }
            } catch (sampleError) {
                console.warn('Não foi possível criar máquinas de exemplo:', sampleError);
            }

            showMessage('Conta criada com sucesso! Faça login para continuar.', 'success');
            
            // Limpar formulário
            document.getElementById('signupForm').reset();
            
            // Voltar para tela de login
            setTimeout(() => {
                switchToLogin();
            }, 2000);
            
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Erro no cadastro:', error);
        let errorMessage = 'Erro ao criar conta. Tente novamente.';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este email já está em uso.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido.';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Operação não permitida.';
        }
        
        showMessage(errorMessage, 'error');
    } finally {
        // Restaurar botão
        const signupBtn = document.querySelector('.signup-form .login-btn');
        if (signupBtn) {
            signupBtn.disabled = false;
            signupBtn.classList.remove('loading');
            signupBtn.textContent = 'CRIAR CONTA';
        }
    }
}

// Função para alternar para tela de login
function switchToLogin() {
    const loginCard = document.getElementById('loginCard');
    const signupCard = document.getElementById('signupCard');
    
    if (loginCard && signupCard) {
        signupCard.style.display = 'none';
        loginCard.style.display = 'block';
        
        // Focar no campo de email
        setTimeout(() => {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.focus();
            }
        }, 300);
    }
}

// ===== SISTEMA DE RECUPERAÇÃO DE SENHA =====

function showForgotPasswordModal() {
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Redefinir Senha</h3>
                <p>Digite seu email para receber as instruções de redefinição de senha.</p>
            </div>
            
            <div class="form-group">
                <label for="resetEmail">Email</label>
                <input type="email" id="resetEmail" placeholder="seu@email.com">
            </div>
            
            <div id="resetMessage" style="margin: 15px 0; min-height: 20px;"></div>
            
            <div class="modal-buttons">
                <button id="cancelReset" class="modal-btn modal-btn-cancel">Cancelar</button>
                <button id="submitReset" class="modal-btn modal-btn-submit">Enviar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Elementos do modal
    const resetEmailInput = document.getElementById('resetEmail');
    const cancelBtn = document.getElementById('cancelReset');
    const submitBtn = document.getElementById('submitReset');
    const resetMessage = document.getElementById('resetMessage');
    
    // Preencher com email atual se disponível
    const currentEmail = document.getElementById('email')?.value;
    if (currentEmail) {
        resetEmailInput.value = currentEmail;
    }
    
    // Focar no input
    setTimeout(() => resetEmailInput.focus(), 100);
    
    // Event listeners
    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    submitBtn.addEventListener('click', async () => {
        const email = resetEmailInput.value.trim();
        
        if (!email) {
            showResetMessage('Por favor, insira seu email.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showResetMessage('Por favor, insira um email válido.', 'error');
            return;
        }
        
        // Desabilitar botão
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';
        
        try {
            await firebaseResetPassword(email);
        } finally {
            // Reabilitar botão (em caso de erro)
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar';
        }
    });
    
    // Fechar modal ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Enter para enviar
    resetEmailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
    
    function showResetMessage(message, type) {
        const color = type === 'error' ? '#c33' : '#363';
        const bgColor = type === 'error' ? '#fee' : '#efe';
        const borderColor = type === 'error' ? '#fcc' : '#cfc';
        
        resetMessage.innerHTML = `
            <div style="
                padding: 10px;
                border-radius: 5px;
                background: ${bgColor};
                color: ${color};
                border: 1px solid ${borderColor};
                font-size: 14px;
                text-align: center;
            ">
                ${message}
            </div>
        `;
    }
}

// Função para redefinir senha
async function firebaseResetPassword(email) {
    if (!email || !isValidEmail(email)) {
        showResetMessage('Por favor, insira um email válido.', 'error');
        return;
    }

    const messageDiv = showMessage('Enviando email de redefinição...', 'loading');
    
    try {
        // Verificar se authFunctions existe
        if (typeof authFunctions === 'undefined') {
            throw new Error('Sistema de autenticação não carregado');
        }

        const result = await authFunctions.resetPassword(email);
        
        if (result.success) {
            showMessage('Email de redefinição enviado! Verifique sua caixa de entrada e a pasta de spam.', 'success');
            
            console.log('Email de redefinição enviado para:', email);
            
            // Fechar modal após sucesso
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                setTimeout(() => modal.remove(), 3000);
            }
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        let errorMessage = 'Erro ao enviar email de redefinição. Tente novamente.';
        
        if (error.message) {
            errorMessage = error.message;
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Nenhuma conta encontrada com este email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido. Verifique o formato do email.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Erro de conexão. Verifique sua internet.';
        }
        
        showMessage(errorMessage, 'error');
    }
}

// ===== FUNÇÕES DE INTERFACE =====

// Função para mostrar mensagens
function showMessage(message, type) {
    // Remover mensagem anterior se existir
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    // Cores baseadas no tipo
    const colors = {
        error: { bg: '#fee', color: '#c33', border: '#fcc' },
        success: { bg: '#efe', color: '#363', border: '#cfc' },
        info: { bg: '#eef', color: '#336', border: '#ccf' },
        loading: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' }
    };

    const style = colors[type] || colors.info;
    messageDiv.style.background = style.bg;
    messageDiv.style.color = style.color;
    messageDiv.style.border = `1px solid ${style.border}`;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.padding = '12px 20px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.fontWeight = '600';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    messageDiv.style.minWidth = '300px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.animation = 'slideDown 0.3s ease';

    document.body.appendChild(messageDiv);

    // Remover automaticamente após 5 segundos (exceto loading)
    if (type !== 'loading') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    return messageDiv;
}

function clearAllMessages() {
    const messages = document.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());
}

function clearAllFieldErrors() {
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => {
        input.classList.remove('error');
        input.style.borderColor = '';
    });
    
    const fieldErrors = document.querySelectorAll('.field-error');
    fieldErrors.forEach(error => error.remove());
}

// Adicionar animação CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    
    .login-btn.loading::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        top: 50%;
        left: 50%;
        margin-left: -10px;
        margin-top: -10px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s ease-in-out infinite;
    }
    
    .google-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .fa-spin {
        animation: spin 1s linear infinite;
    }
    
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }
    
    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 10px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    }
    
    .modal-header {
        margin-bottom: 20px;
        text-align: center;
    }
    
    .modal-header h3 {
        margin: 0 0 10px 0;
        color: #333;
    }
    
    .modal-header p {
        margin: 0;
        color: #666;
        font-size: 14px;
    }
    
    .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }
    
    .modal-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s;
    }
    
    .modal-btn-cancel {
        background: #f0f0f0;
        color: #666;
    }
    
    .modal-btn-cancel:hover {
        background: #e0e0e0;
    }
    
    .modal-btn-submit {
        background: #4CAF50;
        color: white;
    }
    
    .modal-btn-submit:hover {
        background: #45a049;
    }
    
    .modal-btn-submit:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

console.log('✅ Sistema de login carregado com sucesso!');