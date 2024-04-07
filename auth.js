import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  getStorage,
  ref as sRef,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";
import {
  getDatabase,
  ref as dRef,
  set,
  child,
  get,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCLfrQVLdX98J_Axa1PEQ9h4pLUFHb32g",
  authDomain: "electronotes-fbf7e.firebaseapp.com",
  projectId: "electronotes-fbf7e",
  databaseURL: "https://electronotes-fbf7e-default-rtdb.firebaseio.com/",
  storageBucket: "electronotes-fbf7e.appspot.com",
  messagingSenderId: "120507508085",
  appId: "1:120507508085:web:3845e1b009dc06bdea1f3c",
  measurementId: "G-42YHWSNCW4",
};

/*
username: "cybermajeed" + "@en.com"
password: "cyberMajeed333"
*/

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app, "gs://electronotes-fbf7e.appspot.com");
const database = getDatabase(app);
//app version
const version = "V24.4.7";
let versionSpan = document.querySelector("div.profile .version");
let loginBtn = document.querySelector(".profile .login #loginBtn"),
  logoutBtn = document.querySelector(".profile .logout #logoutBtn"),
  profilePic = document.querySelector("div.profile img"),
  loginScreen = document.querySelector("div.profile .login"),
  logoutScreen = document.querySelector("div.profile .logout"),
  username = document.getElementById("username"),
  password = document.getElementById("password");

//login
loginBtn.addEventListener("click", (e) => {
  //login
  signInWithEmailAndPassword(auth, username.value + "@en.com", password.value)
    .then(() => {
      alert("Logged In");
      loginScreen.querySelector("#password").value = "";
      loginScreen.querySelector("#username").value = "";
      loginScreen.click();
      location.reload();
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(`Code: ${errorCode}`);
      console.error(`Error: ${errorMessage}`);
    });
  //
});
//logout

logoutBtn.addEventListener("click", (e) => {
  //logout
  signOut(auth)
    .then(() => {
      alert("Logged Out");
      logoutScreen.click();
      location.reload();
      localStorage.removeItem("notes");
    })
    .catch((error) => {
      alert(error);
    });
  //logout ends
});
let userName;
import { createNewNote, updateSessionStorage } from "./script.js";
onAuthStateChanged(auth, (user) => {
  if (user) {
    userName = user.email.split("@")[0].toUpperCase();
    profilePic.title = userName;
    //set profile pic
    const imgRef = sRef(storage, `profiles/${userName}.png`);
    getDownloadURL(imgRef)
      .then((url) => {
        profilePic.src = url;
      })
      .catch((error) => {
        console.error(error);
      });
    //sync
    profilePic.oncontextmenu = (e) => {
      e.preventDefault();
      if (!navigator.onLine) {
        alert("You are Offline");
      } else {
        syncNotes();
      }
    };
    profilePic.onclick = () => {
      //open logout screen
      logoutScreen.style.display = "flex";
      versionSpan.style.display = "block";
      versionSpan.innerHTML = version;
    };
    logoutScreen.onclick = (e) => {
      if (e.target.classList.contains("logout")) {
        logoutScreen.style.display = "none";
        versionSpan.style.display = "none";
      }
    };
    window.ononline = () => {
      syncNotes();
    };
    //firebase loaded
    getNotes();
  } else {
    //if use not signed in
    //set profile pic
    profilePic.src = "./assets/profile.svg";
    profilePic.onclick = () => {
      loginScreen.style.display = "flex";
      versionSpan.style.display = "block";
      versionSpan.innerHTML = version;
    };
    loginScreen.onclick = (e) => {
      if (e.target.classList.contains("login")) {
        loginScreen.style.display = "none";
        versionSpan.style.display = "none";
      }
    };
    //
    const notes = JSON.parse(localStorage.getItem("notes"));
    if (notes) {
      notes.forEach((note) => {
        createNewNote(note);
      });
    }
    //
  }
});

function syncNotes() {
  if (localStorage.getItem("notes") && navigator.onLine) {
    set(dRef(database, "users/" + userName), {
      notes: localStorage.getItem("notes"),
    });
    alert("Notes Synced");
  }
}

function getNotes() {
  get(child(dRef(database), "users/" + userName))
    .then((data) => {
      if (data.exists()) {
        let Notes = data.val().notes;
        Notes = JSON.parse(Notes);
        Notes.forEach((note) => {
          createNewNote(note);
        });
        updateSessionStorage();
      } else {
        console.log("No data found!");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
