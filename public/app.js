const assistantOverlay = document.getElementById("assistant-overlay");
const openButtons = [
  document.getElementById("open-assistant"),
  document.getElementById("open-assistant-secondary"),
  document.getElementById("open-assistant-footer"),
  document.getElementById("assistant-fab"),
].filter(Boolean);
const closeButton = document.getElementById("assistant-close");
const backButton = document.getElementById("assistant-back");
const nextButton = document.getElementById("assistant-next");
const questionEl = document.getElementById("assistant-question");
const inputEl = document.getElementById("assistant-input");
const hintEl = document.getElementById("assistant-hint");
const stepEl = document.getElementById("assistant-step");
const barFill = document.getElementById("assistant-bar-fill");
const statusEl = document.getElementById("assistant-status");

const CRM_ENDPOINT = "https://quote.a1cleanupservices.com/api/leads";

const steps = [
  {
    id: "service_type",
    question: "What service do you need?",
    hint: "Choose the closest match.",
    type: "select",
    options: [
      "Office cleaning",
      "Window cleaning",
      "Power washing",
      "Building maintenance",
      "Event cleanup",
      "Move-in / Move-out",
      "Deep clean",
      "Other",
    ],
  },
  {
    id: "city",
    question: "What city is the property in?",
    hint: "We serve all of San Diego County.",
    type: "input",
    placeholder: "San Diego",
  },
  {
    id: "property_type",
    question: "What type of property is this?",
    hint: "Commercial and residential welcome.",
    type: "select",
    options: ["Commercial", "Office", "Storefront", "Event venue", "Residential", "Other"],
  },
  {
    id: "size",
    question: "Rough size or number of rooms/windows?",
    hint: "Example: 3,000 sq ft or 5 rooms.",
    type: "input",
    placeholder: "e.g. 3,000 sq ft",
  },
  {
    id: "frequency",
    question: "Is this one-time or recurring?",
    hint: "We offer recurring schedules.",
    type: "select",
    options: ["One-time", "Weekly", "Bi-weekly", "Monthly", "Ongoing"],
  },
  {
    id: "preferred_time",
    question: "When do you need service?",
    hint: "Share a date or preferred days.",
    type: "input",
    placeholder: "e.g. Next Tuesday afternoon",
  },
  {
    id: "contact_name",
    question: "What is your name?",
    hint: "We will only use this for your quote.",
    type: "input",
    placeholder: "Full name",
  },
  {
    id: "contact_phone",
    question: "Best phone number?",
    hint: "So we can follow up quickly.",
    type: "input",
    inputType: "tel",
    placeholder: "(###) ###-####",
  },
  {
    id: "contact_email",
    question: "Best email address?",
    hint: "We will send your estimate here.",
    type: "input",
    inputType: "email",
    placeholder: "you@email.com",
  },
  {
    id: "contact_preference",
    question: "Callback or on-site estimate?",
    hint: "Choose the option you prefer.",
    type: "select",
    options: ["Callback", "On-site estimate", "Either"],
  },
  {
    id: "notes",
    question: "Anything else we should know?",
    hint: "Optional details about access, timing, or special requests.",
    type: "textarea",
    placeholder: "Add any extra details...",
    optional: true,
  },
];

let currentStep = 0;
const answers = {};

function openAssistant() {
  assistantOverlay.classList.add("active");
  assistantOverlay.setAttribute("aria-hidden", "false");
  statusEl.textContent = "";
  renderStep();
}

function closeAssistant() {
  assistantOverlay.classList.remove("active");
  assistantOverlay.setAttribute("aria-hidden", "true");
}

function renderStep() {
  const step = steps[currentStep];
  questionEl.textContent = step.question;
  hintEl.textContent = step.hint || "";
  stepEl.textContent = `Step ${currentStep + 1} of ${steps.length}`;
  barFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;

  inputEl.innerHTML = "";
  let input;

  if (step.type === "select") {
    input = document.createElement("select");
    input.innerHTML = step.options
      .map((option) => `<option value="${option}">${option}</option>`)
      .join("");
  } else if (step.type === "textarea") {
    input = document.createElement("textarea");
    input.placeholder = step.placeholder || "";
  } else {
    input = document.createElement("input");
    input.type = step.inputType || "text";
    input.placeholder = step.placeholder || "";
  }

  if (answers[step.id]) {
    input.value = answers[step.id];
  }

  inputEl.appendChild(input);
  input.focus();

  backButton.disabled = currentStep === 0;
  nextButton.textContent = currentStep === steps.length - 1 ? "Submit" : "Next";
}

function captureAnswer() {
  const step = steps[currentStep];
  const input = inputEl.querySelector("input, select, textarea");
  if (!input) return false;
  const value = input.value.trim();
  if (!value && !step.optional) {
    statusEl.textContent = "Please enter a response to continue.";
    return false;
  }
  answers[step.id] = value;
  statusEl.textContent = "";
  return true;
}

async function submitLead() {
  const messageLines = [
    `City: ${answers.city || ""}`,
    `Property type: ${answers.property_type || ""}`,
    `Size: ${answers.size || ""}`,
    `Frequency: ${answers.frequency || ""}`,
    `Contact preference: ${answers.contact_preference || ""}`,
    answers.notes ? `Notes: ${answers.notes}` : "",
  ].filter(Boolean);

  const payload = {
    name: answers.contact_name || "",
    phone: answers.contact_phone || "",
    email: answers.contact_email || "",
    service_type: answers.service_type || "",
    property_type: answers.property_type || "",
    address: answers.city || "",
    preferred_time: answers.preferred_time || "",
    message: messageLines.join("\n"),
    source: "a1cleanupservices.com",
  };

  try {
    statusEl.textContent = "Sending your request...";
    const response = await fetch(CRM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Failed to submit request");
    }
    statusEl.textContent = "Thanks! We received your request and will respond within one business day.";
    nextButton.disabled = true;
    backButton.disabled = true;
    setTimeout(closeAssistant, 2000);
  } catch (error) {
    statusEl.textContent = "We could not submit your request. Please try again or call us.";
  }
}

function nextStep() {
  if (!captureAnswer()) return;
  if (currentStep === steps.length - 1) {
    submitLead();
    return;
  }
  currentStep += 1;
  renderStep();
}

function prevStep() {
  if (currentStep === 0) return;
  currentStep -= 1;
  renderStep();
}

openButtons.forEach((btn) => btn.addEventListener("click", openAssistant));
closeButton.addEventListener("click", closeAssistant);
assistantOverlay.addEventListener("click", (event) => {
  if (event.target === assistantOverlay) closeAssistant();
});

nextButton.addEventListener("click", nextStep);
backButton.addEventListener("click", prevStep);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && assistantOverlay.classList.contains("active")) {
    closeAssistant();
  }
});
