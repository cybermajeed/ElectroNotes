let wrapper = document.querySelector(".wrapper"),
  container = document.querySelector(".container"),
  topNavParent = container.querySelector(".topNavParent"),
  notesList = container.querySelector(".notesList"),
  addNote = container.querySelector(".addNoteParent .addNote");

//localStorage getting

//navigation close?open
const navIcon = `<svg class="navClose" xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 0 24 24" width="35px" fill="#fff">
<path d="M14.71 15.88L10.83 12l3.88-3.88c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .38-.39.39-1.03 0-1.42z"/>
</svg>`;
//

//
topNavParent.querySelector("div").onclick = navCloseOpen;
topNavParent.querySelector("div").innerHTML = navIcon;

function navCloseOpen() {
  if (topNavParent.querySelector("div svg").classList.contains("navClose")) {
    topNavParent.querySelector("div").style.rotate = "180deg";
    topNavParent
      .querySelector("div svg")
      .classList.replace("navClose", "navOpen");
    //
    container.style.width = "0%";
    wrapper.style.width = "100%";
    setTimeout(() => {
      container.querySelector(".notesList").style.display = "none";
      container.querySelector(".addNoteParent").style.display = "none";
      topNavParent.style.alignItems = "flex-start";
    }, 150);
  } else {
    topNavParent.querySelector("div").style.rotate = "0deg";
    topNavParent
      .querySelector("div svg")
      .classList.replace("navOpen", "navClose");
    container.style.width = "30%";
    wrapper.style.width = "70%";
    setTimeout(() => {
      container.querySelector(".notesList").style.display = "";
      container.querySelector(".addNoteParent").style.display = "";
      topNavParent.style.alignItems = "center";
    }, 150);
  }
}
//create  a new note

/*
        <div class="notes">
          <input
          type="text"
          class="noteTitle"
          placeholder="Title"
          maxlength="30"
          />
          <textarea class="noteContent" placeholder="Type Here"></textarea>
          </div>
          */

const notes = JSON.parse(localStorage.getItem("notes"));

if (notes) {
  notes.forEach((note) => {
    createNewNote(note);
  });
}

addNote.onclick = createNewNote;

function createNewNote(note) {
  let noteparentDiv = document.createElement("div");
  noteparentDiv.classList.add("notes");
  let parentTop = document.createElement("div");
  parentTop.classList.add("parentTop");

  let inputText = document.createElement("input");
  inputText.type = "text";
  inputText.classList.add("noteTitle");
  inputText.placeholder = "Title";
  inputText.maxLength = "30";

  let deleteNote = document.createElement("button");
  deleteNote.classList.add("deleteNote");
  //
  const deleteNoteIcon = `<svg class="deleteNoteIcon" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 24 24" width="30px" fill="#000">
<path d="M0 0h24v24H0V0z" fill="none"/>
<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z"/>
</svg>`;

  deleteNote.innerHTML = deleteNoteIcon;
  //
  let textarea = document.createElement("textarea");
  textarea.classList.add("noteContent");
  textarea.placeholder = "Type Here";
  parentTop.appendChild(inputText);
  parentTop.appendChild(deleteNote);
  noteparentDiv.appendChild(parentTop);
  noteparentDiv.appendChild(textarea);
  notesList.appendChild(noteparentDiv);
  //local Storage

  if (note.title) {
    inputText.value = note.title;
  }
  if (note.content) {
    textarea.value = note.content;
  }
  updateLocalStorage();
  //delete
  let deleteNotes = document.querySelectorAll(".notes .parentTop button svg");
  deleteNotes.forEach((removeNote) => {
    removeNote.onclick = function deleteNote() {
      let parent = this.parentNode.parentNode.parentNode;
      parent.remove();
      updateLocalStorage();
    };
  });
  //
}

function updateLocalStorage() {
  const allTextarea = document.querySelectorAll(".notes");
  const notes = [];

  allTextarea.forEach((eachTextarea) => {
    notes.push({
      title: eachTextarea.querySelector(".noteTitle").value,
      content: eachTextarea.querySelector(".noteContent").value,
    });
  });
  localStorage.setItem("notes", JSON.stringify(notes));
}

setInterval(() => {
  updateLocalStorage();
});
