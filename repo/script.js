// =====================
// R.E.P.O. – Hub Multijoueur
// =====================

// Informations du jeu
document.getElementById("repoVersion").textContent = "1.0.0";
document.getElementById("modStatus").textContent = "Installé ✔";

// =====================
// Gestion des salons
// =====================

const roomList = document.getElementById("roomList");
const createRoomBtn = document.getElementById("createRoom");

function loadRooms() {
    const rooms = JSON.parse(localStorage.getItem("repo_rooms") || "[]");
    roomList.innerHTML = "";

    rooms.forEach((room, index) => {
        const div = document.createElement("div");
        div.className = "room";

        div.innerHTML = `
            <p><strong>${room.name}</strong></p>
            <p>${room.desc}</p>
            ${room.voice ? `<p>Salon vocal : <a href="${room.voice}">${room.voice}</a></p>` : ""}
            <button class="primary" onclick="joinRoom(${index})">Rejoindre</button>
            <button class="danger" onclick="deleteRoom(${index})">Supprimer</button>
        `;

        roomList.appendChild(div);
    });
}

function joinRoom(index) {
    alert("Fonction Rejoindre : à connecter au backend Unity plus tard.");
}

function deleteRoom(index) {
    const rooms = JSON.parse(localStorage.getItem("repo_rooms") || "[]");
    rooms.splice(index, 1);
    localStorage.setItem("repo_rooms", JSON.stringify(rooms));
    loadRooms();
}

createRoomBtn.onclick = () => {
    const name = document.getElementById("roomName").value;
    const desc = document.getElementById("roomDesc").value;
    const voice = document.getElementById("voiceLink").value;

    if (!name) {
        alert("Nom du salon requis !");
        return;
    }

    const rooms = JSON.parse(localStorage.getItem("repo_rooms") || "[]");
    rooms.push({ name, desc, voice });
    localStorage.setItem("repo_rooms", JSON.stringify(rooms));

    loadRooms();
};

// Initialisation
loadRooms();
