// =====================
// PEAK – Hub Multijoueur
// =====================

// Chargement du pseudo
const connectedInfo = document.getElementById("connectedInfo");
let username = localStorage.getItem("peak_username") || "Joueur";

connectedInfo.textContent = `Connecté en tant que ${username}`;

// Changer de pseudo
document.getElementById("changeNameBtn").onclick = () => {
    const newName = prompt("Nouveau pseudo :");
    if (!newName) return;
    username = newName;
    localStorage.setItem("peak_username", newName);
    connectedInfo.textContent = `Connecté en tant que ${newName}`;
};

// Déconnexion
document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("peak_username");
    location.reload();
};

// =====================
// Gestion des lobbys
// =====================

const lobbyList = document.getElementById("lobbyList");
const addLobbyBtn = document.getElementById("addLobby");

function loadLobbies() {
    const lobbies = JSON.parse(localStorage.getItem("peak_lobbies") || "[]");
    lobbyList.innerHTML = "";

    lobbies.forEach((lobby, index) => {
        const div = document.createElement("div");
        div.className = "lobby";

        div.innerHTML = `
            <p><strong>${lobby.name}</strong></p>
            <p>${lobby.desc}</p>
            <p><a href="${lobby.link}">${lobby.link}</a></p>
            ${lobby.voice ? `<p>Salon vocal : <a href="${lobby.voice}">${lobby.voice}</a></p>` : ""}
            <button class="primary" onclick="joinLobby('${lobby.link}')">Rejoindre</button>
            <button class="danger" onclick="deleteLobby(${index})">Supprimer</button>
        `;

        lobbyList.appendChild(div);
    });
}

function joinLobby(link) {
    window.location.href = link;
}

function deleteLobby(index) {
    const lobbies = JSON.parse(localStorage.getItem("peak_lobbies") || "[]");
    lobbies.splice(index, 1);
    localStorage.setItem("peak_lobbies", JSON.stringify(lobbies));
    loadLobbies();
}

addLobbyBtn.onclick = () => {
    const link = document.getElementById("steamLink").value;
    const name = document.getElementById("lobbyName").value;
    const desc = document.getElementById("lobbyDesc").value;
    const voice = document.getElementById("voiceLink").value;

    if (!link || !name) {
        alert("Lien Steam + nom requis !");
        return;
    }

    const lobbies = JSON.parse(localStorage.getItem("peak_lobbies") || "[]");
    lobbies.push({ link, name, desc, voice });
    localStorage.setItem("peak_lobbies", JSON.stringify(lobbies));

    loadLobbies();
};

// Initialisation
loadLobbies();
