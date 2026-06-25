// ===============================
//  CONFIG FIREBASE
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TA_CLE",
  authDomain: "TON_DOMAINE",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_BUCKET",
  messagingSenderId: "TON_ID",
  appId: "TON_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
//  SONS UI
// ===============================
const sounds = {
  join: new Audio("sounds/ui_confirm.wav"),
  click: new Audio("sounds/soft_tap.wav"),
  error: new Audio("sounds/ui_error.wav"),
  notify: new Audio("sounds/light_ding.wav"),
  popup: new Audio("sounds/ui_slide.wav")
};

sounds.join.volume = 0.6;
sounds.click.volume = 0.45;
sounds.error.volume = 0.65;
sounds.notify.volume = 0.55;
sounds.popup.volume = 0.5;

// ===============================
//  CREATION DE LOBBY
// ===============================
const createBtn = document.getElementById("createLobby");
const lobbyNameInput = document.getElementById("lobbyName");
const visibilitySelect = document.getElementById("visibility");
const passwordInput = document.getElementById("password");

visibilitySelect.addEventListener("change", () => {
  passwordInput.style.display = visibilitySelect.value === "private" ? "block" : "none";
});

createBtn.addEventListener("click", async () => {
  sounds.click.play();

  const name = lobbyNameInput.value.trim();
  const visibility = visibilitySelect.value;
  const password = visibility === "private" ? passwordInput.value.trim() : null;

  if (!name) {
    sounds.error.play();
    alert("Le nom du lobby est obligatoire");
    return;
  }

  if (visibility === "private" && !password) {
    sounds.error.play();
    alert("Mot de passe obligatoire pour un lobby privé");
    return;
  }

  await addDoc(collection(db, "lobbies"), {
    name,
    visibility,
    password,
    createdAt: serverTimestamp()
  });

  sounds.join.play();
  lobbyNameInput.value = "";
  passwordInput.value = "";
});

// ===============================
//  AFFICHAGE DES LOBBYS
// ===============================
const lobbyList = document.getElementById("lobbyList");
let allLobbies = [];

onSnapshot(collection(db, "lobbies"), (snapshot) => {
  allLobbies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  displayLobbies(allLobbies);
  sounds.notify.play();
});

function displayLobbies(list) {
  lobbyList.innerHTML = "";

  list.forEach(lobby => {
    const div = document.createElement("div");
    div.className = "lobby";

    div.innerHTML = `
      <h3>${lobby.name}</h3>
      <p>Visibilité : ${lobby.visibility === "private" ? "🔒 Privé" : "🌍 Public"}</p>
      <button data-id="${lobby.id}">Rejoindre</button>
    `;

    div.querySelector("button").addEventListener("click", () => {
      attemptJoinLobby(lobby);
    });

    lobbyList.appendChild(div);
  });
}

// ===============================
//  REJOINDRE UN LOBBY
// ===============================
function attemptJoinLobby(lobby) {
  sounds.click.play();

  if (lobby.visibility === "private") {
    const input = prompt("Ce lobby est privé. Entrez le mot de passe :");

    if (input !== lobby.password) {
      sounds.error.play();
      alert("Mot de passe incorrect");
      return;
    }
  }

  joinLobby(lobby);
}

function joinLobby(lobby) {
  sounds.join.play();
  alert(`Tu as rejoint le lobby : ${lobby.name}`);
}
