document.addEventListener("DOMContentLoaded", () => {
  // 🧩 Get DOM elements
  const searchBar = document.getElementById("search-bar");
  const cityFilter = document.getElementById("city-filter");
  const genderFilter = document.getElementById("gender-filter");
  const experienceFilter = document.getElementById("experience-filter");
  const feeFilter = document.getElementById("fee-filter");
  const modeFilter = document.getElementById("mode-filter");
  const resultsContainer = document.getElementById("results-container");
  const clearFiltersBtn = document.getElementById("clear-filters");
  const themeToggle = document.getElementById("theme-toggle");

  let allTherapists = [];

  // ✅ Load and parse the CSV file using PapaParse
  Papa.parse("./therapists.csv", {
    download: true,
    header: true,
    complete: function (results) {
      allTherapists = results.data.filter(t => t.name && t.name.trim() !== "");

      // 🏙️ Populate city dropdown dynamically (sorted unique)
      const cities = [...new Set(allTherapists.map(t => t.city).filter(Boolean))].sort();
      cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
      });

      renderTherapists(allTherapists);
    },
    error: function (err) {
      resultsContainer.innerHTML = `<p style="color:red;">Error loading CSV: ${err.message}</p>`;
      console.error("PapaParse error:", err);
    },
  });

  // 🧭 Add event listeners for all filters
  [searchBar, cityFilter, genderFilter, experienceFilter, feeFilter, modeFilter]
    .forEach(el => el.addEventListener("input", applyFilters));

  // 🧹 Clear all filters and reset list
  clearFiltersBtn.addEventListener("click", () => {
    [searchBar, cityFilter, genderFilter, experienceFilter, feeFilter, modeFilter]
      .forEach(el => el.value = "");
    renderTherapists(allTherapists);
  });

  // 🔍 Apply all filters together
  function applyFilters() {
    const searchTerm = searchBar.value.toLowerCase();
    const selectedCity = cityFilter.value;
    const selectedGender = genderFilter.value;
    const selectedExperience = experienceFilter.value;
    const selectedFee = feeFilter.value;
    const selectedMode = modeFilter.value;

    let filteredTherapists = [...allTherapists];

    // 🔍 Search filter (name, expertise, education)
    if (searchTerm) {
      filteredTherapists = filteredTherapists.filter(t =>
        (t.name || "").toLowerCase().includes(searchTerm) ||
        (t.expertise || "").toLowerCase().includes(searchTerm) ||
        (t.education || "").toLowerCase().includes(searchTerm)
      );
    }

    // 🌆 City filter
    if (selectedCity)
      filteredTherapists = filteredTherapists.filter(t => t.city === selectedCity);

    // 👩‍⚕️ Gender filter
    if (selectedGender)
      filteredTherapists = filteredTherapists.filter(t => t.gender === selectedGender);

    // 🧮 Experience filter
    if (selectedExperience) {
      filteredTherapists = filteredTherapists.filter(t => {
        const years = parseFloat(t.experience_years) || 0;
        return (
          (selectedExperience === "0-5" && years <= 5) ||
          (selectedExperience === "5-10" && years > 5 && years <= 10) ||
          (selectedExperience === "10-15" && years > 10 && years <= 15) ||
          (selectedExperience === "15+" && years > 15)
        );
      });
    }

    // 💰 Fee filter
    if (selectedFee) {
      filteredTherapists = filteredTherapists.filter(t => {
        const fee = parseFloat(t.fee_amount) || 0;
        return (
          (selectedFee === "under-2000" && fee < 2000) ||
          (selectedFee === "2000-4000" && fee >= 2000 && fee <= 4000) ||
          (selectedFee === "4000-6000" && fee > 4000 && fee <= 6000) ||
          (selectedFee === "above-6000" && fee > 6000)
        );
      });
    }

    // 💬 Mode filter
    if (selectedMode) {
      filteredTherapists = filteredTherapists.filter(t => {
        const modes = (t.modes || "").toLowerCase();
        return (
          (selectedMode === "In-person" && modes.includes("in-person")) ||
          (selectedMode === "Online" && modes.includes("online")) ||
          (selectedMode === "Both" && modes.includes("in-person") && modes.includes("online"))
        );
      });
    }

    renderTherapists(filteredTherapists);
  }

  // 🎴 Render therapist cards
  function renderTherapists(list) {
    resultsContainer.innerHTML = "";

    if (list.length === 0) {
      resultsContainer.innerHTML = "<p>No matching therapists found.</p>";
      return;
    }

    list.forEach(person => {
      const card = document.createElement("div");
      card.classList.add("therapist-card");

      const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
      const stars = "⭐".repeat(Math.round(rating));

      card.innerHTML = `
        <h3>${person.name}</h3>
        <p>${stars} (${rating})</p>
        <div class="info">
          <span>📍 ${person.city || "Unknown"}</span>
          <span>💰 Rs. ${person.fee_amount || "N/A"}</span>
        </div>
        <div class="info">
          <span>🕒 ${person.experience_years || "0"} yrs</span>
          <span>👤 ${person.gender || "N/A"}</span>
        </div>
        <div class="tags">
          ${(person.expertise || "General Counseling")
            .split(";")
            .slice(0, 3)
            .map(tag => `<span>${tag.trim()}</span>`)
            .join("")}
        </div>
        ${
          person.profile_url
            ? `<a class="view-details-btn" href="${person.profile_url}" target="_blank">View Details</a>`
            : ""
        }
      `;
      resultsContainer.appendChild(card);
    });
  }

  // 🌙 Dark / Light Theme Toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const darkMode = document.body.classList.contains("dark");
      themeToggle.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    });

    // Load saved theme preference
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      themeToggle.textContent = "☀️ Light Mode";
    }
  }
});
