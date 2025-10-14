document.addEventListener("DOMContentLoaded", () => {
  const searchBar = document.getElementById("search-bar");
  const cityFilter = document.getElementById("city-filter");
  const genderFilter = document.getElementById("gender-filter");
  const experienceFilter = document.getElementById("experience-filter");
  const feeFilter = document.getElementById("fee-filter");
  const modeFilter = document.getElementById("mode-filter");
  const resultsContainer = document.getElementById("results-container");

  let allTherapists = [];

  // ✅ Load and parse the CSV file
  Papa.parse("./therapists.csv", {
    download: true,
    header: true,
    complete: function (results) {
      allTherapists = results.data.filter(row => row.name && row.name.trim() !== "");

      // 🏙️ Populate city dropdown dynamically
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

  // 🧭 Apply filters whenever something changes
  searchBar.addEventListener("input", applyFilters);
  cityFilter.addEventListener("change", applyFilters);
  genderFilter.addEventListener("change", applyFilters);
  experienceFilter.addEventListener("change", applyFilters);
  feeFilter.addEventListener("change", applyFilters);
  modeFilter.addEventListener("change", applyFilters);

  // 🧹 Clear all filters
  document.getElementById("clear-filters").addEventListener("click", () => {
    searchBar.value = "";
    cityFilter.value = "";
    genderFilter.value = "";
    experienceFilter.value = "";
    feeFilter.value = "";
    modeFilter.value = "";
    renderTherapists(allTherapists);
  });

  // 🔍 Filtering logic
  function applyFilters() {
    let filteredTherapists = allTherapists;
    const searchTerm = searchBar.value.toLowerCase();
    const selectedCity = cityFilter.value;
    const selectedGender = genderFilter.value;
    const selectedExperience = experienceFilter.value;
    const selectedFee = feeFilter.value;
    const selectedMode = modeFilter.value;

    // 🔍 Search filter
    if (searchTerm) {
      filteredTherapists = filteredTherapists.filter(t =>
        (t.name || "").toLowerCase().includes(searchTerm) ||
        (t.expertise || "").toLowerCase().includes(searchTerm) ||
        (t.education || "").toLowerCase().includes(searchTerm)
      );
    }

    // 🌆 City filter
    if (selectedCity) {
      filteredTherapists = filteredTherapists.filter(t => t.city === selectedCity);
    }

    // 👩‍⚕️ Gender filter
    if (selectedGender) {
      filteredTherapists = filteredTherapists.filter(t => t.gender === selectedGender);
    }

    // 🧮 Experience filter
    if (selectedExperience) {
      filteredTherapists = filteredTherapists.filter(t => {
        const years = parseFloat(t.experience_years) || 0;
        if (selectedExperience === "0-5") return years <= 5;
        if (selectedExperience === "5-10") return years > 5 && years <= 10;
        if (selectedExperience === "10-15") return years > 10 && years <= 15;
        if (selectedExperience === "15+") return years > 15;
        return true;
      });
    }

    // 💰 Fee filter
    if (selectedFee) {
      filteredTherapists = filteredTherapists.filter(t => {
        const fee = parseFloat(t.fee_amount) || 0;
        if (selectedFee === "under-2000") return fee < 2000;
        if (selectedFee === "2000-4000") return fee >= 2000 && fee <= 4000;
        if (selectedFee === "4000-6000") return fee > 4000 && fee <= 6000;
        if (selectedFee === "above-6000") return fee > 6000;
        return true;
      });
    }

    // 💬 Consultation Mode filter
    if (selectedMode) {
      filteredTherapists = filteredTherapists.filter(t => {
        const modes = (t.modes || "").toLowerCase();
        if (selectedMode === "In-person") return modes.includes("in-person");
        if (selectedMode === "Online") return modes.includes("online");
        if (selectedMode === "Both") return modes.includes("in-person") && modes.includes("online");
        return true;
      });
    }

    renderTherapists(filteredTherapists);
  }

  // 🎴 Display therapists
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
        <a class="view-details-btn" href="${person.profile_url}" target="_blank">View Details</a>
      `;
      resultsContainer.appendChild(card);
    });
  }

  // 🌙 Theme toggle logic
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      themeToggle.textContent = document.body.classList.contains("dark")
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";
    });
  }
});
