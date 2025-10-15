//----------------------  DARK MODE LOGIC -------------------------

const darkToggle = document.querySelector(".dark-mode-btn i");
const colorText = document.querySelectorAll(".color-text");
const boxElements = document.querySelectorAll(".box");
const root = document.querySelector(":root");

const defaultLightModeColors = ["#fff", "#000000", "#000", "#272B2F", "#fff"];

// Helper: apply CSS variables
function applyThemeColors(colors) {
  root.style.setProperty("--white", colors[0]);
  root.style.setProperty("--text-color", colors[1]);
  root.style.setProperty("--primary-color", colors[2]);
  root.style.setProperty("--secondary-color", colors[3]);
  root.style.setProperty("--ui-bg", colors[4]);
}

// Helper: toggle classes for dark mode
function toggleDarkMode(darkModeStyle) {
  const method = darkModeStyle ? "add" : "remove";
  colorText.forEach(el => el.classList[method]("darkMode"));
  boxElements.forEach(el => el.classList[method]("darkMode"));
}

// Function to enable dark mode
function enableDarkMode(colors) {
  darkToggle.classList.replace("fa-moon", "fa-sun");
  toggleDarkMode(true);
  applyThemeColors(colors);
  darkToggle.parentElement.title = "Light Mode";
  localStorage.setItem("darkMode", "on");
}

// Function to disable dark mode
function disableDarkMode() {
  darkToggle.classList.replace("fa-sun", "fa-moon");
  toggleDarkMode(false);
  applyThemeColors(defaultLightModeColors);
  darkToggle.parentElement.title = "Dark Mode";
  localStorage.setItem("darkMode", "off");
}


// On page load: apply saved preference
const savedMode = localStorage.getItem("darkMode");
if (savedMode === "on") {
  const colorData = darkToggle.getAttribute("data-color").split(" ");
  enableDarkMode(colorData);
} else {
  disableDarkMode();
}


// Toggle on click
darkToggle.addEventListener("click", () => {
  const isDarkMode = darkToggle.classList.contains("fa-moon");
  const colorData = darkToggle.getAttribute("data-color").split(" ");
  if (isDarkMode) {
    enableDarkMode(colorData);
  } else {
    disableDarkMode();
  }
});


//-------------------DATE & TIME LINE UNDER TITLE---------------

function updateDateTime() {
  const now = new Date();

  // Format #currentDate → "October 15, 2025"
  const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString(undefined, optionsDate);

  // Format #currentDayAndTime → "Tuesday, 2:30:45 PM" (with seconds)
  const optionsDayTime = { 
    weekday: 'long', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric', // show seconds
    hour12: true 
  };
  document.getElementById('currentDayAndTime').textContent = now.toLocaleTimeString(undefined, optionsDayTime);
}

// Initial update
updateDateTime();

// Update every second for a live ticking clock
setInterval(updateDateTime, 1000);


//---------------------------- DASHBOARD LIVE DATA MODULES ------------------------------

function getBox(title) {
  return [...document.querySelectorAll('.box')].find(
    b => b.querySelector('h3').textContent.includes(title)
  );
}

//-------------------------- WEATHER -----------------------

(async function weatherBox() {
  const box = document.getElementById("weather-box");
  const content = box?.querySelector(".weather-content");
  if (!content) return;

  // Helper: get location name from coordinates
  async function getLocationName(lat, lon) {
    try {
      const res = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      return (
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.state ||
        data.address?.country ||
        "Unknown Area"
      );
    } catch {
      return "Unknown Area";
    }
  }

  // Helper: map weather codes to readable text
  function getWeatherDescription(code) {
    const map = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail"
    };
    return map[code] || "Unknown condition";
  }

  // Fetch weather and render inside .weather-content
  async function fetchWeather(lat, lon, labelNote = "", locationStatus = "Off") {
    content.innerHTML = `<p>Fetching weather...</p>`; // temporary loading

    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await res.json();
      const w = data.current_weather;
      const locationName = await getLocationName(lat, lon);
      const description = getWeatherDescription(w.weathercode);

      content.innerHTML = `
        <p><strong>Location:</strong> ${locationName} ${labelNote}</p>
        <p><strong>Location Status:</strong> ${locationStatus}</p>
        <p><strong>Temperature:</strong> ${w.temperature}°C</p>
        <p><strong>Wind:</strong> ${w.windspeed} km/h</p>
        <p><strong>Condition:</strong> ${description}</p>
      `;
    } catch (e) {
      content.innerHTML = `<p>Unable to load weather data.</p>`;
      console.error("Weather fetch error:", e);
    }
  }

  // Default on page load — Manila, Location Off
  await fetchWeather(14.60, 120.98, "(Default)", "Off");

  // Activate location when user clicks icon
  document.querySelector(".location-btn")?.addEventListener("click", async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude, longitude } = pos.coords;
          await fetchWeather(latitude, longitude, "(Current location)", "On");
        },
        async err => {
          console.warn("Geolocation denied or failed:", err.message);
          await fetchWeather(14.60, 120.98, "(Location denied — showing Manila)", "Off");
        }
      );
    } else {
      await fetchWeather(14.60, 120.98, "(Geolocation not supported — showing Manila)", "Off");
    }
  });
})();

//---------------------- WORLD CLOCK --------------------------
(function worldClock() {
  const box = getBox("World Clock");
  const cities = [
    { name: "New York", tz: "America/New_York" },
    { name: "London",   tz: "Europe/London" },
    { name: "Berlin",   tz: "Europe/Berlin" },
    { name: "Beijing",  tz: "Asia/Shanghai" },
    { name: "Tokyo",    tz: "Asia/Tokyo" }
  ];
  const list = document.createElement("div");
  box.appendChild(list);

  function update() {
    list.innerHTML = cities.map(c => {
      const time = new Date().toLocaleTimeString("en-US", { timeZone: c.tz });
      return `<p><strong>${c.name}:</strong> ${time}</p>`;
    }).join("");
  }
  update();
  setInterval(update, 1000);
})();


//--------------------------- GLOBAL CURRENCY -------------------------------------

(async function currencyBox() {
  const box = getBox("Global Currency");
  try {
    // Get base PHP
    const res = await fetch("https://open.er-api.com/v6/latest/PHP");
    const data = await res.json();

    if (data.result !== "success") throw new Error("Invalid response");

    // Preferred currencies (in your order)
    const show = [
      { code: "USD", label: "US Dollar" },
      { code: "GBP", label: "British Pound" },
      { code: "EUR", label: "Euro" },
      { code: "CNY", label: "Chinese Yuan" },
      { code: "JPY", label: "Japanese Yen" }
    ];

    // Convert: 1 [foreign] = X PHP
    box.innerHTML += show.map(c => {
      const rate = 1 / data.rates[c.code]; // since base=PHP, invert the rate
      return `<p><strong>${c.label}</strong> (${c.code}): ₱${rate.toLocaleString("en-PH", { maximumFractionDigits: 2 })}</p>`;
    }).join("");

  } catch (err) {
    console.error(err);
    box.innerHTML += `<p>Currency data unavailable.</p>`;
  }
})();

// Utility: Resilient fetch with retries
async function fetchWithRetry(url, tries = 3, delay = 2000) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Fetch attempt ${i + 1} failed: ${err.message}`);
      if (i === tries - 1) throw err;
      await new Promise(r => setTimeout(r, delay)); // wait before retry
    }
  }
}

//------------------------ LOCAL NEWS ----------------------------------
(async function localNewsBox() {
  const box = getBox("Local News");
  if (!box) return;

  const textEl = box.querySelector(".local-news-text");
  const poweredNote = box.querySelector(".note");
  const scrollBtn = box.querySelector("#localNewsReadBtn");
  const refreshBtn = box.querySelector("#localNewsRefreshBtn");
  const linkBtn = box.querySelector("#localNewsLinkBtn");

  const sources = [
    { name: "Philstar", url: "https://www.philstar.com/rss/headlines", home: "https://www.philstar.com" },
    { name: "Inquirer.net", url: "https://www.inquirer.net/fullfeed", home: "https://www.inquirer.net" },
    { name: "ABS-CBN", url: "https://news.abs-cbn.com/rss/latest.xml", home: "https://news.abs-cbn.com" },
    { name: "GMA News", url: "https://www.gmanetwork.com/news/rss/latest/", home: "https://www.gmanetwork.com/news/" }
  ];

  async function fetchWithRetry(url, tries = 3, delay = 2000) {
    for (let i = 0; i < tries; i++) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (err) {
        console.warn(`Fetch attempt ${i + 1} failed: ${err.message}`);
        if (i === tries - 1) throw err;
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  let success = false;
  let sourceHome = null;

  async function loadLocalNews() {
    textEl.textContent = "Fetching local news...";
    success = false;
    sourceHome = null;

    for (const src of sources) {
      try {
        const response = await fetchWithRetry(
          `https://api.allorigins.win/get?url=${encodeURIComponent(src.url)}`
        );
        const xml = new DOMParser().parseFromString(response.contents, "text/xml");
        const items = [...xml.querySelectorAll("item")].slice(0, 5);
        if (!items.length) throw new Error("Empty feed");

        const formattedHeadlines = items
          .map((i, index) => `News#${index + 1} : ${i.querySelector("title")?.textContent?.trim() || "Untitled"}`)
          .join(" • ") + "........";

        textEl.textContent = formattedHeadlines;
        poweredNote.innerHTML = `Powered by <strong>${src.name}</strong> • via AllOrigins`;
        sourceHome = src.home;
        success = true;
        console.log(`Loaded local news from ${src.name}`);
        break;
      } catch (err) {
        console.warn(`Failed to load ${src.name}: ${err.message}`);
      }
    }

    if (!success) {
      textEl.textContent = "Local news unavailable. Please try again later.";
      poweredNote.innerHTML = "Powered by PH News RSS • via AllOrigins";
    }
  }

  // Initial load
  await loadLocalNews();

  // Scroll behavior
  scrollBtn?.addEventListener("click", () => {
    const textWidth = textEl.scrollWidth;
    const containerWidth = textEl.parentElement.offsetWidth;
    const distance = textWidth - containerWidth;
    if (distance <= 0) return;

    const speed = 100;
    const duration = distance / speed;

    scrollBtn.style.backgroundColor = "var(--secondary-color)";
    textEl.style.transition = `left ${duration}s linear`;
    textEl.style.left = `-${distance}px`;

    textEl.addEventListener("transitionend", function handler() {
      textEl.removeEventListener("transitionend", handler);
      setTimeout(() => {
        textEl.style.transition = "left 0.5s linear";
        textEl.style.left = "0px";
        textEl.addEventListener("transitionend", function resetHandler() {
          textEl.removeEventListener("transitionend", resetHandler);
          scrollBtn.style.backgroundColor = "var(--primary-color)";
        });
      }, 3000);
    });
  });

  // Refresh button
  refreshBtn?.addEventListener("click", loadLocalNews);

  // Source link
  linkBtn?.addEventListener("click", () => {
    if (success && sourceHome) window.open(sourceHome, "_blank");
    else alert("No news source available to open.");
  });
})();

//---------------------- WORLD NEWS -----------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  const globalText = document.querySelector('.global-news-text');
  const globalScrollBtn = document.getElementById('globalNewsReadBtn');
  const globalRefreshBtn = document.getElementById('globalNewsRefreshBtn');
  const worldLinkBtn = document.getElementById('worldNewsLinkBtn');

  const rssUrl = "https://feeds.bbci.co.uk/news/world/rss.xml";

  async function loadGlobalNews() {
    globalText.textContent = "Fetching world news...";
    try {
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
      const data = await response.json();
      const xml = new DOMParser().parseFromString(data.contents, "text/xml");
      const items = [...xml.querySelectorAll("item")].slice(0, 5);

      globalText.textContent =
        items.map((i, index) => `News#${index + 1} : ${i.querySelector("title")?.textContent?.trim() || "Untitled"}`)
             .join(" • ") + "........";

    } catch (err) {
      console.error("World News error:", err);
      globalText.textContent = "World news unavailable. Please try again later.";
    }
  }

  // Initial load
  await loadGlobalNews();

  // Scroll behavior
  globalScrollBtn?.addEventListener('click', () => {
    const textWidth = globalText.scrollWidth;
    const containerWidth = globalText.parentElement.offsetWidth;
    const distance = textWidth - containerWidth;
    if (distance <= 0) return;

    const speed = 100;
    const duration = distance / speed;

    globalScrollBtn.style.backgroundColor = 'var(--secondary-color)';
    globalText.style.transition = `left ${duration}s linear`;
    globalText.style.left = `-${distance}px`;

    globalText.addEventListener('transitionend', function handler() {
      globalText.removeEventListener('transitionend', handler);
      setTimeout(() => {
        globalText.style.transition = 'left 0.5s linear';
        globalText.style.left = '0px';
        globalText.addEventListener('transitionend', function resetHandler() {
          globalText.removeEventListener('transitionend', resetHandler);
          globalScrollBtn.style.backgroundColor = 'var(--primary-color)';
        });
      }, 3000);
    });
  });

  // Refresh button
  globalRefreshBtn?.addEventListener("click", loadGlobalNews);

  // BBC news link
  worldLinkBtn?.addEventListener("click", () => {
    window.open("https://www.bbc.com/news", "_blank", "noopener,noreferrer");
  });
});


//------------------------ CRYPTO MARKET ---------------------------------
(async function cryptoBox() {
  const box = document.getElementById("crypto-market");
  try {
    const coins = [
      { id: "bitcoin", name: "BTC" },
      { id: "tether-gold", name: "XAUT" },
      { id: "binancecoin", name: "BNB" },
      { id: "ethereum", name: "ETH" },
      { id: "ripple", name: "XRP" }
    ];

    const ids = coins.map(c => c.id).join(",");
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=php`);
    const data = await res.json();

    // Combine and sort by PHP price (descending)
    const priced = coins
      .map(c => ({ ...c, price: data[c.id]?.php || 0 }))
      .sort((a, b) => b.price - a.price);

    // Add prices to the box
    box.innerHTML += priced.map(c =>
      `<p><strong>${c.name}</strong>: ₱${c.price.toLocaleString("en-PH", { maximumFractionDigits: 2 })}</p>`
    ).join("");

  } catch (err) {
    console.error(err);
    box.innerHTML += `<p>Crypto data unavailable.</p>`;
  }
})();

