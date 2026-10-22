const DATA_URL = "./data/internship-records-sample.json";

const list = document.querySelector("#internshipList");
const searchInput = document.querySelector("#searchInput");
const domainFilter = document.querySelector("#domainFilter");
const modeFilter = document.querySelector("#modeFilter");
const clearButton = document.querySelector("#clearButton");
const statusMessage = document.querySelector("#statusMessage");
const errorPanel = document.querySelector("#errorPanel");
const retryButton = document.querySelector("#retryButton");
const resultCount = document.querySelector("#resultCount");
const dialog = document.querySelector("#detailsDialog");
const closeDialog = document.querySelector("#closeDialog");
const applicationForm = document.querySelector("#applicationForm");
const applicationMessage = document.querySelector("#applicationMessage");
let internships = [];

function showLoading() {
  statusMessage.hidden = false;
  statusMessage.textContent = "Loading internship opportunities…";
  errorPanel.hidden = true;
  list.replaceChildren();
  resultCount.textContent = "Loading…";
}

function populateDomains(records) {
  const previous = domainFilter.value;
  const domains = [...new Set(records.map(item => item.domain))].sort();
  domainFilter.replaceChildren(new Option("All domains", "all"));
  domains.forEach(domain => domainFilter.add(new Option(domain, domain)));
  domainFilter.value = domains.includes(previous) ? previous : "all";
}

function makeCard(item) {
  const article = document.createElement("article");
  article.className = "internship-card";
  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "domain-tag";
  tag.textContent = item.domain;
  const mode = document.createElement("span");
  mode.className = "work-mode";
  mode.textContent = item.mode;
  top.append(tag, mode);

  const title = document.createElement("h3");
  title.textContent = item.title;
  const location = document.createElement("p");
  location.className = "location";
  location.textContent = `⌖ ${item.location}`;
  const skills = document.createElement("ul");
  skills.className = "skill-list";
  skills.setAttribute("aria-label", "Required skills");
  (item.skills || []).forEach(skill => {
    const li = document.createElement("li");
    li.textContent = skill;
    skills.append(li);
  });

  const bottom = document.createElement("div");
  bottom.className = "card-bottom";
  const openings = document.createElement("span");
  openings.className = "openings";
  openings.textContent = `${item.openings} opening${item.openings === 1 ? "" : "s"}`;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "button";
  button.textContent = "View details";
  button.setAttribute("aria-label", `View details for ${item.title}`);
  button.addEventListener("click", () => openDetails(item));
  bottom.append(openings, button);
  article.append(top, title, location, skills, bottom);
  return article;
}

function render(records) {
  list.replaceChildren();
  records.forEach(item => list.append(makeCard(item)));
  resultCount.textContent = `${records.length} opportunit${records.length === 1 ? "y" : "ies"} found`;
  statusMessage.hidden = records.length > 0;
  if (records.length === 0) {
    statusMessage.textContent = "No internships match your search. Try another keyword or clear the filters.";
  }
}

function applyFilters() {
  const keyword = searchInput.value.trim().toLowerCase();
  const domain = domainFilter.value;
  const mode = modeFilter.value;
  const filtered = internships.filter(item => {
    const text = [item.title, item.domain, item.mode, item.location, ...(item.skills || [])].join(" ").toLowerCase();
    return text.includes(keyword) && (domain === "all" || item.domain === domain) && (mode === "all" || item.mode === mode);
  });
  render(filtered);
}

async function loadInternships() {
  showLoading();
  try {
    const response = await fetch(DATA_URL, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.internships)) throw new Error("Invalid sample-data format");
    internships = payload.internships;
    populateDomains(internships);
    applyFilters();
  } catch (error) {
    console.error("Could not load internship data:", error.message);
    statusMessage.hidden = true;
    errorPanel.hidden = false;
    list.replaceChildren();
    resultCount.textContent = "Unable to load listings";
  }
}

function openDetails(item) {
  document.querySelector("#dialogTitle").textContent = item.title;
  document.querySelector("#dialogMeta").textContent = `${item.domain} · ${item.mode} · ${item.location}`;
  document.querySelector("#dialogDescription").textContent = item.description || "No description provided.";
  const skillList = document.querySelector("#dialogSkills");
  skillList.replaceChildren();
  (item.skills || []).forEach(skill => {
    const li = document.createElement("li");
    li.textContent = skill;
    skillList.append(li);
  });
  applicationMessage.textContent = "";
  applicationForm.reset();
  dialog.showModal();
  document.querySelector("#applicantName").focus();
}

searchInput.addEventListener("input", applyFilters);
domainFilter.addEventListener("change", applyFilters);
modeFilter.addEventListener("change", applyFilters);
clearButton.addEventListener("click", () => {
  searchInput.value = "";
  domainFilter.value = "all";
  modeFilter.value = "all";
  applyFilters();
  searchInput.focus();
});
retryButton.addEventListener("click", loadInternships);
closeDialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
applicationForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!applicationForm.reportValidity()) return;
  applicationMessage.textContent = `Thanks, ${document.querySelector("#applicantName").value.trim()}! This is a demo form; no application was sent or saved.`;
});

loadInternships();
