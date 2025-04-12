let idols = [];
let currentIdol = null;

const homeView = document.getElementById("homeView");
const addView = document.getElementById("addView");
const detailView = document.getElementById("detailView");
const detailContent = document.getElementById("detailContent");
const memberList = document.getElementById("memberList");
const memberForm = document.getElementById("memberForm");

const btnAdd = document.getElementById("btnAdd");
const btnHome = document.getElementById("btnHome");
const backToHome = document.getElementById("backToHome");
const btnAddMember = document.getElementById("btnAddMember");

const idolForm = document.getElementById("idolForm");
const popup = document.getElementById("popup");
const popupImage = document.getElementById("popupImage");

const filterType = document.getElementById("filterType");
const filterAgency = document.getElementById("filterAgency");
const filterGen = document.getElementById("filterGen");
const searchInput = document.getElementById("searchInput");

function saveToLocal() {
  localStorage.setItem("idolData", JSON.stringify(idols));
}

function loadFromLocal() {
  const saved = localStorage.getItem("idolData");
  if (saved) idols = JSON.parse(saved);
}

function updateAgencyFilter() {
  const agencies = [...new Set(idols.map(i => i.agency))];
  filterAgency.innerHTML = '<option value="all">Semua Agensi</option>' +
    agencies.map(a => `<option value="${a}">${a}</option>`).join('');
}

function renderIdols() {
  const list = document.getElementById("idolList");
  list.innerHTML = "";
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = idols.filter(idol => {
    return (filterType.value === "all" || idol.groupType === filterType.value) &&
           (filterAgency.value === "all" || idol.agency === filterAgency.value) &&
           (filterGen.value === "all" || getGeneration(idol.debut) === filterGen.value) &&
           idol.name.toLowerCase().includes(searchTerm);
  });
  filtered.forEach(idol => {
    const card = document.createElement("div");
    card.className = "idol-card";
    card.innerHTML = `<img src="${idol.imageUrl}" /><h3>${idol.name}</h3>`;
    card.onclick = () => showDetail(idol);
    list.appendChild(card);
  });
}

function getGeneration(date) {
  const year = new Date(date).getFullYear();
  if (year >= 2010 && year <= 2014) return "gen2";
  if (year >= 2015 && year <= 2019) return "gen3";
  if (year >= 2020 && year <= 2024) return "gen4";
  if (year >= 2025 && year <= 2029) return "gen5";
  if (year >= 2030) return "gen6";
  return "unknown";
}

function showPopup(src) {
  popupImage.src = src;
  popup.style.display = "flex";
}

function showDetail(idol) {
  currentIdol = idol;
  homeView.classList.add("hidden");
  detailView.classList.remove("hidden");
  detailContent.innerHTML = `
    <h2>${idol.name}</h2>
    <img src="${idol.imageUrl}" alt="${idol.name}" />
    <p>Agensi: ${idol.agency}</p>
    <p>Debut: ${idol.debut}</p>
    <p>Music Show Wins: <span id="winCount">${idol.wins}</span>
    <button onclick="editWins()">Edit</button></p>
    <button onclick="deleteIdol()">Hapus Idol</button>
  `;
  memberList.innerHTML = "<ul>" + idol.members.map(m => `
    <li><img src="${m.photo}" onclick="showPopup('${m.photo}')">
    <strong>${m.name}</strong> - ${m.position} (${m.birth})</li>
  `).join("") + "</ul>";
}

function editWins() {
  const newWin = prompt("Masukkan jumlah baru:", currentIdol.wins);
  if (newWin !== null && !isNaN(newWin)) {
    currentIdol.wins = parseInt(newWin);
    saveToLocal();
    document.getElementById("winCount").textContent = currentIdol.wins;
  }
}

function deleteIdol() {
  if (confirm("Yakin ingin menghapus idol ini?")) {
    idols = idols.filter(i => i !== currentIdol);
    saveToLocal();
    detailView.classList.add("hidden");
    homeView.classList.remove("hidden");
    renderIdols();
    updateAgencyFilter();
  }
}

// Event
btnAdd.addEventListener("click", () => {
  homeView.classList.add("hidden");
  addView.classList.remove("hidden");
});

btnHome.addEventListener("click", () => {
  addView.classList.add("hidden");
  detailView.classList.add("hidden");
  homeView.classList.remove("hidden");
  renderIdols();
});

backToHome.addEventListener("click", () => {
  detailView.classList.add("hidden");
  homeView.classList.remove("hidden");
});

btnAddMember.addEventListener("click", () => {
  memberForm.classList.toggle("hidden");
});

idolForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const reader = new FileReader();
  reader.onload = () => {
    const idol = {
      name: document.getElementById("idolName").value,
      agency: document.getElementById("idolAgency").value,
      debut: document.getElementById("idolDebut").value,
      memberCount: parseInt(document.getElementById("idolMemberCount").value),
      groupType: document.getElementById("idolType").value,
      imageUrl: reader.result,
      wins: parseInt(document.getElementById("idolWins").value),
      members: []
    };
    idols.push(idol);
    saveToLocal();
    idolForm.reset();
    addView.classList.add("hidden");
    homeView.classList.remove("hidden");
    updateAgencyFilter();
    renderIdols();
  };
  reader.readAsDataURL(document.getElementById("idolImage").files[0]);
});

memberForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const reader = new FileReader();
  reader.onload = () => {
    const member = {
      name: document.getElementById("memberName").value,
      position: document.getElementById("memberPosition").value,
      birth: document.getElementById("memberBirth").value,
      photo: reader.result
    };
    currentIdol.members.push(member);
    saveToLocal();
    memberForm.reset();
    memberForm.classList.add("hidden");
    showDetail(currentIdol);
  };
  reader.readAsDataURL(document.getElementById("memberPhoto").files[0]);
});

popup.addEventListener("click", () => popup.style.display = "none");

filterType.addEventListener("change", renderIdols);
filterAgency.addEventListener("change", renderIdols);
filterGen.addEventListener("change", renderIdols);
searchInput.addEventListener("input", renderIdols);

// Init
loadFromLocal();
updateAgencyFilter();
renderIdols();
