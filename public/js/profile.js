    // Retrieve the logged-in user data from local storage
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      const user = JSON.parse(loggedInUser);
      document.getElementById("profile-username").innerText =
        "Username: " + user.username;
      document.getElementById("profile-fullname").innerText =
        "Full Name: " + user.fullname;
      document.getElementById("profile-email").innerText =
        "Email: " + user.email;

      // Split the full name into first and last name
      const nameParts = user.fullname.split(" ");
      const firstName = nameParts[0] || "!";
      const lastName = nameParts[1] || "!";

      // API call using the name
      fetch(
        `https://ui-avatars.com/api/?name=${firstName}+${lastName}&color=random&background=random`
      )
        .then((response) => response.blob())
        .then((blob) => {
          // Create an object URL from the blob
          const imageUrl = URL.createObjectURL(blob);

          // Display the image in the UI
          const profileImage = document.getElementById("profile-image");
          profileImage.src = imageUrl;
          profileImage.alt = "Profile Image of " + user.fullname;

          // Save the image link to the logged-in user's object in localStorage
          user.image = imageUrl;
          localStorage.setItem("loggedInUser", JSON.stringify(user));
        })
        .catch((error) => console.error(error));
    } else {
      // User not logged in, redirect to the login page
      window.location.href = "login.html";
    }

    // Function to generate a random color
    function generateRandomColor() {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }