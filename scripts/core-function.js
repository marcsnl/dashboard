//--------------- Dark Mode toggle logic ---------------

const darkToggle = document.querySelector(".dark-mode-btn i");
const colorText = document.querySelectorAll(".color-text");
const boxElements = document.querySelectorAll(".box");
const lightImages = document.querySelectorAll('.light-img');
const darkImages = document.querySelectorAll('.dark-img');
const root = document.querySelector(":root");

// Default colors for light mode (CSS variables)
const defaultLightModeColors = [
  "#fff",       // --white
  "#000000",    // --text-color
  "#000",       // --primary-color
  "#272B2F",    // --secondary-color
  "#fff"        // --ui-bg
];

// Function to apply theme colors
function applyThemeColors(colors) {
  root.style.setProperty("--white", colors[0]);
  root.style.setProperty("--text-color", colors[1]);
  root.style.setProperty("--primary-color", colors[2]);
  root.style.setProperty("--secondary-color", colors[3]);
  root.style.setProperty("--ui-bg", colors[4]);
}

// Function to toggle dark mode classes
function toggleDarkMode(darkModeStyle) {
  const method = darkModeStyle ? "add" : "remove";
  colorText.forEach(el => el.classList[method]("darkMode"));
  boxElements.forEach(el => el.classList[method]("darkMode"));
}

// Handle dark mode toggle
darkToggle.addEventListener("click", () => {
  const isDarkMode = darkToggle.classList.contains("fa-moon");
  const colorData = darkToggle.getAttribute("data-color").split(" "); // Get color data from the button
  
  if (isDarkMode) {
    // Switch to dark mode
    darkToggle.classList.replace("fa-moon", "fa-sun");
    toggleDarkMode(true);
    applyThemeColors(colorData); // Apply the color theme when dark mode is activated
    darkToggle.parentElement.title = "Light Mode";

    // Show dark images, hide light images
    lightImages.forEach(img => img.classList.add('hidden'));
    darkImages.forEach(img => img.classList.remove('hidden'));
    
  } else {
    // Switch to light mode
    darkToggle.classList.replace("fa-sun", "fa-moon");
    toggleDarkMode(false);
    applyThemeColors(defaultLightModeColors); // Apply the default light mode colors
    darkToggle.parentElement.title = "Dark Mode";

    // Show light images, hide dark images
    lightImages.forEach(img => img.classList.remove('hidden'));
    darkImages.forEach(img => img.classList.add('hidden'));
  }
});

//--------------- Tab Navigation logic ---------------

const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll(".page-content");

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    navLinks.forEach(nav => nav.classList.remove("active-nav"));
    link.classList.add("active-nav");

    sections.forEach(sec => sec.classList.remove("active-section"));
    const targetID = link.getAttribute("href").substring(1);
    document.getElementById(targetID).classList.add("active-section");
  });
});

//--------------- Nav Menu logic for Phones ---------------

const toggle = document.querySelector('.nav-links-menu-toggle');
const navLinksContainer = document.querySelector('.nav-links');

// Toggle mobile menu visibility
toggle.onclick = (e) => {
  e.stopPropagation(); // Prevent the toggle click from immediately closing
  navLinksContainer.classList.toggle('show');
};

// Close nav when clicking outside
document.addEventListener('click', (e) => {
  if (!navLinksContainer.contains(e.target) && !toggle.contains(e.target)) {
    navLinksContainer.classList.remove('show');
  }
});

// Close mobile menu after a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksContainer.classList.remove('show');
  });
});