// firebase/machines.js - Versão corrigida e completa

// Funções para gerenciar máquinas no Firebase

// Salvar máquina no Firebase
async function saveMachineToFirebase(machineData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        console.log('Salvando máquina para usuário:', user.uid);

        if (machineData.id) {
            // Atualizar máquina existente
            await db.collection('users').doc(user.uid).collection('machines').doc(machineData.id).update({
                ...machineData,
                updatedAt: new Date()
            });
            return { success: true, message: 'Máquina atualizada com sucesso!' };
        } else {
            // Adicionar nova máquina
            const docRef = await db.collection('users').doc(user.uid).collection('machines').add({
                ...machineData,
                userId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return { success: true, message: 'Máquina adicionada com sucesso!', id: docRef.id };
        }
    } catch (error) {
        console.error('Erro ao salvar máquina:', error);
        return { success: false, error: error.message };
    }
}

// Carregar máquinas do Firebase
async function loadMachinesFromFirebase() {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        console.log('Carregando máquinas para usuário:', user.uid);

        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection('machines')
            .orderBy('createdAt', 'desc')
            .get();
            
        const machines = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            machines.push({
                id: doc.id,
                name: data.name || 'Sem nome',
                temperature: data.temperature || 0,
                vibration: data.vibration || 0,
                pressure: data.pressure || 0,
                efficiency: data.efficiency || 0,
                status: data.status || 'active',
                lastUpdate: data.lastUpdate || new Date().toISOString().split('T')[0],
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date(),
                type: data.type || 'general',
                healthScore: data.healthScore || 0,
                lastMaintenance: data.lastMaintenance,
                nextMaintenance: data.nextMaintenance
            });
        });

        console.log(`Carregadas ${machines.length} máquinas`);
        return { success: true, machines: machines };
    } catch (error) {
        console.error('Erro ao carregar máquinas:', error);
        return { success: false, error: error.message, machines: [] };
    }
}

// Ouvir mudanças em tempo real nas máquinas
function listenToMachines(callback) {
    const user = auth.currentUser;
    if (!user) {
        console.log('Usuário não autenticado para listener de máquinas');
        return () => {}; // Retorna função vazia para unsubscribe
    }

    console.log('Iniciando listener de máquinas em tempo real');

    return db.collection('users')
        .doc(user.uid)
        .collection('machines')
        .orderBy('updatedAt', 'desc')
        .onSnapshot(snapshot => {
            const machines = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                machines.push({
                    id: doc.id,
                    name: data.name || 'Sem nome',
                    temperature: data.temperature || 0,
                    vibration: data.vibration || 0,
                    pressure: data.pressure || 0,
                    efficiency: data.efficiency || 0,
                    status: data.status || 'active',
                    lastUpdate: data.lastUpdate || new Date().toISOString().split('T')[0],
                    createdAt: data.createdAt || new Date(),
                    updatedAt: data.updatedAt || new Date()
                });
            });
            console.log('Máquinas atualizadas em tempo real:', machines.length);
            callback(machines);
        }, error => {
            console.error('Erro ao ouvir mudanças nas máquinas:', error);
            callback([], error);
        });
}

// Deletar máquina do Firebase
async function deleteMachineFromFirebase(machineId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        console.log('Excluindo máquina:', machineId);

        await db.collection('users').doc(user.uid).collection('machines').doc(machineId).delete();
        return { success: true, message: 'Máquina excluída com sucesso!' };
    } catch (error) {
        console.error('Erro ao excluir máquina:', error);
        return { success: false, error: error.message };
    }
}

// Atualizar status da máquina
async function updateMachineStatus(machineId, status) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        await db.collection('users').doc(user.uid).collection('machines').doc(machineId).update({
            status: status,
            updatedAt: new Date()
        });
        
        console.log('Status da máquina atualizado:', machineId, status);
        return { success: true, message: 'Status atualizado com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        return { success: false, error: error.message };
    }
}

// Atualizar dados da máquina
async function updateMachineData(machineId, updateData) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        await db.collection('users').doc(user.uid).collection('machines').doc(machineId).update({
            ...updateData,
            updatedAt: new Date()
        });
        
        return { success: true, message: 'Dados da máquina atualizados com sucesso!' };
    } catch (error) {
        console.error('Erro ao atualizar dados da máquina:', error);
        return { success: false, error: error.message };
    }
}

// Buscar máquina por ID
async function getMachineById(machineId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        const doc = await db.collection('users').doc(user.uid).collection('machines').doc(machineId).get();
        
        if (!doc.exists) {
            return { success: false, error: 'Máquina não encontrada' };
        }

        const data = doc.data();
        return { 
            success: true, 
            machine: {
                id: doc.id,
                name: data.name || 'Sem nome',
                temperature: data.temperature || 0,
                vibration: data.vibration || 0,
                pressure: data.pressure || 0,
                efficiency: data.efficiency || 0,
                status: data.status || 'active',
                lastUpdate: data.lastUpdate || new Date().toISOString().split('T')[0],
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date()
            }
        };
    } catch (error) {
        console.error('Erro ao buscar máquina:', error);
        return { success: false, error: error.message };
    }
}

// Obter estatísticas das máquinas
async function getMachinesStats() {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        const snapshot = await db.collection('users').doc(user.uid).collection('machines').get();
        
        const stats = {
            total: 0,
            active: 0,
            warning: 0,
            danger: 0,
            avgEfficiency: 0,
            totalHealthScore: 0
        };

        let totalEfficiency = 0;
        let totalHealthScore = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            stats.total++;
            
            if (data.status === 'active') stats.active++;
            if (data.status === 'warning') stats.warning++;
            if (data.status === 'danger') stats.danger++;
            
            totalEfficiency += data.efficiency || 0;
            totalHealthScore += data.healthScore || 0;
        });

        stats.avgEfficiency = stats.total > 0 ? (totalEfficiency / stats.total).toFixed(1) : 0;
        stats.avgHealthScore = stats.total > 0 ? (totalHealthScore / stats.total).toFixed(1) : 0;

        return { success: true, stats: stats };
    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        return { success: false, error: error.message };
    }
}

// Buscar máquinas por status
async function getMachinesByStatus(status) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection('machines')
            .where('status', '==', status)
            .orderBy('updatedAt', 'desc')
            .get();
            
        const machines = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            machines.push({
                id: doc.id,
                name: data.name || 'Sem nome',
                temperature: data.temperature || 0,
                vibration: data.vibration || 0,
                pressure: data.pressure || 0,
                efficiency: data.efficiency || 0,
                status: data.status || 'active',
                lastUpdate: data.lastUpdate || new Date().toISOString().split('T')[0],
                createdAt: data.createdAt || new Date(),
                updatedAt: data.updatedAt || new Date()
            });
        });

        return { success: true, machines: machines };
    } catch (error) {
        console.error('Erro ao buscar máquinas por status:', error);
        return { success: false, error: error.message };
    }
}

// Buscar máquinas que precisam de manutenção
async function getMachinesNeedingMaintenance() {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Usuário não autenticado');
        }

        const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        const snapshot = await db.collection('users')
            .doc(user.uid)
            .collection('machines')
            .where('nextMaintenance', '<=', oneWeekFromNow)
            .orderBy('nextMaintenance', 'asc')
            .get();
            
        const machines = [];
        
        snapshot.forEach(doc => {
            const data = doc.data();
            machines.push({
                id: doc.id,
                name: data.name || 'Sem nome',
                nextMaintenance: data.nextMaintenance,
                status: data.status || 'active',
                efficiency: data.efficiency || 0
            });
        });

        return { success: true, machines: machines };
    } catch (error) {
        console.error('Erro ao buscar máquinas para manutenção:', error);
        return { success: false, error: error.message };
    }
}

// ===== EXPORTAÇÃO DAS FUNÇÕES =====

// Exportar funções para uso global
window.machineFunctions = {
    saveMachineToFirebase,
    loadMachinesFromFirebase,
    listenToMachines,
    deleteMachineFromFirebase,
    updateMachineStatus,
    updateMachineData,
    getMachineById,
    getMachinesStats,
    getMachinesByStatus,
    getMachinesNeedingMaintenance
};

console.log('Machines.js carregado com sucesso!');