const STORAGE_KEY = "skatteuttag-form-state";

const form = document.querySelector("#planner-form");
const yearInput = document.querySelector("#year");
const errorBox = document.querySelector("#error-box");
const summaryBox = document.querySelector("#recommendation-summary");
const breakdownGrid = document.querySelector("#breakdown-grid");
const alternativesBox = document.querySelector("#alternatives");
const assumptionsBox = document.querySelector("#assumptions");
const resetButton = document.querySelector("#reset-values");

const currency = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currency.format(value || 0);
}

function formToObject() {
  const formData = new FormData(form);
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, Number(value)])
  );
}

function setFieldLabels(year) {
  const salaryBasisYear = Number(year) - 1;
  document.querySelector("#salary-basis-text").textContent =
    `For planning year ${year}, the dividend room looks back to salary year ${salaryBasisYear}.`;
  document.querySelector("#company-salary-label").textContent =
    `Company cash salaries in ${salaryBasisYear}`;
  document.querySelector("#user-salary-label").textContent =
    `User salary from the company in ${salaryBasisYear}`;
}

function restoreState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const source = saved ? JSON.parse(saved) : window.APP_DEFAULTS;

  for (const [key, value] of Object.entries(source)) {
    const field = form.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  }
  setFieldLabels(source.year || window.APP_DEFAULTS.year);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(formToObject()));
}

function renderMetrics(result) {
  const recommendation = result.recommended;
  summaryBox.classList.remove("empty-state");
  summaryBox.innerHTML = `
    ${metric("Recommended salary", formatCurrency(recommendation.salary), "Gross annual salary from the company")}
    ${metric("Recommended total dividend", formatCurrency(recommendation.total_dividend), "Split 50/50 between user and spouse")}
    ${metric("User net income", formatCurrency(recommendation.user_net_from_company), "Closest modelled value to the requested target")}
    ${metric("Household net from company", formatCurrency(recommendation.household_net_from_company), "User salary plus both owners' after-tax dividends")}
    ${metric("Distance to target", formatCurrency(recommendation.distance_to_target), recommendation.shortfall_to_target > 0 ? "Target is not fully reached in this scenario" : "The target is reached or slightly exceeded")}
    ${metric("Total tax burden", formatCurrency(recommendation.total_tax_burden), "Employer charges, corporate tax, salary tax, and dividend tax")}
  `;
}

function metric(label, value, subvalue) {
  return `
    <article class="metric">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="subvalue">${subvalue}</div>
    </article>
  `;
}

function renderBreakdown(result) {
  const recommendation = result.recommended;
  const company = recommendation.company;
  const salaryTax = recommendation.salary_tax;
  const userDividend = recommendation.user_dividend;
  const spouseDividend = recommendation.spouse_dividend;
  const spaces = recommendation.dividend_spaces;

  breakdownGrid.innerHTML = [
    breakdownCard("Company budget", [
      ["Profit before owner salary", formatCurrency(result.input.company_profit_before_owner_salary)],
      ["Owner salary", formatCurrency(recommendation.salary)],
      ["Employer contributions", formatCurrency(company.employer_contributions)],
      ["Corporate tax", formatCurrency(company.corporate_tax)],
      ["Available dividend cash", formatCurrency(company.available_dividend_cash)],
    ]),
    breakdownCard("User salary tax", [
      ["Gross salary", formatCurrency(recommendation.salary)],
      ["Base deduction", formatCurrency(salaryTax.base_deduction)],
      ["Municipal tax", formatCurrency(salaryTax.municipal_tax)],
      ["State tax", formatCurrency(salaryTax.state_tax)],
      ["Net salary", formatCurrency(salaryTax.net_income)],
    ]),
    breakdownCard("Dividend room", [
      ["User room", formatCurrency(spaces.user_space)],
      ["User rule", spaces.user_rule_label],
      ["Spouse room", formatCurrency(spaces.spouse_space)],
      ["Spouse rule", spaces.spouse_rule_label],
      ["Salary-base year", String(result.meta.salary_basis_year)],
    ]),
    breakdownCard("Dividend taxation", [
      ["User qualified dividend", formatCurrency(userDividend.qualified_dividend)],
      ["User service-taxed excess", formatCurrency(userDividend.service_taxed_dividend)],
      ["Spouse qualified dividend", formatCurrency(spouseDividend.qualified_dividend)],
      ["Spouse service-taxed excess", formatCurrency(spouseDividend.service_taxed_dividend)],
      ["Combined dividend tax", formatCurrency(userDividend.total_dividend_tax + spouseDividend.total_dividend_tax)],
    ]),
  ].join("");
}

function breakdownCard(title, rows) {
  return `
    <article class="breakdown-card">
      <h3>${title}</h3>
      <div class="kv">
        ${rows.map(([key, value]) => `<div>${key}</div><div>${value}</div>`).join("")}
      </div>
    </article>
  `;
}

function renderAlternatives(result) {
  alternativesBox.innerHTML = result.alternatives
    .map((entry) => {
      const scenario = entry.scenario;
      return `
        <article class="scenario-card">
          <h3>${entry.label}</h3>
          <p>${entry.description}</p>
          <div class="kv">
            <div>Salary</div><div>${formatCurrency(scenario.salary)}</div>
            <div>Total dividend</div><div>${formatCurrency(scenario.total_dividend)}</div>
            <div>User net</div><div>${formatCurrency(scenario.user_net_from_company)}</div>
            <div>Total tax burden</div><div>${formatCurrency(scenario.total_tax_burden)}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAssumptions(result) {
  const notes = [
    ...result.explanations,
    ...result.recommended.dividend_spaces.notes,
    ...result.assumptions,
  ];
  assumptionsBox.innerHTML = notes.map((note) => `<div class="note">${note}</div>`).join("");
}

function setError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

async function submitForm() {
  clearError();
  saveState();

  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formToObject()),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Calculation failed.");
  }

  const result = await response.json();
  renderMetrics(result);
  renderBreakdown(result);
  renderAlternatives(result);
  renderAssumptions(result);
}

yearInput.addEventListener("change", (event) => {
  setFieldLabels(event.target.value);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await submitForm();
  } catch (error) {
    setError(error.message);
  }
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  restoreState();
  submitForm().catch((error) => setError(error.message));
});

restoreState();
submitForm().catch((error) => setError(error.message));
