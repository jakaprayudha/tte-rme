const loginForm = document.getElementById("loginForm");

const loginButton = document.getElementById("loginButton");

const alertBox = document.getElementById("alertBox");

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

/* =========================================
   CHECK SESSION SAAT HALAMAN DIBUKA
========================================= */

async function checkLoginSession() {
  try {
    const response = await fetch(
      "../api/controller/AdminSessionController.php",
      {
        credentials: "include",
      },
    );

    const result = await response.json();

    if (result.success && result.logged_in) {
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    console.error("Session check error:", error);
  }
}

checkLoginSession();

/* =========================================
   LOGIN
========================================= */

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();

  const password = passwordInput.value;

  const originalButton = loginButton.innerHTML;

  alertBox.innerHTML = "";

  loginButton.disabled = true;

  loginButton.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Memproses Login...
    `;

  try {
    const response = await fetch("../api/controller/AdminLoginController.php", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const result = await response.json();

    if (result.success) {
      loginButton.innerHTML = `
                <i class="fa-solid fa-check"></i>
                Login Berhasil
            `;

      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 700);
    } else {
      showError(result.message || "Username atau password salah.");
    }
  } catch (error) {
    console.error(error);

    showError("Gagal terhubung ke server.");
  } finally {
    setTimeout(function () {
      loginButton.disabled = false;

      loginButton.innerHTML = originalButton;
    }, 1000);
  }
});

/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {
  alertBox.innerHTML = `
        <div class="alert-error">

            <i class="fa-solid fa-circle-exclamation"></i>

            <span>${message}</span>

        </div>
    `;
}

/* =========================================
   SHOW / HIDE PASSWORD
========================================= */

togglePassword.addEventListener("click", function () {
  const icon = togglePassword.querySelector("i");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";

    icon.classList.remove("fa-eye");

    icon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";

    icon.classList.remove("fa-eye-slash");

    icon.classList.add("fa-eye");
  }
});
