const assistantOverlay = document.getElementById("assistant-overlay");
const assistantPanel = assistantOverlay?.querySelector(".assistant-panel");
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
    question: "What type of service do you need?",
    hint: "Choose the closest fit. You can add extra detail later.",
    type: "choice",
    options: [
      "Office cleaning",
      "Window cleaning",
      "Power washing",
      "Building maintenance",
      "Event cleanup",
      "Move-in / Move-out",
      "Deep cleaning",
      "Other",
    ],
  },
  {
    id: "property_type",
    question: "What type of property is this for?",
    hint: "Commercial and residential requests are both welcome.",
    type: "choice",
    options: [
      "Office",
      "Storefront",
      "Residential home",
      "Apartment / rental unit",
      "Event venue",
      "Other",
    ],
  },
  {
    id: "city",
    question: "What city is the property in?",
    hint: "A1 Clean Up serves San Diego County.",
    type: "input",
    placeholder: "San Diego",
  },
  {
    id: "size",
    question: "What is the rough size or scope?",
    hint: "Example: 3,000 sq ft, 5 rooms, or storefront front windows.",
    type: "input",
    placeholder: "e.g. 3,000 sq ft",
  },
  {
    id: "frequency",
    question: "Is this a one-time job or recurring service?",
    hint: "Pick the option that feels closest right now.",
    type: "choice",
    options: ["One-time", "Weekly", "Bi-weekly", "Monthly", "Ongoing"],
  },
  {
    id: "preferred_time",
    question: "When do you need service?",
    hint: "Share a target date, week, or preferred days and times.",
    type: "input",
    placeholder: "e.g. Next Tuesday afternoon",
  },
  {
    id: "contact_name",
    question: "What is your name?",
    hint: "We use this only to follow up about your quote request.",
    type: "input",
    placeholder: "Full name",
  },
  {
    id: "contact_phone",
    question: "What is the best phone number to reach you?",
    hint: "A phone number helps the team follow up quickly.",
    type: "input",
    inputType: "tel",
    inputMode: "tel",
    placeholder: "(###) ###-####",
  },
  {
    id: "contact_email",
    question: "What is the best email address for the estimate?",
    hint: "We will send quote follow-up here.",
    type: "input",
    inputType: "email",
    inputMode: "email",
    placeholder: "you@email.com",
  },
  {
    id: "contact_preference",
    question: "How would you prefer the team follow up?",
    hint: "Choose the contact path you prefer most.",
    type: "choice",
    options: ["Phone call", "Text message", "Email", "On-site estimate", "Either"],
  },
  {
    id: "notes",
    question: "Anything else we should know?",
    hint: "Optional: access notes, timing details, or anything special about the job.",
    type: "textarea",
    placeholder: "Add any extra details...",
    optional: true,
  },
];

let currentStep = 0;
let isSubmitting = false;
const answers = {};

function setStatus(message = "", kind = "") {
  statusEl.textContent = message;
  statusEl.className = "assistant-status";
  if (kind) {
    statusEl.classList.add(`is-${kind}`);
  }
}

function resetAssistant() {
  currentStep = 0;
  isSubmitting = false;
  Object.keys(answers).forEach((key) => delete answers[key]);
  nextButton.disabled = false;
  backButton.disabled = false;
  assistantPanel?.classList.remove("is-submitting");
  setStatus("");
}

function openAssistant() {
  if (!assistantOverlay || !assistantPanel) return;

  if (!assistantOverlay.classList.contains("active") && !Object.keys(answers).length) {
    resetAssistant();
  }

  assistantOverlay.classList.add("active");
  assistantOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderStep();
}

function closeAssistant() {
  if (isSubmitting || !assistantOverlay) return;
  assistantOverlay.classList.remove("active");
  assistantOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  setStatus("");
}

function renderChoiceStep(step) {
  const grid = document.createElement("div");
  grid.className = "option-grid";
  grid.dataset.optionGrid = step.id;

  step.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-card";
    button.textContent = option;
    button.dataset.value = option;

    if (answers[step.id] === option) {
      button.classList.add("is-selected");
    }

    button.addEventListener("click", () => {
      answers[step.id] = option;
      grid.querySelectorAll(".option-card").forEach((card) => {
        card.classList.toggle("is-selected", card.dataset.value === option);
      });
      setStatus("");
    });

    grid.appendChild(button);
  });

  inputEl.appendChild(grid);
  grid.querySelector(".option-card")?.focus();
}

function renderTextStep(step) {
  const field = document.createElement(step.type === "textarea" ? "textarea" : "input");

  if (step.type !== "textarea") {
    field.type = step.inputType || "text";
  }

  if (step.inputMode) {
    field.inputMode = step.inputMode;
  }

  field.placeholder = step.placeholder || "";
  field.value = answers[step.id] || "";

  field.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && step.type !== "textarea" && !event.shiftKey) {
      event.preventDefault();
      nextStep();
    }

    if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && step.type === "textarea") {
      event.preventDefault();
      nextStep();
    }
  });

  inputEl.appendChild(field);
  field.focus();
  field.setSelectionRange?.(field.value.length, field.value.length);
}

function renderStep() {
  const step = steps[currentStep];
  if (!step) return;

  questionEl.textContent = step.question;
  hintEl.textContent = step.optional ? `${step.hint} Optional.` : step.hint || "";
  stepEl.textContent = `Step ${currentStep + 1} of ${steps.length}`;
  barFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;

  inputEl.innerHTML = "";

  if (step.type === "choice") {
    renderChoiceStep(step);
  } else {
    renderTextStep(step);
  }

  backButton.disabled = currentStep === 0 || isSubmitting;
  nextButton.disabled = isSubmitting;
  nextButton.textContent = currentStep === steps.length - 1 ? "Submit Request" : "Next";
}

function getStepValue(step) {
  if (step.type === "choice") {
    return answers[step.id] || "";
  }

  const field = inputEl.querySelector("input, textarea");
  return field ? field.value.trim() : "";
}

function validateStep(step, value) {
  if (!value && step.optional) {
    return "";
  }

  if (!value) {
    return "Please add a response before continuing.";
  }

  if (step.id === "contact_email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return "Please enter a valid email address.";
    }
  }

  if (step.id === "contact_phone") {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 10) {
      return "Please enter a phone number with at least 10 digits.";
    }
  }

  return "";
}

function captureAnswer() {
  const step = steps[currentStep];
  const value = getStepValue(step);
  const validationMessage = validateStep(step, value);

  if (validationMessage) {
    setStatus(validationMessage, "error");
    return false;
  }

  answers[step.id] = value;
  setStatus("");
  return true;
}

function buildLeadPayload() {
  const messageLines = [
    `City: ${answers.city || ""}`,
    `Property type: ${answers.property_type || ""}`,
    `Size / scope: ${answers.size || ""}`,
    `Frequency: ${answers.frequency || ""}`,
    `Preferred timing: ${answers.preferred_time || ""}`,
    `Preferred follow-up: ${answers.contact_preference || ""}`,
    answers.notes ? `Notes: ${answers.notes}` : "",
  ].filter(Boolean);

  return {
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
}

async function submitLead() {
  if (isSubmitting) return;

  isSubmitting = true;
  nextButton.disabled = true;
  backButton.disabled = true;
  assistantPanel?.classList.add("is-submitting");
  setStatus("Sending your request to A1 Clean Up...", "success");

  try {
    const response = await fetch(CRM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildLeadPayload()),
    });

    if (!response.ok) {
      throw new Error("Lead submission failed");
    }

    setStatus(
      "Thanks. Your request was sent. If the job is urgent, you can also call (442) 599-1872.",
      "success",
    );

    window.setTimeout(() => {
      isSubmitting = false;
      assistantPanel?.classList.remove("is-submitting");
      closeAssistant();
      resetAssistant();
    }, 2200);
  } catch (_error) {
    isSubmitting = false;
    nextButton.disabled = false;
    backButton.disabled = currentStep === 0;
    assistantPanel?.classList.remove("is-submitting");
    setStatus(
      "We could not submit the request right now. Please try again, email info@a1cleanupservices.com, or call us.",
      "error",
    );
  }
}

function nextStep() {
  if (isSubmitting) return;
  if (!captureAnswer()) return;

  if (currentStep === steps.length - 1) {
    submitLead();
    return;
  }

  currentStep += 1;
  renderStep();
}

function prevStep() {
  if (isSubmitting || currentStep === 0) return;
  currentStep -= 1;
  renderStep();
}

openButtons.forEach((button) => button.addEventListener("click", openAssistant));
closeButton?.addEventListener("click", closeAssistant);
backButton?.addEventListener("click", prevStep);
nextButton?.addEventListener("click", nextStep);

assistantOverlay?.addEventListener("click", (event) => {
  if (event.target === assistantOverlay) {
    closeAssistant();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && assistantOverlay?.classList.contains("active")) {
    closeAssistant();
  }
});
