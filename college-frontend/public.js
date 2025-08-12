const API_BASE = "http://localhost:3000";

async function fetchColleges(query = "") {
  const endpoint = query
    ? `${API_BASE}/search?name=${encodeURIComponent(query)}&location=${encodeURIComponent(query)}`
    : `${API_BASE}/colleges`;
  try {
    const res = await fetch(endpoint);
    const colleges = await res.json();
    renderColleges(colleges);
  } catch {
    document.getElementById("collegeList").innerHTML = "<p style='color:red;'>Failed to load colleges.</p>";
  }
}

function renderColleges(colleges) {
  const list = document.getElementById('collegeList');
  if (!colleges.length) {
    list.innerHTML = "<p>No colleges found. Try searching again.</p>";
    return;
  }
  list.innerHTML = colleges.map(college => `
    <div class="college-card">
      <h2 class="college-title">${college.name}</h2>
      <p class="college-location">${college.location}</p>
      <p class="college-description">${college.description || "No description available."}</p>
      <p class="college-courses"><strong>Courses:</strong> ${college.courses ? college.courses.join(", ") : "N/A"}</p>
      <p class="college-website"><a href="${college.website}" target="_blank">Visit Website</a></p>
    </div>
  `).join('');
}

document.getElementById("searchBox").addEventListener("input", function(e) {
  fetchColleges(e.target.value.trim());
});

window.onload = () => fetchColleges();
