// firebase/firebase-config.js
// Configuração do Firebase - Substitua com suas credenciais

const firebaseConfig = {
    apiKey: "AIzaSyBNQ0W-u_Qz5QD3MKBw8bB_DvYtCPMoWtM",
    authDomain: "predictivepulse-554d0.firebaseapp.com",
    projectId: "predictivepulse-554d0",
    storageBucket: "predictivepulse-554d0.firebasestorage.app",
    messagingSenderId: "407792088328",
    appId: "1:407792088328:web:d936473125e6f63c06e8bd"
};

// Inicializar Firebase
try {
    // Verificar se já está inicializado
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase inicializado com sucesso!');
    } else {
        console.log('Firebase já estava inicializado');
    }
} catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
}

// Inicializar serviços
const auth = firebase.auth();
const db = firebase.firestore();

// Configurações do Firestore para compatibilidade
if (db.settings) {
    db.settings({
        timestampsInSnapshots: true,
        merge: true
    });
}

// Configurar persistência de autenticação
if (auth.setPersistence) {
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            console.log('Persistência de autenticação configurada');
        })
        .catch((error) => {
            console.error('Erro ao configurar persistência:', error);
        });
}

// Verificar se os serviços estão disponíveis
if (typeof auth !== 'undefined') {
    console.log('Firebase Auth carregado');
} else {
    console.error('Firebase Auth não carregado');
}

if (typeof db !== 'undefined') {
    console.log('Firebase Firestore carregado');
} else {
    console.error('Firebase Firestore não carregado');
}

// Exportar para uso global
window.auth = auth;
window.db = db;
window.firebaseApp = firebase;