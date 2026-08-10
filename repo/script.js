import { db } from "../shared/firebase.js";
import {
    collection, addDoc, deleteDoc, doc,
    onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const roomRef = collection(db, "repoRooms");

// =====================
// Ajouter un salon
// =====================
document.getElementById("createRoom").onclick = async () => {
    const name = document.getElementById("roomName").value;
    const desc = document.getElementById("roomDesc").value;
    const voice = document.getElementById("voiceLink").value;

    if (!name) {
        alert("Nom du salon requis !");
        return;
    }

    await addDoc(roomRef, {
        name,
        desc,
        voice,
        createdAt: serverTimestamp()
    });
};

// =====================
// Affichage en temps réel
// =====================
const roomList = document.getElementById("roomList");

onSnapshot(roomRef, (snapshot) => {
    roomList.innerHTML = "";

    snapshot.forEach((docSnap) => {
        const room = docSnap.data();
        const id = docSnap.id;

        const div = document.createElement("div");
        div.className = "room";

        div.innerHTML = `
            <p><strong>${room.name}</strong></p>
            <p>${room.desc}</p>
            ${room.voice ? `<p>Salon vocal : <a href="${room.voice}">${room.voice}</a></p>` : ""}
            <button class="primary">Rejoindre</button>
            <button class="danger" onclick="deleteRoom('${id}')">Supprimer</button>
        `;

        roomList.appendChild(div);
    });
});

// =====================
// Supprimer un salon
// =====================
window.deleteRoom = async (id) => {
    await deleteDoc(doc(db, "repoRooms", id));
};
