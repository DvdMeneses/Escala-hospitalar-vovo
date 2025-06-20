// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Sua configuração Firebase (a que você colou)
const firebaseConfig = {
    apiKey: "AIzaSyCiAn2rLz396Rto1U8dMLitlfu7OIt2vh0",
    authDomain: "escala-hospitalar-da-vovo.firebaseapp.com",
    databaseURL: "https://escala-hospitalar-da-vovo-default-rtdb.firebaseio.com",
    projectId: "escala-hospitalar-da-vovo",
    storageBucket: "escala-hospitalar-da-vovo.firebasestorage.app",
    messagingSenderId: "279474719875",
    appId: "1:279474719875:web:d74e82870267d351655fb6",
    measurementId: "G-NMCRGH43BQ"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Exporta o database para usar no app
const database = getDatabase(app);

export { database };
