let wrapper = document.querySelector(".wrapper"),
  noteTitleInEditView = wrapper.querySelector(" input.noteTitleInEditView"),
  textareaInEditView = wrapper.querySelector("textarea.noteContentInEditView"),
  deleteNoteInEditView = wrapper.querySelector(" button.deleteNote"),
  container = document.querySelector(".container"),
  topNavParent = container.querySelector(".topNavParent"),
  notesList = container.querySelector(".notesList"),
  addNote = container.querySelector(".addNoteParent .addNote"),
  currentNoteTitle = document.querySelector(".currentlyEditing .noteTitle");

//navigation close?open
const navIcon = `<svg class="navClose" xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 0 24 24" width="35px" fill="#fff">
<path d="M14.71 15.88L10.83 12l3.88-3.88c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L8.71 11.3c-.39.39-.39 1.02 0 1.41l4.59 4.59c.39.39 1.02.39 1.41 0 .38-.39.39-1.03 0-1.42z"/>
</svg>`;
//
//wrapper
const deleteNoteIcon = `<svg class="deleteNoteIcon" xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 24 24" width="30px" fill="#000">
<path d="M0 0h24v24H0V0z" fill="none"/>
<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z"/>
</svg>`;
deleteNoteInEditView.innerHTML = deleteNoteIcon;

//
const addNoteIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 0 24 24" width="40px" fill="#FFF">
<path d="M0 0h24v24H0V0z" fill="none"/>
<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11h-3v3c0 .55-.45 1-1 1s-1-.45-1-1v-3H8c-.55 0-1-.45-1-1s.45-1 1-1h3V8c0-.55.45-1 1-1s1 .45 1 1v3h3c.55 0 1 .45 1 1s-.45 1-1 1z"/>
</svg>`;

addNote.innerHTML = addNoteIcon;
//
topNavParent.querySelector("div").onclick = navCloseOpen;
topNavParent.querySelector("div").innerHTML = navIcon;

function navCloseOpen() {
  if (topNavParent.querySelector("div svg").classList.contains("navClose")) {
    topNavParent
      .querySelector("div svg")
      .classList.replace("navClose", "navOpen");
    //
    container.style.width = "0%";
    wrapper.style.width = "100%";
    topNavParent.querySelector("div").style.rotate = "180deg";
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
  updateSessionStorage();
}
//
/*
        <div class="notes">
          <input
          type="text"
          class="noteTitle"
          placeholder="Title"
          maxlength="50"
          />
          <textarea class="noteContent" placeholder="Type Here"></textarea>
          </div>
          */

//localStorage notes
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
  inputText.classList.add("noteTitle");
  inputText.type = "text";
  inputText.placeholder = "Title";
  inputText.maxLength = "50";

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
  textarea.placeholder = "Empty";
  textarea.disabled = true;
  //appending
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
  //delete from editor view
  deleteNoteInEditView.onclick = deleteCurrentNote;
  function deleteCurrentNote() {
    if (wrapper.classList.contains("containsNote")) {
      let current = document.querySelector(".currentlyEditing");
      let noteTitle = current.querySelector(".noteTitle").value;
      let noteContent = current.querySelector(".noteContent").value;
      let generatedNoteTitle =
        noteContent == "" ? "<No Title>" : noteContent.slice(0, 30);

      let confirmMsg =
        noteTitle !== ""
          ? confirm(`Are you sure you want to delete "${noteTitle}"?`)
          : confirm(`Are you sure you want to delete "${generatedNoteTitle}"?`);
      if (confirmMsg) {
        current.remove();
        updateLocalStorage();

        noteTitleInEditView.value = "";
        textareaInEditView.value = "";
        wrapper.classList.remove("containsNote");
      }
    }
    //
  }
  //delete ends

  //delete
  let deleteNotes = document.querySelectorAll(".notes .parentTop button svg");
  deleteNotes.forEach((removeNote) => {
    removeNote.onclick = function deleteNote() {
      let parent = this.parentNode.parentNode.parentNode;
      let noteTitle = parent.querySelector(".noteTitle").value;
      let noteContent = parent.querySelector(".noteContent").value;
      let generatedNoteTitle =
        noteContent == "" ? "<No Title>" : noteContent.slice(0, 30);

      let confirmMsg =
        noteTitle !== ""
          ? confirm(`Are you sure you want to delete "${noteTitle}"?`)
          : confirm(`Are you sure you want to delete "${generatedNoteTitle}"?`);
      if (confirmMsg) {
        parent.remove();
        updateLocalStorage();

        noteTitleInEditView.value = "";
        textareaInEditView.value = "";
        wrapper.classList.remove("containsNote");
      }
    };
  });
  //del func ends

  //open in edit view
  inputText.onclick = openInEditView;
  inputText.oninput = openInEditView;

  function openInEditView() {
    if (!document.querySelector(".currentlyEditing")) {
      textarea.parentElement.classList.add("currentlyEditing");
      wrapper.classList.add("containsNote");
    } else {
      document
        .querySelector(".currentlyEditing")
        .classList.remove("currentlyEditing");
      textarea.parentElement.classList.add("currentlyEditing");
      wrapper.classList.add("containsNote");
    }
    textareaInEditView.value = textarea.value;
    noteTitleInEditView.value = inputText.value;
    updateLocalStorage();
  }
  //open in edit view ends
}
//liveUpdate

textareaInEditView.oninput = () => {
  if (wrapper.classList.contains("containsNote")) {
    let current = document.querySelector(".currentlyEditing");
    current.querySelector(".noteContent").value = textareaInEditView.value;
  }
  updateLocalStorage();
};
noteTitleInEditView.oninput = () => {
  if (wrapper.classList.contains("containsNote")) {
    let current = document.querySelector(".currentlyEditing");
    current.querySelector(".noteTitle").value = noteTitleInEditView.value;
  }
  updateLocalStorage();
};
//live update ends
//disable?enable
setInterval(() => {
  if (!wrapper.classList.contains("containsNote")) {
    noteTitleInEditView.disabled = true;
    textareaInEditView.disabled = true;
    deleteNoteInEditView.disabled = true;
    document.title = `Cyber Note`;
  } else {
    noteTitleInEditView.disabled = false;
    textareaInEditView.disabled = false;
    deleteNoteInEditView.disabled = false;
    if (noteTitleInEditView.value == "") {
      let generatedNoteTitle =
        noteTitleInEditView.value == ""
          ? "<No Title>"
          : textareaInEditView.value.slice(0, 30);
      document.title = `Cyber Note/${generatedNoteTitle}`;
    } else {
      document.title = `Cyber Note/${noteTitleInEditView.value}`;
    }
  }
});
//

function updateLocalStorage() {
  const allNotes = document.querySelectorAll(".notes");
  const notes = [];

  allNotes.forEach((eachNote) => {
    notes.push({
      title: eachNote.querySelector(".noteTitle").value,
      content: eachNote.querySelector(".noteContent").value,
    });
  });

  localStorage.setItem("notes", JSON.stringify(notes));
}
//this session
function updateSessionStorage() {
  let isNavCloseOpen = topNavParent
    .querySelector("div svg")
    .classList.contains("navClose")
    ? "opened"
    : "closed";
  sessionStorage.setItem("isNavCloseOpen", isNavCloseOpen);
}

//session state

let navState = sessionStorage.getItem("isNavCloseOpen");
if (navState == "closed") {
  topNavParent.querySelector("div").click();
}
