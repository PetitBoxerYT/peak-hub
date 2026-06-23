import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
 
/* ------------------------------
   LOCAL USER
------------------------------ */

if (!localStorage.getItem("peakUserId")) {
  localStorage.setItem("peakUserId", crypto.randomUUID());
}
const localUserId = localStorage.getItem("peakUserId");

if (!localStorage.getItem("peakPseudo")) {
  const pseudo = prompt("Choisis ton pseudo Peak :");
  localStorage.setItem("peakPseudo", pseudo || "Joueur");
}
let localPseudo = localStorage.getItem("peakPseudo");

document.getElementById("user-info").textContent =
  "Connecté en tant que " + localPseudo +
  " (ID : " + localUserId.slice(0, 8) + "…)";

/* ------------------------------
   FIREBASE
------------------------------ */

const firebaseConfig = {
  apiKey: "AIzaSyDb0hPFAQ2X-czfL71R3tJMU3cue84koTE",
  authDomain: "peak-hub-803e8.firebaseapp.com",
  projectId: "peak-hub-803e8",
  storageBucket: "peak-hub-803e8.firebasestorage.app",
  messagingSenderId: "660080957005",
  appId: "1:660080957005:web:57e94fde72d949ee69ee04",
  measurementId: "G-DH9YF0MZSW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ------------------------------
   LOBBYS
------------------------------ */

const lobbiesRef = collection(db, "lobbies");
const lobbiesQuery = query(lobbiesRef, orderBy("createdAt", "desc"));

let currentLobbyId = localStorage.getItem("currentLobbyId") || null;

window.addLobby = async (url, label) => {
  const desc = document.getElementById("lobby-desc").value;
  const voice = document.getElementById("lobby-voice").value;

  if (!url || !label) {
    alert("Merci de remplir l’URL et le nom du lobby");
    return;
  }

  let voiceLink = voice;
  if (voice && !voice.startsWith("http")) {
    voiceLink = "https://" + voice;
  }

  await addDoc(lobbiesRef, {
    url,
    label,
    desc,
    voice: voiceLink,
    owner: localUserId,
    pseudo: localPseudo,
    createdAt: Date.now()
  });

  document.getElementById("lobby-url").value = "";
  document.getElementById("lobby-label").value = "";
  document.getElementById("lobby-desc").value = "";
  document.getElementById("lobby-voice").value = "";
};

window.deleteLobby = async (id, owner) => {
  if (localUserId !== owner) {
    alert("Tu ne peux pas supprimer le lobby de quelqu'un d'autre");
    return;
  }
  await deleteDoc(doc(db, "lobbies", id));
};

window.joinLobby = async (lobbyId, url) => {
  localStorage.removeItem("hasQuitHub");
  startPresence();

  if (currentLobbyId && currentLobbyId !== lobbyId) {
    await deleteDoc(doc(db, "lobbies", currentLobbyId, "players", localUserId));
  }

  await setDoc(doc(db, "lobbies", lobbyId, "players", localUserId), {
    pseudo: localPseudo,
    lastSeen: Date.now()
  });

  currentLobbyId = lobbyId;
  localStorage.setItem("currentLobbyId", lobbyId);

  window.open(url, "_blank");
};

onSnapshot(lobbiesQuery, snapshot => {
  const container = document.getElementById("lobbies");
  container.innerHTML = "";

  snapshot.forEach(docu => {
    const data = docu.data();
    const lobbyId = docu.id;

    const div = document.createElement("div");
    div.className = "glass";

    div.innerHTML = `
      <p><strong>${data.label}</strong> <small>(${data.pseudo})</small></p>
      <p>${data.desc || ""}</p>

      ${data.voice ? `<p>🔊 <a href="${data.voice}" target="_blank">${data.voice}</a></p>` : ""}

      <p><span id="players-${lobbyId}">0</span> joueur(s)</p>

      <p class="lobby-url">${data.url}</p>

      <button onclick="joinLobby('${lobbyId}', '${data.url}')">Rejoindre</button>

      ${localUserId === data.owner
        ? `<button onclick="deleteLobby('${lobbyId}', '${data.owner}')" class="danger">Supprimer</button>`
        : `<small>Créé par ${data.pseudo}</small>`}
    `;

    container.appendChild(div);

    const playersRef = collection(db, "lobbies", lobbyId, "players");
    onSnapshot(playersRef, snap => {
      document.getElementById(`players-${lobbyId}`).textContent = snap.size;
    });
  });
});

/* ------------------------------
   PSEUDO
------------------------------ */

window.changePseudo = () => {
  const nouveau = prompt("Nouveau pseudo :");
  if (!nouveau) return;

  localStorage.setItem("peakPseudo", nouveau);
  localPseudo = nouveau;

  localStorage.removeItem("hasQuitHub");
  startPresence();

  document.getElementById("user-info").textContent =
    "Connecté en tant que " + nouveau +
    " (ID : " + localUserId.slice(0, 8) + "…)";
};

/* ------------------------------
   PRESENCE
------------------------------ */

const onlineUsersRef = collection(db, "onlineUsers");
const onlineRef = doc(db, "onlineUsers", localUserId);

let presenceInterval = null;
let presenceStarted = false;

function startPresence() {
  if (presenceStarted) return;
  presenceStarted = true;

  setDoc(onlineRef, {
    pseudo: localPseudo,
    lastSeen: Date.now()
  });

  presenceInterval = setInterval(() => {
    if (localStorage.getItem("hasQuitHub") === "true") return;
    setDoc(onlineRef, {
      pseudo: localPseudo,
      lastSeen: Date.now()
    });
  }, 30000);
}

function stopPresence() {
  if (presenceInterval !== null) {
    clearInterval(presenceInterval);
    presenceInterval = null;
  }
  presenceStarted = false;
}

if (localStorage.getItem("hasQuitHub") !== "true") {
  startPresence();
}

window.leaveHub = async () => {
  localStorage.setItem("hasQuitHub", "true");
  stopPresence();

  if (currentLobbyId) {
    await deleteDoc(doc(db, "lobbies", currentLobbyId, "players", localUserId));
    currentLobbyId = null;
    localStorage.removeItem("currentLobbyId");
  }

  await deleteDoc(onlineRef);
  alert("Tu as quitté le Hub.");
};

onSnapshot(onlineUsersRef, snapshot => {
  const now = Date.now();
  const list = document.getElementById("online-list");
  list.innerHTML = "";

  let count = 0;

  snapshot.forEach(docu => {
    const data = docu.data();
    if (now - data.lastSeen < 60000) {
      count++;
      const div = document.createElement("div");
      div.textContent = data.pseudo;
      list.appendChild(div);
    }
  });

  document.getElementById("online-count").textContent = count;
});

/* ------------------------------
   THEME SWITCHER
------------------------------ */

const themeButton = document.getElementById("themeButton");
const themeDropdown = document.getElementById("themeDropdown");

themeButton.onclick = () => {
  themeDropdown.classList.toggle("hidden");
};

window.setTheme = theme => {
  document.body.className = theme;
  themeDropdown.classList.add("hidden");
};
