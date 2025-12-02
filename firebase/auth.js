// firebase/auth.js
// Sistema completo de autenticação do Firebase - VERSÃO CORRIGIDA

console.log('=== SISTEMA DE AUTENTICAÇÃO CARREGADO ===');

// ===== VARIÁVEIS GLOBAIS =====
let authInitialized = false;
let redirectInProgress = false;
let authCheckCompleted = false;

// ===== FUNÇÕES PRINCIPAIS DE AUTENTICAÇÃO =====

// Função de cadastro (signup)
async function signUp(email, password, fullName) {
    try {
        console.log('Iniciando cadastro para:', email);
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('Usuário criado:', user.uid);

        // Atualizar perfil do usuário
        await user.updateProfile({
            displayName: fullName
        });

        // Inicializar dados do usuário no Firestore
        const initResult = await initializeUserData(user, fullName);
        if (!initResult.success) {
            console.warn('Aviso: Dados iniciais não puderam ser criados:', initResult.error);
        }

        // Criar máquinas de exemplo para novo usuário
        try {
            await createSampleMachines(user.uid);
        } catch (sampleError) {
            console.warn('Não foi possível criar máquinas de exemplo:', sampleError);
        }

        // Gerenciar sessão
        manageUserSession(user);

        return { success: true, user: user };
    } catch (error) {
        console.error('Erro no cadastro:', error);
        let errorMessage = 'Erro ao criar conta. Tente novamente.';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este email já está em uso.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido.';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Operação não permitida.';
        }
        
        return { success: false, error: errorMessage };
    }
}

// Função de login
async function signIn(email, password) {
    try {
        console.log('Iniciando login para:', email);
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        console.log('Login bem-sucedido:', user.email);

        // Verificar e criar dados do usuário se necessário
        await ensureUserData(user);

        // Atualizar último login no Firestore
        try {
            await db.collection('users').doc(user.uid).update({
                lastLogin: new Date(),
                updatedAt: new Date()
            });
        } catch (firestoreError) {
            console.warn('Aviso: Não foi possível atualizar último login:', firestoreError);
        }

        // Gerenciar sessão
        manageUserSession(user);

        return { success: true, user: user };
    } catch (error) {
        console.error('Erro no login:', error);
        let errorMessage = 'Erro ao fazer login. Tente novamente.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Usuário não encontrado.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Senha incorreta.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        } else if (error.code === 'auth/invalid-login-credentials') {
            errorMessage = 'Credenciais de login inválidas.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Erro de conexão. Verifique sua internet.';
        }
        
        return { success: false, error: errorMessage };
    }
}

// Função de logout
async function signOut() {
    try {
        await auth.signOut();
        console.log('Logout realizado com sucesso');
        
        // Limpar dados da sessão
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        
        // Não redirecionar automaticamente, deixar a página decidir
        return { success: true };
    } catch (error) {
        console.error('Erro no logout:', error);
        return { success: false, error: error.message };
    }
}

// Função de login com Google
async function signInWithGoogle() {
    try {
        console.log('Iniciando login com Google...');
        
        // Verificar se Firebase está disponível
        if (!firebase || !firebase.auth) {
            throw new Error('Firebase não está carregado corretamente');
        }
        
        // Criar provedor do Google
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Adicionar escopos
        provider.addScope('profile');
        provider.addScope('email');
        
        // Configurar parâmetros
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        // Fazer login com popup
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('Login Google bem-sucedido:', user.email);
        console.log('Provedor:', result.additionalUserInfo?.providerId);
        console.log('É novo usuário:', result.additionalUserInfo?.isNewUser);

        // Verificar se é um novo usuário
        const isNewUser = result.additionalUserInfo?.isNewUser || false;
        
        if (isNewUser) {
            // Criar perfil do usuário no Firestore
            await initializeUserData(user, user.displayName);
            
            // Criar máquinas de exemplo para novos usuários
            try {
                await createSampleMachines(user.uid);
            } catch (sampleError) {
                console.warn('Não foi possível criar máquinas de exemplo:', sampleError);
            }
        } else {
            // Verificar dados existentes
            await ensureUserData(user);
            
            // Atualizar último login
            try {
                await db.collection('users').doc(user.uid).update({
                    lastLogin: new Date(),
                    updatedAt: new Date()
                });
            } catch (firestoreError) {
                console.warn('Não foi possível atualizar último login:', firestoreError);
            }
        }

        // Gerenciar sessão
        manageUserSession(user);

        return { 
            success: true, 
            user: user,
            isNewUser: isNewUser,
            provider: 'google'
        };
    } catch (error) {
        console.error('Erro no login com Google:', error);
        let errorMessage = 'Erro ao fazer login com Google. Tente novamente.';
        
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Login cancelado pelo usuário.';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup bloqueado. Por favor, permita popups para este site.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Erro de conexão. Verifique sua internet.';
        } else if (error.code === 'auth/unauthorized-domain') {
            errorMessage = 'Domínio não autorizado. Contate o administrador.';
        } else if (error.code === 'auth/cancelled-popup-request') {
            errorMessage = 'Solicitação de popup cancelada.';
        }
        
        return { success: false, error: errorMessage };
    }
}

// Verificar estado de autenticação
function onAuthStateChanged(callback) {
    if (!auth) {
        console.error('Auth não está inicializado');
        return () => {};
    }
    return auth.onAuthStateChanged(callback);
}

// Obter usuário atual
function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

// Redefinir senha
async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        console.log('Email de redefinição enviado para:', email);
        return { success: true, message: 'Email de redefinição enviado!' };
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        let errorMessage = 'Erro ao enviar email de redefinição.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Nenhuma conta encontrada com este email.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido. Verifique o formato do email.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
        }
        
        return { success: false, error: errorMessage };
    }
}

// Atualizar perfil do usuário
async function updateUserProfile(displayName) {
    try {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        await user.updateProfile({
            displayName: displayName
        });

        // Atualizar também no Firestore
        await db.collection('users').doc(user.uid).update({
            name: displayName,
            updatedAt: new Date()
        });

        // Atualizar sessão
        manageUserSession(user);

        return { success: true, message: 'Perfil atualizado com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { success: false, error: error.message };
    }
}

// ===== FUNÇÕES DE INICIALIZAÇÃO =====

// Inicializar dados do usuário no Firestore
async function initializeUserData(user, fullName) {
    try {
        const userName = fullName || user.displayName || user.email.split('@')[0];
        const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);
        
        const userData = {
            uid: user.uid,
            email: user.email,
            name: formattedName,
            company: `Empresa ${formattedName.split(' ')[0]}`,
            createdAt: new Date(),
            lastLogin: new Date(),
            updatedAt: new Date(),
            emailVerified: user.emailVerified,
            profileCompleted: true,
            provider: user.providerData[0]?.providerId || 'email',
            photoURL: user.photoURL || null,
            permissions: ['basic', 'view_machines', 'add_machines']
        };

        // Salvar dados principais do usuário
        await db.collection('users').doc(user.uid).set(userData, { merge: true });
        
        // Criar documento adicional para busca por nome
        await db.collection('userNames').doc(user.uid).set({
            userId: user.uid,
            name: formattedName,
            email: user.email,
            createdAt: new Date(),
            updatedAt: new Date(),
            provider: user.providerData[0]?.providerId || 'email'
        }, { merge: true });

        console.log('Dados do usuário inicializados com sucesso:', formattedName);
        return { success: true, data: userData };
    } catch (error) {
        console.error('Erro ao inicializar dados do usuário:', error);
        return { success: false, error: error.message };
    }
}

// Criar máquinas de exemplo para novo usuário
async function createSampleMachines(userId) {
    try {
        const sampleMachines = [
            {
                name: 'Compressor Principal',
                type: 'compressor',
                status: 'active',
                temperature: 75.5,
                vibration: 2.1,
                pressure: 150,
                efficiency: 92.5,
                lastUpdate: new Date().toISOString().split('T')[0],
                lastMaintenance: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                nextMaintenance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                healthScore: 95,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Turbina T-202',
                type: 'turbine',
                status: 'warning',
                temperature: 82.3,
                vibration: 3.8,
                pressure: 180,
                efficiency: 78.2,
                lastUpdate: new Date().toISOString().split('T')[0],
                lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                nextMaintenance: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                healthScore: 65,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Gerador G-15',
                type: 'generator',
                status: 'active',
                temperature: 68.7,
                vibration: 1.5,
                pressure: 120,
                efficiency: 95.0,
                lastUpdate: new Date().toISOString().split('T')[0],
                lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                nextMaintenance: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                healthScore: 98,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        const batch = db.batch();
        
        sampleMachines.forEach(machine => {
            const machineRef = db.collection('users').doc(userId).collection('machines').doc();
            batch.set(machineRef, machine);
        });

        await batch.commit();
        console.log('Máquinas de exemplo criadas com sucesso');
        return { success: true, count: sampleMachines.length };
    } catch (error) {
        console.error('Erro ao criar máquinas de exemplo:', error);
        return { success: false, error: error.message };
    }
}

// Verificar se email já existe
async function checkEmailExists(email) {
    try {
        const methods = await auth.fetchSignInMethodsForEmail(email);
        return { exists: methods.length > 0, methods: methods };
    } catch (error) {
        console.error('Erro ao verificar email:', error);
        return { exists: false, error: error.message };
    }
}

// Enviar verificação de email
async function sendEmailVerification() {
    try {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        await user.sendEmailVerification();
        return { success: true, message: 'Email de verificação enviado!' };
    } catch (error) {
        console.error('Erro ao enviar verificação de email:', error);
        return { success: false, error: error.message };
    }
}

// Atualizar senha do usuário
async function updatePassword(newPassword) {
    try {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        await user.updatePassword(newPassword);
        return { success: true, message: 'Senha atualizada com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar senha:', error);
        return { success: false, error: error.message };
    }
}

// Excluir conta do usuário
async function deleteUserAccount() {
    try {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        // Primeiro excluir dados do Firestore
        try {
            await db.collection('users').doc(user.uid).delete();
            await db.collection('userNames').doc(user.uid).delete();
            
            // Excluir todas as máquinas
            const machinesSnapshot = await db.collection('users').doc(user.uid).collection('machines').get();
            const batch = db.batch();
            machinesSnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        } catch (firestoreError) {
            console.warn('Aviso ao excluir dados do Firestore:', firestoreError);
        }
        
        // Depois excluir a conta de autenticação
        await user.delete();
        
        // Limpar sessão
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('userData');
        
        return { success: true, message: 'Conta excluída com sucesso!' };
    } catch (error) {
        console.error('Erro ao excluir conta:', error);
        return { success: false, error: error.message };
    }
}

// Gerenciar sessão do usuário
function manageUserSession(user = null) {
    const currentUser = user || getCurrentUser();
    
    if (currentUser) {
        // Salvar dados básicos na sessionStorage para acesso rápido
        const userSession = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || currentUser.email.split('@')[0],
            emailVerified: currentUser.emailVerified,
            photoURL: currentUser.photoURL,
            provider: currentUser.providerData[0]?.providerId || 'email',
            timestamp: new Date().getTime()
        };
        sessionStorage.setItem('currentUser', JSON.stringify(userSession));
        
        // Salvar também no localStorage para persistência
        localStorage.setItem('userSession', JSON.stringify(userSession));
        
        console.log('Sessão gerenciada para:', userSession.email);
        return userSession;
    } else {
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('userSession');
        console.log('Sessão limpa');
        return null;
    }
}

// Verificar permissões do usuário
async function checkUserPermissions() {
    try {
        const user = getCurrentUser();
        if (!user) {
            return { authenticated: false };
        }

        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            return { 
                authenticated: true, 
                permissions: ['basic'],
                profileComplete: false
            };
        }

        const userData = userDoc.data();
        return {
            authenticated: true,
            permissions: userData.permissions || ['basic'],
            profileComplete: userData.profileCompleted || false,
            company: userData.company,
            lastLogin: userData.lastLogin,
            provider: userData.provider
        };
    } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        return { authenticated: false, error: error.message };
    }
}

// Verificar e criar dados do usuário se necessário
async function ensureUserData(user) {
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            console.log('Criando dados para usuário:', user.uid);
            const result = await initializeUserData(user, user.displayName);
            
            if (!result.success) {
                console.warn('Não foi possível criar dados do usuário:', result.error);
                return result;
            }
        } else {
            console.log('Dados do usuário já existem:', user.uid);
            
            // Verificar se o usuário tem máquinas
            const machinesSnapshot = await db.collection('users').doc(user.uid).collection('machines').limit(1).get();
            if (machinesSnapshot.empty) {
                console.log('Usuário não tem máquinas, criando exemplo...');
                await createSampleMachines(user.uid);
            }
        }
        
        return { success: true, exists: true };
    } catch (error) {
        console.error('Erro ao verificar dados do usuário:', error);
        return { success: false, error: error.message };
    }
}

// Verificar se o usuário já está logado
function checkIfLoggedIn() {
    return new Promise((resolve) => {
        if (!auth) {
            console.error('Auth não está inicializado');
            resolve(false);
            return;
        }

        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            resolve(!!user);
        }, (error) => {
            console.error('Erro ao verificar login:', error);
            unsubscribe();
            resolve(false);
        });
    });
}

// ===== FUNÇÕES DE REDIRECIONAMENTO SEGURO =====

// Redirecionar para área do cliente
function redirectToDashboard() {
    if (redirectInProgress) {
        console.log('Redirecionamento já em andamento');
        return;
    }

    redirectInProgress = true;
    
    // Verificar se já está na área do cliente
    if (window.location.pathname.includes('area-cliente.html')) {
        console.log('Já está na área do cliente');
        redirectInProgress = false;
        return;
    }

    console.log('Redirecionando para área do cliente...');
    
    // Pequeno delay para garantir que tudo esteja carregado
    setTimeout(() => {
        window.location.href = 'area-cliente.html';
        redirectInProgress = false;
    }, 500);
}

// Redirecionar para login
function redirectToLogin() {
    if (redirectInProgress) {
        console.log('Redirecionamento já em andamento');
        return;
    }

    redirectInProgress = true;
    
    // Verificar se já está na página de login
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('index.html')) {
        console.log('Já está na página de login');
        redirectInProgress = false;
        return;
    }

    console.log('Redirecionando para login...');
    
    // Limpar dados da sessão
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('userData');
    
    // Pequeno delay para garantir que tudo esteja carregado
    setTimeout(() => {
        window.location.href = 'login.html';
        redirectInProgress = false;
    }, 500);
}

// Verificar autenticação e redirecionar se necessário
function checkAuthAndRedirect() {
    const currentPath = window.location.pathname;
    const isProtectedPage = currentPath.includes('area-cliente.html');
    const isAuthPage = currentPath.includes('login.html') || currentPath.includes('index.html');
    
    console.log('Verificando autenticação para:', currentPath);
    console.log('Página protegida:', isProtectedPage);
    console.log('Página de autenticação:', isAuthPage);

    const user = getCurrentUser();
    const sessionUser = sessionStorage.getItem('currentUser');

    if (user || sessionUser) {
        // Usuário está autenticado
        console.log('Usuário autenticado detectado');
        
        // Se estiver em página de login, redirecionar para dashboard
        if (isAuthPage && !currentPath.includes('area-cliente.html')) {
            console.log('Usuário autenticado em página de login, redirecionando...');
            setTimeout(redirectToDashboard, 1000);
        }
        
        // Se for página protegida, garantir que os dados da sessão estão atualizados
        if (isProtectedPage) {
            manageUserSession(user);
        }
    } else {
        // Usuário não está autenticado
        console.log('Nenhum usuário autenticado detectado');
        
        // Se estiver em página protegida, redirecionar para login
        if (isProtectedPage) {
            console.log('Acesso não autorizado à página protegida, redirecionando...');
            setTimeout(redirectToLogin, 1000);
        }
    }
}

// ===== INICIALIZAÇÃO DO SISTEMA =====

// Inicializar sistema de autenticação
function initializeAuthSystem() {
    if (authInitialized) {
        console.log('Sistema de autenticação já inicializado');
        return;
    }

    console.log('Inicializando sistema de autenticação...');

    // Configurar listener para mudanças de autenticação
    const unsubscribe = onAuthStateChanged((user) => {
        console.log('Estado de autenticação alterado:', user ? `Usuário: ${user.email}` : 'Nenhum usuário');
        
        authCheckCompleted = true;
        
        if (user) {
            // Gerenciar sessão
            manageUserSession(user);
            
            // Garantir que os dados do usuário existam
            ensureUserData(user).then(result => {
                if (!result.success) {
                    console.warn('Aviso: Não foi possível verificar dados do usuário:', result.error);
                }
            });

            // Verificar e redirecionar se necessário
            setTimeout(() => {
                checkAuthAndRedirect();
            }, 500);
        } else {
            console.log('Usuário não autenticado');
            
            // Limpar dados da sessão
            sessionStorage.removeItem('currentUser');
            localStorage.removeItem('userData');
            
            // Verificar e redirecionar se necessário
            setTimeout(() => {
                checkAuthAndRedirect();
            }, 500);
        }
    });

    // Verificar autenticação inicial
    setTimeout(() => {
        if (!authCheckCompleted) {
            console.log('Verificação de autenticação inicial...');
            checkAuthAndRedirect();
        }
    }, 1000);

    // Configurar timeout para evitar loops infinitos
    setTimeout(() => {
        authInitialized = true;
        console.log('✅ Sistema de autenticação inicializado com sucesso!');
    }, 2000);

    // Retornar função para limpeza
    return unsubscribe;
}

// ===== FUNÇÃO DE INICIALIZAÇÃO ATUALIZADA =====

// Função para inicializar e verificar autenticação de forma segura
async function initializeAuth() {
    try {
        console.log('=== INICIALIZANDO AUTENTICAÇÃO ===');
        
        // Verificar se Firebase está carregado
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.error('Firebase não está carregado corretamente');
            throw new Error('Firebase não está disponível');
        }

        // Inicializar sistema
        initializeAuthSystem();

        // Verificar se há usuário na sessão
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
            try {
                const userData = JSON.parse(sessionUser);
                console.log('Usuário na sessão:', userData.email);
                
                // Verificar se o Firebase já tem um usuário
                const firebaseUser = getCurrentUser();
                if (!firebaseUser && auth) {
                    console.log('Sessão existe mas Firebase não tem usuário, verificando estado...');
                    // Aguardar um pouco para o Firebase se sincronizar
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (e) {
                console.error('Erro ao processar sessão:', e);
                sessionStorage.removeItem('currentUser');
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        return { success: false, error: error.message };
    }
}

// ===== EXPORTAÇÃO DAS FUNÇÕES =====

// Exportar funções para uso global
window.authFunctions = {
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateUserProfile,
    getCurrentUser,
    checkEmailExists,
    sendEmailVerification,
    updatePassword,
    deleteUserAccount,
    manageUserSession,
    checkUserPermissions,
    ensureUserData,
    initializeUserData,
    createSampleMachines,
    checkIfLoggedIn,
    checkAuthAndRedirect,
    initializeAuth,
    redirectToDashboard,
    redirectToLogin
};

// Inicializar automaticamente quando o script carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO SISTEMA DE AUTENTICAÇÃO ===');
    
    // Esperar um pouco para garantir que o Firebase esteja carregado
    setTimeout(() => {
        if (typeof auth !== 'undefined' && typeof db !== 'undefined') {
            initializeAuth().then(result => {
                if (result.success) {
                    console.log('✅ Sistema de autenticação pronto!');
                } else {
                    console.error('❌ Falha ao inicializar autenticação:', result.error);
                }
            });
        } else {
            console.warn('⚠️ Firebase não carregado, tentando novamente...');
            
            // Tentar novamente após 2 segundos
            setTimeout(() => {
                if (typeof auth !== 'undefined' && typeof db !== 'undefined') {
                    initializeAuth();
                } else {
                    console.error('❌ Firebase não carregado após tentativa');
                }
            }, 2000);
        }
    }, 500);
});

console.log('✅ Sistema de autenticação carregado com sucesso!');