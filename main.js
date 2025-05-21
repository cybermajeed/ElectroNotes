let hamBurgBtn = document.querySelector(".hamBurgBtn");
let sideBar = document.querySelector("#sideBar");
let gptMore = document.querySelector(".cheapgptMore .more");
let gptMoreBox = document.querySelector(".cheapgptMore .moreBox");
let chatsList = document.querySelector(".chatsList");
let chatArea = document.getElementById("chatArea");
let emptyMsg = document.getElementById("emptyMsg");
let wrapper = document.querySelector(".wrapper");
let newChatBtn = document.querySelector("#sideBar .newChatBtn");

let promptArea = document.getElementById("prompt");
let submit = document.getElementById("submit");

gptMore.onclick = (e) => {
  if (getComputedStyle(gptMoreBox).display == "none") {
    gptMoreBox.style.display = "flex";
  } else {
    gptMoreBox.style.display = "none";
  }
};

hamBurgBtn.onclick = (op) => {
  if (getComputedStyle(sideBar).left == "0px") {
    sideBar.style.left = "-100%";
    op = 1;
  } else {
    sideBar.style.left = "0";
    op = 0.3;
  }
  [promptArea.parentElement, chatArea].forEach((e) => {
    e.style.opacity = op;
  });
};

promptArea.oninput = () => {
  submit.disabled = !promptArea.value.trim();
};

window.onkeyup = (e) => {
  e.preventDefault();
  if (e.keyCode == 13 && !e.shiftKey) {
    submit.click();
  }
};

let chatsData = {};
let chatsDataTitle = {};
if (!localStorage.chatsDB) {
  localStorage.setItem("chatsDB", JSON.stringify(chatsData));
} else {
  chatsData = JSON.parse(localStorage.chatsDB);
}
if (!localStorage.chatsDBTitle) {
  localStorage.setItem("chatsDBTitle", JSON.stringify(chatsDataTitle));
} else {
  chatsDataTitle = JSON.parse(localStorage.chatsDBTitle);
}
submit.onclick = async () => {
  let promptValue = promptArea.value.trim();
  if (!promptValue) return;
  wrapper.style.display = "flex";
  emptyMsg.style.display = "none";
  submit.disabled = true;
  submit.innerHTML = "stop_circle";
  promptArea.value = "";
  let userMsg = document.createElement("div");
  userMsg.classList.add("userMsg");
  userMsg.classList.add("msgBox");
  userMsg.innerText = promptValue;
  wrapper.appendChild(userMsg);
  chatArea.scrollTop = chatArea.scrollHeight;
  //  <div class="msgBox userMsg">Who are you?</div>
  //  <div class="msgBox gptMsg">Hello there! I am CheapGPT</div>
  marked.setOptions({
    breaks: true,
  });
  let gptMsg = document.createElement("div");
  gptMsg.classList.add("gptMsg");
  gptMsg.classList.add("msgBox");
  gptMsg.innerHTML = `<div id="loadBubble">
  <span></span>
  <span></span>
  <span></span>
  </div>`;
  wrapper.appendChild(gptMsg);
  chatArea.scrollTop = chatArea.scrollHeight;
  let reply = await getResponse(promptValue);
  gptMsg.textContent = reply;

  renderMathInElement(gptMsg, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "\\[", right: "\\]", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
    ],
    throwOnError: false,
  });
  reply = marked.parse(gptMsg.innerHTML);
  gptMsg.innerHTML = reply;
  chatArea.scrollTop = chatArea.scrollHeight;
  //
  let id_;
  if (wrapper.classList.contains("newChat")) {
    let title_in_list = promptValue.slice(0, 15);
    id_ = Math.random().toString(36).slice(5);
    chatsList.innerHTML += `<span id='${id_}' class="title">${title_in_list}</span>`;
    //<span class="title">chat#1</span>
    wrapper.classList.add(id_);
    wrapper.classList.remove("newChat");
  }
  chatsData[wrapper.classList[1]] = wrapper.innerHTML;
  chatsDataTitle[wrapper.classList[1]] = promptValue.slice(0, 15);
  addDeleteBtn();
  localStorage.setItem("chatsDB", JSON.stringify(chatsData));
  localStorage.setItem("chatsDBTitle", JSON.stringify(chatsDataTitle));
};
titleStore = JSON.parse(localStorage.chatsDBTitle);
if (titleStore) {
  for (let i in titleStore) {
    chatsList.innerHTML += `<span id='${i}' class="title">${titleStore[i]}</span>`;
  }
  addDeleteBtn();
}
function addDeleteBtn() {
  chatsList.querySelectorAll(".title").forEach((t) => {
    t.oncontextmenu = (e) => {
      e.preventDefault();
      if (chatsList.querySelector(".deleteBtn")) {
        chatsList.querySelector(".deleteBtn").remove();
      }
      let deleteBox = document.createElement("div");
      deleteBox.classList.add("deleteBtn");
      deleteBox.innerText = "Delete";
      deleteBox.innerHTML +=
        '<span class="material-symbols-rounded">delete</span>';
      t.appendChild(deleteBox);
      deleteBox.style.right = 5 + "px";
      deleteBox.style.top = e.y + 20 + "px";
    };
    t.onclick = () => {
      wrapper.classList.replace(wrapper.classList[1], t.id);
      emptyMsg.style.display = "none";
      wrapper.innerHTML = chatsData[t.id];
    };
  });
}
//delete
window.onclick = (e) => {
  let deleteBox = chatsList.querySelector(".deleteBtn");
  if (deleteBox) {
    if (e.target != deleteBox) {
      deleteBox.remove();
    } else {
      if (confirm("Are you sure you want to delete this?")) {
        let _id = deleteBox.parentElement.id;
        deleteBox.parentElement.remove();
        wrapper.classList.add("newChat");
        if (wrapper.classList.contains(_id)) {
          wrapper.classList.remove(_id);
        }
        wrapper.innerHTML = "";
        emptyMsg.style.display = "flex";
        delete chatsData[_id];
        delete chatsDataTitle[_id];
        localStorage.setItem("chatsDB", JSON.stringify(chatsData));
        localStorage.setItem("chatsDBTitle", JSON.stringify(chatsDataTitle));
      }
    }
  }
};
async function getResponse(promptValue) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: "Bearer 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",
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost/", 
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1:free",
      messages: [
        {
          role: "user",
          content: promptValue,
        },
      ],
    }),
  });
  //submit.disabled = false;
  const data = await res.json();
  submit.innerHTML = "arrow_upward";
  return data.choices?.[0]?.message?.content || "Rate limit exceeded!";
}

newChatBtn.onclick = () => {
  wrapper.classList.replace(wrapper.classList[1], "newChat");
  wrapper.innerHTML = "";
  emptyMsg.style.display = "flex";
};
