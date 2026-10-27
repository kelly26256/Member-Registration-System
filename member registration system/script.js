
"use strict";

// ========================================
// 1. SELECT HTML ELEMENTS
// ========================================

const memberForm = document.getElementById("member-form");
const fullNameInput = document.getElementById("full-name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const genderInput = document.getElementById("gender");
const membershipInput = document.getElementById("membership-type");
const joinDateInput = document.getElementById("join-date");

const formMessage = document.getElementById("form-message");
const searchInput = document.getElementById("search-input");
const typeFilter = document.getElementById("type-filter");
const tableBody = document.getElementById("members-table-body");
const emptyState = document.getElementById("empty-state");
const visibleCount = document.getElementById("visible-count");

const totalMembersDisplay = document.getElementById("total-members");
const activeMembersDisplay = document.getElementById("active-members");
const newMembersDisplay = document.getElementById("new-members");

const themeToggle = document.getElementById("theme-toggle");
const resetButton = document.getElementById("reset-button");

const formFields = memberForm.querySelectorAll(
  "input, select, textarea"
);

const errorElements = memberForm.querySelectorAll(
  ".field-error"
);

console.log("MemberHub form:", memberForm);
console.log("Form fields:", formFields);
console.log("Field error elements:", errorElements);
console.log("Success message:", formMessage);
console.log("Members table:", tableBody);
console.log("Member counter:", totalMembersDisplay);
console.log("Dark Mode button:", themeToggle);

console.log("MemberHub form:", memberForm);
console.log("Form fields:", formFields);
console.log("Field error elements:", errorElements);
console.log("Success message:", formMessage);
console.log("Members table:", tableBody);
console.log("Member counter:", totalMembersDisplay);
console.log("Dark Mode button:", themeToggle);


// ========================================
// 2. APPLICATION STATE
// ========================================

const STORAGE_KEY = "memberHub.members";
const THEME_KEY = "memberHub.theme";

let members = loadMembers();

// ========================================
// 3. HELPER FUNCTIONS
// ========================================

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function loadMembers() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return [];
    }

    const parsedData = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    // Accept only records with the expected basic structure.
    return parsedData.filter((member) =>
      member &&
      typeof member.id === "string" &&
      typeof member.fullName === "string" &&
      typeof member.email === "string" &&
      typeof member.phone === "string" &&
      typeof member.membershipType === "string" &&
      typeof member.joinDate === "string"
    );
  } catch (error) {
    console.error("Could not load saved members:", error);
    return [];
  }
}

function saveMembers() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    return true;
  } catch (error) {
    console.error("Could not save members:", error);
    return false;
  }
}

function showMessage(message, type = "success") {
  formMessage.textContent = message;
  formMessage.classList.toggle("error-message", type === "error");
  formMessage.hidden = false;
}

function hideMessage() {
  formMessage.hidden = true;
  formMessage.textContent = "";
  formMessage.classList.remove("error-message");
}

function clearFieldErrors() {
  const fields = [
    fullNameInput,
    emailInput,
    phoneInput,
    genderInput,
    membershipInput,
    joinDateInput
  ];

  fields.forEach((field) => {
    field.removeAttribute("aria-invalid");

    const errorElement = document.getElementById(
      `${field.id}-error`
    );

    if (errorElement) {
      errorElement.textContent = "";
    }
  });
}

function showFieldError(field, message) {
  field.setAttribute("aria-invalid", "true");

  const errorElement = document.getElementById(
    `${field.id}-error`
  );

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function formatDate(dateString) {
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  const date = new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ========================================
// 4. VALIDATE THE FORM
// ========================================

function validateForm() {
  clearFieldErrors();

  let isValid = true;

  const fullName = fullNameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const phone = phoneInput.value.trim();
  const gender = genderInput.value;
  const membershipType = membershipInput.value;
  const joinDate = joinDateInput.value;

  if (fullName.length < 2) {
    showFieldError(
      fullNameInput,
      "Please enter a name with at least 2 characters."
    );
    isValid = false;
  }

  if (!emailInput.validity.valid || !email) {
    showFieldError(
      emailInput,
      "Please enter a valid email address."
    );
    isValid = false;
  } else if (
    members.some((member) =>
      member.email.toLowerCase() === email
    )
  ) {
    showFieldError(
      emailInput,
      "This email is already registered."
    );
    isValid = false;
  }

  const digitCount = phone.replace(/\D/g, "").length;

  if (digitCount < 7 || digitCount > 15) {
    showFieldError(
      phoneInput,
      "Enter a phone number containing 7–15 digits."
    );
    isValid = false;
  }

  if (!gender) {
    showFieldError(genderInput, "Please select a gender option.");
    isValid = false;
  }

  if (!membershipType) {
    showFieldError(
      membershipInput,
      "Please select a membership type."
    );
    isValid = false;
  }

  if (
    !joinDate ||
    joinDate > getLocalDateString() ||
    Number.isNaN(Date.parse(`${joinDate}T00:00:00`))
  ) {
    showFieldError(
      joinDateInput,
      "Choose a valid date that is not in the future."
    );
    isValid = false;
  }

  return isValid;
}

// ========================================
// 5. REGISTER A MEMBER
// ========================================

memberForm.addEventListener("submit", (event) => {
  event.preventDefault();
  hideMessage();

  if (!validateForm()) {
    showMessage(
      "Please correct the highlighted fields before registering.",
      "error"
    );

    const firstInvalidField = memberForm.querySelector(
      '[aria-invalid="true"]'
    );

    if (firstInvalidField) {
      firstInvalidField.focus();
    }

    return;
  }

  const member = {
    id: createId(),
    fullName: fullNameInput.value.trim(),
    email: emailInput.value.trim().toLowerCase(),
    phone: phoneInput.value.trim(),
    gender: genderInput.value,
    membershipType: membershipInput.value,
    joinDate: joinDateInput.value,
    status: "Active"
  };

  members.unshift(member);

  if (!saveMembers()) {
    // Roll back the change if it could not be saved.
    members.shift();

    showMessage(
      "Registration was not saved. Check your browser storage settings and try again.",
      "error"
    );

    return;
  }

  renderDashboard();
  renderMembers();

  memberForm.reset();
  clearFieldErrors();
  setDefaultJoinDate();

  showMessage(
    `${member.fullName} has been registered successfully.`
  );

  document.getElementById("members").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

// ========================================
// 6. RENDER THE MEMBERS TABLE
// ========================================

function renderMembers() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedType = typeFilter.value;

  const filteredMembers = members.filter((member) => {
    const matchesSearch = [
      member.fullName,
      member.email,
      member.phone
    ].some((value) =>
      value.toLowerCase().includes(searchTerm)
    );

    const matchesType =
      !selectedType ||
      member.membershipType === selectedType;

    return matchesSearch && matchesType;
  });

  tableBody.replaceChildren();

  filteredMembers.forEach((member) => {
    const row = document.createElement("tr");

    // Member name and email
    const memberCell = document.createElement("td");
    const memberInfo = document.createElement("div");
    const avatar = document.createElement("span");
    const memberDetails = document.createElement("div");
    const name = document.createElement("span");
    const email = document.createElement("span");

    memberInfo.className = "member-cell";
    avatar.className = "avatar";
    memberDetails.className = "member-details";
    name.className = "member-name";
    email.className = "member-email";

    const initials = member.fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");

    avatar.textContent = initials || "?";
    name.textContent = member.fullName;
    email.textContent = member.email;

    memberDetails.append(name, email);
    memberInfo.append(avatar, memberDetails);
    memberCell.append(memberInfo);

    // Phone
    const phoneCell = document.createElement("td");
    phoneCell.textContent = member.phone;

    // Membership type
    const typeCell = document.createElement("td");
    const typeBadge = document.createElement("span");

    typeBadge.className =
      "membership-badge " +
      member.membershipType.toLowerCase();

    typeBadge.textContent = member.membershipType;
    typeCell.append(typeBadge);

    // Date joined
    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(member.joinDate);

    // Status
    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");

    statusBadge.className = "status-badge";
    statusBadge.textContent = member.status || "Active";
    statusCell.append(statusBadge);

    // Delete button
    const actionCell = document.createElement("td");
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
      "aria-label",
      `Delete member ${member.fullName}`
    );

    deleteButton.addEventListener("click", () => {
      deleteMember(member.id);
    });

    actionCell.append(deleteButton);

    row.append(
      memberCell,
      phoneCell,
      typeCell,
      dateCell,
      statusCell,
      actionCell
    );

    tableBody.append(row);
  });

  visibleCount.textContent =
    `${filteredMembers.length} ` +
    `${filteredMembers.length === 1 ? "member" : "members"}`;

  emptyState.hidden = filteredMembers.length > 0;
}

// ========================================
// 7. UPDATE DASHBOARD STATISTICS
// ========================================

function renderDashboard() {
  const now = new Date();

  const activeCount = members.filter(
    (member) => (member.status || "Active") === "Active"
  ).length;

  const newCount = members.filter((member) => {
    const parts = member.joinDate.split("-");

    return (
      Number(parts[0]) === now.getFullYear() &&
      Number(parts[1]) === now.getMonth() + 1
    );
  }).length;

  totalMembersDisplay.textContent = members.length;
  activeMembersDisplay.textContent = activeCount;
  newMembersDisplay.textContent = newCount;
}

// ========================================
// 8. DELETE MEMBERS
// ========================================

function deleteMember(memberId) {
  const member = members.find(
    (item) => item.id === memberId
  );

  if (!member) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete ${member.fullName}?`
  );

  if (!confirmed) {
    return;
  }

  const originalMembers = members;

  members = members.filter(
    (item) => item.id !== memberId
  );

  if (!saveMembers()) {
    members = originalMembers;

    showMessage(
      "The member could not be deleted because the change was not saved.",
      "error"
    );

    return;
  }

  renderDashboard();
  renderMembers();

  showMessage(`${member.fullName} was deleted successfully.`);
}

// ========================================
// 9. SEARCH AND FILTER MEMBERS
// ========================================

searchInput.addEventListener("input", renderMembers);
typeFilter.addEventListener("change", renderMembers);

// ========================================
// 10. CLEAR FORM AND VALIDATION MESSAGES
// ========================================

function setDefaultJoinDate() {
  joinDateInput.max = getLocalDateString();

  if (!joinDateInput.value) {
    joinDateInput.value = getLocalDateString();
  }
}

memberForm.addEventListener("input", (event) => {
  const field = event.target;

  if (field.matches("input, select")) {
    field.removeAttribute("aria-invalid");

    const errorElement = document.getElementById(
      `${field.id}-error`
    );

    if (errorElement) {
      errorElement.textContent = "";
    }

    hideMessage();
  }
});

memberForm.addEventListener("change", hideMessage);

memberForm.addEventListener("reset", () => {
  window.setTimeout(() => {
    clearFieldErrors();
    hideMessage();
    setDefaultJoinDate();
  }, 0);
});

resetButton.addEventListener("click", hideMessage);

// ========================================
// 11. DARK MODE
// ========================================

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-mode", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));

  const label = themeToggle.querySelector("span");

  if (label) {
    label.textContent = isDark ? "Light mode" : "Toggle theme";
  }

  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
}

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch (error) {
    return "light";
  }
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-mode")
    ? "light"
    : "dark";

  applyTheme(nextTheme);

  try {
    localStorage.setItem(THEME_KEY, nextTheme);
  } catch (error) {
    console.warn("Theme preference could not be saved.");
  }
});

// ========================================
// 12. INITIALIZE THE APPLICATION
// ========================================

document.getElementById("current-year").textContent =
  new Date().getFullYear();

setDefaultJoinDate();
applyTheme(loadTheme());
renderDashboard();
renderMembers();
