// Register form submit event
document
  .getElementById("register")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get form values
    const username = document.getElementById("register-username").value;
    const fullname = document.getElementById("register-fullname").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById(
      "register-confirm-password"
    ).value;

    // Function to display messages
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

      // Hide the message after 20 seconds
      setTimeout(function () {
        messageElement.style.display = "none";
      }, 3000);
    };

    // Function to clear the form
    const clearForm = function () {
      document.getElementById("register-username").value = "";
      document.getElementById("register-fullname").value = "";
      document.getElementById("register-email").value = "";
      document.getElementById("register-password").value = "";
      document.getElementById("register-confirm-password").value = "";
    };

    // Perform validation
    if (password !== confirmPassword) {
      showMessage("Passwords do not match");
      return;
    }

    // Send the registration data to the server
    fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        fullname: fullname,
        email: email,
        password: password,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Registration failed");
        }
      })
      .then((data) => {
        showMessage(data.message);
        showMessage("success. You would be redirected to log in", data.message);
        // Redirect to login page after 2 seconds
        setTimeout(function () {
          window.location.href = "/login";
        }, 2000);
      })
      .catch((error) => {
        console.error(error);
        showMessage("Username or email is already registered", "error");
      });
  });
