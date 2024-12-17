const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const statusDiv = document.getElementById("status");

const baseUrl = "http://192.168.100.199/servo";
const modeUrl = "http://192.168.100.199/mode";
const ldrUrl = "http://192.168.100.199/ldr";

let currentMode = "manual"; // Default mode awal
let lastServoCommand = "none"; // Status terakhir servo, default tidak ada

// Fungsi untuk mengambil mode saat ini dari server
function getCurrentMode() {
  fetch("http://192.168.100.199/getmode")
    .then((response) => response.text())
    .then((mode) => {
      currentMode = mode; // Perbarui currentMode
      updateStatusText();
      toggleManualControls(mode);
    })
    .catch((error) => {
      console.error("Error fetching current mode:", error);
    });
}

// Fungsi untuk memperbarui tampilan status
function updateStatusText() {
  statusDiv.innerText = `Status: ${
    currentMode === "auto"
      ? "Otomatis"
      : `Manual
      ${lastServoCommand}`
  }`;
}

// Fungsi untuk mengubah mode
function setMode(mode) {
  currentMode = mode;
  lastServoCommand = "-"; // Reset status servo saat mode diganti
  updateStatusText();
  toggleManualControls(mode);

  fetch(`${modeUrl}?mode=${mode}`)
    .then((response) => response.text())
    .then((data) => {
      console.log(`Mode response: ${data}`);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Tampilkan atau sembunyikan kontrol manual
function toggleManualControls(mode) {
  const manualControls = document.getElementById("manualControls");
  manualControls.style.display = mode === "auto" ? "none" : "block";
}

// Fungsi untuk mengirimkan perintah servo
function sendCommand(direction) {
  if (currentMode === "auto") {
    statusDiv.innerText =
      "Mode otomatis aktif. Tidak bisa mengontrol secara manual.";
    return;
  }

  // Ubah teks status untuk "Buka" atau "Tutup" sesuai perintah
  if (direction === "left") {
    lastServoCommand = "Menutup Gorden"; // Kiri -> Tutup
  } else if (direction === "right") {
    lastServoCommand = "Membuka Gorden"; // Kanan -> Buka
  }

  updateStatusText();

  fetch(`${baseUrl}?direction=${direction}`)
    .then((response) => response.text())
    .then((data) => {
      console.log(`Response: ${data}`);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Fungsi untuk memperbarui nilai LDR
function updateLDR() {
  fetch(ldrUrl)
    .then((response) => response.text())
    .then((data) => {
      console.log("LDR Value Received:", data);
      document.getElementById(
        "ldrValue"
      ).innerText = `Intensitas Cahaya: ${data}`;
    })
    .catch((error) => {
      console.error("Error fetching LDR value:", error);
    });
}

// Event listener untuk tombol manual
leftButton.addEventListener("mousedown", () => sendCommand("left"));
rightButton.addEventListener("mousedown", () => sendCommand("right"));

// Lepaskan tombol, hanya mengirim 'stop' tanpa memengaruhi tampilan status
leftButton.addEventListener("mouseup", () =>
  fetch(`${baseUrl}?direction=stop`)
);
rightButton.addEventListener("mouseup", () =>
  fetch(`${baseUrl}?direction=stop`)
);

// Ambil status mode saat halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  getCurrentMode();
});

// Update nilai LDR setiap 1 detik
setInterval(updateLDR, 1000);