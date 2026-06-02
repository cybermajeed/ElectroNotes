const wrapper = document.querySelector(".wrapper");
const noteTitleInEditView = wrapper.querySelector(".noteTitleInEditView");
const textareaInEditView = wrapper.querySelector(".noteContentInEditView");
const deleteNoteInEditView = wrapper.querySelector(".deleteNote");
const noteColorInEditView = wrapper.querySelector(".noteColor");
const colorPaletteInEditView = wrapper.querySelector(".colorPalette");
const allColorSet = wrapper.querySelectorAll(".colorSet");
const formatToolbar = wrapper.querySelector(".formatToolbar");
const headingSelect = wrapper.querySelector(".headingSelect");
const textColorInput = wrapper.querySelector(".textColorInput");

const imgWrapper = document.querySelector(".imgWrapper");
const imgViewer = imgWrapper.querySelector(".imgViewer");
const container = document.querySelector(".container");
const topNavParent = container.querySelector(".topNavParent");
const hideSidebar = topNavParent.querySelector(".hideSidebar");
const searchForNotes = topNavParent.querySelector(".searchForNotes");
const notesList = container.querySelector(".notesList");
const addNote = container.querySelector(".addNote");

const DEFAULT_THEME = {
  bg: "#ffffff",
  color: "#0c1118",
};

let currentNoteId = null;
let savedEditorRange = null;

const shortcuts = {
  nav: "Ctrl+Shift+S",
  save: "Ctrl+S",
  bold: "Ctrl+B",
  italic: "Ctrl+I",
  underline: "Ctrl+U",
  strikeThrough: "Alt+Shift+S",
};

const icons = {
  nav: `<svg class="navClose" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M14.71 15.88 10.83 12l3.88-3.88a1 1 0 0 0-1.41-1.41L8.71 11.3a1 1 0 0 0 0 1.41l4.59 4.59a1 1 0 0 0 1.41 0 .99.99 0 0 0 0-1.42z"/></svg>`,
  delete: `<svg class="deleteNoteIcon" xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 0 24 24" width="22" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9H6v10zM8 4l1-1h6l1 1h4v2H4V4h4z"/></svg>`,
  color: `<svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 0 24 24" width="22" fill="currentColor"><path d="M12 2a10 10 0 0 0 0 20c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67a.5.5 0 0 1 .36-.83H16a6.5 6.5 0 0 0 0-13.01A9.9 9.9 0 0 0 12 2zM6.5 13A1.5 1.5 0 1 1 8 11.5 1.5 1.5 0 0 1 6.5 13zm3-4A1.5 1.5 0 1 1 11 7.5 1.5 1.5 0 0 1 9.5 9zm5 0A1.5 1.5 0 1 1 16 7.5 1.5 1.5 0 0 1 14.5 9zm3 4A1.5 1.5 0 1 1 19 11.5 1.5 1.5 0 0 1 17.5 13z"/></svg>`,
  add: `<svg xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 0 24 24" width="26" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  toolbar: {
    taskList: "☑",
    bold: "B",
    italic: "<i>I</i>",
    underline: "<u>U</u>",
    strikeThrough: "<s>S</s>",
    codeBlock: "{ }",
    highlight: "HL",
    insertUnorderedList: `<img src="./assets/bullet_list.svg" alt="" />`,
    insertOrderedList: `<img src="./assets/numbered_list.svg" alt="" />`,
    formatBlock: `<img src="./assets/quote.svg" alt="" />`,
    removeFormat: `<img src="./assets/clear_format.svg" alt="" />`,
  },
};

class NotesStore {
  constructor() {
    this.dbName = "NOTESDB";
    this.storeName = "eNotes";
    this.dbVersion = 3;
  }

  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      };

      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async withStore(mode, action) {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeName], mode);
      const store = tx.objectStore(this.storeName);
      const result = action(store);

      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onerror = (e) => {
        db.close();
        reject(e.target.error);
      };
    });
  }

  setNote(note) {
    return this.withStore("readwrite", (store) => store.put(note));
  }

  deleteNote(id) {
    return this.withStore("readwrite", (store) => store.delete(id));
  }

  async getAllNotes() {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeName], "readonly");
      const store = tx.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    });
  }
}

const db = new NotesStore();

init();

async function init() {
  hydrateIcons();
  bindEvents();

  try {
    const notes = await db.getAllNotes();
    notes.forEach(createNewNote);
    restoreSession();
  } catch (error) {
    console.error("Could not load notes:", error);
  }

  refreshEditorState();
}

function hydrateIcons() {
  hideSidebar.innerHTML = icons.nav;
  deleteNoteInEditView.innerHTML = icons.delete;
  noteColorInEditView.innerHTML = icons.color;
  addNote.innerHTML = icons.add;
  hideSidebar.title = `Hide Sidebar (${shortcuts.nav})`;
  noteTitleInEditView.title = `Title (${shortcuts.save} to save)`;
  textareaInEditView.title = `Editor (${shortcuts.save} to save)`;
  noteColorInEditView.title = "Change Theme";
  deleteNoteInEditView.title = "Delete Note";
  addNote.title = "Add Note";
  headingSelect.title = "Heading Level";
  textColorInput.title = "Text Color";

  formatToolbar.querySelectorAll("button").forEach((button) => {
    const key = button.dataset.command || button.dataset.action;
    button.innerHTML = icons.toolbar[key] || "";
    button.title = getFormatTooltip(button);
  });
}

function bindEvents() {
  hideSidebar.addEventListener("click", toggleSidebar);
  addNote.addEventListener("click", () => openNote(createNewNote()));
  deleteNoteInEditView.addEventListener("click", () => deleteCurrentNote());
  noteColorInEditView.addEventListener("pointerdown", showColorPalette);
  textareaInEditView.addEventListener("input", updateCurrentNoteContent);
  noteTitleInEditView.addEventListener("input", updateCurrentNoteTitle);
  searchForNotes.addEventListener("input", searchNotes);
  formatToolbar.addEventListener("mousedown", keepEditorSelection);
  formatToolbar.addEventListener("click", applyFormat);
  headingSelect.addEventListener("change", applyHeading);
  textColorInput.addEventListener("pointerdown", saveEditorSelection);
  textColorInput.addEventListener("input", applyTextColor);
  textareaInEditView.addEventListener("keydown", handleEditorKeys);
  textareaInEditView.addEventListener("keyup", saveEditorSelection);
  textareaInEditView.addEventListener("mouseup", saveEditorSelection);
  textareaInEditView.addEventListener("change", updateCurrentNoteContent);

  textareaInEditView.addEventListener("click", (e) => {
    if (e.target.localName === "img") {
      imgWrapper.style.display = "flex";
      imgViewer.src = e.target.src;
    }
  });

  imgWrapper.addEventListener("click", (e) => {
    if (e.target === imgWrapper) {
      imgWrapper.style.display = "none";
      imgViewer.src = "";
    }
  });

  document.addEventListener("click", (e) => {
    if (
      !colorPaletteInEditView.contains(e.target) &&
      !e.target.closest(".noteColor")
    ) {
      colorPaletteInEditView.classList.remove("colorPaletteShown");
    }
  });

  document.addEventListener("keydown", handleShortcuts);

  allColorSet.forEach((colorSet) => {
    colorSet.addEventListener("click", () => {
      const bg = getComputedStyle(colorSet)
        .getPropertyValue("--background")
        .trim();
      const color = getComputedStyle(colorSet)
        .getPropertyValue("--color")
        .trim();
      applyThemeToCurrent(bg, color);
      colorPaletteInEditView.classList.remove("colorPaletteShown");
    });
  });
}

function keepEditorSelection(e) {
  if (e.target.closest("button[data-command], button[data-action]")) {
    saveEditorSelection();
    e.preventDefault();
  }
}

function getFormatTooltip(button) {
  const labels = {
    bold: `Bold (${shortcuts.bold})`,
    italic: `Italic (${shortcuts.italic})`,
    underline: `Underline (${shortcuts.underline})`,
    strikeThrough: `Strikethrough (${shortcuts.strikeThrough})`,
    taskList: "Checkbox / Task List",
    codeBlock: "Code Block",
    highlight: "Highlight Text",
    insertUnorderedList: "Bullet List (Enter on empty item to exit)",
    insertOrderedList: "Numbered List (Enter on empty item to exit)",
    formatBlock: "Quote (Enter on empty quote to exit)",
    removeFormat: "Clear Formatting",
  };

  return labels[button.dataset.command || button.dataset.action] || button.title || "";
}

function createNewNote(note = {}) {
  const normalized = normalizeNote(note);
  const noteparentDiv = document.createElement("div");
  const parentTop = document.createElement("div");
  const inputText = document.createElement("input");
  const deleteNote = document.createElement("button");
  const textarea = document.createElement("textarea");
  const createdOn = document.createElement("span");
  const modifiedOn = document.createElement("span");

  noteparentDiv.id = normalized.id;
  noteparentDiv.className = "notes";
  parentTop.className = "parentTop";
  inputText.className = "noteTitle";
  deleteNote.className = "deleteNote";
  textarea.className = "noteContent";
  createdOn.className = "createdOn";
  modifiedOn.className = "modifiedOn";

  inputText.type = "text";
  inputText.placeholder = "Title";
  inputText.maxLength = 100;
  inputText.value = normalized.title;
  deleteNote.title = "Delete Note";
  deleteNote.innerHTML = icons.delete;
  textarea.placeholder = "Empty";
  textarea.disabled = true;
  textarea.value = normalized.content;
  createdOn.title = "Date Created";
  createdOn.textContent = normalized.createdOn;
  modifiedOn.title = "Last Edited";
  modifiedOn.textContent = normalized.modifiedOn;

  parentTop.append(inputText, deleteNote);
  noteparentDiv.append(parentTop, textarea, createdOn, modifiedOn);
  notesList.appendChild(noteparentDiv);

  applyThemeToCard(noteparentDiv, normalized.themeBg, normalized.themeColor);

  inputText.addEventListener("click", () => openNote(noteparentDiv));
  inputText.addEventListener("input", () => {
    openNote(noteparentDiv);
    updateCurrentNoteTitle();
  });
  deleteNote.addEventListener("click", () => deleteNoteElement(noteparentDiv));

  saveNoteElement(noteparentDiv);
  notesList.scrollTop = notesList.scrollHeight;
  return noteparentDiv;
}

function normalizeNote(note) {
  const now = getTimestamp();
  return {
    id: note.id || createId(),
    title: note.title || "",
    content: note.content || "",
    themeBg: note.themeBg || DEFAULT_THEME.bg,
    themeColor: note.themeColor || DEFAULT_THEME.color,
    createdOn: note.createdOn || now,
    modifiedOn: note.modifiedOn || now,
  };
}

function openNote(noteElement) {
  if (!noteElement) {
    return;
  }

  document.querySelectorAll(".currentlyEditing").forEach((note) => {
    note.classList.remove("currentlyEditing");
  });

  currentNoteId = noteElement.id;
  noteElement.classList.add("currentlyEditing");
  wrapper.classList.remove("noViewMsgWrapper");
  wrapper.classList.add("containsNote");

  const note = getNoteFromElement(noteElement);
  noteTitleInEditView.value = note.title;
  textareaInEditView.innerHTML = note.content;
  applyThemeToEditor(note.themeBg, note.themeColor);
  refreshEditorState();
  updateSessionStorage();
  updateWordCount();
}

function updateCurrentNoteTitle() {
  const current = getCurrentNoteElement();
  if (!current) {
    return;
  }

  current.querySelector(".noteTitle").value = noteTitleInEditView.value;
  touchNote(current);
  saveNoteElement(current);
  refreshTitle();
}

function updateCurrentNoteContent() {
  const current = getCurrentNoteElement();
  if (!current) {
    return;
  }

  current.querySelector(".noteContent").value = textareaInEditView.innerHTML;
  touchNote(current);
  saveNoteElement(current);
  updateWordCount();
  refreshTitle();
}

function touchNote(noteElement) {
  noteElement.querySelector(".modifiedOn").textContent = getTimestamp();
}

function applyThemeToCurrent(bg, color) {
  const current = getCurrentNoteElement();
  if (!current) {
    return;
  }

  applyThemeToEditor(bg, color);
  applyThemeToCard(current, bg, color);
  saveNoteElement(current);
}

function applyThemeToEditor(bg, color) {
  [noteTitleInEditView, textareaInEditView].forEach((element) => {
    element.style.background = bg;
    element.style.color = color;
  });
  [noteColorInEditView, deleteNoteInEditView].forEach((button) => {
    button.style.background = bg;
    button.style.color = color;
  });
}

function applyThemeToCard(noteElement, bg, color) {
  noteElement
    .querySelectorAll(
      ".noteTitle, .noteContent, .createdOn, .modifiedOn, .deleteNote",
    )
    .forEach((element) => {
      element.style.background = bg;
      element.style.color = color;
    });
}

async function deleteCurrentNote() {
  const current = getCurrentNoteElement();
  if (current) {
    await deleteNoteElement(current);
  }
}

async function deleteNoteElement(noteElement) {
  const note = getNoteFromElement(noteElement);
  const fallbackTitle = stripHtml(note.content).slice(0, 30) || "<No Title>";
  const title = note.title || fallbackTitle;

  if (!confirm(`Are you sure you want to delete "${title}"?`)) {
    return;
  }

  await db.deleteNote(note.id);
  noteElement.remove();

  if (currentNoteId === note.id) {
    currentNoteId = null;
    noteTitleInEditView.value = "";
    textareaInEditView.innerHTML = "";
    wrapper.classList.add("noViewMsgWrapper");
    wrapper.classList.remove("containsNote");
    colorPaletteInEditView.classList.remove("colorPaletteShown");
    updateSessionStorage();
    refreshEditorState();
  }
}

function applyFormat(e) {
  const button = e.target.closest("button[data-command], button[data-action]");
  if (!button || !currentNoteId) {
    return;
  }

  e.preventDefault();
  restoreEditorSelection();

  if (button.dataset.action) {
    applyCustomFormat(button.dataset.action);
    return;
  }

  const command = button.dataset.command;
  if (command === "removeFormat") {
    clearFormatting();
    updateCurrentNoteContent();
    saveEditorSelection();
    return;
  }

  if (
    command === "formatBlock" &&
    button.dataset.value === "blockquote" &&
    getSelectionElement()?.closest("blockquote")
  ) {
    document.execCommand("formatBlock", false, "<div>");
    updateCurrentNoteContent();
    saveEditorSelection();
    return;
  }

  const value =
    command === "formatBlock"
      ? `<${button.dataset.value}>`
      : button.dataset.value || null;
  document.execCommand(command, false, value);
  updateCurrentNoteContent();
  saveEditorSelection();
}

function applyCustomFormat(action) {
  const actions = {
    taskList: insertTaskList,
    codeBlock: insertCodeBlock,
    highlight: applyHighlight,
  };

  actions[action]?.();
  updateCurrentNoteContent();
  saveEditorSelection();
}

function applyHeading() {
  if (!currentNoteId) {
    headingSelect.value = "";
    return;
  }

  restoreEditorSelection();
  const selectionElement = getSelectionElement();
  const currentHeading = selectionElement?.closest("h1, h2, h3");
  const selectedHeading = headingSelect.value;
  const block =
    selectedHeading && currentHeading?.tagName.toLowerCase() !== selectedHeading
      ? `<${selectedHeading}>`
      : "<div>";

  document.execCommand("formatBlock", false, block);
  headingSelect.value = "";
  updateCurrentNoteContent();
  saveEditorSelection();
}

function applyTextColor() {
  if (!currentNoteId) {
    return;
  }

  restoreEditorSelection();
  document.execCommand("foreColor", false, textColorInput.value);
  updateCurrentNoteContent();
  saveEditorSelection();
}

function insertTaskList() {
  const taskLine = getSelectionElement()?.closest(".taskLine");
  if (taskLine && textareaInEditView.contains(taskLine)) {
    unwrapTaskLine(taskLine);
    return;
  }

  const selectedText = getSelectedText() || "Task";
  const items = selectedText
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  const taskHtml = (items.length ? items : ["Task"])
    .map(
      (item) =>
        `<div class="taskLine"><input type="checkbox"> <span>${escapeHtml(item)}</span></div>`,
    )
    .join("");

  document.execCommand("insertHTML", false, `${taskHtml}<div><br></div>`);
}

function insertCodeBlock() {
  const codeBlock = getSelectionElement()?.closest("pre");
  if (codeBlock && textareaInEditView.contains(codeBlock)) {
    const line = document.createElement("div");
    line.textContent = codeBlock.innerText;
    codeBlock.replaceWith(line);
    placeCaretAtStart(line);
    return;
  }

  const selectedText = getSelectedText() || "code";
  document.execCommand(
    "insertHTML",
    false,
    `<pre><code>${escapeHtml(selectedText)}</code></pre><div><br></div>`,
  );
}

function applyHighlight() {
  const selection = window.getSelection();
  const mark = getSelectionElement()?.closest("mark");

  if (mark && textareaInEditView.contains(mark)) {
    unwrapElement(mark);
    return;
  }

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    document.execCommand("insertHTML", false, "<mark>highlight</mark>&nbsp;");
    return;
  }

  const range = selection.getRangeAt(0);
  const highlight = document.createElement("mark");
  highlight.appendChild(range.extractContents());
  range.insertNode(highlight);
  range.setStartAfter(highlight);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function clearFormatting() {
  const semanticFormats = getSelectedElements("h1, h2, h3, mark, pre, code");
  const selectionElement = getSelectionElement();
  const closestSemanticFormat =
    selectionElement?.closest("pre") ||
    selectionElement?.closest("h1, h2, h3, mark, code");

  document.execCommand("removeFormat", false, null);

  if (semanticFormats.length) {
    semanticFormats.forEach((element) => {
      if (element.isConnected) {
        clearSemanticElement(element);
      }
    });
  } else if (closestSemanticFormat?.isConnected) {
    clearSemanticElement(closestSemanticFormat);
  }
}

function handleEditorKeys(e) {
  if (e.key !== "Enter" || e.shiftKey) {
    return;
  }

  const selectionElement = getSelectionElement();
  const listItem = selectionElement?.closest("li");
  const quote = selectionElement?.closest("blockquote");
  const taskLine = selectionElement?.closest(".taskLine");

  if (taskLine && textareaInEditView.contains(taskLine)) {
    e.preventDefault();

    if (taskLine.innerText.trim() === "") {
      const line = document.createElement("div");
      line.innerHTML = "<br>";
      taskLine.after(line);
      taskLine.remove();
      placeCaretAtStart(line);
    } else {
      const nextTask = createTaskLine("");
      taskLine.after(nextTask);
      placeCaretAtStart(nextTask.querySelector("span"));
    }

    updateCurrentNoteContent();
    return;
  }

  if (listItem && textareaInEditView.contains(listItem)) {
    if (listItem.innerText.trim() !== "") {
      return;
    }

    e.preventDefault();
    const command =
      listItem.parentElement?.tagName === "OL"
        ? "insertOrderedList"
        : "insertUnorderedList";
    document.execCommand(command, false, null);
    document.execCommand("formatBlock", false, "<div>");
    updateCurrentNoteContent();
    return;
  }

  if (
    quote &&
    textareaInEditView.contains(quote) &&
    quote.innerText.trim() === ""
  ) {
    e.preventDefault();
    const line = document.createElement("div");
    line.innerHTML = "<br>";
    quote.after(line);
    quote.remove();
    placeCaretAtStart(line);
    updateCurrentNoteContent();
  }
}

function showColorPalette(e) {
  e.preventDefault();
  e.stopPropagation();
  if (!currentNoteId) {
    return;
  }

  colorPaletteInEditView.classList.toggle("colorPaletteShown");
  const rect = noteColorInEditView.getBoundingClientRect();
  const left = Math.min(rect.left, window.innerWidth - 220);
  colorPaletteInEditView.style.left = `${Math.max(12, left)}px`;
  colorPaletteInEditView.style.top = `${rect.bottom + 8}px`;
}

function getSelectionElement() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const node = selection.getRangeAt(0).startContainer;
  return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}

function saveEditorSelection() {
  const selection = window.getSelection();
  if (
    selection &&
    selection.rangeCount > 0 &&
    textareaInEditView.contains(selection.anchorNode)
  ) {
    savedEditorRange = selection.getRangeAt(0).cloneRange();
  }
}

function restoreEditorSelection() {
  textareaInEditView.focus();
  if (!savedEditorRange) {
    return;
  }

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(savedEditorRange);
}

function getSelectedText() {
  const selection = window.getSelection();
  return selection ? selection.toString() : "";
}

function getSelectedElements(selector) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return [];
  }

  const range = selection.getRangeAt(0);
  return Array.from(textareaInEditView.querySelectorAll(selector)).filter(
    (element) => range.intersectsNode(element),
  );
}

function createTaskLine(text) {
  const taskLine = document.createElement("div");
  const checkbox = document.createElement("input");
  const label = document.createElement("span");

  taskLine.className = "taskLine";
  checkbox.type = "checkbox";
  label.textContent = text;
  taskLine.append(checkbox, label);
  return taskLine;
}

function unwrapTaskLine(taskLine) {
  const line = document.createElement("div");
  line.textContent = taskLine.innerText.trim() || "Task";
  taskLine.replaceWith(line);
  placeCaretAtStart(line);
}

function unwrapElement(element) {
  const fragment = document.createDocumentFragment();
  while (element.firstChild) {
    fragment.appendChild(element.firstChild);
  }
  element.replaceWith(fragment);
}

function clearSemanticElement(element) {
  const tagName = element.tagName.toLowerCase();

  if (["h1", "h2", "h3", "pre"].includes(tagName)) {
    const line = document.createElement("div");
    line.textContent = element.innerText;
    element.replaceWith(line);
    return;
  }

  unwrapElement(element);
}

function placeCaretAtStart(element) {
  const range = document.createRange();
  const selection = window.getSelection();

  range.selectNodeContents(element);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  saveEditorSelection();
}

function toggleSidebar() {
  const isClosed = container.classList.toggle("sidebarClosed");
  hideSidebar.title = `${isClosed ? "Show Notes List" : "Hide Sidebar"} (${shortcuts.nav})`;
  hideSidebar.querySelector("svg").style.transform = isClosed
    ? "rotate(180deg)"
    : "";
  updateSessionStorage();
}

function searchNotes() {
  const query = searchForNotes.value.trim().toLowerCase();
  document.querySelectorAll(".notes").forEach((noteElement) => {
    const note = getNoteFromElement(noteElement);
    const haystack = `${note.title} ${stripHtml(note.content)}`.toLowerCase();
    noteElement.style.display = haystack.includes(query) ? "" : "none";
  });
}

function handleShortcuts(e) {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
    toggleSidebar();
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
    e.preventDefault();
    saveCurrentNote();
    return;
  }

  if (e.altKey && e.shiftKey && e.key.toLowerCase() === "s") {
    e.preventDefault();
    textareaInEditView.focus();
    document.execCommand("strikeThrough");
    updateCurrentNoteContent();
  }
}

function saveCurrentNote() {
  const current = getCurrentNoteElement();
  if (current) {
    saveNoteElement(current);
  }
}

function saveNoteElement(noteElement) {
  const note = getNoteFromElement(noteElement);
  if (note.title || stripHtml(note.content)) {
    db.setNote(note).catch((error) =>
      console.error("Could not save note:", error),
    );
  }
}

function getNoteFromElement(noteElement) {
  const title = noteElement.querySelector(".noteTitle");
  const content = noteElement.querySelector(".noteContent");
  const createdOn = noteElement.querySelector(".createdOn");
  const modifiedOn = noteElement.querySelector(".modifiedOn");

  return {
    id: noteElement.id,
    title: title.value,
    content: content.value,
    themeBg: title.style.background || DEFAULT_THEME.bg,
    themeColor: title.style.color || DEFAULT_THEME.color,
    createdOn: createdOn.textContent,
    modifiedOn: modifiedOn.textContent,
  };
}

function getCurrentNoteElement() {
  return currentNoteId ? document.getElementById(currentNoteId) : null;
}

function refreshEditorState() {
  const hasNote = Boolean(currentNoteId);
  noteTitleInEditView.disabled = !hasNote;
  textareaInEditView.setAttribute("contenteditable", hasNote);
  deleteNoteInEditView.disabled = !hasNote;
  noteColorInEditView.disabled = !hasNote;
  headingSelect.disabled = !hasNote;
  textColorInput.disabled = !hasNote;
  formatToolbar.querySelectorAll("button").forEach((button) => {
    button.disabled = !hasNote;
  });
  refreshTitle();
}

function refreshTitle() {
  const current = getCurrentNoteElement();
  if (!current) {
    document.title = "Electro Notes";
    return;
  }

  const note = getNoteFromElement(current);
  const generatedTitle = stripHtml(note.content).slice(0, 30) || "<No Title>";
  document.title = `Electro Notes/${note.title || generatedTitle}`;
}

function updateWordCount() {
  const text = textareaInEditView.innerText.replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ") : [];
  const chars = text.replace(/\s/g, "").length;
  wrapper.querySelector(".wordCount").textContent =
    `${words.length} W; ${chars} C`;
}

function restoreSession() {
  const sessionNote = sessionStorage.getItem("currentSessionNote");
  const noteToOpen = sessionNote ? document.getElementById(sessionNote) : null;

  if (noteToOpen) {
    openNote(noteToOpen);
  }

  if (sessionStorage.getItem("isNavCloseOpen") === "closed") {
    container.classList.add("sidebarClosed");
    hideSidebar.title = `Show Notes List (${shortcuts.nav})`;
    hideSidebar.querySelector("svg").style.transform = "rotate(180deg)";
  }
}

function updateSessionStorage() {
  sessionStorage.setItem(
    "isNavCloseOpen",
    container.classList.contains("sidebarClosed") ? "closed" : "opened",
  );

  if (currentNoteId) {
    sessionStorage.setItem("currentSessionNote", currentNoteId);
  } else {
    sessionStorage.removeItem("currentSessionNote");
  }
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.innerText.trim();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function createId() {
  return Math.random().toString(36).slice(2);
}

function getTimestamp() {
  const d = new Date();
  const hour = d.getHours() > 12 ? d.getHours() - 12 : d.getHours() || 12;
  const minutes = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes();
  const AMoPM = d.getHours() >= 12 ? "PM" : "AM";
  const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  return `${date}, ${hour}:${minutes} ${AMoPM}`;
}
