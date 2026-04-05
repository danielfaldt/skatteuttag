const STORAGE_KEY = "skatteuttag-form-state";
const LANGUAGE_KEY = "skatteuttag-language";

const form = document.querySelector("#planner-form");
const yearInput = document.querySelector("#year");
const languageSwitch = document.querySelector("#language-switch");
const errorBox = document.querySelector("#error-box");
const summaryBox = document.querySelector("#recommendation-summary");
const breakdownGrid = document.querySelector("#breakdown-grid");
const alternativesBox = document.querySelector("#alternatives");
const assumptionsBox = document.querySelector("#assumptions");
const resetButton = document.querySelector("#reset-values");
const metaDescription = document.querySelector("#meta-description");
const pageTitle = document.querySelector("#page-title");
const appNameElement = document.querySelector("#app-name");

const TRANSLATIONS = {
  sv: {
    "brand.app_name": "Skatteuttag",
    "meta.description": "Löne- och utdelningsplanering för ett svenskt aktiebolag med tydlig årskopplad skattelogik.",
    "language.label": "Språk",
    "hero.eyebrow": "Svensk skatteplanering för ägarledda bolag",
    "hero.lede": "Planera lön och utdelning i ett svenskt aktiebolag med ett valt planeringsår. Appen förklarar hur utbetalningsåret och lönebasåret hänger ihop.",
    "hero.supported_years": "Stödda år: {years}",
    "hero.ownership": "50/50 ägande mellan makar",
    "hero.persistence": "Lokal sparning i webbläsaren",
    "inputs.title": "Inmatning",
    "inputs.subtitle": "Alla belopp anges som årsbelopp i SEK.",
    "field.planning_year": "Planeringsår",
    "field.target_user_net_income": "Önskad nettoinkomst för användaren efter skatt",
    "field.spouse_external_salary": "Makes/makas lön från annan arbetsgivare",
    "field.company_profit_before_owner_salary": "Bolagsvinst före ägarlön och arbetsgivaravgifter",
    "field.opening_retained_earnings": "Ingående fria vinstmedel tillgängliga för utdelning",
    "field.municipal_tax_rate": "Kommunalskatt",
    "salary_basis.title": "Lönebasår för utdelningsutrymme",
    "salary_basis.text": "För planeringsår {planningYear} tittar utdelningsutrymmet tillbaka på löneår {salaryBasisYear}.",
    "field.prior_year_company_cash_salaries": "Bolagets kontanta löner under {salaryBasisYear}",
    "field.prior_year_user_company_salary": "Användarens lön från bolaget under {salaryBasisYear}",
    "shareholder.title": "Aktieägarvärden",
    "shareholder.subtitle": "Sparat utdelningsutrymme och omkostnadsbelopp anges separat för varje ägare.",
    "field.saved_dividend_space_user": "Användarens sparade utdelningsutrymme",
    "field.saved_dividend_space_spouse": "Makes/makas sparade utdelningsutrymme",
    "field.user_share_cost_basis": "Användarens omkostnadsbelopp",
    "field.spouse_share_cost_basis": "Makes/makas omkostnadsbelopp",
    "button.calculate": "Beräkna rekommendation",
    "button.reset": "Återställ sparade värden",
    "inputs.helper": "Appen sparar formulärvärden i webbläsarens lokala lagring och återställer dem vid omladdning.",
    "recommended.title": "Rekommenderad plan",
    "recommended.subtitle": "Närmast målet, därefter prioritet på lägre total skatt.",
    "recommended.empty": "Skicka formuläret för att få en rekommendation.",
    "breakdown.title": "Nedbrytning",
    "breakdown.subtitle": "Bolagets kassaflöde, löneskatt, utdelningsskatt och utdelningsutrymme.",
    "alternatives.title": "Alternativa scenarier",
    "alternatives.subtitle": "Jämförelsepunkter runt rekommendationen.",
    "assumptions.title": "Så togs resultatet fram",
    "assumptions.subtitle": "Årskoppling, antaganden och regelnoter.",
    "metric.recommended_salary": "Rekommenderad lön",
    "metric.recommended_salary_sub": "Bruttoårslön från bolaget",
    "metric.recommended_dividend": "Rekommenderad total utdelning",
    "metric.recommended_dividend_sub": "Delas 50/50 mellan användare och make/maka",
    "metric.user_net": "Användarens netto från bolaget",
    "metric.user_net_sub": "Närmaste modellerade nivå mot önskat mål",
    "metric.household_net": "Hushållets netto från bolaget",
    "metric.household_net_sub": "Användarens nettolön plus båda ägarnas nettoutdelning",
    "metric.distance_to_target": "Avstånd till mål",
    "metric.distance_target_reached": "Målet nås eller överskrids marginellt",
    "metric.distance_target_shortfall": "Målet nås inte fullt ut i detta scenario",
    "metric.total_tax_burden": "Total skattebelastning",
    "metric.total_tax_burden_sub": "Arbetsgivaravgifter, bolagsskatt, löneskatt och utdelningsskatt",
    "breakdown.company_budget": "Bolagsbudget",
    "breakdown.user_salary_tax": "Användarens löneskatt",
    "breakdown.dividend_room": "Utdelningsutrymme",
    "breakdown.dividend_taxation": "Utdelningsbeskattning",
    "label.profit_before_owner_salary": "Vinst före ägarlön",
    "label.owner_salary": "Ägarlön",
    "label.employer_contributions": "Arbetsgivaravgifter",
    "label.corporate_tax": "Bolagsskatt",
    "label.available_dividend_cash": "Tillgänglig utdelningslikvid",
    "label.gross_salary": "Bruttolön",
    "label.base_deduction": "Grundavdrag",
    "label.municipal_tax": "Kommunal skatt",
    "label.state_tax": "Statlig skatt",
    "label.net_salary": "Nettolön",
    "label.user_room": "Användarens utrymme",
    "label.user_rule": "Använd regel",
    "label.spouse_room": "Makes/makas utrymme",
    "label.spouse_rule": "Make/maka regel",
    "label.salary_basis_year": "Lönebasår",
    "label.user_qualified_dividend": "Användarens kvalificerade utdelning",
    "label.user_service_taxed_excess": "Användarens tjänstebeskattade överskjutande del",
    "label.spouse_qualified_dividend": "Makes/makas kvalificerade utdelning",
    "label.spouse_service_taxed_excess": "Makes/makas tjänstebeskattade överskjutande del",
    "label.combined_dividend_tax": "Samlad utdelningsskatt",
    "alternative.dividend_led": "Utdelningsdrivet",
    "alternative.dividend_led_desc": "Lägre lön med större tyngd på utdelning.",
    "alternative.near_state_breakpoint": "Nära brytpunkten för statlig skatt",
    "alternative.near_state_breakpoint_desc": "Lön pressad nära brytpunkten innan mer utdelning används.",
    "alternative.maximum_user_net": "Maximal användarnetto",
    "alternative.maximum_user_net_desc": "Högsta netto för användaren som modellen hittar inom bolagets budget.",
    "scenario.salary": "Lön",
    "scenario.total_dividend": "Total utdelning",
    "scenario.user_net": "Användarens netto",
    "scenario.total_tax_burden": "Total skattebelastning",
    "error.calculation_failed": "Beräkningen misslyckades.",
    "rule.main": "Huvudregeln",
    "rule.simplification": "Förenklingsregeln",
    "rule.new_combined": "2026 års kombinerade regel",
    "note.salary_basis_year": "Planeringsår {planningYear} använder lönedata från {salaryBasisYear} för det lönebaserade utdelningsutrymmet.",
    "note.ownership_structure": "Modellen antar att bolaget ägs 50/50 av makar och att endast användaren tar lön från bolaget.",
    "note.old_rule_salary_requirement_met": "Det gamla lönekravet är uppfyllt eftersom bolagslönen under basåret är minst {salaryRequirement} SEK.",
    "note.old_rule_salary_requirement_not_met": "Det gamla lönekravet är inte uppfyllt. Bolagslönen under basåret behöver vara cirka {salaryRequirement} SEK för att låsa upp lönebaserat utrymme för 2025.",
    "note.old_rule_saved_space_uplift": "Sparat utdelningsutrymme räknas upp med 4,96 % för 2025 enligt reglerna före 2026.",
    "note.new_rule_combined_method": "2026 års regelverk använder en kombinerad metod: grundbelopp, lönebaserat utrymme, ränta på omkostnadsbelopp över 100 000 SEK och sparat utrymme.",
    "note.new_rule_wage_space_positive": "Det lönebaserade utrymmet är positivt eftersom bolagets kontanta löner under basåret överstiger avdraget på {wageDeduction} SEK.",
    "note.new_rule_wage_space_zero": "Det lönebaserade utrymmet är noll eftersom bolagets kontanta löner under basåret inte överstiger avdraget på {wageDeduction} SEK.",
    "assumption.swedish_limited_company": "Modellen antar ett svenskt privat aktiebolag med två makar som äger 50 % var.",
    "assumption.only_user_company_salary": "Endast användaren antas ta lön från bolaget.",
    "assumption.dividend_limited_to_profit_and_retained": "Utdelning begränsas till aktuell vinst efter lönekostnad och eventuell ingående fri vinst som användaren anger.",
    "assumption.municipal_rate_editable": "Kommunalskatten kan ändras av användaren och förifylls med rikssnittet för valt år.",
    "assumption.official_rule_data": "Appen modellerar årsspecifik löneskatt och 3:12-liknande utdelningsskatt med officiella regeldata för 2025 och 2026.",
    "assumption.spouse_salary_affects_service_tax": "Tjänstebeskattad överskjutande utdelning modelleras som extra tjänsteinkomst där makes/makas externa lön påverkar dennes skatteeffekt.",
    "explanation.salary_uses_planning_year": "Lön som tas ut under {planningYear} beskattas med lönereglerna för {planningYear}.",
    "explanation.dividend_uses_salary_basis_year": "Utdelningsutrymmet för {planningYear} använder lönebasåret {salaryBasisYear}.",
    "explanation.recommendation_scoring": "Rekommendationen minimerar först avståndet till användarens nettomål och föredrar därefter lägre total skatt."
  },
  en: {
    "brand.app_name": "TaxSplit",
    "meta.description": "Salary and dividend planning for a Swedish limited company with transparent year-based tax logic.",
    "language.label": "Language",
    "hero.eyebrow": "Swedish tax planning for owner-managed companies",
    "hero.lede": "Plan salary and dividends for a Swedish limited company with one chosen planning year. The app explains how the payout year and the salary-base year interact.",
    "hero.supported_years": "Supported years: {years}",
    "hero.ownership": "50/50 spouse ownership",
    "hero.persistence": "Local browser persistence",
    "inputs.title": "Inputs",
    "inputs.subtitle": "All amounts are annual SEK values.",
    "field.planning_year": "Planning year",
    "field.target_user_net_income": "Desired user net income after tax",
    "field.spouse_external_salary": "Spouse salary from other employer",
    "field.company_profit_before_owner_salary": "Company profit before owner salary and employer charges",
    "field.opening_retained_earnings": "Opening retained earnings available for dividends",
    "field.municipal_tax_rate": "Municipal tax rate",
    "salary_basis.title": "Salary-base year for dividend room",
    "salary_basis.text": "For planning year {planningYear}, the dividend room looks back to salary year {salaryBasisYear}.",
    "field.prior_year_company_cash_salaries": "Company cash salaries in {salaryBasisYear}",
    "field.prior_year_user_company_salary": "User salary from the company in {salaryBasisYear}",
    "shareholder.title": "Shareholder values",
    "shareholder.subtitle": "Saved dividend room and cost basis are entered separately for each owner.",
    "field.saved_dividend_space_user": "User saved dividend space",
    "field.saved_dividend_space_spouse": "Spouse saved dividend space",
    "field.user_share_cost_basis": "User share cost basis",
    "field.spouse_share_cost_basis": "Spouse share cost basis",
    "button.calculate": "Calculate recommendation",
    "button.reset": "Reset saved values",
    "inputs.helper": "The app stores your form values in local browser storage and restores them on reload.",
    "recommended.title": "Recommended plan",
    "recommended.subtitle": "Closest to the target, then biased toward lower total tax.",
    "recommended.empty": "Submit the form to generate a recommendation.",
    "breakdown.title": "Breakdown",
    "breakdown.subtitle": "Company cash flow, salary tax, dividend tax, and dividend room.",
    "alternatives.title": "Alternative scenarios",
    "alternatives.subtitle": "Useful comparison points around the recommendation.",
    "assumptions.title": "How the result was derived",
    "assumptions.subtitle": "Year linkage, assumptions, and rule notes.",
    "metric.recommended_salary": "Recommended salary",
    "metric.recommended_salary_sub": "Gross annual salary from the company",
    "metric.recommended_dividend": "Recommended total dividend",
    "metric.recommended_dividend_sub": "Split 50/50 between user and spouse",
    "metric.user_net": "User net income",
    "metric.user_net_sub": "Closest modelled value to the requested target",
    "metric.household_net": "Household net from company",
    "metric.household_net_sub": "User net salary plus both owners' net dividends",
    "metric.distance_to_target": "Distance to target",
    "metric.distance_target_reached": "The target is reached or slightly exceeded",
    "metric.distance_target_shortfall": "The target is not fully reached in this scenario",
    "metric.total_tax_burden": "Total tax burden",
    "metric.total_tax_burden_sub": "Employer charges, corporate tax, salary tax, and dividend tax",
    "breakdown.company_budget": "Company budget",
    "breakdown.user_salary_tax": "User salary tax",
    "breakdown.dividend_room": "Dividend room",
    "breakdown.dividend_taxation": "Dividend taxation",
    "label.profit_before_owner_salary": "Profit before owner salary",
    "label.owner_salary": "Owner salary",
    "label.employer_contributions": "Employer contributions",
    "label.corporate_tax": "Corporate tax",
    "label.available_dividend_cash": "Available dividend cash",
    "label.gross_salary": "Gross salary",
    "label.base_deduction": "Base deduction",
    "label.municipal_tax": "Municipal tax",
    "label.state_tax": "State tax",
    "label.net_salary": "Net salary",
    "label.user_room": "User room",
    "label.user_rule": "User rule",
    "label.spouse_room": "Spouse room",
    "label.spouse_rule": "Spouse rule",
    "label.salary_basis_year": "Salary-base year",
    "label.user_qualified_dividend": "User qualified dividend",
    "label.user_service_taxed_excess": "User service-taxed excess",
    "label.spouse_qualified_dividend": "Spouse qualified dividend",
    "label.spouse_service_taxed_excess": "Spouse service-taxed excess",
    "label.combined_dividend_tax": "Combined dividend tax",
    "alternative.dividend_led": "Dividend-led",
    "alternative.dividend_led_desc": "Lower salary focus with heavier reliance on dividends.",
    "alternative.near_state_breakpoint": "Near state tax breakpoint",
    "alternative.near_state_breakpoint_desc": "Salary pushed close to the state income tax breakpoint before dividends.",
    "alternative.maximum_user_net": "Maximum user net",
    "alternative.maximum_user_net_desc": "Highest user after-tax income the model can find within the company budget.",
    "scenario.salary": "Salary",
    "scenario.total_dividend": "Total dividend",
    "scenario.user_net": "User net",
    "scenario.total_tax_burden": "Total tax burden",
    "error.calculation_failed": "Calculation failed.",
    "rule.main": "Main rule",
    "rule.simplification": "Simplification rule",
    "rule.new_combined": "2026 combined rule",
    "note.salary_basis_year": "Planning year {planningYear} uses salary data from {salaryBasisYear} for the wage-linked dividend room.",
    "note.ownership_structure": "The model assumes the company is jointly owned 50/50 by spouses and that only the user receives salary from the company.",
    "note.old_rule_salary_requirement_met": "The old salary-threshold test is met because prior-year company salary is at least {salaryRequirement} SEK.",
    "note.old_rule_salary_requirement_not_met": "The old salary-threshold test is not met. Prior-year company salary needs about {salaryRequirement} SEK to unlock wage-based space for 2025.",
    "note.old_rule_saved_space_uplift": "Saved dividend room is uplifted by 4.96% for 2025 under the pre-2026 rules.",
    "note.new_rule_combined_method": "The 2026 rule set uses one combined method: ground amount, wage-based room, interest on cost basis above 100,000 SEK, and saved room.",
    "note.new_rule_wage_space_positive": "The wage-based room is positive because prior-year company cash salaries exceed the deduction amount of {wageDeduction} SEK.",
    "note.new_rule_wage_space_zero": "The wage-based room is zero because prior-year company cash salaries do not exceed the deduction amount of {wageDeduction} SEK.",
    "assumption.swedish_limited_company": "The model assumes a Swedish private limited company with two spouse owners holding 50% each.",
    "assumption.only_user_company_salary": "Only the user receives salary from the company.",
    "assumption.dividend_limited_to_profit_and_retained": "Dividends are limited to current-year profit after salary cost and any opening retained earnings entered by the user.",
    "assumption.municipal_rate_editable": "The municipal tax rate is user-editable and defaults to the national average for the selected year.",
    "assumption.official_rule_data": "The app models year-specific salary tax and 3:12-style dividend tax using official 2025 and 2026 rule data.",
    "assumption.spouse_salary_affects_service_tax": "Service-taxed excess dividend is modelled as additional service income with the spouse's external salary affecting only the spouse's personal tax outcome.",
    "explanation.salary_uses_planning_year": "Salary paid during {planningYear} is taxed using {planningYear} salary-tax rules.",
    "explanation.dividend_uses_salary_basis_year": "Dividend room for {planningYear} uses the salary base year {salaryBasisYear}.",
    "explanation.recommendation_scoring": "The recommendation minimizes distance to the user's after-tax target and then prefers lower total tax burden."
  }
};

let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || "sv";
let lastResult = null;

function formatCurrency(value) {
  return new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-US", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getTranslation(key) {
  return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS.en[key] || key;
}

function interpolate(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = params[token];
    return value === undefined ? `{${token}}` : value;
  });
}

function t(key, params = {}) {
  return interpolate(getTranslation(key), params);
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;
  languageSwitch.value = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const params = element.dataset.i18nVars ? JSON.parse(element.dataset.i18nVars) : {};
    element.textContent = t(element.dataset.i18n, params);
  });
  metaDescription.setAttribute("content", t("meta.description"));
  pageTitle.textContent = t("brand.app_name");
  appNameElement.textContent = t("brand.app_name");
}

function formToObject() {
  const formData = new FormData(form);
  return Object.fromEntries(
    Array.from(formData.entries()).map(([key, value]) => [key, Number(value)])
  );
}

function setFieldLabels(year) {
  const salaryBasisYear = Number(year) - 1;
  document.querySelector("#salary-basis-text").textContent = t("salary_basis.text", {
    planningYear: year,
    salaryBasisYear,
  });
  document.querySelector("#company-salary-label").textContent = t("field.prior_year_company_cash_salaries", {
    salaryBasisYear,
  });
  document.querySelector("#user-salary-label").textContent = t("field.prior_year_user_company_salary", {
    salaryBasisYear,
  });
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

function metric(label, value, subvalue) {
  return `
    <article class="metric">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="subvalue">${subvalue}</div>
    </article>
  `;
}

function translateRule(label) {
  if (label === "Main rule") return t("rule.main");
  if (label === "Simplification rule") return t("rule.simplification");
  if (label === "2026 combined rule") return t("rule.new_combined");
  return label;
}

function translateMessage(item) {
  if (typeof item === "string") {
    return item;
  }
  return t(item.key, item.params || {});
}

function renderMetrics(result) {
  const recommendation = result.recommended;
  summaryBox.classList.remove("empty-state");
  summaryBox.innerHTML = `
    ${metric(t("metric.recommended_salary"), formatCurrency(recommendation.salary), t("metric.recommended_salary_sub"))}
    ${metric(t("metric.recommended_dividend"), formatCurrency(recommendation.total_dividend), t("metric.recommended_dividend_sub"))}
    ${metric(t("metric.user_net"), formatCurrency(recommendation.user_net_from_company), t("metric.user_net_sub"))}
    ${metric(t("metric.household_net"), formatCurrency(recommendation.household_net_from_company), t("metric.household_net_sub"))}
    ${metric(t("metric.distance_to_target"), formatCurrency(recommendation.distance_to_target), recommendation.shortfall_to_target > 0 ? t("metric.distance_target_shortfall") : t("metric.distance_target_reached"))}
    ${metric(t("metric.total_tax_burden"), formatCurrency(recommendation.total_tax_burden), t("metric.total_tax_burden_sub"))}
  `;
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

function renderBreakdown(result) {
  const recommendation = result.recommended;
  const company = recommendation.company;
  const salaryTax = recommendation.salary_tax;
  const userDividend = recommendation.user_dividend;
  const spouseDividend = recommendation.spouse_dividend;
  const spaces = recommendation.dividend_spaces;

  breakdownGrid.innerHTML = [
    breakdownCard(t("breakdown.company_budget"), [
      [t("label.profit_before_owner_salary"), formatCurrency(result.input.company_profit_before_owner_salary)],
      [t("label.owner_salary"), formatCurrency(recommendation.salary)],
      [t("label.employer_contributions"), formatCurrency(company.employer_contributions)],
      [t("label.corporate_tax"), formatCurrency(company.corporate_tax)],
      [t("label.available_dividend_cash"), formatCurrency(company.available_dividend_cash)],
    ]),
    breakdownCard(t("breakdown.user_salary_tax"), [
      [t("label.gross_salary"), formatCurrency(recommendation.salary)],
      [t("label.base_deduction"), formatCurrency(salaryTax.base_deduction)],
      [t("label.municipal_tax"), formatCurrency(salaryTax.municipal_tax)],
      [t("label.state_tax"), formatCurrency(salaryTax.state_tax)],
      [t("label.net_salary"), formatCurrency(salaryTax.net_income)],
    ]),
    breakdownCard(t("breakdown.dividend_room"), [
      [t("label.user_room"), formatCurrency(spaces.user_space)],
      [t("label.user_rule"), translateRule(spaces.user_rule_label)],
      [t("label.spouse_room"), formatCurrency(spaces.spouse_space)],
      [t("label.spouse_rule"), translateRule(spaces.spouse_rule_label)],
      [t("label.salary_basis_year"), String(result.meta.salary_basis_year)],
    ]),
    breakdownCard(t("breakdown.dividend_taxation"), [
      [t("label.user_qualified_dividend"), formatCurrency(userDividend.qualified_dividend)],
      [t("label.user_service_taxed_excess"), formatCurrency(userDividend.service_taxed_dividend)],
      [t("label.spouse_qualified_dividend"), formatCurrency(spouseDividend.qualified_dividend)],
      [t("label.spouse_service_taxed_excess"), formatCurrency(spouseDividend.service_taxed_dividend)],
      [t("label.combined_dividend_tax"), formatCurrency(userDividend.total_dividend_tax + spouseDividend.total_dividend_tax)],
    ]),
  ].join("");
}

function renderAlternatives(result) {
  const labelMap = {
    "Dividend-led": "alternative.dividend_led",
    "Near state tax breakpoint": "alternative.near_state_breakpoint",
    "Maximum user net": "alternative.maximum_user_net",
  };
  const descriptionMap = {
    "Lower salary focus with heavier reliance on dividends.": "alternative.dividend_led_desc",
    "Salary pushed close to the state income tax breakpoint before dividends.": "alternative.near_state_breakpoint_desc",
    "Highest user after-tax income the model can find within the current company budget.": "alternative.maximum_user_net_desc",
  };

  alternativesBox.innerHTML = result.alternatives
    .map((entry) => {
      const scenario = entry.scenario;
      return `
        <article class="scenario-card">
          <h3>${t(labelMap[entry.label] || entry.label)}</h3>
          <p>${t(descriptionMap[entry.description] || entry.description)}</p>
          <div class="kv">
            <div>${t("scenario.salary")}</div><div>${formatCurrency(scenario.salary)}</div>
            <div>${t("scenario.total_dividend")}</div><div>${formatCurrency(scenario.total_dividend)}</div>
            <div>${t("scenario.user_net")}</div><div>${formatCurrency(scenario.user_net_from_company)}</div>
            <div>${t("scenario.total_tax_burden")}</div><div>${formatCurrency(scenario.total_tax_burden)}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAssumptions(result) {
  const notes = [
    ...result.explanations.map(translateMessage),
    ...result.recommended.dividend_spaces.notes.map(translateMessage),
    ...result.assumptions.map(translateMessage),
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
    throw new Error(error.detail || t("error.calculation_failed"));
  }

  const result = await response.json();
  lastResult = result;
  renderMetrics(result);
  renderBreakdown(result);
  renderAlternatives(result);
  renderAssumptions(result);
}

yearInput.addEventListener("change", (event) => {
  setFieldLabels(event.target.value);
  saveState();
});

languageSwitch.addEventListener("change", (event) => {
  currentLanguage = event.target.value;
  localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  applyStaticTranslations();
  setFieldLabels(yearInput.value);
  if (lastResult) {
    renderMetrics(lastResult);
    renderBreakdown(lastResult);
    renderAlternatives(lastResult);
    renderAssumptions(lastResult);
  }
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

applyStaticTranslations();
restoreState();
submitForm().catch((error) => setError(error.message));
