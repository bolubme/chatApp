// Login form submit event
document.getElementById("login").addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the form from submitting

  // Get form values
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  // Function to display messages
  // Function to show a message
  const showMessage = function (message, isError) {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;

    // Apply error class if isError is true
    if (isError) {
      messageElement.classList.add("error");
    } else {
      messageElement.classList.remove("error");
    }

    // Show the message
    messageElement.style.display = "block";

    // Hide the message after 3 seconds
    setTimeout(function () {
      messageElement.style.display = "none";
    }, 3000);
  };

  // Function to clear the form
  const clearForm = function () {
    document.getElementById("login-username").value = "";
    document.getElementById("login-password").value = "";
  };

  // Send the login data to the server
  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username,
      password: password,
    }),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Login failed");
      }
    })
    .then((data) => {
      // Save the logged-in user to local storage
      localStorage.setItem("loggedInUser", JSON.stringify(data));

      // Redirect to the profile page or perform any other necessary action
      window.location.href = "/chat";
    })
    .catch((error) => {
      console.error(error);
      showMessage("Log in Details is wrong", "error");
      clearForm();
    });
});

// // Clear session on tab close
// window.addEventListener('beforeunload', function () {
//   localStorage.removeItem('session');
// });
