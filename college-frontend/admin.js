const API_BASE = "http://localhost:3000";
let adminToken = "";
let editingCollegeId = null;

// Login
document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value;
  const msgEl = document.getElementById("loginMsg");
  try {
    const res = await fetch(API_BASE + "/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) {
      adminToken = data.token;
      msgEl.textContent = "Login successful!";
      document.getElementById("adminSection").style.display = "none";
      document.getElementById("manageColleges").style.display = "block";
      fetchColleges();
    } else {
      msgEl.textContent = data.message || "Login failed.";
    }
  } catch {
    msgEl.textContent = "Server error. Try again.";
  }
});

// Logout
document.getElementById("logoutBtn").onclick = function() {
  adminToken = "";
  document.getElementById("manageColleges").style.display = "none";
  document.getElementById("adminSection").style.display = "block";
};

// Fetch Colleges (Admin)
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
    list.innerHTML = "<p>No colleges found.</p>";
    return;
  }
  list.innerHTML = colleges.map(college => `
    <div class="college-card" data-id="${college._id}">
      <h2 class="college-title">${college.name}</h2>
      <p class="college-location">${college.location}</p>
      <p class="college-description">${college.description || "No description available."}</p>
      <p class="college-courses"><strong>Courses:</strong> ${college.courses ? college.courses.join(", ") : "N/A"}</p>
      <p class="college-website"><a href="${college.website}" target="_blank">Visit Website</a></p>
      <button class="editBtn">Edit</button>
      <button class="deleteBtn">Delete</button>
    </div>
  `).join('');
  addAdminListeners();
}

function addAdminListeners() {
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.onclick = async function() {
      const card = this.closest('.college-card');
      const id = card.getAttribute('data-id');
      if (!confirm("Delete this college?")) return;
      try {
        const res = await fetch(`${API_BASE}/colleges/${id}`, {
          method: "DELETE",
          headers: { "Authorization": adminToken }
        });
        if (res.ok) fetchColleges();
        else alert("Delete failed.");
      } catch {
        alert("Server error while deleting.");
      }
    };
  });

  document.querySelectorAll('.editBtn').forEach(btn => {
    btn.onclick = function() {
      const card = this.closest('.college-card');
      startEditCollege(card.getAttribute('data-id'));
    };
  });
}

// Add College
document.getElementById("addCollegeForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const college = {
    name: document.getElementById("collegeName").value.trim(),
    location: document.getElementById("collegeLocation").value.trim(),
    website: document.getElementById("collegeWebsite").value.trim(),
    description: document.getElementById("collegeDescription").value.trim(),
    courses: document.getElementById("collegeCourses").value.split(",").map(c => c.trim())
  };
  const msgEl = document.getElementById("addMsg");
  try {
    const res = await fetch(API_BASE + "/colleges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": adminToken
      },
      body: JSON.stringify(college)
    });
    const data = await res.json();
    if (res.status === 201) {
      msgEl.textContent = "College added!";
      fetchColleges();
      this.reset();
    } else {
      msgEl.textContent = data.error || "Add failed.";
    }
  } catch {
    msgEl.textContent = "Server error.";
  }
});

// Modal Edit Logic
async function startEditCollege(id) {
  editingCollegeId = id;
  let college;
  try {
    const res = await fetch(`${API_BASE}/colleges/${id}`);
    college = await res.json();
  } catch {
    alert("Failed to load college.");
    return;
  }
  document.getElementById('editName').value = college.name;
  document.getElementById('editLocation').value = college.location;
  document.getElementById('editWebsite').value = college.website;
  document.getElementById('editDescription').value = college.description || "";
  document.getElementById('editCourses').value = (college.courses || []).join(", ");
  document.getElementById("editMsg").textContent = "";
  document.getElementById("editModal").style.display = "flex";
}

document.querySelector('.modal-close').onclick = function() {
  document.getElementById("editModal").style.display = "none";
  editingCollegeId = null;
};

document.getElementById('editCollegeForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const updatedCollege = {
    name: document.getElementById("editName").value.trim(),
    location: document.getElementById("editLocation").value.trim(),
    website: document.getElementById("editWebsite").value.trim(),
    description: document.getElementById("editDescription").value.trim(),
    courses: document.getElementById("editCourses").value.split(',').map(s => s.trim())
  };
  const msgEl = document.getElementById("editMsg");
  try {
    const res = await fetch(`${API_BASE}/colleges/${editingCollegeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": adminToken
      },
      body: JSON.stringify(updatedCollege)
    });
    const data = await res.json();
    if (res.ok) {
      msgEl.textContent = "College updated!";
      document.getElementById("editModal").style.display = "none";
      editingCollegeId = null;
      fetchColleges();
    } else {
      msgEl.textContent = data.error || "Update failed.";
    }
  } catch {
    msgEl.textContent = "Server error.";
  }
});

document.getElementById("editModal").onclick = function(e) {
  if (e.target === this) {
    this.style.display = "none";
    editingCollegeId = null;
  }
};
