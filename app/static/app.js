const STORAGE_KEY = "skatteuttag-form-state";
const LANGUAGE_KEY = "skatteuttag-language";

const form = document.querySelector("#planner-form");
const yearInput = document.querySelector("#year");
const languageSwitch = document.querySelector("#language-switch");
const availableLanguageCodes = Array.from(languageSwitch.options).map((option) => option.value);
const actionMenu = document.querySelector("#action-menu");
const importAnnualReportButton = document.querySelector("#import-annual-report");
const importAnnualReportFileInput = document.querySelector("#import-annual-report-file");
const exportDataButton = document.querySelector("#export-data");
const importDataButton = document.querySelector("#import-data");
const importDataFileInput = document.querySelector("#import-data-file");
const exportPdfButton = document.querySelector("#export-pdf");
const annualReportStatusBox = document.querySelector("#annual-report-status");
const errorBox = document.querySelector("#error-box");
const summaryBox = document.querySelector("#recommendation-summary");
const finalPlanBox = document.querySelector("#final-plan-summary");
const breakdownGrid = document.querySelector("#breakdown-grid");
const alternativesBox = document.querySelector("#alternatives");
const assumptionsBox = document.querySelector("#assumptions");
const resetButton = document.querySelector("#reset-values");
const submitButton = form.querySelector('button[type="submit"]');
const metaDescription = document.querySelector("#meta-description");
const pageTitle = document.querySelector("#page-title");
const appNameElement = document.querySelector("#app-name");
const recommendedSubtitle = document.querySelector("#recommended-subtitle");
const compensationMixBox = document.querySelector("#compensation-mix-analysis");
const periodizationStrategyBox = document.querySelector("#periodization-strategy");
const problemSignalsBox = document.querySelector("#problem-signals");
const ownershipSuggestionBox = document.querySelector("#ownership-suggestion");
const userDisplayNameInput = document.querySelector("#user-display-name");
const spouseDisplayNameInput = document.querySelector("#spouse-display-name");
const targetNetIncomeLabel = document.querySelector("#target-net-income-label");
const userOtherSalaryIncomeLabel = document.querySelector("#user-other-salary-income-label");
const spouseExternalSalaryLabel = document.querySelector("#spouse-external-salary-label");
const userCarBenefitLabel = document.querySelector("#user-car-benefit-label");
const plannedUserPensionLabel = document.querySelector("#planned-user-pension-label");
const userBirthYearLabel = document.querySelector("#user-birth-year-label");
const spouseBirthYearLabel = document.querySelector("#spouse-birth-year-label");
const taxMunicipalitySelect = document.querySelector("#tax-municipality");
const taxParishSelect = document.querySelector("#tax-parish");
const taxParishField = document.querySelector("#tax-parish-field");
const includeChurchFeeInput = document.querySelector("#include-church-fee");
const municipalTaxRateInput = document.querySelector("#municipal-tax-rate");
const burialFeeRateInput = document.querySelector("#burial-fee-rate");
const churchFeeRateInput = document.querySelector("#church-fee-rate");
const localTaxSummary = document.querySelector("#local-tax-summary");
const openingPeriodizationSummary = document.querySelector("#opening-periodization-summary");
const openingPeriodizationBalanceHiddenInput = document.querySelector("#opening-periodization-fund-balance-hidden");
const periodizationLayerInputs = Array.from(document.querySelectorAll(".js-periodization-layer"));
const userShareLabel = document.querySelector("#user-share-label");
const spouseShareLabel = document.querySelector("#spouse-share-label");
const userShareDisplay = document.querySelector("#user-share-display");
const spouseShareDisplay = document.querySelector("#spouse-share-display");
const userShareSlider = document.querySelector("#user-share-slider");
const userSavedDividendSpaceLabel = document.querySelector("#user-saved-dividend-space-label");
const spouseSavedDividendSpaceLabel = document.querySelector("#spouse-saved-dividend-space-label");
const userShareCostBasisLabel = document.querySelector("#user-share-cost-basis-label");
const spouseShareCostBasisLabel = document.querySelector("#spouse-share-cost-basis-label");
const numericInputs = Array.from(document.querySelectorAll(".js-number"));
const infoPopovers = Array.from(document.querySelectorAll(".info-popover"));
const EXPORT_SCHEMA = "skatteuttag-planning-export";
const EXPORT_VERSION = 1;

let TRANSLATIONS = {};
const translationRequests = new Map();

async function loadTranslationFile(language) {
  if (translationRequests.has(language)) {
    return translationRequests.get(language);
  }

  const request = fetch(`/static/i18n/${language}.json?v=${window.APP_ASSET_VERSION}`, { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load translations for ${language}`);
      }
      return response.json();
    })
    .then((messages) => {
      TRANSLATIONS[language] = messages;
      return messages;
    });

  translationRequests.set(language, request);
  return request;
}

async function ensureTranslationsLoaded(language = currentLanguage) {
  const languages = new Set(["en", language]);
  await Promise.all(Array.from(languages, (code) => loadTranslationFile(code)));
}

const YEAR_DEFAULTS = {
  2025: { municipalTaxRate: 32.41, burialFeeRate: 0.293 },
  2026: { municipalTaxRate: 32.38, burialFeeRate: 0.292 },
};

let currentLanguage = availableLanguageCodes.includes(localStorage.getItem(LANGUAGE_KEY) || "")
  ? (localStorage.getItem(LANGUAGE_KEY) || "sv")
  : "sv";
let lastResult = null;
let activeSubmitRequestId = 0;
let taxCatalog = new Map();
let municipalTaxManualOverride = false;
let applyingMunicipalTaxRate = false;
let annualReportImportState = null;
let annualReportImportPending = false;

function formatCurrency(value) {
  return new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-US", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatMoneyValue(value) {
  const numeric = Number(value || 0);
  return `${new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-US", {
    minimumFractionDigits: Number.isInteger(numeric) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(numeric)} kr`;
}

function getTranslation(key) {
  const currentMessages = TRANSLATIONS[currentLanguage] || {};
  const fallbackMessages = TRANSLATIONS.en || {};
  return currentMessages[key] || fallbackMessages[key] || key;
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

function formatDisplayName(value) {
  const normalized = String(value || "").trim().toLocaleLowerCase("sv-SE");
  return normalized
    .split(/(\s+|\/|-)/)
    .map((segment) => {
      if (!segment || /^\s+$/.test(segment) || segment === "/" || segment === "-") {
        return segment;
      }
      return segment.charAt(0).toLocaleUpperCase("sv-SE") + segment.slice(1);
    })
    .join("");
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;
  languageSwitch.value = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const params = element.dataset.i18nVars ? JSON.parse(element.dataset.i18nVars) : {};
    element.textContent = t(element.dataset.i18n, params);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });
  metaDescription.setAttribute("content", t("meta.description"));
  pageTitle.textContent = t("brand.app_name");
  appNameElement.textContent = t("brand.app_name");
  if (annualReportImportState) {
    applyAnnualReportFieldMarkers();
    renderAnnualReportStatus();
  }
}

function readSavedState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { ...window.APP_DEFAULTS };
  }

  try {
    const parsed = JSON.parse(saved);
    if (parsed.user_other_salary_income === undefined && parsed.user_other_service_income !== undefined) {
      parsed.user_other_salary_income = parsed.user_other_service_income;
    }
    return { ...window.APP_DEFAULTS, ...parsed };
  } catch {
    return { ...window.APP_DEFAULTS };
  }
}

function buildPortableState() {
  return {
    ...formToObject(),
    _municipal_tax_manual_override: municipalTaxManualOverride,
  };
}

function normalizeAnalysisComparableValue(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function isCurrentFormSyncedWithAnalysis() {
  if (!lastResult || !lastResult.input || typeof lastResult.input !== "object") {
    return false;
  }

  const formState = buildPortableState();
  const analysisInput = lastResult.input;
  return Object.keys(window.APP_DEFAULTS).every((key) => {
    if (key.startsWith("_")) {
      return true;
    }
    return normalizeAnalysisComparableValue(formState[key]) === normalizeAnalysisComparableValue(analysisInput[key]);
  });
}

function buildExportPayload() {
  return {
    schema: EXPORT_SCHEMA,
    version: EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    app_name: t("brand.app_name"),
    language: currentLanguage,
    form: buildPortableState(),
    analysis: isCurrentFormSyncedWithAnalysis() ? lastResult : null,
  };
}

function formatApiErrorDetail(detail, fallbackKey) {
  if (detail && typeof detail === "object" && detail.key) {
    const params = { ...(detail.params || {}) };
    const moneyKeys = new Set(["requestedAmount", "maxAmount", "openingBalance", "requestedPension", "pensionLimit"]);
    Object.keys(params).forEach((key) => {
      if (moneyKeys.has(key) && typeof params[key] === "number") {
        params[key] = formatMoneyValue(params[key]);
      }
    });
    return t(detail.key, params);
  }
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  return t(fallbackKey);
}

function normalizeErrorMessage(message, fallbackKey = "error.calculation_failed") {
  if (message instanceof Error) {
    return normalizeErrorMessage(message.message, fallbackKey);
  }
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (message && typeof message === "object") {
    if (message.key) {
      return t(message.key, message.params || {});
    }
    if (message.detail !== undefined) {
      return normalizeErrorMessage(message.detail, fallbackKey);
    }
    if (message.message !== undefined) {
      return normalizeErrorMessage(message.message, fallbackKey);
    }
  }
  return t(fallbackKey);
}

function sanitizeImportedState(rawState) {
  if (!rawState || typeof rawState !== "object" || Array.isArray(rawState)) {
    throw new Error(t("error.import_invalid_format"));
  }

  const merged = { ...window.APP_DEFAULTS, ...rawState };
  if (merged.user_other_salary_income === undefined && merged.user_other_service_income !== undefined) {
    merged.user_other_salary_income = merged.user_other_service_income;
  }
  return merged;
}

function normalizeNumericToken(token, kind = "amount") {
  if (kind === "percent") {
    const lastComma = token.lastIndexOf(",");
    const lastDot = token.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    return decimalSeparator === ","
      ? token.replace(/\./g, "").replace(",", ".")
      : token.replace(/,/g, "");
  }

  return token.replace(/[,.]/g, "");
}

function evaluateArithmeticExpression(raw, kind = "amount") {
  const compact = String(raw || "").replace(/\s+/g, "");
  if (!/[+\-*/()]/.test(compact) || !/^[0-9+\-*/().,]+$/.test(compact)) {
    return null;
  }

  const tokens = compact.match(/[0-9][0-9.,]*|[()+\-*/]/g);
  if (!tokens || tokens.join("") !== compact) {
    return null;
  }

  let index = 0;

  function parseExpression() {
    let value = parseTerm();
    while (tokens[index] === "+" || tokens[index] === "-") {
      const operator = tokens[index++];
      const rhs = parseTerm();
      value = operator === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    while (tokens[index] === "*" || tokens[index] === "/") {
      const operator = tokens[index++];
      const rhs = parseFactor();
      if (operator === "/" && rhs === 0) {
        throw new Error("Division by zero");
      }
      value = operator === "*" ? value * rhs : value / rhs;
    }
    return value;
  }

  function parseFactor() {
    const token = tokens[index];

    if (token === "+") {
      index += 1;
      return parseFactor();
    }

    if (token === "-") {
      index += 1;
      return -parseFactor();
    }

    if (token === "(") {
      index += 1;
      const value = parseExpression();
      if (tokens[index] !== ")") {
        throw new Error("Missing closing parenthesis");
      }
      index += 1;
      return value;
    }

    if (!token || !/^[0-9]/.test(token)) {
      throw new Error("Invalid token");
    }

    index += 1;
    const normalized = normalizeNumericToken(token, kind);
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid number");
    }
    return parsed;
  }

  try {
    const value = parseExpression();
    if (index !== tokens.length || !Number.isFinite(value)) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function parseLocaleNumber(value, kind = "amount") {
  if (typeof value === "number") {
    return value;
  }
  const raw = String(value || "").trim().replace(/\s/g, "");
  if (!raw) {
    return 0;
  }

  const expressionValue = evaluateArithmeticExpression(raw, kind);
  if (expressionValue !== null) {
    return expressionValue;
  }

  if (kind === "amount") {
    const parsed = Number(raw.replace(/[,.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (kind === "signed-amount") {
    const normalized = raw.startsWith("-")
      ? `-${raw.slice(1).replace(/[,.]/g, "")}`
      : raw.replace(/[,.]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : ".";
  const normalized = decimalSeparator === ","
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatInputValue(value, kind = "amount") {
  const number = parseLocaleNumber(value, kind);
  if (kind === "percent") {
    return new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);
  }
  return new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-US", {
    maximumFractionDigits: 0,
  }).format(number);
}

function refreshFormattedInputs() {
  numericInputs.forEach((input) => {
    input.value = formatInputValue(input.value, input.dataset.numberKind);
  });
  syncOwnershipDisplay();
  syncOpeningPeriodizationSummary();
}

function formatNumericField(input) {
  const kind = input.dataset.numberKind;
  if (!kind) {
    return;
  }
  input.value = formatInputValue(input.value, kind);
}

function explicitOpeningPeriodizationTotal() {
  return periodizationLayerInputs.reduce(
    (sum, input) => sum + parseLocaleNumber(input.value, input.dataset.numberKind || "amount"),
    0,
  );
}

function syncOpeningPeriodizationSummary() {
  const explicitTotal = explicitOpeningPeriodizationTotal();
  const hiddenLegacyBalance = parseLocaleNumber(openingPeriodizationBalanceHiddenInput?.value || 0, "amount");
  const usingExplicitLayers = explicitTotal > 0.5;
  const displayedTotal = usingExplicitLayers ? explicitTotal : hiddenLegacyBalance;

  if (openingPeriodizationBalanceHiddenInput) {
    openingPeriodizationBalanceHiddenInput.value = formatInputValue(displayedTotal, "amount");
  }

  if (!openingPeriodizationSummary) {
    return;
  }

  const detail = usingExplicitLayers
    ? t("field.opening_periodization_total_detail")
    : t("field.opening_periodization_legacy");

  openingPeriodizationSummary.innerHTML = `
    <div class="tax-summary-label">${t("field.opening_periodization_total")}</div>
    <div class="tax-summary-value">${formatCurrency(displayedTotal)}</div>
    <div class="tax-summary-detail">${detail}</div>
  `;
}

function formToObject() {
  const values = {};

  Array.from(form.elements).forEach((field) => {
    if (!field?.name || field.disabled) {
      return;
    }

    if (field.type === "checkbox") {
      values[field.name] = field.checked;
      return;
    }

    if (field.type === "radio") {
      if (field.checked) {
        values[field.name] = field.value;
      }
      return;
    }

    const kind = field.dataset?.numberKind;
    if (!kind) {
      values[field.name] = String(field.value || "").trim();
      return;
    }

    values[field.name] = parseLocaleNumber(field.value, kind);
  });

  return values;
}

function getOwnerName(ownerType) {
  const input = ownerType === "user" ? userDisplayNameInput : spouseDisplayNameInput;
  const value = String(input?.value || "").trim();
  if (value) {
    return value;
  }
  return t(ownerType === "user" ? "owner.user_default" : "owner.spouse_default");
}

function ownerLabel(ownerType, nounKey) {
  return `${getOwnerName(ownerType)}: ${t(nounKey)}`;
}

function ownerSpecificText(kind, ownerType, params = {}) {
  const owner = getOwnerName(ownerType);

  if (currentLanguage === "sv") {
    if (kind === "birth_year") return `Födelseår för ${owner}`;
    if (kind === "target_net_income") return `Önskad nettoinkomst efter skatt för ${owner}`;
    if (kind === "other_salary_income") return `Annan bruttolön utanför bolaget för ${owner}`;
    if (kind === "external_salary") return `Bruttolön från annan arbetsgivare för ${owner}`;
    if (kind === "salary_from_company") return `Kontant bruttolön från bolaget under ${params.salaryBasisYear} för ${owner}`;
    if (kind === "saved_dividend_space") return `Sparat utdelningsutrymme för ${owner}`;
    if (kind === "share_cost_basis") return `Omkostnadsbelopp för ${owner}`;
    if (kind === "car_benefit") return `Bilförmån för ${owner}`;
    if (kind === "pension") return `Planerad tjänstepension för ${owner}`;
    if (kind === "salary_tax") return `Löneskatt för ${owner}`;
    if (kind === "net_from_company") return `Netto från bolaget för ${owner}`;
    if (kind === "net_from_company_sub") return `Närmaste modellerade nivå mot målet för ${owner}`;
    if (kind === "scenario_net") return `Netto för ${owner}`;
  }

  if (kind === "birth_year") return `Birth year for ${owner}`;
  if (kind === "target_net_income") return `Desired net income after tax for ${owner}`;
  if (kind === "other_salary_income") return `Other gross salary outside the company for ${owner}`;
  if (kind === "external_salary") return `Gross salary from another employer for ${owner}`;
  if (kind === "salary_from_company") return `Cash gross salary from the company in ${params.salaryBasisYear} for ${owner}`;
  if (kind === "saved_dividend_space") return `Saved dividend space for ${owner}`;
  if (kind === "share_cost_basis") return `Share cost basis for ${owner}`;
  if (kind === "car_benefit") return `Car benefit for ${owner}`;
  if (kind === "pension") return `Planned occupational pension for ${owner}`;
  if (kind === "salary_tax") return `Salary tax for ${owner}`;
  if (kind === "net_from_company") return `Net income from company for ${owner}`;
  if (kind === "net_from_company_sub") return `Closest modelled value to the target for ${owner}`;
  if (kind === "scenario_net") return `Net income for ${owner}`;
  return owner;
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
  document.querySelector("#user-salary-label").textContent = ownerSpecificText("salary_from_company", "user", {
    salaryBasisYear,
  });
  targetNetIncomeLabel.textContent = ownerSpecificText("target_net_income", "user");
  userBirthYearLabel.textContent = ownerSpecificText("birth_year", "user");
  spouseBirthYearLabel.textContent = ownerSpecificText("birth_year", "spouse");
  userOtherSalaryIncomeLabel.textContent = ownerSpecificText("other_salary_income", "user");
  spouseExternalSalaryLabel.textContent = ownerSpecificText("external_salary", "spouse");
  userCarBenefitLabel.textContent = ownerSpecificText("car_benefit", "user");
  plannedUserPensionLabel.textContent = ownerSpecificText("pension", "user");
  userSavedDividendSpaceLabel.textContent = ownerSpecificText("saved_dividend_space", "user");
  spouseSavedDividendSpaceLabel.textContent = ownerSpecificText("saved_dividend_space", "spouse");
  userShareCostBasisLabel.textContent = ownerSpecificText("share_cost_basis", "user");
  spouseShareCostBasisLabel.textContent = ownerSpecificText("share_cost_basis", "spouse");
  periodizationLayerInputs.forEach((input) => {
    const offset = Number(input.dataset.periodizationOffset || 0);
    const label = document.querySelector(`#periodization-layer-label-${offset}`);
    if (label) {
      label.textContent = t("field.opening_periodization_layer", { taxYear: Number(year) - offset });
    }
  });
  syncOpeningPeriodizationSummary();
}

function syncOwnershipDisplay() {
  const userShare = Math.min(Math.max(parseLocaleNumber(form.elements.namedItem("user_share_percentage").value, "percent"), 0), 100);
  userShareLabel.textContent = getOwnerName("user");
  spouseShareLabel.textContent = getOwnerName("spouse");
  userShareDisplay.textContent = `${formatInputValue(userShare, "percent")} %`;
  spouseShareDisplay.textContent = `${formatInputValue(100 - userShare, "percent")} %`;
  setFieldLabels(yearInput.value);
}

function setFieldValue(field, value) {
  if (field && typeof field.length === "number" && field.length > 0 && field[0]?.type === "radio") {
    Array.from(field).forEach((option) => {
      option.checked = option.value === value;
    });
    return;
  }
  if (field.type === "checkbox") {
    field.checked = Boolean(value);
    return;
  }
  if (field.type === "radio") {
    field.checked = field.value === value;
    return;
  }
  field.value = value ?? "";
}

function getFieldWrapper(fieldName) {
  const field = form.elements.namedItem(fieldName);
  if (!field || typeof field.length === "number") {
    return null;
  }
  return field.closest(".field");
}

function getFieldLabel(fieldName) {
  const wrapper = getFieldWrapper(fieldName);
  if (!wrapper) {
    return fieldName;
  }
  const label = wrapper.querySelector(".label-text, span, small, legend");
  return label ? label.textContent.trim() : fieldName;
}

function clearAnnualReportFieldMarkers() {
  form.querySelectorAll(".field-autofilled").forEach((wrapper) => {
    wrapper.classList.remove("field-autofilled");
    delete wrapper.dataset.importedBadge;
  });
}

function applyAnnualReportFieldMarkers() {
  clearAnnualReportFieldMarkers();
  if (!annualReportImportState?.fields) {
    return;
  }

  Object.keys(annualReportImportState.fields).forEach((fieldName) => {
    const wrapper = getFieldWrapper(fieldName);
    if (!wrapper) {
      return;
    }
    wrapper.classList.add("field-autofilled");
    wrapper.dataset.importedBadge = t("annual_report.badge");
  });
}

function clearAnnualReportField(fieldName) {
  if (!annualReportImportState?.fields?.[fieldName]) {
    return;
  }

  const nextFields = { ...annualReportImportState.fields };
  delete nextFields[fieldName];

  annualReportImportState = Object.keys(nextFields).length > 0
    ? { ...annualReportImportState, fields: nextFields }
    : null;

  applyAnnualReportFieldMarkers();
  renderAnnualReportStatus();
}

function renderAnnualReportStatus() {
  if (!annualReportStatusBox) {
    return;
  }

  if (annualReportImportPending) {
    annualReportStatusBox.innerHTML = `
      <div class="note annual-report-loading">
        <div class="loading-header">
          <span class="loading-spinner" aria-hidden="true"></span>
          <strong>${t("annual_report.loading_title")}</strong>
        </div>
        <div class="loading-detail">${t("annual_report.loading_detail")}</div>
      </div>
    `;
    annualReportStatusBox.classList.remove("hidden");
    return;
  }

  if (!annualReportImportState?.fields || Object.keys(annualReportImportState.fields).length === 0) {
    annualReportStatusBox.innerHTML = "";
    annualReportStatusBox.classList.add("hidden");
    return;
  }

  const fieldEntries = Object.entries(annualReportImportState.fields);
  const meta = annualReportImportState.company_name && annualReportImportState.report_year
    ? t("annual_report.status_report_meta", {
      companyName: annualReportImportState.company_name,
      reportYear: annualReportImportState.report_year,
    })
    : "";

  const fieldItems = fieldEntries.map(([fieldName, detail]) => {
    const sourceKey = detail.page
      ? "annual_report.field_source"
      : "annual_report.field_source_no_page";

    return `<li>${t(sourceKey, {
      fieldLabel: getFieldLabel(fieldName),
      value: formatCurrency(detail.value),
      sourceLabel: detail.source_label,
      page: detail.page,
    })}</li>`;
  }).join("");

  const warningItems = (annualReportImportState.warnings || []).map((warning) => (
    `<li>${t("annual_report.warning_prefix")} ${warning}</li>`
  )).join("");

  annualReportStatusBox.innerHTML = `
    <div class="note">
      <strong>${t("annual_report.status_title")}</strong><br>
      <div>${t("annual_report.status_intro", { count: fieldEntries.length })}</div>
      <div>${t("annual_report.status_report", {
        filename: annualReportImportState.filename,
        meta,
      })}</div>
      <ul class="annual-report-list">${fieldItems}${warningItems}</ul>
    </div>
  `;
  annualReportStatusBox.classList.remove("hidden");
}

function applyAnnualReportImport(payload) {
  const importedFields = payload?.fields || {};
  const nextState = { ...payload, fields: {} };

  Object.entries(importedFields).forEach(([fieldName, detail]) => {
    const field = form.elements.namedItem(fieldName);
    if (!field || typeof field.length === "number") {
      return;
    }

    const kind = field.dataset?.numberKind;
    setFieldValue(field, kind ? formatInputValue(detail.value, kind) : detail.value);
    nextState.fields[fieldName] = detail;
  });

  annualReportImportState = Object.keys(nextState.fields).length > 0 ? nextState : null;
  refreshFormattedInputs();
  saveState();
  applyAnnualReportFieldMarkers();
  renderAnnualReportStatus();
}

async function importAnnualReportFile(file) {
  if (!file) {
    return;
  }

  clearError();
  annualReportImportPending = true;
  renderAnnualReportStatus();
  importAnnualReportButton.disabled = true;
  importAnnualReportButton.textContent = t("button.importing_annual_report");

  try {
    const body = new FormData();
    body.append("file", file, file.name);

    const response = await fetch("/api/import-annual-report", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || t("error.annual_report_failed"));
    }

    const payload = await response.json();
    applyAnnualReportImport(payload);
    await submitForm();
  } catch (error) {
    throw new Error(error.message || t("error.annual_report_invalid_format"));
  } finally {
    annualReportImportPending = false;
    renderAnnualReportStatus();
    importAnnualReportButton.disabled = false;
    importAnnualReportButton.textContent = t("button.import_annual_report");
    importAnnualReportFileInput.value = "";
    if (actionMenu) {
      actionMenu.open = false;
    }
  }
}

async function fetchTaxCatalog(year) {
  if (taxCatalog.has(year)) {
    return taxCatalog.get(year);
  }

  const response = await fetch(`/api/municipal-tax/${year}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(formatApiErrorDetail(error.detail, "error.calculation_failed"));
  }

  const payload = await response.json();
  taxCatalog.set(year, payload.municipalities);
  return payload.municipalities;
}

function selectedMunicipalityRecord() {
  const municipalities = taxCatalog.get(Number(yearInput.value)) || [];
  return municipalities.find((item) => item.municipality === taxMunicipalitySelect.value) || null;
}

function populateTaxMunicipalities(selectedMunicipality = "") {
  const municipalities = taxCatalog.get(Number(yearInput.value)) || [];
  const selectedValue = selectedMunicipality || taxMunicipalitySelect.value;
  const placeholder = t("field.tax_option_placeholder");

  taxMunicipalitySelect.innerHTML = [
    `<option value="">${placeholder}</option>`,
    ...municipalities.map((item) => {
      const selected = item.municipality === selectedValue ? " selected" : "";
      return `<option value="${item.municipality}"${selected}>${formatDisplayName(item.municipality)}</option>`;
    }),
  ].join("");
}

function populateTaxParishes(selectedParish = "") {
  const municipality = selectedMunicipalityRecord();
  const selectedValue = selectedParish || taxParishSelect.value;
  const placeholder = t("field.parish_option_placeholder");
  const parishes = municipality?.parishes || [];

  taxParishSelect.innerHTML = [
    `<option value="">${placeholder}</option>`,
    ...parishes.map((item) => {
      const selected = item.parish === selectedValue ? " selected" : "";
      return `<option value="${item.parish}"${selected}>${formatDisplayName(item.parish)}</option>`;
    }),
  ].join("");

  if (includeChurchFeeInput.checked && parishes.length > 0 && !taxParishSelect.value) {
    taxParishSelect.value = parishes[0].parish;
  }
}

function syncParishFieldVisibility() {
  const municipality = selectedMunicipalityRecord();
  const showParishField = includeChurchFeeInput.checked && Boolean(municipality?.parishes?.length);
  taxParishField.classList.toggle("hidden", !showParishField);
  taxParishSelect.disabled = !showParishField;
}

function findSelectedParish() {
  const municipality = selectedMunicipalityRecord();
  return municipality?.parishes?.find((item) => item.parish === taxParishSelect.value) || null;
}

function syncLocalTaxComponentInputs() {
  const municipality = selectedMunicipalityRecord();
  const yearDefaults = YEAR_DEFAULTS[Number(yearInput.value)] || YEAR_DEFAULTS[2026];
  if (!municipality) {
    burialFeeRateInput.value = formatInputValue(yearDefaults.burialFeeRate, "percent");
    churchFeeRateInput.value = formatInputValue(0, "percent");
    renderLocalTaxSummary();
    return;
  }

  burialFeeRateInput.value = formatInputValue(municipality.burial_fee || 0, "percent");
  const parish = findSelectedParish();
  const churchFee = includeChurchFeeInput.checked && parish ? parish.church_fee || 0 : 0;
  churchFeeRateInput.value = formatInputValue(churchFee, "percent");
  renderLocalTaxSummary();
}

function renderLocalTaxSummary() {
  const incomeTax = parseLocaleNumber(municipalTaxRateInput.value, "percent");
  const burialFee = parseLocaleNumber(burialFeeRateInput.value, "percent");
  const churchFee = parseLocaleNumber(churchFeeRateInput.value, "percent");
  const totalLocalTax = incomeTax + burialFee + churchFee;
  const parts = [
    `${formatInputValue(incomeTax, "percent")} %`,
    `${formatInputValue(burialFee, "percent")} %`,
  ];

  if (churchFee > 0.0001) {
    parts.push(`${formatInputValue(churchFee, "percent")} %`);
  }

  const detailKey = churchFee > 0.0001
    ? "field.local_tax_detail_church"
    : "field.local_tax_detail_base";

  localTaxSummary.innerHTML = `
    <div class="tax-summary-label">${t("field.local_tax_total")}</div>
    <div class="tax-summary-value">${formatInputValue(totalLocalTax, "percent")} %</div>
    <div class="tax-summary-detail">${t(detailKey)}: ${parts.join(" + ")}</div>
  `;
}

function applyMunicipalTaxAutofill({ force = false } = {}) {
  const municipality = selectedMunicipalityRecord();
  if (municipalTaxManualOverride && !force) {
    syncLocalTaxComponentInputs();
    return;
  }
  const yearDefaults = YEAR_DEFAULTS[Number(yearInput.value)] || YEAR_DEFAULTS[2026];
  const localIncomeTax = municipality
    ? (municipality.municipal_tax || 0) + (municipality.regional_tax || 0)
    : yearDefaults.municipalTaxRate;

  applyingMunicipalTaxRate = true;
  municipalTaxRateInput.value = formatInputValue(localIncomeTax, "percent");
  applyingMunicipalTaxRate = false;
  syncLocalTaxComponentInputs();
}

async function syncMunicipalTaxSelectors({ year, municipality, parish, forceAutofill = false } = {}) {
  const targetYear = Number(year || yearInput.value);
  yearInput.value = String(targetYear);
  await fetchTaxCatalog(targetYear);
  populateTaxMunicipalities(municipality);

  if (municipality) {
    taxMunicipalitySelect.value = municipality;
  }

  populateTaxParishes(parish);

  if (parish) {
    taxParishSelect.value = parish;
  }

  syncParishFieldVisibility();
  applyMunicipalTaxAutofill({ force: forceAutofill });
}

async function restoreState() {
  const source = readSavedState();
  municipalTaxManualOverride = Boolean(source._municipal_tax_manual_override);
  yearInput.value = String(source.year || window.APP_DEFAULTS.year);

  await syncMunicipalTaxSelectors({
    year: source.year || window.APP_DEFAULTS.year,
    municipality: source.tax_municipality || "",
    parish: source.tax_parish || "",
    forceAutofill: !municipalTaxManualOverride,
  });

  for (const [key, value] of Object.entries(source)) {
    const field = form.elements.namedItem(key);
    if (field) {
      setFieldValue(field, value);
    }
  }

  populateTaxMunicipalities(source.tax_municipality || "");
  populateTaxParishes(source.tax_parish || "");
  syncParishFieldVisibility();
  syncLocalTaxComponentInputs();
  if (!municipalTaxManualOverride) {
    applyMunicipalTaxAutofill({ force: true });
  }
  refreshFormattedInputs();
  setFieldLabels(source.year || window.APP_DEFAULTS.year);
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(buildPortableState()),
  );
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildExportFilename() {
  const datePart = new Date().toISOString().slice(0, 10);
  return `skatteuttag-${datePart}.json`;
}

async function applyImportedState(source) {
  const imported = sanitizeImportedState(source);
  municipalTaxManualOverride = Boolean(imported._municipal_tax_manual_override);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
  annualReportImportState = null;
  applyAnnualReportFieldMarkers();
  renderAnnualReportStatus();
  if (
    typeof imported.language === "string"
    && Array.from(languageSwitch.options).some((option) => option.value === imported.language)
  ) {
    currentLanguage = imported.language;
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
    await ensureTranslationsLoaded(currentLanguage);
    applyStaticTranslations();
  }
  return restoreState();
}

function saveStateIfFormField(event) {
  if (event.target && event.target.name && form.contains(event.target)) {
    clearAnnualReportField(event.target.name);
    saveState();
  }
}

function positionInfoPopover(popover) {
  const panel = popover.querySelector(".info-panel");
  if (!panel) {
    return;
  }

  popover.classList.remove("align-left", "open-upward");
  const rect = panel.getBoundingClientRect();

  if (rect.left < 16) {
    popover.classList.add("align-left");
  }

  if (rect.bottom > window.innerHeight - 16) {
    popover.classList.add("open-upward");
  }
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

function currentOptimizationProfile(result = null) {
  return result?.input?.optimization_profile || form.elements.namedItem("optimization_profile")?.value || "target_then_tax";
}

function recommendationSubtitleKey(profile) {
  if (profile === "guardrails") return "recommended.subtitle_guardrails";
  if (profile === "household_max") return "recommended.subtitle_household_max";
  if (profile === "tax_min") return "recommended.subtitle_tax_min";
  return "recommended.subtitle_target_then_tax";
}

function recommendationControlTexts(result) {
  const profileKey = {
    target_then_tax: "analysis.control_profile_target_then_tax",
    guardrails: "analysis.control_profile_guardrails",
    household_max: "analysis.control_profile_household_max",
    tax_min: "analysis.control_profile_tax_min",
  }[currentOptimizationProfile(result)] || "analysis.control_profile_target_then_tax";

  const controls = [t(profileKey)];
  const householdFloor = Number(result?.input?.household_min_net_income || 0);
  controls.push(
    householdFloor > 0
      ? t("analysis.control_household_floor_active", { amount: formatCurrency(householdFloor) })
      : t("analysis.control_household_floor_none"),
  );
  return controls;
}

function recommendationConstraintTexts(result) {
  const constraints = [];
  const recommendation = result.recommended;
  const householdFloor = Number(result.input.household_min_net_income || 0);
  const maxFeasibleSalary = Number(result.meta.max_feasible_salary || 0);

  if (recommendation.shortfall_to_target > 1) {
    constraints.push(t("analysis.constraint_user_target", { amount: formatCurrency(recommendation.shortfall_to_target) }));
  }
  if (householdFloor > recommendation.household_net_from_company + 1) {
    constraints.push(
      t("analysis.constraint_household_floor", {
        amount: formatCurrency(householdFloor - recommendation.household_net_from_company),
      }),
    );
  }
  if (recommendation.company.available_dividend_cash > 0 && recommendation.total_dividend >= recommendation.company.available_dividend_cash - 100) {
    constraints.push(t("analysis.constraint_dividend_cap"));
  }
  if (maxFeasibleSalary > 0 && recommendation.salary >= maxFeasibleSalary - 100) {
    constraints.push(t("analysis.constraint_salary_cap"));
  }
  if ((result.compensation_mix?.household_max_delta || 0) > 1) {
    constraints.push(t("analysis.constraint_household_not_max"));
  }

  return constraints.length ? constraints : [t("analysis.constraint_none")];
}

function analysisMetaBlock({ method, controls, constraints = [] }) {
  return `
    <div class="analysis-meta">
      <div class="analysis-meta-row">
        <strong>${t("analysis.how_title")}</strong>
        <span>${method}</span>
      </div>
      <div class="analysis-meta-row">
        <strong>${t("analysis.controls_title")}</strong>
        <span>${controls.join(" ")}</span>
      </div>
      <div class="analysis-meta-row">
        <strong>${t("analysis.constraints_title")}</strong>
        <span>${constraints.join(" ")}</span>
      </div>
    </div>
  `;
}

function translateRule(label) {
  if (label === "Main rule") return t("rule.main");
  if (label === "Simplification rule") return t("rule.simplification");
  if (label === "2026 combined rule") return t("rule.new_combined");
  return label;
}

function localizeTranslationParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value !== "number") {
        return [key, value];
      }
      if (/Percentage$/i.test(key)) {
        return [key, formatInputValue(value, "percent")];
      }
      if (["salaryRequirement", "wageDeduction"].includes(key)) {
        return [key, formatInputValue(value, "amount")];
      }
      return [key, value];
    }),
  );
}

function translateMessage(item) {
  if (typeof item === "string") {
    return item;
  }
  const params = {
    userName: getOwnerName("user"),
    spouseName: getOwnerName("spouse"),
    ...localizeTranslationParams(item.params || {}),
  };
  return t(item.key, params);
}

function renderMetrics(result) {
  const recommendation = result.recommended;
  recommendedSubtitle.textContent = t(recommendationSubtitleKey(currentOptimizationProfile(result)));
  summaryBox.classList.remove("empty-state");
  summaryBox.innerHTML = `
    ${metric(t("metric.recommended_salary"), formatCurrency(recommendation.salary), t("metric.recommended_salary_sub"))}
    ${metric(t("metric.recommended_dividend"), formatCurrency(recommendation.total_dividend), t("metric.recommended_dividend_sub"))}
    ${metric(ownerSpecificText("net_from_company", "user"), formatCurrency(recommendation.user_net_from_company), ownerSpecificText("net_from_company_sub", "user"))}
    ${metric(t("metric.household_net"), formatCurrency(recommendation.household_net_from_company), t("metric.household_net_sub"))}
    ${metric(t("metric.distance_to_target"), formatCurrency(recommendation.distance_to_target), recommendation.shortfall_to_target > 0 ? t("metric.distance_target_shortfall") : t("metric.distance_target_reached"))}
    ${metric(t("metric.total_tax_burden"), formatCurrency(recommendation.total_tax_burden), t("metric.total_tax_burden_sub"))}
  `;
}

function renderProblemSignals(result) {
  const problems = result.problems || [];
  if (!problems.length) {
    problemSignalsBox.innerHTML = "";
    return;
  }

  problemSignalsBox.innerHTML = `
    <div class="note problem-note">
      <strong>${t("problem.title")}</strong>
      <div class="problem-list">
        ${problems.map((item) => `<div>${translateMessage(item)}</div>`).join("")}
      </div>
    </div>
  `;
}

function renderFinalPlan(result) {
  const recommendation = result.recommended;
  const suggestion = result.ownership_suggestion;
  const ownershipPending = Boolean(result.ownership_analysis_pending);
  const userShare = suggestion ? suggestion.suggested_user_share_percentage : result.input.user_share_percentage;
  const spouseShare = suggestion ? suggestion.suggested_spouse_share_percentage : (100 - result.input.user_share_percentage);
  const summaryKey = ownershipPending
    ? "recommended.final_summary_pending"
    : (suggestion ? "recommended.final_summary_suggested" : "recommended.final_summary_current");
  const statusKey = suggestion
    ? "recommended.final_status_better"
    : (ownershipPending ? "recommended.final_status_pending" : "recommended.final_status_same");
  const analysisMeta = analysisMetaBlock({
    method: t("analysis.recommendation_method"),
    controls: recommendationControlTexts(result),
    constraints: recommendationConstraintTexts(result),
  });

  finalPlanBox.innerHTML = `
    <div class="note final-plan-note">
      <strong>${t("recommended.final_title")}</strong>
      <p class="final-plan-summary">${t(summaryKey, {
        salary: formatCurrency(recommendation.salary),
        dividend: formatCurrency(recommendation.total_dividend),
        userName: getOwnerName("user"),
        spouseName: getOwnerName("spouse"),
        userShare: formatInputValue(userShare, "percent"),
        spouseShare: formatInputValue(spouseShare, "percent"),
      })}</p>
      <div class="final-plan-status">${t(statusKey)}</div>
      ${analysisMeta}
    </div>
  `;
}

function comparisonDeltaText(type, amount) {
  if (Math.abs(amount) < 1) {
    amount = 0;
  }
  const value = formatCurrency(Math.abs(amount));
  const direction = amount <= 0 ? "lower" : "higher";
  return t(`mix.comparison_${type}_${direction}`, { amount: value });
}

function renderCompensationMixAnalysis(result) {
  const mix = result.compensation_mix;
  if (!mix) {
    compensationMixBox.innerHTML = "";
    return;
  }

  const comparisons = (mix.comparisons || [])
    .map((entry) => {
      const scenario = entry.scenario;
      return `
        <article class="mix-comparison-card">
          <h4>${t(entry.key)}</h4>
          <div class="kv">
            <div>${t("scenario.salary")}</div><div>${formatCurrency(scenario.salary)}</div>
            <div>${t("scenario.total_dividend")}</div><div>${formatCurrency(scenario.total_dividend)}</div>
            <div>${ownerSpecificText("scenario_net", "user")}</div><div>${formatCurrency(scenario.user_net_from_company)}</div>
            <div>${t("scenario.total_tax_burden")}</div><div>${formatCurrency(scenario.total_tax_burden)}</div>
          </div>
          <p>${comparisonDeltaText("tax", entry.tax_delta)} ${comparisonDeltaText("net", entry.net_delta)}</p>
        </article>
      `;
    })
    .join("");

  const householdNote = mix.household_max_delta > 1
    ? t("mix.household_more", {
      householdNet: formatCurrency(mix.household_max_net),
      delta: formatCurrency(mix.household_max_delta),
    })
    : t("mix.household_same");

  compensationMixBox.innerHTML = `
    <div class="note mix-note">
      <strong>${t("mix.title")}</strong>
      <p class="mix-summary">${translateMessage(mix.summary)}</p>
      ${analysisMetaBlock({
        method: t("analysis.mix_method"),
        controls: recommendationControlTexts(result),
        constraints: [(mix.household_max_delta || 0) > 1 ? t("analysis.constraint_household_not_max") : t("analysis.constraint_none")],
      })}
      <div class="mix-stat-grid">
        <div class="mix-stat">
          <span>${t("mix.share_salary")}</span>
          <strong>${formatInputValue(mix.salary_share_percentage, "percent")} %</strong>
        </div>
        <div class="mix-stat">
          <span>${t("mix.share_dividend")}</span>
          <strong>${formatInputValue(mix.dividend_share_percentage, "percent")} %</strong>
        </div>
      </div>
      <div class="mix-reasons">
        ${(mix.reasons || []).map((item) => `<div>${translateMessage(item)}</div>`).join("")}
      </div>
      <div class="mix-household-note">
        <strong>${t("mix.household_title")}</strong>
        <p>${householdNote}</p>
      </div>
      ${comparisons ? `<div class="mix-comparison-grid">${comparisons}</div>` : ""}
    </div>
  `;
}

function renderPeriodizationStrategy(result) {
  const strategy = result.periodization_strategy;
  if (!strategy) {
    periodizationStrategyBox.innerHTML = "";
    return;
  }

  const openingLayers = (strategy.opening_layers || [])
    .map((layer) => `${layer.tax_year}: ${formatCurrency(layer.amount)}`)
    .join(" · ");
  const closingLayers = (strategy.closing_layers || [])
    .filter((layer) => layer.amount > 0)
    .map((layer) => `${layer.tax_year}: ${formatCurrency(layer.amount)}`)
    .join(" · ");

  periodizationStrategyBox.innerHTML = `
    <div class="note mix-note">
      <strong>${t("periodization.title")}</strong>
      <p class="mix-summary">${translateMessage(strategy.summary)}</p>
      ${analysisMetaBlock({
        method: t("analysis.periodization_method"),
        controls: recommendationControlTexts(result),
        constraints: strategy.actions.length ? strategy.actions.map(translateMessage) : [t("analysis.constraint_none")],
      })}
      <div class="mix-reasons">
        ${(strategy.actions || []).map((item) => `<div>${translateMessage(item)}</div>`).join("")}
      </div>
      <div class="kv periodization-kv">
        <div>${t("label.periodization_opening_balance")}</div><div>${formatCurrency(result.recommended.company.opening_periodization_fund_balance)}</div>
        <div>${t("label.periodization_schablon_income")}</div><div>${formatCurrency(result.recommended.company.schablon_income)}</div>
        <div>${t("label.periodization_mandatory_reversal")}</div><div>${formatCurrency(result.recommended.company.mandatory_reversal_original)}</div>
        <div>${t("label.periodization_total_reversal_taxable")}</div><div>${formatCurrency(result.recommended.company.total_reversal_taxable)}</div>
        <div>${t("label.periodization_unused_room")}</div><div>${formatCurrency(strategy.unused_allocation_room)}</div>
        <div>${t("label.periodization_immediate_deferral")}</div><div>${formatCurrency(strategy.immediate_tax_deferral)}</div>
        <div>${t("label.retained_after_recommendation")}</div><div>${formatCurrency(strategy.retained_after_recommendation)}</div>
      </div>
      ${openingLayers ? `<p class="breakdown-note">${t("periodization.opening_layers")}: ${openingLayers}</p>` : ""}
      ${closingLayers ? `<p class="breakdown-note">${t("periodization.closing_layers")}: ${closingLayers}</p>` : ""}
    </div>
  `;
}

function renderOwnershipSuggestion(result) {
  const suggestion = result.ownership_suggestion;
  const ownershipPending = Boolean(result.ownership_analysis_pending);
  const currentSplit = t("ownership.current_split", {
    userName: getOwnerName("user"),
    spouseName: getOwnerName("spouse"),
    userSharePercentage: formatInputValue(result.input.user_share_percentage, "percent"),
    spouseSharePercentage: formatInputValue(100 - result.input.user_share_percentage, "percent"),
  });

  if (ownershipPending) {
    ownershipSuggestionBox.innerHTML = `
      <div class="note ownership-loading">
        <div class="loading-header">
          <span class="loading-spinner" aria-hidden="true"></span>
          <strong>${t("ownership.loading_title")}</strong>
        </div>
        <div>${t("ownership.loading")}</div>
        <div class="loading-detail">${t("ownership.loading_detail")}</div>
      </div>
    `;
    return;
  }

  if (!suggestion) {
    ownershipSuggestionBox.innerHTML = `
      <div class="note">
        <strong>${t("ownership.title")}</strong><br>
        <div class="ownership-comparison-row">
          <span class="ownership-chip">${t("ownership.input_label")}</span>
          <span>${currentSplit}</span>
        </div>
        ${t("ownership.no_better_split")}<br>
        ${t("ownership.no_better_split_detail")}
        ${analysisMetaBlock({
          method: t("analysis.ownership_method"),
          controls: [t("ownership.optimized_for_household")],
          constraints: [t("analysis.constraint_none")],
        })}
      </div>
    `;
    return;
  }

  let taxImpactText = t("ownership.tax_saving_neutral");
  if (suggestion.estimated_tax_saving > 1) {
    taxImpactText = t("ownership.tax_saving_positive", {
      taxSaving: formatCurrency(suggestion.estimated_tax_saving),
    });
  } else if (suggestion.estimated_tax_saving < -1) {
    taxImpactText = t("ownership.tax_saving_negative", {
      taxSaving: formatCurrency(Math.abs(suggestion.estimated_tax_saving)),
    });
  }

  let extractionImpactText = t("ownership.extraction_change_neutral");
  if (suggestion.estimated_extraction_change > 1) {
    extractionImpactText = t("ownership.extraction_change_positive", {
      amount: formatCurrency(suggestion.estimated_extraction_change),
    });
  } else if (suggestion.estimated_extraction_change < -1) {
    extractionImpactText = t("ownership.extraction_change_negative", {
      amount: formatCurrency(Math.abs(suggestion.estimated_extraction_change)),
    });
  }

  let samePlanHouseholdText = t("ownership.same_plan_household_gain_neutral");
  if (suggestion.same_plan_household_net_change > 1) {
    samePlanHouseholdText = t("ownership.same_plan_household_gain_positive", {
      amount: formatCurrency(suggestion.same_plan_household_net_change),
    });
  } else if (suggestion.same_plan_household_net_change < -1) {
    samePlanHouseholdText = t("ownership.same_plan_household_gain_negative", {
      amount: formatCurrency(Math.abs(suggestion.same_plan_household_net_change)),
    });
  }

  let samePlanTaxText = t("ownership.same_plan_tax_change_neutral");
  if (suggestion.same_plan_total_tax_change > 1) {
    samePlanTaxText = t("ownership.same_plan_tax_change_positive", {
      amount: formatCurrency(suggestion.same_plan_total_tax_change),
    });
  } else if (suggestion.same_plan_total_tax_change < -1) {
    samePlanTaxText = t("ownership.same_plan_tax_change_negative", {
      amount: formatCurrency(Math.abs(suggestion.same_plan_total_tax_change)),
    });
  }

  const samePlanGuidanceKey = Math.max(
    Math.abs(suggestion.same_plan_household_net_change || 0),
    Math.abs(suggestion.same_plan_total_tax_change || 0),
  ) > 10_000
    ? "ownership.same_plan_guidance_large"
    : "ownership.same_plan_guidance_small";

  let taxEffectValue = t("ownership.tax_saving_value_neutral");
  if (suggestion.estimated_tax_saving > 1) {
    taxEffectValue = t("ownership.tax_saving_value_positive", {
      amount: formatCurrency(suggestion.estimated_tax_saving),
    });
  } else if (suggestion.estimated_tax_saving < -1) {
    taxEffectValue = t("ownership.tax_saving_value_negative", {
      amount: formatCurrency(Math.abs(suggestion.estimated_tax_saving)),
    });
  }

  ownershipSuggestionBox.innerHTML = `
    <div class="note">
      <strong>${t("ownership.title")}</strong><br>
      <div class="ownership-comparison">
        <div class="ownership-comparison-row">
          <span class="ownership-chip">${t("ownership.input_label")}</span>
          <span>${currentSplit}</span>
        </div>
        <div class="ownership-comparison-row ownership-comparison-row-highlight">
          <span class="ownership-chip ownership-chip-accent">${t("ownership.proposal_label")}</span>
          <span>${t("ownership.better_split", {
            userName: getOwnerName("user"),
            spouseName: getOwnerName("spouse"),
            userSharePercentage: formatInputValue(suggestion.suggested_user_share_percentage, "percent"),
            spouseSharePercentage: formatInputValue(suggestion.suggested_spouse_share_percentage, "percent"),
          })}</span>
        </div>
      </div>
      <div>${t("ownership.optimized_for_household")}</div>
      <div>${t("ownership.optimized_comparison_intro")}</div>
      <div class="mix-household-note">
        <strong>${t("ownership.reading_guide_title")}</strong>
        <p>${t("ownership.reading_guide_body")}</p>
        <p>${t("ownership.manual_recalc")}</p>
      </div>
      <div class="mix-stat-grid ownership-stat-grid">
        <div class="mix-stat">
          <span>${t("ownership.household_net_gain_label")}</span>
          <strong>${formatCurrency(suggestion.estimated_household_net_gain)}</strong>
        </div>
        <div class="mix-stat">
          <span>${t("ownership.tax_effect_label")}</span>
          <strong>${taxEffectValue}</strong>
        </div>
        <div class="mix-stat">
          <span>${t("ownership.current_total_tax_label")}</span>
          <strong>${formatCurrency(suggestion.current_total_tax_burden)}</strong>
        </div>
        <div class="mix-stat">
          <span>${t("ownership.suggested_total_tax_label")}</span>
          <strong>${formatCurrency(suggestion.suggested_total_tax_burden)}</strong>
        </div>
      </div>
      ${t("ownership.household_net_gain", {
        householdNetGain: formatCurrency(suggestion.estimated_household_net_gain),
      })}<br>
      ${extractionImpactText}<br>
      ${taxImpactText}<br>
      <div class="ownership-same-plan">
        <strong>${t("ownership.same_plan_title")}</strong><br>
        ${t("ownership.same_plan_explainer")}<br>
        ${samePlanHouseholdText}<br>
        ${samePlanTaxText}<br>
        ${t(samePlanGuidanceKey)}
      </div>
      ${translateMessage(suggestion.note)}
      ${analysisMetaBlock({
        method: t("analysis.ownership_method"),
        controls: [t("ownership.optimized_for_household")],
        constraints: [extractionImpactText, taxImpactText],
      })}
    </div>
  `;
}

function breakdownCard(title, rows, note = "") {
  return `
    <article class="breakdown-card">
      <h3>${title}</h3>
      <div class="kv">
        ${rows.map(([key, value]) => `<div>${key}</div><div>${value}</div>`).join("")}
      </div>
      ${note ? `<p class="breakdown-note">${note}</p>` : ""}
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
      [t("label.profit_before_owner_salary"), formatCurrency(result.input.company_result_before_corporate_tax)],
      [t("label.cash_salary"), formatCurrency(recommendation.salary)],
      [t("label.car_benefit_non_cash"), formatCurrency(company.car_benefit)],
      [t("label.employer_contributions"), formatCurrency(company.employer_contributions)],
      [t("label.pension"), formatCurrency(company.planned_user_pension)],
      [t("label.pension_slp"), formatCurrency(company.pension_special_payroll_tax)],
      [t("label.periodization_opening_balance"), formatCurrency(company.opening_periodization_fund_balance)],
      [t("label.periodization_schablon_income"), formatCurrency(company.schablon_income)],
      [t("label.periodization_mandatory_reversal"), formatCurrency(company.mandatory_reversal_original)],
      [t("label.periodization_fund_change"), formatCurrency(company.periodization_fund_change)],
      [t("label.corporate_tax"), formatCurrency(company.corporate_tax)],
      [t("label.available_dividend_cash"), formatCurrency(company.available_dividend_cash)],
    ], t("note.company_budget_non_cash")),
    breakdownCard(ownerSpecificText("salary_tax", "user"), [
      [t("label.cash_salary"), formatCurrency(recommendation.salary)],
      [t("label.user_other_salary_income"), formatCurrency(result.input.user_other_salary_income)],
      [t("label.car_benefit"), formatCurrency(company.car_benefit)],
      [t("label.taxable_company_income"), formatCurrency(company.taxable_salary_base)],
      [t("label.base_deduction"), formatCurrency(salaryTax.base_deduction)],
      [t("label.municipal_tax"), formatCurrency(salaryTax.municipal_tax)],
      [t("label.burial_fee_tax"), formatCurrency(salaryTax.burial_fee_tax)],
      [t("label.church_fee_tax"), formatCurrency(salaryTax.church_fee_tax)],
      [t("label.state_tax"), formatCurrency(salaryTax.state_tax)],
      [t("label.incremental_salary_tax"), formatCurrency(recommendation.incremental_user_salary_tax)],
      [t("label.net_cash_salary"), formatCurrency(recommendation.user_net_cash_salary)],
    ]),
    breakdownCard(t("breakdown.dividend_room"), [
      [ownerLabel("user", "noun.dividend_room"), formatCurrency(spaces.user_space)],
      [ownerLabel("user", "noun.rule"), translateRule(spaces.user_rule_label)],
      [ownerLabel("spouse", "noun.dividend_room"), formatCurrency(spaces.spouse_space)],
      [ownerLabel("spouse", "noun.rule"), translateRule(spaces.spouse_rule_label)],
      [t("label.salary_basis_year"), String(result.meta.salary_basis_year)],
    ]),
    breakdownCard(t("breakdown.dividend_taxation"), [
      [ownerLabel("user", "noun.qualified_dividend"), formatCurrency(userDividend.qualified_dividend)],
      [ownerLabel("user", "noun.service_taxed_excess"), formatCurrency(userDividend.service_taxed_dividend)],
      [ownerLabel("spouse", "noun.qualified_dividend"), formatCurrency(spouseDividend.qualified_dividend)],
      [ownerLabel("spouse", "noun.service_taxed_excess"), formatCurrency(spouseDividend.service_taxed_dividend)],
      [t("label.combined_dividend_tax"), formatCurrency(userDividend.total_dividend_tax + spouseDividend.total_dividend_tax)],
    ]),
  ].join("");
}

function renderAlternatives(result) {
  const labelMap = {
    "Dividend-led": "alternative.dividend_led",
    "Near state tax breakpoint": "alternative.near_state_breakpoint",
    "Maximum user net": "alternative.maximum_user_net",
    "Lowest total tax": "alternative.lowest_total_tax",
    "Highest household net": "alternative.highest_household_net",
    "Within lower tax guardrails": "alternative.within_lower_tax_guardrails",
  };
  const descriptionMap = {
    "Lower salary focus with heavier reliance on dividends.": "alternative.dividend_led_desc",
    "Salary pushed close to the state income tax breakpoint before dividends.": "alternative.near_state_breakpoint_desc",
    "Highest user after-tax income the model can find within the current company budget.": "alternative.maximum_user_net_desc",
    "Lowest total tax burden that the model can find within the current company budget.": "alternative.lowest_total_tax_desc",
    "Highest combined household net from the company that the model can find within the current company budget.": "alternative.highest_household_net_desc",
    "Keeps salary under state income tax when possible and keeps dividends inside qualified room before service taxation.": "alternative.within_lower_tax_guardrails_desc",
  };

  const cards = result.alternatives
    .map((entry) => {
      const scenario = entry.scenario;
      return `
        <article class="scenario-card">
          <h3>${t(labelMap[entry.label] || entry.label)}</h3>
          <p>${t(descriptionMap[entry.description] || entry.description)}</p>
          <div class="kv">
            <div>${t("scenario.salary")}</div><div>${formatCurrency(scenario.salary)}</div>
            <div>${t("scenario.total_dividend")}</div><div>${formatCurrency(scenario.total_dividend)}</div>
            <div>${ownerSpecificText("scenario_net", "user")}</div><div>${formatCurrency(scenario.user_net_from_company)}</div>
            <div>${t("scenario.total_tax_burden")}</div><div>${formatCurrency(scenario.total_tax_burden)}</div>
          </div>
        </article>
      `;
    })
    .join("");

  alternativesBox.innerHTML = `
    <div class="note">
      <strong>${t("analysis.how_title")}</strong><br>
      ${t("analysis.alternatives_method")}<br><br>
      <strong>${t("analysis.controls_title")}</strong><br>
      ${recommendationControlTexts(result).join(" ")}
    </div>
    ${cards}
  `;
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
  errorBox.textContent = normalizeErrorMessage(message);
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function syncRecommendedSubtitle(result = null) {
  recommendedSubtitle.textContent = t(recommendationSubtitleKey(currentOptimizationProfile(result)));
}

function setLoadingState() {
  syncRecommendedSubtitle();
  summaryBox.classList.add("empty-state");
  summaryBox.innerHTML = `<span>${t("status.calculating")}</span>`;
  problemSignalsBox.innerHTML = "";
  finalPlanBox.innerHTML = "";
  compensationMixBox.innerHTML = "";
  periodizationStrategyBox.innerHTML = "";
  ownershipSuggestionBox.innerHTML = `
    <div class="note ownership-loading">
      <div class="loading-header">
        <span class="loading-spinner" aria-hidden="true"></span>
        <strong>${t("ownership.loading_title")}</strong>
      </div>
      <div>${t("ownership.loading")}</div>
      <div class="loading-detail">${t("ownership.loading_detail")}</div>
    </div>
  `;
  breakdownGrid.innerHTML = "";
  alternativesBox.innerHTML = "";
  assumptionsBox.innerHTML = "";
  submitButton.disabled = true;
  submitButton.textContent = t("button.calculating");
}

function clearLoadingState() {
  submitButton.disabled = false;
  submitButton.textContent = t("button.calculate");
}

async function fetchOwnershipAnalysis(payload) {
  const response = await fetch("/api/ownership-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(formatApiErrorDetail(error.detail, "error.calculation_failed"));
  }

  return response.json();
}

async function exportPdf() {
  clearError();
  saveState();
  const payload = { ...formToObject(), language: currentLanguage };
  exportPdfButton.disabled = true;
  exportPdfButton.textContent = t("button.exporting_pdf");

  try {
    const response = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(formatApiErrorDetail(error.detail, "error.export_failed"));
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "skatteuttag-report.pdf";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  } finally {
    exportPdfButton.disabled = false;
    exportPdfButton.textContent = t("button.export_pdf");
    if (actionMenu) {
      actionMenu.open = false;
    }
  }
}

function exportData() {
  clearError();
  saveState();
  exportDataButton.disabled = true;
  exportDataButton.textContent = t("button.exporting_data");

  try {
    downloadJsonFile(buildExportFilename(), buildExportPayload());
  } finally {
    exportDataButton.disabled = false;
    exportDataButton.textContent = t("button.export_data");
    if (actionMenu) {
      actionMenu.open = false;
    }
  }
}

async function importDataFile(file) {
  if (!file) {
    return;
  }

  clearError();
  importDataButton.disabled = true;
  importDataButton.textContent = t("button.importing_data");

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    const importedForm = parsed?.schema === EXPORT_SCHEMA ? parsed.form : parsed;

    if (parsed?.schema === EXPORT_SCHEMA && parsed.language && ["sv", "en"].includes(parsed.language)) {
      currentLanguage = parsed.language;
      localStorage.setItem(LANGUAGE_KEY, currentLanguage);
      applyStaticTranslations();
    }

    await applyImportedState(importedForm);
    lastResult = parsed?.schema === EXPORT_SCHEMA && parsed.analysis ? parsed.analysis : null;
    syncRecommendedSubtitle(lastResult);
    await submitForm();
  } catch (error) {
    throw new Error(error instanceof SyntaxError ? t("error.import_invalid_format") : (error.message || t("error.import_failed")));
  } finally {
    importDataButton.disabled = false;
    importDataButton.textContent = t("button.import_data");
    importDataFileInput.value = "";
    if (actionMenu) {
      actionMenu.open = false;
    }
  }
}

async function submitForm() {
  clearError();
  saveState();
  setLoadingState();
  const payload = formToObject();
  const requestId = ++activeSubmitRequestId;

  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    clearLoadingState();
    throw new Error(formatApiErrorDetail(error.detail, "error.calculation_failed"));
  }

  const result = await response.json();
  if (requestId !== activeSubmitRequestId) {
    return;
  }
  lastResult = result;
  renderMetrics(result);
  renderProblemSignals(result);
  renderFinalPlan(result);
  renderCompensationMixAnalysis(result);
  renderPeriodizationStrategy(result);
  renderBreakdown(result);
  renderAlternatives(result);
  renderAssumptions(result);
  clearLoadingState();

  fetchOwnershipAnalysis(payload)
    .then((ownershipResult) => {
      if (requestId !== activeSubmitRequestId) {
        return;
      }
      lastResult = {
        ...result,
        ownership_analysis_pending: false,
        ownership_suggestion: ownershipResult.ownership_suggestion,
      };
      renderProblemSignals(lastResult);
      renderFinalPlan(lastResult);
      renderPeriodizationStrategy(lastResult);
      renderOwnershipSuggestion(lastResult);
    })
    .catch((error) => {
      if (requestId !== activeSubmitRequestId) {
        return;
      }
      renderOwnershipSuggestion({ ...result, ownership_analysis_pending: false });
      setError(error);
    });
}

yearInput.addEventListener("change", (event) => {
  setFieldLabels(event.target.value);
  municipalTaxManualOverride = false;
  syncMunicipalTaxSelectors({
    year: event.target.value,
    municipality: taxMunicipalitySelect.value,
    parish: taxParishSelect.value,
    forceAutofill: true,
  }).then(saveState).catch((error) => setError(error));
});

form.addEventListener("input", saveStateIfFormField);
form.addEventListener("change", saveStateIfFormField);
form.addEventListener("change", syncOwnershipDisplay);
form.addEventListener("input", (event) => {
  if (event.target && ["user_share_percentage", "user_display_name", "spouse_display_name"].includes(event.target.name)) {
    syncOwnershipDisplay();
  }
});

numericInputs.forEach((input) => {
  input.addEventListener("blur", () => {
    formatNumericField(input);
    if (input.classList.contains("js-periodization-layer")) {
      syncOpeningPeriodizationSummary();
    }
    saveState();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    formatNumericField(input);
    if (input.classList.contains("js-periodization-layer")) {
      syncOpeningPeriodizationSummary();
    }
    saveState();
  });
});

periodizationLayerInputs.forEach((input) => {
  input.addEventListener("input", () => {
    syncOpeningPeriodizationSummary();
  });
});

infoPopovers.forEach((popover) => {
  popover.addEventListener("toggle", () => {
    if (!popover.open) {
      popover.classList.remove("align-left", "open-upward");
      return;
    }

    infoPopovers.forEach((otherPopover) => {
      if (otherPopover !== popover) {
        otherPopover.open = false;
      }
    });

    requestAnimationFrame(() => positionInfoPopover(popover));
  });
});

municipalTaxRateInput.addEventListener("input", () => {
  if (!applyingMunicipalTaxRate) {
    municipalTaxManualOverride = true;
  }
  renderLocalTaxSummary();
});

taxMunicipalitySelect.addEventListener("change", () => {
  municipalTaxManualOverride = false;
  populateTaxParishes("");
  syncParishFieldVisibility();
  applyMunicipalTaxAutofill({ force: true });
  saveState();
});

includeChurchFeeInput.addEventListener("change", () => {
  municipalTaxManualOverride = false;
  populateTaxParishes(taxParishSelect.value);
  syncParishFieldVisibility();
  applyMunicipalTaxAutofill({ force: true });
  saveState();
});

taxParishSelect.addEventListener("change", () => {
  municipalTaxManualOverride = false;
  applyMunicipalTaxAutofill({ force: true });
  saveState();
});

userShareSlider.addEventListener("input", () => {
  syncOwnershipDisplay();
  saveState();
});

languageSwitch.addEventListener("change", async (event) => {
  currentLanguage = event.target.value;
  localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  await ensureTranslationsLoaded(currentLanguage);
  applyStaticTranslations();
  syncRecommendedSubtitle(lastResult);
  populateTaxMunicipalities(taxMunicipalitySelect.value);
  populateTaxParishes(taxParishSelect.value);
  syncParishFieldVisibility();
  refreshFormattedInputs();
  renderLocalTaxSummary();
  setFieldLabels(yearInput.value);
  if (lastResult) {
    renderMetrics(lastResult);
    renderProblemSignals(lastResult);
    renderFinalPlan(lastResult);
    renderCompensationMixAnalysis(lastResult);
    renderPeriodizationStrategy(lastResult);
    renderOwnershipSuggestion(lastResult);
    renderBreakdown(lastResult);
    renderAlternatives(lastResult);
    renderAssumptions(lastResult);
  }
});

form.addEventListener("change", (event) => {
  if (event.target?.name === "optimization_profile") {
    syncRecommendedSubtitle();
  }
});

exportPdfButton.addEventListener("click", () => {
  exportPdf().catch((error) => setError(error));
});

exportDataButton.addEventListener("click", () => {
  try {
    exportData();
  } catch (error) {
    setError(error);
  }
});

importAnnualReportButton.addEventListener("click", () => {
  importAnnualReportFileInput.click();
});

importAnnualReportFileInput.addEventListener("change", () => {
  importAnnualReportFile(importAnnualReportFileInput.files?.[0]).catch((error) => setError(error));
});

importDataButton.addEventListener("click", () => {
  importDataFileInput.click();
});

importDataFileInput.addEventListener("change", () => {
  importDataFile(importDataFileInput.files?.[0]).catch((error) => setError(error));
});

document.addEventListener("click", (event) => {
  infoPopovers.forEach((popover) => {
    if (popover.open && !popover.contains(event.target)) {
      popover.open = false;
    }
  });
  if (actionMenu?.open && !actionMenu.contains(event.target)) {
    actionMenu.open = false;
  }
});

window.addEventListener("resize", () => {
  infoPopovers.forEach((popover) => {
    if (popover.open) {
      positionInfoPopover(popover);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  infoPopovers.forEach((popover) => {
    popover.open = false;
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await submitForm();
  } catch (error) {
    setError(error);
  }
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  municipalTaxManualOverride = false;
  annualReportImportState = null;
  applyAnnualReportFieldMarkers();
  renderAnnualReportStatus();
  restoreState().then(() => submitForm().catch((error) => setError(error)));
});

async function init() {
  await ensureTranslationsLoaded();
  applyStaticTranslations();
  await restoreState();
  syncRecommendedSubtitle();
  await submitForm();
}

init().catch((error) => setError(error));
