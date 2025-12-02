// area-cliente.js - Versão Completa e Corrigida com Sistema de Tema e Chat Inteligente
let machines = [];
let chatHistory = [];
let isTyping = false;

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO ÁREA DO CLIENTE ===');
    
    // INICIALIZAR SISTEMA DE TEMA (PRIMEIRO!)
    initThemeSystem();
    
    // DEPOIS VERIFICAR AUTENTICAÇÃO
    checkAuthState();
});

// ===== SISTEMA DE TEMA ESCURO/CLARO =====
function initThemeSystem() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) {
        console.warn('⚠️ Botão de tema não encontrado na área do cliente!');
        return;
    }
    
    console.log('🎯 Inicializando sistema de tema na área do cliente...');
    
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
    
    console.log('✅ Sistema de tema na área do cliente pronto!');
}

function applyTheme(theme) {
    const html = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    const themeText = themeToggle?.querySelector('.theme-text');
    
    console.log(`🎨 Aplicando tema na área do cliente: ${theme === 'dark' ? 'ESCURO 🌙' : 'CLARO ☀️'}`);
    
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

// ===== SISTEMA DE AUTENTICAÇÃO FORTIFICADO =====
async function checkAuthState() {
    console.log('=== VERIFICANDO ESTADO DE AUTENTICAÇÃO ===');
    
    // Primeiro, verificar se há usuário na sessionStorage
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        console.log('❌ Nenhum usuário na sessão, verificando Firebase...');
        
        // Verificar se há usuário no Firebase
        if (auth && auth.currentUser) {
            console.log('✅ Usuário encontrado no Firebase:', auth.currentUser.email);
            await handleFirebaseUser(auth.currentUser);
        } else {
            console.log('❌ Nenhum usuário no Firebase, redirecionando para login...');
            redirectToLogin();
        }
        return;
    }
    
    try {
        const user = JSON.parse(currentUser);
        console.log('📋 Usuário da sessão:', user.email);
        
        // Verificar se o Firebase está carregado
        if (typeof auth === 'undefined') {
            console.error('❌ Firebase Auth não carregado');
            showMessage('Erro de autenticação. Faça login novamente.', 'error');
            setTimeout(redirectToLogin, 2000);
            return;
        }

        // Aguardar Firebase se necessário
        await waitForFirebase();
        
        if (auth.currentUser) {
            console.log('✅ Usuário autenticado no Firebase:', auth.currentUser.email);
            
            // Verificar se o email coincide
            if (auth.currentUser.email !== user.email) {
                console.warn('⚠️ Email diferente entre sessão e Firebase');
                redirectToLogin();
                return;
            }
            
            // Tudo ok, inicializar app
            initializeApp();
        } else {
            console.log('⚠️ Nenhum usuário no Firebase, tentando recuperar sessão...');
            await tryReauthentication(user.email);
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar autenticação:', error);
        showMessage('Erro de autenticação. Faça login novamente.', 'error');
        setTimeout(redirectToLogin, 2000);
    }
}

async function handleFirebaseUser(firebaseUser) {
    try {
        // Criar sessão do usuário
        const userSession = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            company: `Empresa ${firebaseUser.email.split('@')[0]}`,
            timestamp: new Date().getTime()
        };
        
        // Salvar na sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(userSession));
        
        console.log('✅ Sessão criada para:', firebaseUser.email);
        initializeApp();
        
    } catch (error) {
        console.error('❌ Erro ao criar sessão:', error);
        redirectToLogin();
    }
}

function redirectToLogin() {
    console.log('🔀 Redirecionando para login...');
    
    // Limpar dados da sessão
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('chatHistory');
    
    // Redirecionar após pequeno delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

async function waitForFirebase() {
    return new Promise((resolve) => {
        if (auth && db) {
            resolve();
            return;
        }
        
        let attempts = 0;
        const maxAttempts = 10;
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (auth && db) {
                clearInterval(checkInterval);
                console.log(`✅ Firebase carregado após ${attempts} tentativas`);
                resolve();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.warn(`⚠️ Firebase não carregado após ${maxAttempts} tentativas`);
                resolve();
            }
        }, 200);
    });
}

async function tryReauthentication(email) {
    return new Promise(async (resolve) => {
        console.log('🔄 Tentando reautenticação para:', email);
        
        // Primeiro verificar se já temos um usuário
        if (auth.currentUser) {
            console.log('✅ Já autenticado após wait:', auth.currentUser.email);
            initializeApp();
            resolve();
            return;
        }

        // Configurar listener para mudanças de estado
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                console.log('✅ Firebase Auth sincronizado:', firebaseUser.email);
                unsubscribe();
                
                // Atualizar sessão
                updateUserSession(firebaseUser);
                
                // Inicializar app
                initializeApp();
                resolve();
            } else {
                console.log('❌ Nenhum usuário autenticado no Firebase');
                unsubscribe();
                
                // Verificar se temos dados na sessionStorage
                const currentUser = sessionStorage.getItem('currentUser');
                if (currentUser) {
                    console.log('⚠️ Temos sessão mas não Firebase, tentando continuar...');
                    try {
                        const user = JSON.parse(currentUser);
                        loadUserInfo();
                        initializeApp();
                        resolve();
                        return;
                    } catch (e) {
                        console.error('Erro ao processar sessão:', e);
                    }
                }
                
                // Mostrar mensagem e redirecionar
                showMessage('Sessão expirada. Faça login novamente.', 'error');
                setTimeout(redirectToLogin, 2000);
                resolve();
            }
        });

        // Timeout para evitar espera infinita
        setTimeout(() => {
            unsubscribe();
            console.log('⏰ Timeout da reautenticação');
            
            // Verificar se temos dados na sessionStorage
            const currentUser = sessionStorage.getItem('currentUser');
            if (currentUser) {
                console.log('⚠️ Timeout, mas temos sessão, continuando...');
                try {
                    const user = JSON.parse(currentUser);
                    loadUserInfo();
                    initializeApp();
                } catch (e) {
                    console.error('Erro ao processar sessão:', e);
                    showMessage('Erro de conexão. Verificando autenticação...', 'warning');
                }
            }
            resolve();
        }, 5000);
    });
}

async function updateUserSession(firebaseUser) {
    try {
        let userData = null;
        
        // Tentar buscar dados do Firestore
        try {
            const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
            if (userDoc.exists) {
                userData = userDoc.data();
            }
        } catch (firestoreError) {
            console.warn('⚠️ Não foi possível buscar dados do Firestore:', firestoreError);
        }
        
        // Criar objeto de sessão
        const userSession = {
            uid: firebaseUser.uid,
            name: userData?.name || firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            company: userData?.company || `Empresa ${firebaseUser.email.split('@')[0]}`,
            timestamp: new Date().getTime()
        };
        
        // Salvar na sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(userSession));
        console.log('✅ Sessão atualizada:', userSession.email);
        
    } catch (error) {
        console.error('❌ Erro ao atualizar sessão:', error);
        
        // Criar sessão mínima em caso de erro
        const userSession = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            email: firebaseUser.email,
            company: `Empresa ${firebaseUser.email.split('@')[0]}`,
            timestamp: new Date().getTime()
        };
        sessionStorage.setItem('currentUser', JSON.stringify(userSession));
    }
}

function loadUserInfo() {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            throw new Error('Nenhum usuário na sessão');
        }
        
        const user = JSON.parse(currentUser);
        console.log('👤 Carregando informações do usuário:', user.name);
        
        if (!user.name || typeof user.name !== 'string') {
            throw new Error('Nome do usuário inválido');
        }
        
        document.getElementById('user-name').textContent = user.name;
        document.getElementById('user-company').textContent = user.company || 'Empresa';
        
        const avatar = document.getElementById('user-avatar');
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        avatar.textContent = initials || 'U';
        
    } catch (error) {
        console.error('❌ Erro ao carregar informações do usuário:', error);
        document.getElementById('user-name').textContent = 'Usuário';
        document.getElementById('user-company').textContent = 'Empresa';
        document.getElementById('user-avatar').textContent = 'U';
    }
}

function initializeApp() {
    console.log('🚀 Inicializando aplicação...');
    
    try {
        // 1. Carregar informações do usuário
        loadUserInfo();
        
        // 2. Configurar event listeners
        setupEventListeners();
        
        // 3. Configurar modal de máquinas
        setupModal();
        
        // 4. Configurar sistema de busca
        setupSearch();
        
        // 5. Configurar chat
        setupChat();
        
        // 6. Carregar máquinas do Firebase
        loadMachines();
        
        // 7. Adicionar estilos dinâmicos
        addDynamicStyles();
        
        console.log('✅ Aplicação inicializada com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar aplicação:', error);
        showMessage('Erro ao carregar aplicação. Tente recarregar a página.', 'error');
    }
}

// ===== SISTEMA DE MÁQUINAS =====
function setupModal() {
    const modal = document.getElementById('machine-modal');
    const closeBtn = document.querySelector('.close-modal');
    const cancelBtn = document.getElementById('cancel-machine');
    const saveBtn = document.getElementById('save-machine');
    const addBtn = document.getElementById('add-machine-btn');

    if (addBtn) {
        addBtn.addEventListener('click', () => openMachineModal());
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', saveMachine);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    console.log('✅ Modal configurado');
}

function openMachineModal(machine = null) {
    const modal = document.getElementById('machine-modal');
    const title = document.getElementById('modal-title');
    
    if (machine) {
        title.textContent = 'Editar Máquina';
        document.getElementById('machine-id').value = machine.id;
        document.getElementById('machine-name').value = machine.name;
        document.getElementById('machine-temperature').value = machine.temperature;
        document.getElementById('machine-vibration').value = machine.vibration;
        document.getElementById('machine-pressure').value = machine.pressure;
        document.getElementById('machine-efficiency').value = machine.efficiency;
        document.getElementById('machine-status').value = machine.status;
        document.getElementById('machine-last-update').value = machine.lastUpdate;
    } else {
        title.textContent = 'Adicionar Nova Máquina';
        document.getElementById('machine-form').reset();
        document.getElementById('machine-id').value = '';
        document.getElementById('machine-last-update').value = new Date().toISOString().split('T')[0];
    }
    
    modal.classList.add('show');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('machine-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

async function saveMachine() {
    const machineId = document.getElementById('machine-id').value;
    
    // Validar dados
    const machineData = {
        name: document.getElementById('machine-name').value.trim(),
        temperature: parseFloat(document.getElementById('machine-temperature').value),
        vibration: parseFloat(document.getElementById('machine-vibration').value),
        pressure: parseInt(document.getElementById('machine-pressure').value),
        efficiency: parseFloat(document.getElementById('machine-efficiency').value),
        status: document.getElementById('machine-status').value,
        lastUpdate: document.getElementById('machine-last-update').value,
        updatedAt: new Date()
    };

    // Validações
    if (!machineData.name) {
        showAlert('Por favor, informe o nome da máquina.', 'error');
        return;
    }

    if (isNaN(machineData.temperature) || machineData.temperature < 0 || machineData.temperature > 200) {
        showAlert('Temperatura deve ser um número entre 0 e 200°C.', 'error');
        return;
    }

    if (isNaN(machineData.vibration) || machineData.vibration < 0 || machineData.vibration > 10) {
        showAlert('Vibração deve ser um número entre 0 e 10 mm/s.', 'error');
        return;
    }

    if (isNaN(machineData.pressure) || machineData.pressure < 0 || machineData.pressure > 300) {
        showAlert('Pressão deve ser um número entre 0 e 300 PSI.', 'error');
        return;
    }

    if (isNaN(machineData.efficiency) || machineData.efficiency < 0 || machineData.efficiency > 100) {
        showAlert('Eficiência deve ser um número entre 0 e 100%.', 'error');
        return;
    }

    const loadingMessage = showMessage('Salvando máquina...', 'loading');

    try {
        let result;
        if (machineId) {
            console.log('🔄 Atualizando máquina:', machineId);
            result = await updateMachineInFirebase(machineId, machineData);
        } else {
            console.log('➕ Adicionando nova máquina');
            result = await addMachineToFirebase(machineData);
        }
        
        // Remover mensagem de carregamento
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        if (result.success) {
            showAlert(result.message, 'success');
            closeModal();
            setTimeout(() => {
                loadMachines();
            }, 1000);
        } else {
            showAlert('Erro ao salvar máquina: ' + result.error, 'error');
        }
    } catch (error) {
        // Remover mensagem de carregamento em caso de erro
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        console.error('❌ Erro ao salvar máquina:', error);
        showAlert('Erro ao salvar máquina. Tente novamente.', 'error');
    }
}

async function addMachineToFirebase(machineData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        console.log('📝 Adicionando máquina para usuário:', user.uid);
        
        const docRef = await db.collection('users')
            .doc(user.uid)
            .collection('machines')
            .add({
                ...machineData,
                createdAt: new Date(),
                userId: user.uid
            });
        
        console.log('✅ Máquina adicionada com ID:', docRef.id);
        return { 
            success: true, 
            message: 'Máquina adicionada com sucesso!', 
            id: docRef.id 
        };
    } catch (error) {
        console.error('❌ Erro ao adicionar máquina:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

async function updateMachineInFirebase(machineId, machineData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        await db.collection('users')
            .doc(user.uid)
            .collection('machines')
            .doc(machineId)
            .update(machineData);
            
        return { 
            success: true, 
            message: 'Máquina atualizada com sucesso!' 
        };
    } catch (error) {
        console.error('❌ Erro ao atualizar máquina:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

async function loadMachines() {
    console.log('=== CARREGANDO MÁQUINAS DO FIREBASE ===');
    
    try {
        // Verificar se temos usuário
        const user = auth.currentUser;
        if (!user) {
            // Tentar obter da sessão
            const sessionUser = sessionStorage.getItem('currentUser');
            if (!sessionUser) {
                throw new Error('Usuário não autenticado');
            }
            
            const userData = JSON.parse(sessionUser);
            console.log('⚠️ Usando usuário da sessão:', userData.email);
            
            // Mostrar mensagem informativa
            showMessage('Carregando máquinas...', 'info', 3000);
            
            // Carregar máquinas mock para demonstração
            setTimeout(() => {
                loadMockMachines();
            }, 1500);
            return;
        }

        console.log('🔍 Buscando máquinas para usuário:', user.uid);
        
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection('machines')
            .orderBy('createdAt', 'desc')
            .get();
            
        machines = [];
        
        console.log('📊 Documentos encontrados:', snapshot.size);
        
        if (snapshot.empty) {
            console.log('ℹ️ Nenhuma máquina encontrada no Firebase');
            showMessage('Nenhuma máquina cadastrada. Adicione sua primeira máquina!', 'info', 3000);
            
            // Mostrar estado vazio
            displayMachines(machines);
        } else {
            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log('🔧 Máquina encontrada:', doc.id, data.name);
                
                machines.push({
                    id: doc.id,
                    name: data.name || 'Sem nome',
                    temperature: data.temperature || 0,
                    vibration: data.vibration || 0,
                    pressure: data.pressure || 0,
                    efficiency: data.efficiency || 0,
                    status: data.status || 'active',
                    lastUpdate: data.lastUpdate || new Date().toISOString().split('T')[0],
                    createdAt: data.createdAt || new Date()
                });
            });
            
            showMessage(`${machines.length} máquinas carregadas com sucesso!`, 'success', 3000);
            
            // Exibir máquinas
            displayMachines(machines);
        }

        console.log(`✅ Total de máquinas carregadas: ${machines.length}`);
        
    } catch (error) {
        console.error('❌ Erro ao carregar máquinas do Firebase:', error);
        
        // Tentar carregar máquinas mock em caso de erro
        showMessage('Erro ao carregar máquinas. Carregando dados de demonstração...', 'warning');
        
        setTimeout(() => {
            loadMockMachines();
        }, 1000);
    }

    updateAllReports();
    
    // Carregar histórico do chat após carregar máquinas
    setTimeout(() => {
        loadChatHistory();
    }, 500);
}

function loadMockMachines() {
    console.log('🔧 Carregando máquinas de demonstração...');
    
    // Máquinas mock para demonstração
    machines = [
        {
            id: 'mock-1',
            name: 'Compressor Principal',
            temperature: 75.5,
            vibration: 2.1,
            pressure: 150,
            efficiency: 92.5,
            status: 'active',
            lastUpdate: new Date().toISOString().split('T')[0]
        },
        {
            id: 'mock-2',
            name: 'Turbina T-202',
            temperature: 82.3,
            vibration: 3.8,
            pressure: 180,
            efficiency: 78.2,
            status: 'warning',
            lastUpdate: new Date().toISOString().split('T')[0]
        },
        {
            id: 'mock-3',
            name: 'Gerador G-15',
            temperature: 68.7,
            vibration: 1.5,
            pressure: 120,
            efficiency: 95.0,
            status: 'active',
            lastUpdate: new Date(Date.now() - 86400000).toISOString().split('T')[0]
        },
        {
            id: 'mock-4',
            name: 'Bomba Hidráulica',
            temperature: 71.2,
            vibration: 2.8,
            pressure: 135,
            efficiency: 88.3,
            status: 'active',
            lastUpdate: new Date(Date.now() - 172800000).toISOString().split('T')[0]
        }
    ];
    
    displayMachines(machines);
    updateAllReports();
    
    showMessage('Dados de demonstração carregados!', 'info', 3000);
}

function displayMachines(machinesArray = machines) {
    const container = document.getElementById('machines-container');
    if (!container) {
        console.error('❌ Container de máquinas não encontrado!');
        return;
    }

    console.log(`📱 Exibindo ${machinesArray.length} máquinas`);

    updateMachineCounters(machinesArray);

    if (machinesArray.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-cogs"></i>
                <h3>Nenhuma máquina cadastrada</h3>
                <p>Clique em "Adicionar Máquina" para começar o monitoramento</p>
            </div>
        `;
        return;
    }

    container.innerHTML = machinesArray.map(machine => `
        <div class="machine-card">
            <div class="machine-header">
                <div class="machine-name">${escapeHtml(machine.name)}</div>
                <div class="machine-status">
                    <span class="status-indicator ${getStatusClass(machine.status)}"></span>
                    <span>${getStatusText(machine.status)}</span>
                </div>
            </div>
            <div class="machine-body">
                <div class="machine-data">
                    <div class="data-row">
                        <span class="data-label">Temperatura</span>
                        <span class="data-value">${machine.temperature}°C</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Vibração</span>
                        <span class="data-value">${machine.vibration} mm/s</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Pressão</span>
                        <span class="data-value">${machine.pressure} PSI</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Eficiência</span>
                        <span class="data-value">${machine.efficiency}%</span>
                    </div>
                </div>
            </div>
            <div class="machine-footer">
                <div class="last-update">Última atualização: ${formatDate(machine.lastUpdate)}</div>
                <div class="machine-actions">
                    <button class="btn-icon btn-edit" onclick="editMachine('${machine.id}')" title="Editar máquina">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteMachine('${machine.id}')" title="Excluir máquina">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    console.log('✅ Dashboard atualizado com sucesso');
}

function updateMachineCounters(machinesArray) {
    const totalMachinesElement = document.getElementById('total-machines-header');
    const activeMachinesElement = document.getElementById('active-machines-count');
    const machineCountElement = document.getElementById('machine-count');
    const warningCountElement = document.getElementById('warning-count');
    const normalCountElement = document.getElementById('normal-count');
    
    if (totalMachinesElement) totalMachinesElement.textContent = machinesArray.length;
    if (machineCountElement) machineCountElement.textContent = machinesArray.length;
    
    const activeCount = machinesArray.filter(m => m.status === 'active').length;
    if (activeMachinesElement) activeMachinesElement.textContent = activeCount;

    const warningCount = machinesArray.filter(m => m.status === 'warning' || m.status === 'danger').length;
    const normalCount = machinesArray.filter(m => m.status === 'active').length;
    
    if (warningCountElement) warningCountElement.textContent = warningCount;
    if (normalCountElement) normalCountElement.textContent = normalCount;
}

function editMachine(id) {
    const machine = machines.find(m => m.id === id);
    if (machine) {
        openMachineModal(machine);
    } else {
        showAlert('Máquina não encontrada para edição', 'error');
    }
}

async function deleteMachine(id) {
    if (!confirm('Tem certeza que deseja excluir esta máquina?\nEsta ação não pode ser desfeita.')) {
        return;
    }

    // Mostrar mensagem de carregamento e guardar referência
    const loadingMessage = showMessage('Excluindo máquina...', 'loading');

    try {
        // Verificar se é uma máquina mock
        if (id.startsWith('mock-')) {
            // Remover da lista local
            machines = machines.filter(m => m.id !== id);
            displayMachines();
            updateAllReports();
            
            // Remover mensagem de carregamento
            if (loadingMessage && loadingMessage.parentNode) {
                loadingMessage.remove();
            }
            
            showAlert('Máquina excluída com sucesso!', 'success');
            return;
        }

        // Se não for mock, excluir do Firebase
        const user = auth.currentUser;
        if (!user) throw new Error('Usuário não autenticado');

        await db.collection('users')
            .doc(user.uid)
            .collection('machines')
            .doc(id)
            .delete();
        
        // Remover mensagem de carregamento
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        showAlert('Máquina excluída com sucesso!', 'success');
        
        machines = machines.filter(m => m.id !== id);
        displayMachines();
        updateAllReports();
        
    } catch (error) {
        // Remover mensagem de carregamento em caso de erro
        if (loadingMessage && loadingMessage.parentNode) {
            loadingMessage.remove();
        }
        
        console.error('❌ Erro ao excluir máquina:', error);
        showAlert('Erro ao excluir máquina: ' + error.message, 'error');
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-machine');
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase().trim();
                if (searchTerm === '') {
                    displayMachines(machines);
                } else {
                    const filteredMachines = machines.filter(machine => 
                        machine.name.toLowerCase().includes(searchTerm)
                    );
                    displayFilteredMachines(filteredMachines);
                }
            }, 300);
        });
    }
    
    console.log('✅ Sistema de busca configurado');
}

function displayFilteredMachines(filteredMachines) {
    const container = document.getElementById('machines-container');
    if (!container) return;

    if (filteredMachines.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Nenhuma máquina encontrada</h3>
                <p>Tente ajustar os termos da sua pesquisa</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredMachines.map(machine => `
        <div class="machine-card">
            <div class="machine-header">
                <div class="machine-name">${escapeHtml(machine.name)}</div>
                <div class="machine-status">
                    <span class="status-indicator ${getStatusClass(machine.status)}"></span>
                    <span>${getStatusText(machine.status)}</span>
                </div>
            </div>
            <div class="machine-body">
                <div class="machine-data">
                    <div class="data-row">
                        <span class="data-label">Temperatura</span>
                        <span class="data-value">${machine.temperature}°C</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Vibração</span>
                        <span class="data-value">${machine.vibration} mm/s</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Pressão</span>
                        <span class="data-value">${machine.pressure} PSI</span>
                    </div>
                    <div class="data-row">
                        <span class="data-label">Eficiência</span>
                        <span class="data-value">${machine.efficiency}%</span>
                    </div>
                </div>
            </div>
            <div class="machine-footer">
                <div class="last-update">Última atualização: ${formatDate(machine.lastUpdate)}</div>
                <div class="machine-actions">
                    <button class="btn-icon btn-edit" onclick="editMachine('${machine.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteMachine('${machine.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== RELATÓRIOS =====
function updateAllReports() {
    console.log('📊 Atualizando relatórios...');
    
    updateReport1();
    updateReport2();
    updateReport3();
}

function updateReport1() {
    const avgEfficiencyElement = document.getElementById('avg-efficiency');
    const totalMachinesElement = document.getElementById('report-total-machines');
    const warningMachinesElement = document.getElementById('warning-machines');

    if (!avgEfficiencyElement) return;

    if (machines.length === 0) {
        avgEfficiencyElement.textContent = '0%';
        if (totalMachinesElement) totalMachinesElement.textContent = '0';
        if (warningMachinesElement) warningMachinesElement.textContent = '0';
        return;
    }

    const totalEfficiency = machines.reduce((sum, m) => sum + (parseFloat(m.efficiency) || 0), 0);
    const avgEfficiency = (totalEfficiency / machines.length).toFixed(1);
    const warningMachines = machines.filter(m => m.status === 'warning' || m.status === 'danger').length;
    
    avgEfficiencyElement.textContent = `${avgEfficiency}%`;
    if (totalMachinesElement) totalMachinesElement.textContent = machines.length;
    if (warningMachinesElement) warningMachinesElement.textContent = warningMachines;
}

function updateReport2() {
    const totalAnomaliesElement = document.getElementById('total-anomalies');
    const criticalAnomaliesElement = document.getElementById('critical-anomalies');
    const warningAnomaliesElement = document.getElementById('warning-anomalies');
    const infoAnomaliesElement = document.getElementById('info-anomalies');

    if (!totalAnomaliesElement) return;

    const criticalAnomalies = machines.filter(m => m.status === 'danger').length;
    const warningAnomalies = machines.filter(m => m.status === 'warning').length;
    const infoAnomalies = machines.filter(m => m.status === 'active').length;
    const totalAnomalies = criticalAnomalies + warningAnomalies;
    
    totalAnomaliesElement.textContent = totalAnomalies;
    if (criticalAnomaliesElement) criticalAnomaliesElement.textContent = criticalAnomalies;
    if (warningAnomaliesElement) warningAnomaliesElement.textContent = warningAnomalies;
    if (infoAnomaliesElement) infoAnomaliesElement.textContent = infoAnomalies;
}

function updateReport3() {
    const energyConsumptionElement = document.getElementById('energy-consumption');
    const energyCostElement = document.getElementById('energy-cost');
    const bestMachineElement = document.getElementById('best-machine');

    if (!energyConsumptionElement) return;

    const energyConsumption = machines.length * 150;
    const energyCost = (energyConsumption * 0.85).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
    
    let bestMachine = 'Nenhuma máquina';
    if (machines.length > 0) {
        const best = machines.reduce((best, current) => {
            const currentEff = parseFloat(current.efficiency) || 0;
            const bestEff = parseFloat(best.efficiency) || 0;
            return currentEff > bestEff ? current : best;
        });
        bestMachine = best.name;
    }
    
    energyConsumptionElement.textContent = energyConsumption;
    if (energyCostElement) energyCostElement.textContent = energyCost;
    if (bestMachineElement) bestMachineElement.textContent = bestMachine;
}

// ===== SISTEMA DE CHAT INTELIGENTE =====
function setupChat() {
    const sendBtn = document.getElementById('send-message');
    const chatInput = document.getElementById('chat-input');
    
    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Configurar ações rápidas
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
    
    console.log('✅ Chat configurado');
}

function loadChatHistory() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    // Limpar mensagens existentes
    chatMessages.innerHTML = '';

    // Mensagem de boas-vindas inicial
    addBotMessage("Olá! Eu sou o assistente virtual do Predictive Pulse. Posso ajudá-lo a monitorar suas máquinas, analisar dados e tomar decisões. Como posso ser útil hoje?");
    
    // Carregar histórico do localStorage
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        try {
            chatHistory = JSON.parse(savedHistory);
            chatHistory.forEach(msg => {
                if (msg.type === 'user') {
                    addUserMessage(msg.content, false);
                } else if (msg.type === 'bot') {
                    addBotMessage(msg.content, false);
                }
            });
            console.log('✅ Histórico do chat carregado:', chatHistory.length, 'mensagens');
        } catch (e) {
            console.error('❌ Erro ao carregar histórico do chat:', e);
            chatHistory = [];
        }
    }
}

function handleQuickAction(action) {
    switch(action) {
        case 'status-sistema':
            sendSystemStatus();
            break;
        case 'alertas':
            sendAlertsStatus();
            break;
        case 'dicas-manutencao':
            sendMaintenanceTips();
            break;
        case 'contato-suporte':
            showContactSupport();
            break;
        default:
            addBotMessage("Como posso ajudá-lo com isso?");
    }
}

function sendSystemStatus() {
    addUserMessage("Qual é o status do sistema?");
    
    setTimeout(() => {
        const totalMachines = machines.length;
        const activeMachines = machines.filter(m => m.status === 'active').length;
        const warningMachines = machines.filter(m => m.status === 'warning').length;
        const criticalMachines = machines.filter(m => m.status === 'danger').length;
        
        let statusMessage = `<strong>Status do Sistema:</strong><br><br>`;
        
        if (totalMachines === 0) {
            statusMessage += "⚠️ Nenhuma máquina cadastrada. Adicione máquinas para começar o monitoramento.";
        } else {
            statusMessage += `✅ <strong>${totalMachines}</strong> máquina(s) monitorada(s)<br>`;
            statusMessage += `🟢 <strong>${activeMachines}</strong> normal(is)<br>`;
            statusMessage += `🟡 <strong>${warningMachines}</strong> com atenção<br>`;
            statusMessage += `🔴 <strong>${criticalMachines}</strong> crítica(s)<br><br>`;
            
            // Calcula eficiência média
            const avgEfficiency = machines.reduce((sum, m) => sum + (parseFloat(m.efficiency) || 0), 0) / totalMachines;
            statusMessage += `📊 <strong>Eficiência média:</strong> ${avgEfficiency.toFixed(1)}%`;
            
            // Recomendações baseadas no status
            if (criticalMachines > 0) {
                statusMessage += `<br><br><strong>⚠️ AÇÃO NECESSÁRIA:</strong> Há ${criticalMachines} máquina(s) em estado crítico que requerem atenção imediata.`;
            } else if (warningMachines > 0) {
                statusMessage += `<br><br><strong>📋 RECOMENDAÇÃO:</strong> ${warningMachines} máquina(s) precisam de verificação preventiva.`;
            }
        }
        
        addBotMessage(statusMessage);
    }, 500);
}

function sendAlertsStatus() {
    addUserMessage("Quais são os alertas atuais?");
    
    setTimeout(() => {
        const warningMachines = machines.filter(m => m.status === 'warning');
        const criticalMachines = machines.filter(m => m.status === 'danger');
        
        let alertMessage = `<strong>Alertas Atuais:</strong><br><br>`;
        
        if (warningMachines.length === 0 && criticalMachines.length === 0) {
            alertMessage += "✅ <strong>Sistema estável</strong><br>Nenhum alerta ativo no momento.";
        } else {
            if (criticalMachines.length > 0) {
                alertMessage += `🔴 <strong>CRÍTICO (${criticalMachines.length}):</strong><ul class="machine-list">`;
                criticalMachines.slice(0, 3).forEach(machine => {
                    alertMessage += `<li>${escapeHtml(machine.name)} - Eficiência: ${machine.efficiency}%</li>`;
                });
                alertMessage += `</ul>`;
                if (criticalMachines.length > 3) {
                    alertMessage += `<em>... e mais ${criticalMachines.length - 3} máquina(s)</em><br>`;
                }
                alertMessage += `<br><strong>🚨 Ação Recomendada:</strong> Verificação imediata necessária.`;
            }
            
            if (warningMachines.length > 0) {
                alertMessage += `<br><br>🟡 <strong>ATENÇÃO (${warningMachines.length}):</strong><ul class="machine-list">`;
                warningMachines.slice(0, 3).forEach(machine => {
                    alertMessage += `<li>${escapeHtml(machine.name)} - Eficiência: ${machine.efficiency}%</li>`;
                });
                alertMessage += `</ul>`;
                if (warningMachines.length > 3) {
                    alertMessage += `<em>... e mais ${warningMachines.length - 3} máquina(s)</em>`;
                }
                alertMessage += `<br><br><strong>📋 Ação Recomendada:</strong> Agende manutenção preventiva nas próximas 72 horas.`;
            }
        }
        
        addBotMessage(alertMessage);
    }, 500);
}

function sendMaintenanceTips() {
    addUserMessage("Quais dicas de manutenção você tem?");
    
    setTimeout(() => {
        const tips = [
            "🔧 <strong>Manutenção Preventiva:</strong> Realize calibração mensal dos sensores.",
            "📈 <strong>Monitoramento Contínuo:</strong> Verifique relatórios de eficiência.",
            "🌡️ <strong>Controle de Temperatura:</strong> Mantenha ambiente abaixo de 35°C para prolongar vida útil.",
            "🔊 <strong>Análise de Vibração:</strong> Valores acima de 3.5 mm/s indicam desgaste.",
            "⚡ <strong>Eficiência Energética:</strong> Máquinas abaixo de 80% de eficiência consomem 25% mais energia.",
            "📋 <strong>Checklist Diário:</strong> Verifique pressão, temperatura e ruídos anormais.",
            "🔍 <strong>Inspeção Visual:</strong> Procure por vazamentos e desgastes visíveis."
        ];
        
        const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 4);
        
        let tipsMessage = `<strong>Dicas de Manutenção:</strong><br><br>`;
        tipsMessage += randomTips.join('<br>');
        tipsMessage += `<br><br><strong>💡 Dica Extra:</strong> Configure alertas automáticos no sistema para monitoramento proativo.`;
        
        addBotMessage(tipsMessage);
    }, 500);
}

function showContactSupport() {
    addUserMessage("Preciso falar com o suporte técnico");
    
    setTimeout(() => {
        const contactMessage = `
            <strong>Suporte Técnico:</strong><br><br>
            📞 <strong>Telefone:</strong> +55 (21) 99834-5897<br>
            📧 <strong>Email:</strong> suporte@predictivepulse.com<br>
            🕐 <strong>Horário:</strong> Seg-Sex: 08:00-18:00<br><br>
            
            <strong>Para atendimento rápido:</strong><br>
            1. Tenha o código da máquina em mãos<br>
            2. Descreva o problema com detalhes<br>
            3. Informe se há algum alerta crítico<br><br>
            
            <em>⏳ Tempo médio de resposta: 15 minutos</em>
        `;
        
        addBotMessage(contactMessage);
    }, 500);
}

async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message || isTyping) return;
    
    chatInput.value = '';
    addUserMessage(message);
    
    // Salvar no histórico
    chatHistory.push({ type: 'user', content: message, timestamp: new Date() });
    saveChatHistory();
    
    // Simular digitação
    isTyping = true;
    showTypingIndicator();
    
    setTimeout(() => {
        hideTypingIndicator();
        const response = generateIntelligentResponse(message);
        addBotMessage(response);
        
        // Salvar resposta no histórico
        chatHistory.push({ type: 'bot', content: response, timestamp: new Date() });
        saveChatHistory();
        
        isTyping = false;
    }, 1500);
}

function generateIntelligentResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Análise de contexto
    const keywords = {
        'status': ['status', 'sistema', 'como está', 'situação'],
        'eficiencia': ['eficiência', 'performance', 'rendimento'],
        'alerta': ['alerta', 'problema', 'erro', 'falha', 'crítico'],
        'máquina': ['máquina', 'equipamento', 'compressor', 'motor'],
        'relatorio': ['relatório', 'dados', 'estatística'],
        'ajuda': ['ajuda', 'ajudar', 'como usar', 'funciona'],
        'manutenção': ['manutenção', 'preventiva', 'corretiva'],
        'temperatura': ['temperatura', 'calor', 'frio'],
        'vibração': ['vibração', 'tremer', 'oscilação'],
        'pressão': ['pressão', 'psi', 'bar']
    };
    
    // Identificar tipo de pergunta
    let questionType = 'geral';
    for (const [type, words] of Object.entries(keywords)) {
        if (words.some(word => lowerMessage.includes(word))) {
            questionType = type;
            break;
        }
    }
    
    // Gerar resposta baseada no tipo
    switch(questionType) {
        case 'status':
            return generateSystemStatusResponse();
        case 'eficiencia':
            return generateEfficiencyResponse();
        case 'alerta':
            return generateAlertResponse();
        case 'máquina':
            return generateMachineSpecificResponse(message);
        case 'relatorio':
            return generateReportResponse();
        case 'manutenção':
            return generateMaintenanceResponse();
        case 'temperatura':
        case 'vibração':
        case 'pressão':
            return generateParameterResponse(questionType);
        default:
            return generateGeneralResponse(message);
    }
}

function generateSystemStatusResponse() {
    if (machines.length === 0) {
        return "Atualmente não há máquinas cadastradas para monitoramento. Adicione máquinas para começar a receber análises do sistema.";
    }
    
    const total = machines.length;
    const normal = machines.filter(m => m.status === 'active').length;
    const warning = machines.filter(m => m.status === 'warning').length;
    const critical = machines.filter(m => m.status === 'danger').length;
    const avgEff = machines.reduce((sum, m) => sum + (parseFloat(m.efficiency) || 0), 0) / total;
    
    let response = `<strong>📊 Status do Sistema:</strong><br>`;
    response += `• Total de máquinas: ${total}<br>`;
    response += `• Status normal: ${normal} (${Math.round((normal/total)*100)}%)<br>`;
    response += `• Requer atenção: ${warning}<br>`;
    response += `• Estado crítico: ${critical}<br>`;
    response += `• Eficiência média: ${avgEff.toFixed(1)}%<br><br>`;
    
    if (critical > 0) {
        response += `🚨 <strong>AÇÃO IMEDIATA NECESSÁRIA:</strong> Há ${critical} máquina(s) em estado crítico.`;
    } else if (warning > 0) {
        response += `⚠️ <strong>RECOMENDAÇÃO:</strong> ${warning} máquina(s) precisam de verificação preventiva.`;
    } else {
        response += `✅ <strong>SISTEMA ESTÁVEL:</strong> Todas as máquinas operando normalmente.`;
    }
    
    return response;
}

function generateEfficiencyResponse() {
    if (machines.length === 0) {
        return "Não há dados de eficiência disponíveis. Adicione máquinas para começar o monitoramento.";
    }
    
    const avgEff = machines.reduce((sum, m) => sum + (parseFloat(m.efficiency) || 0), 0) / machines.length;
    const bestMachine = machines.reduce((best, current) => 
        parseFloat(current.efficiency) > parseFloat(best.efficiency) ? current : best
    );
    const worstMachine = machines.reduce((worst, current) => 
        parseFloat(current.efficiency) < parseFloat(worst.efficiency) ? current : worst
    );
    
    let response = `<strong>📈 Análise de Eficiência:</strong><br>`;
    response += `• Eficiência média: ${avgEff.toFixed(1)}%<br>`;
    response += `• Máquina mais eficiente: ${escapeHtml(bestMachine.name)} (${bestMachine.efficiency}%)<br>`;
    response += `• Máquina menos eficiente: ${escapeHtml(worstMachine.name)} (${worstMachine.efficiency}%)<br><br>`;
    
    if (avgEff > 85) {
        response += `✅ <strong>EXCELENTE DESEMPENHO:</strong> Suas máquinas estão operando com alta eficiência.`;
    } else if (avgEff > 70) {
        response += `🟡 <strong>DESEMPENHO REGULAR:</strong> Considere otimizações para melhorar a eficiência.`;
        response += `<br>💡 <em>Sugestão:</em> Verifique calibração dos sensores e condições operacionais.`;
    } else {
        response += `🔴 <strong>DESEMPENHO BAIXO:</strong> Recomendo análise detalhada das causas.`;
        response += `<br>🛠️ <em>Ação recomendada:</em> Agende manutenção preventiva urgente.`;
    }
    
    return response;
}

function generateAlertResponse() {
    const criticalMachines = machines.filter(m => m.status === 'danger');
    const warningMachines = machines.filter(m => m.status === 'warning');
    
    if (criticalMachines.length === 0 && warningMachines.length === 0) {
        return "✅ <strong>NENHUM ALERTA ATIVO:</strong> Todas as máquinas estão operando dentro dos parâmetros normais.";
    }
    
    let response = `<strong>🚨 ALERTAS ATIVOS:</strong><br><br>`;
    
    if (criticalMachines.length > 0) {
        response += `🔴 <strong>CRÍTICO (${criticalMachines.length}):</strong><br>`;
        criticalMachines.forEach(machine => {
            response += `• ${escapeHtml(machine.name)}: Eficiência ${machine.efficiency}%<br>`;
        });
        response += `<br><strong>AÇÃO IMEDIATA:</strong> Estas máquinas requerem intervenção urgente.<br>`;
    }
    
    if (warningMachines.length > 0) {
        response += `<br>🟡 <strong>ATENÇÃO (${warningMachines.length}):</strong><br>`;
        warningMachines.slice(0, 3).forEach(machine => {
            response += `• ${escapeHtml(machine.name)}: Eficiência ${machine.efficiency}%<br>`;
        });
        if (warningMachines.length > 3) {
            response += `• ... e mais ${warningMachines.length - 3} máquina(s)<br>`;
        }
        response += `<br><strong>AÇÃO PREVENTIVA:</strong> Agende manutenção nas próximas 72 horas.`;
    }
    
    return response;
}

function generateMachineSpecificResponse(message) {
    // Tentar encontrar nome da máquina na mensagem
    const machineNames = machines.map(m => m.name.toLowerCase());
    let foundMachine = null;
    
    for (const machineName of machineNames) {
        if (message.toLowerCase().includes(machineName)) {
            foundMachine = machines.find(m => m.name.toLowerCase() === machineName);
            break;
        }
    }
    
    if (!foundMachine && machines.length > 0) {
        // Se não encontrou, listar as máquinas
        let response = `<strong>Máquinas Disponíveis:</strong><br><br>`;
        machines.forEach(machine => {
            const statusIcon = machine.status === 'active' ? '🟢' : machine.status === 'warning' ? '🟡' : '🔴';
            response += `${statusIcon} ${escapeHtml(machine.name)} (${machine.efficiency}%)<br>`;
        });
        response += `<br>Para informações específicas, mencione o nome da máquina.`;
        return response;
    }
    
    if (!foundMachine) {
        return "Não há máquinas cadastradas no momento. Adicione máquinas para começar o monitoramento.";
    }
    
    // Resposta específica da máquina
    let response = `<strong>📋 DETALHES DA MÁQUINA:</strong><br>`;
    response += `• Nome: ${escapeHtml(foundMachine.name)}<br>`;
    response += `• Status: ${getStatusText(foundMachine.status)} ${getStatusIcon(foundMachine.status)}<br>`;
    response += `• Eficiência: ${foundMachine.efficiency}%<br>`;
    response += `• Temperatura: ${foundMachine.temperature}°C<br>`;
    response += `• Vibração: ${foundMachine.vibration} mm/s<br>`;
    response += `• Pressão: ${foundMachine.pressure} PSI<br>`;
    response += `• Última atualização: ${formatDate(foundMachine.lastUpdate)}<br><br>`;
    
    // Análise da máquina
    if (foundMachine.status === 'danger') {
        response += `🚨 <strong>ESTADO CRÍTICO:</strong> Esta máquina requer atenção imediata.`;
        response += `<br>🛠️ <em>Ação recomendada:</em> Parada imediata para manutenção.`;
    } else if (foundMachine.status === 'warning') {
        response += `⚠️ <strong>REQUER ATENÇÃO:</strong> Monitoramento intensivo recomendado.`;
        response += `<br>📋 <em>Ação recomendada:</em> Agendar manutenção preventiva.`;
    } else if (parseFloat(foundMachine.efficiency) < 75) {
        response += `📉 <strong>EFICIÊNCIA BAIXA:</strong> Considere otimizações operacionais.`;
    } else {
        response += `✅ <strong>OPERANDO NORMALMENTE:</strong> Continue com o monitoramento regular.`;
    }
    
    return response;
}

function generateReportResponse() {
    const avgEff = machines.length > 0 ? 
        machines.reduce((sum, m) => sum + (parseFloat(m.efficiency) || 0), 0) / machines.length : 0;
    const totalAnomalies = machines.filter(m => m.status !== 'active').length;
    const energyConsumption = machines.length * 150;
    
    let response = `<strong>📊 RESUMO DE RELATÓRIOS:</strong><br><br>`;
    response += `📈 <strong>Desempenho Operacional:</strong><br>`;
    response += `• Eficiência média: ${avgEff.toFixed(1)}%<br>`;
    response += `• Máquinas analisadas: ${machines.length}<br><br>`;
    
    response += `⚠️ <strong>Anomalias Detectadas:</strong><br>`;
    response += `• Total de anomalias: ${totalAnomalies}<br>`;
    response += `• Críticas: ${machines.filter(m => m.status === 'danger').length}<br>`;
    response += `• Atenção: ${machines.filter(m => m.status === 'warning').length}<br><br>`;
    
    response += `⚡ <strong>Eficiência Energética:</strong><br>`;
    response += `• Consumo estimado: ${energyConsumption} kWh/mês<br>`;
    response += `• Custo estimado: R$ ${(energyConsumption * 0.85).toLocaleString('pt-BR', {minimumFractionDigits: 2})}<br><br>`;
    
    if (machines.length > 0) {
        const bestMachine = machines.reduce((best, current) => 
            parseFloat(current.efficiency) > parseFloat(best.efficiency) ? current : best
        );
        response += `🏆 <strong>Máquina Destaque:</strong> ${escapeHtml(bestMachine.name)} com ${bestMachine.efficiency}% de eficiência.`;
    }
    
    return response;
}

function generateMaintenanceResponse() {
    const tips = [
        "🔧 <strong>Calibração Mensal:</strong> Todos os sensores devem ser calibrados mensalmente.",
        "📊 <strong>Análise Semanal:</strong> Revise os relatórios de eficiência toda semana.",
        "🧹 <strong>Limpeza Diária:</strong> Mantenha as máquinas limpas para melhorar dissipação de calor.",
        "🔍 <strong>Inspeção Visual:</strong> Verifique diariamente por vazamentos e desgastes.",
        "📈 <strong>Monitoramento Contínuo:</strong> Configure alertas para parâmetros críticos.",
        "⚡ <strong>Economia de Energia:</strong> Desligue máquinas ociosas para reduzir consumo.",
        "🔄 <strong>Rotação de Equipamentos:</strong> Alterne o uso de máquinas similares."
    ];
    
    let response = `<strong>🛠️ DICAS DE MANUTENÇÃO PREDITIVA:</strong><br><br>`;
    
    // Seleciona 4 dicas aleatórias
    const randomTips = tips.sort(() => 0.5 - Math.random()).slice(0, 4);
    randomTips.forEach(tip => {
        response += `${tip}<br>`;
    });
    
    response += `<br><strong>📅 AGENDA RECOMENDADA:</strong><br>`;
    response += `• Diário: Verificação visual e limpeza<br>`;
    response += `• Semanal: Análise de relatórios<br>`;
    response += `• Mensal: Calibração completa<br>`;
    response += `• Trimestral: Manutenção preventiva<br><br>`;
    
    response += `💡 <em>Lembre-se:</em> Manutenção preditiva reduz custos em até 40%!`;
    
    return response;
}

function generateParameterResponse(parameter) {
    const paramNames = {
        'temperatura': 'Temperatura',
        'vibração': 'Vibração',
        'pressão': 'Pressão'
    };
    
    const paramUnits = {
        'temperatura': '°C',
        'vibração': 'mm/s',
        'pressão': 'PSI'
    };
    
    const paramRanges = {
        'temperatura': { normal: [60, 85], warning: [86, 95], danger: [96, 120] },
        'vibração': { normal: [0, 2.5], warning: [2.6, 3.5], danger: [3.6, 10] },
        'pressão': { normal: [100, 180], warning: [181, 200], danger: [201, 250] }
    };
    
    const paramName = paramNames[parameter];
    const paramUnit = paramUnits[parameter];
    const ranges = paramRanges[parameter];
    
    let response = `<strong>📊 ANÁLISE DE ${paramName.toUpperCase()}:</strong><br><br>`;
    
    if (machines.length === 0) {
        response += `Nenhuma máquina cadastrada para análise.`;
        return response;
    }
    
    // Calcula estatísticas
    const values = machines.map(m => parseFloat(m[parameter] || 0));
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const maxMachine = machines.find(m => parseFloat(m[parameter] || 0) === max);
    const minMachine = machines.find(m => parseFloat(m[parameter] || 0) === min);
    
    response += `• Média: ${avg.toFixed(1)}${paramUnit}<br>`;
    response += `• Máxima: ${max.toFixed(1)}${paramUnit} (${escapeHtml(maxMachine?.name || 'N/A')})<br>`;
    response += `• Mínima: ${min.toFixed(1)}${paramUnit} (${escapeHtml(minMachine?.name || 'N/A')})<br><br>`;
    
    response += `<strong>📋 FAIXAS DE REFERÊNCIA:</strong><br>`;
    response += `• Normal: ${ranges.normal[0]}-${ranges.normal[1]}${paramUnit}<br>`;
    response += `• Atenção: ${ranges.warning[0]}-${ranges.warning[1]}${paramUnit}<br>`;
    response += `• Crítico: Acima de ${ranges.danger[0]}${paramUnit}<br><br>`;
    
    // Análise
    let abnormalMachines = [];
    machines.forEach(machine => {
        const value = parseFloat(machine[parameter] || 0);
        if (value > ranges.normal[1]) {
            abnormalMachines.push({
                name: machine.name,
                value: value,
                status: value > ranges.danger[0] ? 'Crítico' : 'Atenção'
            });
        }
    });
    
    if (abnormalMachines.length > 0) {
        response += `<strong>⚠️ MÁQUINAS COM ${paramName.toUpperCase()} ANORMAL:</strong><br>`;
        abnormalMachines.forEach(m => {
            const icon = m.status === 'Crítico' ? '🔴' : '🟡';
            response += `${icon} ${escapeHtml(m.name)}: ${m.value}${paramUnit} (${m.status})<br>`;
        });
        
        response += `<br><strong>🛠️ RECOMENDAÇÃO:</strong><br>`;
        if (abnormalMachines.some(m => m.status === 'Crítico')) {
            response += `Intervenção imediata necessária nas máquinas críticas.`;
        } else {
            response += `Monitoramento intensivo recomendado.`;
        }
    } else {
        response += `✅ <strong>TODAS AS MÁQUINAS DENTRO DA FAIXA NORMAL</strong>`;
    }
    
    return response;
}

function generateGeneralResponse(message) {
    const generalResponses = [
        "Posso ajudá-lo com monitoramento de máquinas, análise de dados, relatórios e dicas de manutenção. O que específico você gostaria de saber?",
        "Como assistente do Predictive Pulse, posso fornecer informações sobre o status das suas máquinas, eficiência operacional e recomendações de manutenção. Como posso ajudá-lo?",
        "Para obter informações específicas, você pode perguntar sobre: status do sistema, eficiência das máquinas, alertas ativos, ou dicas de manutenção.",
        "Estou aqui para ajudar no monitoramento preditivo das suas máquinas. Você pode me perguntar sobre qualquer aspecto do sistema."
    ];
    
    // Verifica se é uma saudação
    const greetings = ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite', 'hello', 'hi'];
    if (greetings.some(greet => message.toLowerCase().includes(greet))) {
        return `Olá! Eu sou o assistente virtual do Predictive Pulse. Como posso ajudá-lo com o monitoramento das suas máquinas hoje?`;
    }
    
    // Verifica se é um agradecimento
    if (message.toLowerCase().includes('obrigado') || message.toLowerCase().includes('obrigada')) {
        return `De nada! Estou sempre aqui para ajudar no monitoramento das suas máquinas. Se precisar de mais alguma coisa, é só perguntar!`;
    }
    
    // Resposta aleatória para perguntas gerais
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
}

function getStatusIcon(status) {
    switch(status) {
        case 'active': return '🟢';
        case 'warning': return '🟡';
        case 'danger': return '🔴';
        default: return '⚪';
    }
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p><strong>Assistente Virtual</strong></p>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator && typingIndicator.parentNode) {
        typingIndicator.remove();
    }
}

function addUserMessage(message, saveToHistory = true) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${escapeHtml(message)}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (saveToHistory) {
        chatHistory.push({ type: 'user', content: message, timestamp: new Date() });
        saveChatHistory();
    }
}

function addBotMessage(message, saveToHistory = true) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <p><strong>Assistente Virtual</strong></p>
            <p>${message}</p>
            <span class="message-time">${getCurrentTime()}</span>
        </div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    if (saveToHistory) {
        chatHistory.push({ type: 'bot', content: message, timestamp: new Date() });
        saveChatHistory();
    }
}

function saveChatHistory() {
    try {
        // Manter apenas os últimos 50 mensagens
        if (chatHistory.length > 50) {
            chatHistory = chatHistory.slice(-50);
        }
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } catch (e) {
        console.error('❌ Erro ao salvar histórico do chat:', e);
    }
}

// ===== FUNÇÕES UTILITÁRIAS =====
function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    console.log('✅ Event listeners configurados');
}

function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        showMessage('Saindo...', 'loading');
        
        // Usar função do auth.js se disponível
        if (typeof authFunctions !== 'undefined' && authFunctions.signOut) {
            authFunctions.signOut();
        } else if (auth) {
            auth.signOut().catch(error => {
                console.error('Erro no logout do Firebase:', error);
            });
        }
        
        // Limpar dados locais
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('chatHistory');
        
        // Redirecionar após pequeno delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

function showAlert(message, type) {
    const alertArea = document.getElementById('alert-area');
    if (!alertArea) return;

    const alertDiv = document.createElement('div');
    alertDiv.className = `system-alert ${type}`;
    alertDiv.textContent = message;
    alertDiv.style.display = 'block';
    
    alertArea.appendChild(alertDiv);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function showMessage(message, type, duration = 3000) {
    // Remover mensagens existentes
    const existingMessages = document.querySelectorAll('.message-temporary');
    existingMessages.forEach(msg => {
        if (msg.parentNode) {
            msg.remove();
        }
    });

    // Criar nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-temporary message-${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 300px;
        text-align: center;
        animation: slideDown 0.3s ease;
    `;

    // Cores por tipo
    const colors = {
        error: { bg: '#fee', color: '#c33', border: '#fcc' },
        success: { bg: '#efe', color: '#363', border: '#cfc' },
        info: { bg: '#eef', color: '#336', border: '#ccf' },
        loading: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
        warning: { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' }
    };

    const style = colors[type] || colors.info;
    messageDiv.style.background = style.bg;
    messageDiv.style.color = style.color;
    messageDiv.style.border = `1px solid ${style.border}`;

    document.body.appendChild(messageDiv);

    // Remover após duração (exceto loading)
    if (type !== 'loading') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                messageDiv.style.transform = 'translateX(-50%) translateY(-10px)';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    return messageDiv;
}

function getStatusClass(status) {
    switch(status) {
        case 'active': return 'status-active';
        case 'warning': return 'status-warning';
        case 'danger': return 'status-danger';
        default: return 'status-active';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'active': return 'Normal';
        case 'warning': return 'Atenção';
        case 'danger': return 'Crítico';
        default: return 'Normal';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch (e) {
        return 'Data inválida';
    }
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ESTILOS DINÂMICOS =====
function addDynamicStyles() {
    const chatStyles = document.createElement('style');
    chatStyles.textContent = `
        /* Animações do chat */
        .typing-dots {
            display: flex;
            gap: 4px;
            margin-top: 8px;
        }
        
        .typing-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--orange);
            opacity: 0.4;
            animation: typing 1.4s infinite;
        }
        
        .typing-dots span:nth-child(1) { animation-delay: 0s; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
            0%, 60%, 100% { opacity: 0.4; }
            30% { opacity: 1; }
        }
        
        /* Estilos para listas no chat */
        .machine-list {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .machine-list li {
            margin-bottom: 8px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 8px;
            border-left: 4px solid var(--orange);
        }
        
        /* Animações de mensagem */
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
        
        /* Botão de tema responsivo */
        @media (max-width: 768px) {
            .theme-toggle .theme-text {
                display: none !important;
            }
            
            .theme-toggle {
                padding: 10px !important;
                width: 50px !important;
                height: 50px !important;
                justify-content: center !important;
                min-width: 50px !important;
            }
            
            .theme-toggle i {
                font-size: 1.2rem !important;
                margin: 0 !important;
            }
        }
        
        /* Animações de transição suave */
        body,
        .sidebar,
        .actions-bar,
        .machines-management-section,
        .reports-section,
        .chat-section,
        .machine-card,
        .report-card,
        .theme-toggle,
        .user-info,
        .logo-img,
        .modal-content,
        .form-control,
        .search-box input,
        .chat-input-area input,
        .message-content,
        .action-btn {
            transition: background-color 0.5s ease, 
                        color 0.5s ease, 
                        border-color 0.5s ease,
                        box-shadow 0.5s ease,
                        transform 0.3s ease !important;
        }
    `;
    document.head.appendChild(chatStyles);
}

// ===== VERIFICAÇÃO INICIAL =====
console.log('🔍 Verificando dependências:');
console.log('Firebase auth:', typeof auth !== 'undefined' ? '✅ OK' : '❌ FALTA');
console.log('Firebase firestore:', typeof db !== 'undefined' ? '✅ OK' : '❌ FALTA');
console.log('Chat container:', document.getElementById('chat-messages') ? '✅ OK' : '❌ FALTA');

// Verificação final após carregamento
window.addEventListener('load', function() {
    console.log('🚀 Área do cliente carregada completamente!');
    
    // Verificar tema final
    setTimeout(() => {
        const currentTheme = localStorage.getItem('theme') || 
                           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        const buttonText = document.querySelector('#themeToggle .theme-text')?.textContent;
        
        console.log('🎯 VERIFICAÇÃO FINAL DA ÁREA DO CLIENTE:');
        console.log('   • Tema atual:', currentTheme);
        console.log('   • Botão mostra:', buttonText || 'N/A');
        console.log('   • HTML data-theme:', document.documentElement.getAttribute('data-theme'));
        console.log('   • Máquinas carregadas:', machines.length);
        console.log('   • Histórico do chat:', chatHistory.length, 'mensagens');
        
        // Verificar se o botão de tema tem texto
        if (!buttonText) {
            console.warn('⚠️ Texto do botão não encontrado, corrigindo...');
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

// Exportar funções globais para acesso via console
window.areaCliente = {
    loadMachines,
    openMachineModal,
    addBotMessage,
    addUserMessage,
    get machines() { return machines; },
    get chatHistory() { return chatHistory; }
};

console.log('✅ area-cliente.js carregado com sucesso!');