document.addEventListener("DOMContentLoaded", () => {
  const messageInput = document.getElementById("message-input");
  const sendButton = document.querySelector(".send-button");
  const messageList = document.getElementById("message-list");
  const messageCont = document.querySelector(".chat-history");
  const roomName = document.querySelector("#current-group-header");
  const userList = document.querySelector(".chat-available-user");
  const modal = document.getElementById("myModal");
  const groupList = document.getElementById("groupList");
  const existChat = document.querySelector("#leave-button");

  // get username from local Storage and other details...
  let username;
  let room;
  let img;

  // Check if the user is already logged in
  const savedUsername = localStorage.getItem("loggedInUser");
  let obj = JSON.parse(savedUsername);
  if (obj) {
    username = obj.username;
    img =obj.image
  }

  const socket = io();

  socket.on("groupChatCreated", (groupChat) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `<a>
          <i class="fa fa-users"></i>
          <span id="current-group-header">${groupChat.name}</span>
      </a>
      `;

    groupList.appendChild(listItem);
  });

  document
    .getElementById("createGroupChatForm")
    .addEventListener("submit", async (event) => {
      event.preventDefault();

      const groupName = document.getElementById("groupName").value;
      document.getElementById("groupName").value = "";

      try {
        const response = await fetch("/groupchats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: groupName }),
        });

        if (response.ok) {
          const groupChat = await response.json();
          console.log("Group chat created:", groupChat);
        } else {
          console.error("Failed to create Group chat");
        }
      } catch (err) {
        console.error("An error occurred:", err);
      }
    });

  fetch("/groupchats")
    .then((response) => response.json())
    .then((groupChats) => {
      groupChats.forEach((groupChat) => {
        const listItem = document.createElement("li");
        listItem.textContent = groupChat.name;
        listItem.innerHTML = `<a>
              <i class="fa fa-users"></i>
              <span id="current-group-header">${groupChat.name}</span>
          </a>
          `;
        groupList.appendChild(listItem);
      });
    })
    .catch((err) => console.error("Failed to retrieve Group chats:", err));

  groupList.addEventListener("click", (event) => {
    const clickedLi = event.target.closest("li");
    if (!clickedLi) return;
    console.log(clickedLi);

    const clickedHeader = clickedLi.querySelector("#current-group-header");
    const groupHeaderText = clickedHeader.textContent;

    if (groupHeaderText === room) {
      return;
    }

    // Join the new room
    room = groupHeaderText;
    socket.emit("joinRoom", { username, room });
    groupList.innerHTML = "";

    // Get room and users
    socket.on("roomUsers", ({ room, users }) => {
      outputRoomName(room);
      outputUsers(users);
    });

    // Message from server
    socket.on("message", (message) => {
      console.log(message);
      if (message.username === username) {
        renderMessage("my", message);
      } else {
        renderMessage("other", message);
      }
    });

    socket.on("previousMessages", (messages) => {
      messages.forEach((message) => {
        let messageContainer = messageList;
        if (message.sender === username) {
          let el = document.createElement("li");
          el.setAttribute("class", "clearfix");
          el.innerHTML = `
                        <div class="message-data float-right">
                        <span class="message-data-time">${getDayAndMonth(
                          message.timestamp
                        )}, ${message.sender}</span>
                        <img src="https://bootdey.com/img/Content/avatar/avatar7.png" alt="avatar">
                        </div>
                        <div style="height: 60px;"></div>
                        <div class="message other-message float-right">${
                          message.message
                        }</div>
                        `;
          messageContainer.appendChild(el);
        } else {
          let el = document.createElement("li");
          el.setAttribute("class", "clearfix");
          el.innerHTML = `
            <div class="message-data">
            <span class="message-data-time">${getDayAndMonth(
              message.timestamp
            )}, ${message.sender}</span>
              </div>
            <div class="message my-message">${message.message}</div>
                        `;
          messageContainer.appendChild(el);
        }
      });
    });
  });

  // Disconnect from the current room
  socket.emit("leaveRoom", { room });

  // Message Submit
  sendButton.addEventListener("click", (e) => {
    e.preventDefault();

    //Get Message text
    const msg = messageInput.value.trim();
    // Emit message to server
    socket.emit("chatMessage", msg);
    // Clear input
    messageInput.value = "";
    messageInput.focus();
  });

  // To Leave Group
  existChat.addEventListener("click", function () {
    // Reload the web page
    location.reload();
  });

  //Output message to DOM
  function renderMessage(type, message) {
    let messageContainer = messageList;
    if (type == "my") {
      let el = document.createElement("li");
      el.setAttribute("class", "clearfix");
      el.innerHTML = `
          <div class="message-data float-right">
          <span class="message-data-time">${message.time}, ${message.username}</span>
          <img src="${img}" alt="avatar">
          </div>
          <div style="height: 60px;"></div>
          <div class="message other-message float-right">${message.text}</div>
          `;
      messageContainer.appendChild(el);
    } else if (type == "other") {
      let el = document.createElement("li");
      el.setAttribute("class", "clearfix");
      el.innerHTML = `
          <div class="message-data">
          <span class="message-data-time">${message.time}, ${message.username}</span>
          </div>
          <div class="message my-message">${message.text}</div>
          `;
      messageContainer.appendChild(el);
    }

    // Scroll down
    messageCont.scrollTop = messageCont.scrollHeight;
  }

  function getDayAndMonth(dateString) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // January is 0, so we add 1 to get the actual month

    return `${day} ago`;
  }

  // Add room name to dom
  function outputRoomName(room) {
    roomName.innerHTML = room;
  }

  // Add users to Dom
  function outputUsers(users) {
    console.log(users);
    userList.innerHTML = `
          ${users
            .map(
              (user) =>
                `   <li>
              <i class="fa fa-circle text-success"></i>
              ${user.username}
          </li>`
            )
            .join("")}
      `;
  }
});
