import { db } from "../shared/firebase.js";
import {
    collection, addDoc, deleteDoc, doc,
    onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Référence Firestore
const lobbyRef = collection(db, "lobbies");

// =====================
// Ajouter un lobby
// =====================
document.getElementById("addLobby").onclick = async () => {
    const link = document.getElementById("steamLink").value;
    const name = document.getElementById("lobbyName").value;
    const desc = document.getElementById("lobbyDesc").value;
    const voice = document.getElementById("voiceLink").value;

    if (!link || !name) {
        alert("Lien Steam + nom requis !");
        return;
    }

    await addDoc(lobbyRef, {
        link,
        name,
        desc,
        voice,
        createdAt: serverTimestamp()
    });
};

// =====================
// Affichage en temps réel
// =====================
const lobbyList = document.getElementById("lobbyList");

onSnapshot(lobbyRef, (snapshot) => {
    lobbyList.innerHTML = "";

    snapshot.forEach((docSnap) => {
        const lobby = docSnap.data();
        const id = docSnap.id;

        const div = document.createElement("div");
        div.className = "lobby";

        div.innerHTML = `
            <p><strong>${lobby.name}</strong></p>
            <p>${lobby.desc}</p>
            <p><a href="${lobby.link}">${lobby.link}</a></p>
            ${lobby.voice ? `<p>Salon vocal : <a href="${lobby.voice}">${lobby.voice}</a></p>` : ""}
            <button class="primary" onclick="window.location.href='${lobby.link}'">Rejoindre</button>
            <button class="danger" onclick="deleteLobby('${id}')">Supprimer</button>
        `;

        lobbyList.appendChild(div);
    });
});

// =====================
// Supprimer un lobby
// =====================
window.deleteLobby = async (id) => {
    await deleteDoc(doc(db, "lobbies", id));
};
