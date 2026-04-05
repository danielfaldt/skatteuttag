from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from pydantic import AliasChoices, BaseModel, Field, field_validator

from .rules import (
    CAPITAL_TAX_RATE,
    CORPORATE_TAX_RATE,
    DIVIDEND_RULES,
    EMPLOYER_CONTRIBUTION_RATE,
    QUALIFIED_DIVIDEND_TAX_RATE,
    SALARY_RULES,
    SUPPORTED_YEARS,
)
from .tax import compute_personal_tax


class PlanningInput(BaseModel):
    year: int = Field(default=2026)
    target_user_net_income: float = Field(default=650_000, ge=0)
    spouse_external_salary: float = Field(default=520_000, ge=0)
    company_result_before_corporate_tax: float = Field(
        default=1_600_000,
        ge=0,
        validation_alias=AliasChoices("company_result_before_corporate_tax", "company_profit_before_owner_salary"),
    )
    opening_retained_earnings: float = Field(default=0, ge=0)
    prior_year_company_cash_salaries: float = Field(default=520_000, ge=0)
    prior_year_user_company_salary: float = Field(default=520_000, ge=0)
    saved_dividend_space_user: float = Field(default=0, ge=0)
    saved_dividend_space_spouse: float = Field(default=0, ge=0)
    user_share_cost_basis: float = Field(default=25_000, ge=0)
    spouse_share_cost_basis: float = Field(default=25_000, ge=0)
    user_share_percentage: float = Field(default=50.0, gt=0, lt=100)
    municipal_tax_rate: float = Field(default=32.38, ge=25, le=40)

    @field_validator("year")
    @classmethod
    def validate_year(cls, value: int) -> int:
        if value not in SUPPORTED_YEARS:
            raise ValueError(f"Unsupported year. Choose one of: {', '.join(str(year) for year in SUPPORTED_YEARS)}.")
        return value

    @property
    def user_share_fraction(self) -> float:
        return self.user_share_percentage / 100.0

    @property
    def spouse_share_percentage(self) -> float:
        return 100.0 - self.user_share_percentage

    @property
    def spouse_share_fraction(self) -> float:
        return self.spouse_share_percentage / 100.0


@dataclass(frozen=True)
class DividendSpaceResult:
    user_space: float
    spouse_space: float
    user_rule_label: str
    spouse_rule_label: str
    notes: list[dict[str, Any]]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def compute_dividend_spaces(data: PlanningInput) -> DividendSpaceResult:
    rule = DIVIDEND_RULES[data.year]
    user_share = data.user_share_fraction
    spouse_share = data.spouse_share_fraction
    notes: list[dict[str, Any]] = [
        {
            "key": "note.salary_basis_year",
            "params": {"planningYear": data.year, "salaryBasisYear": rule.salary_basis_year},
        },
        {
            "key": "note.ownership_structure",
            "params": {
                "userSharePercentage": round(data.user_share_percentage, 1),
                "spouseSharePercentage": round(data.spouse_share_percentage, 1),
            },
        },
    ]

    if data.year == 2025:
        uplift = rule.saved_space_uplift or 1.0
        simplified_user = ((rule.simplification_total or 0.0) * user_share) + data.saved_dividend_space_user * uplift
        simplified_spouse = ((rule.simplification_total or 0.0) * spouse_share) + data.saved_dividend_space_spouse * uplift

        salary_requirement = min(
            rule.old_salary_requirement_cap or 0.0,
            (rule.old_salary_requirement_base_low or 0.0) + (0.05 * data.prior_year_company_cash_salaries),
        )
        main_user_wage_space = 0.0
        main_spouse_wage_space = 0.0
        if data.prior_year_user_company_salary >= salary_requirement:
            total_main_wage_space = 0.5 * data.prior_year_company_cash_salaries
            main_user_wage_space = total_main_wage_space * user_share
            main_spouse_wage_space = total_main_wage_space * spouse_share
            notes.append(
                {
                    "key": "note.old_rule_salary_requirement_met",
                    "params": {"salaryRequirement": round(salary_requirement, 0)},
                }
            )
        else:
            notes.append(
                {
                    "key": "note.old_rule_salary_requirement_not_met",
                    "params": {"salaryRequirement": round(salary_requirement, 0)},
                }
            )

        main_user = (
            data.saved_dividend_space_user * uplift
            + (data.user_share_cost_basis * (rule.old_interest_rate or 0.0))
            + main_user_wage_space
        )
        main_spouse = (
            data.saved_dividend_space_spouse * uplift
            + (data.spouse_share_cost_basis * (rule.old_interest_rate or 0.0))
            + main_spouse_wage_space
        )

        if main_user >= simplified_user:
            user_space = main_user
            user_rule_label = "Main rule"
        else:
            user_space = simplified_user
            user_rule_label = "Simplification rule"

        if main_spouse >= simplified_spouse:
            spouse_space = main_spouse
            spouse_rule_label = "Main rule"
        else:
            spouse_space = simplified_spouse
            spouse_rule_label = "Simplification rule"

        notes.append({"key": "note.old_rule_saved_space_uplift", "params": {}})
        return DividendSpaceResult(
            user_space=round(user_space, 2),
            spouse_space=round(spouse_space, 2),
            user_rule_label=user_rule_label,
            spouse_rule_label=spouse_rule_label,
            notes=notes,
        )

    user_base_amount = (rule.new_ground_amount_total or 0.0) * user_share
    spouse_base_amount = (rule.new_ground_amount_total or 0.0) * spouse_share
    total_joint_wage_space = max((data.prior_year_company_cash_salaries - (rule.new_wage_deduction_total or 0.0)) * 0.5, 0.0)
    user_wage_space = min(total_joint_wage_space * user_share, data.prior_year_user_company_salary * 50)
    spouse_wage_space = min(total_joint_wage_space * spouse_share, data.prior_year_user_company_salary * 50)

    user_interest = max(data.user_share_cost_basis - 100_000, 0.0) * (rule.new_interest_rate or 0.0)
    spouse_interest = max(data.spouse_share_cost_basis - 100_000, 0.0) * (rule.new_interest_rate or 0.0)

    notes.append({"key": "note.new_rule_combined_method", "params": {}})
    if total_joint_wage_space > 0:
        notes.append(
            {
                "key": "note.new_rule_wage_space_positive",
                "params": {"wageDeduction": round((rule.new_wage_deduction_total or 0.0), 0)},
            }
        )
    else:
        notes.append(
            {
                "key": "note.new_rule_wage_space_zero",
                "params": {"wageDeduction": round((rule.new_wage_deduction_total or 0.0), 0)},
            }
        )

    return DividendSpaceResult(
        user_space=round(user_base_amount + user_wage_space + user_interest + data.saved_dividend_space_user, 2),
        spouse_space=round(spouse_base_amount + spouse_wage_space + spouse_interest + data.saved_dividend_space_spouse, 2),
        user_rule_label="2026 combined rule",
        spouse_rule_label="2026 combined rule",
        notes=notes,
    )


def compute_company_budget(data: PlanningInput, planned_salary: float) -> dict[str, float]:
    employer_contributions = planned_salary * EMPLOYER_CONTRIBUTION_RATE
    profit_after_salary_cost = data.company_result_before_corporate_tax - planned_salary - employer_contributions
    taxable_profit = max(profit_after_salary_cost, 0.0)
    corporate_tax = taxable_profit * CORPORATE_TAX_RATE
    post_tax_profit = taxable_profit - corporate_tax
    available_dividend_cash = data.opening_retained_earnings + post_tax_profit

    return {
        "planned_salary": round(planned_salary, 2),
        "employer_contributions": round(employer_contributions, 2),
        "profit_after_salary_cost": round(profit_after_salary_cost, 2),
        "taxable_profit": round(taxable_profit, 2),
        "corporate_tax": round(corporate_tax, 2),
        "post_tax_profit": round(post_tax_profit, 2),
        "available_dividend_cash": round(max(available_dividend_cash, 0.0), 2),
    }


def compute_dividend_outcome(
    *,
    owner_dividend: float,
    owner_space: float,
    year: int,
    baseline_earned_income: float,
    baseline_service_income: float,
    municipal_tax_rate: float,
) -> dict[str, float]:
    rule = DIVIDEND_RULES[year]
    baseline_tax = compute_personal_tax(
        year=year,
        earned_income=baseline_earned_income,
        service_income=baseline_service_income,
        municipal_rate=municipal_tax_rate,
    )
    qualified_dividend = min(owner_dividend, owner_space)
    qualified_tax = qualified_dividend * QUALIFIED_DIVIDEND_TAX_RATE
    excess_dividend = max(owner_dividend - owner_space, 0.0)
    service_taxed_dividend = min(excess_dividend, rule.service_tax_cap)
    capital_taxed_excess = max(excess_dividend - service_taxed_dividend, 0.0)

    after_tax_with_service = compute_personal_tax(
        year=year,
        earned_income=baseline_earned_income,
        service_income=baseline_service_income + service_taxed_dividend,
        municipal_rate=municipal_tax_rate,
    )
    incremental_service_tax = after_tax_with_service.total_tax - baseline_tax.total_tax
    capital_excess_tax = capital_taxed_excess * CAPITAL_TAX_RATE
    total_dividend_tax = qualified_tax + incremental_service_tax + capital_excess_tax

    return {
        "gross_dividend": round(owner_dividend, 2),
        "qualified_dividend": round(qualified_dividend, 2),
        "service_taxed_dividend": round(service_taxed_dividend, 2),
        "capital_taxed_excess": round(capital_taxed_excess, 2),
        "qualified_tax": round(qualified_tax, 2),
        "service_tax": round(incremental_service_tax, 2),
        "capital_excess_tax": round(capital_excess_tax, 2),
        "total_dividend_tax": round(total_dividend_tax, 2),
        "net_dividend": round(owner_dividend - total_dividend_tax, 2),
    }


def evaluate_plan(data: PlanningInput, planned_salary: float, total_dividend: float) -> dict[str, Any] | None:
    company = compute_company_budget(data, planned_salary)
    if company["profit_after_salary_cost"] < 0:
        return None
    if total_dividend > company["available_dividend_cash"] + 1:
        return None

    spaces = compute_dividend_spaces(data)
    user_salary_tax = compute_personal_tax(
        year=data.year,
        earned_income=planned_salary,
        municipal_rate=data.municipal_tax_rate,
    )
    spouse_baseline_tax = compute_personal_tax(
        year=data.year,
        earned_income=data.spouse_external_salary,
        municipal_rate=data.municipal_tax_rate,
    )

    user_dividend = total_dividend * data.user_share_fraction
    spouse_dividend = total_dividend * data.spouse_share_fraction

    user_dividend_result = compute_dividend_outcome(
        owner_dividend=user_dividend,
        owner_space=spaces.user_space,
        year=data.year,
        baseline_earned_income=planned_salary,
        baseline_service_income=0.0,
        municipal_tax_rate=data.municipal_tax_rate,
    )
    spouse_dividend_result = compute_dividend_outcome(
        owner_dividend=spouse_dividend,
        owner_space=spaces.spouse_space,
        year=data.year,
        baseline_earned_income=data.spouse_external_salary,
        baseline_service_income=0.0,
        municipal_tax_rate=data.municipal_tax_rate,
    )

    user_net_from_company = user_salary_tax.net_income + user_dividend_result["net_dividend"]
    household_net_from_company = user_net_from_company + spouse_dividend_result["net_dividend"]
    extraction_total = planned_salary + company["employer_contributions"] + total_dividend + company["corporate_tax"]
    total_tax_burden = (
        user_salary_tax.total_tax
        + user_dividend_result["total_dividend_tax"]
        + spouse_dividend_result["total_dividend_tax"]
        + company["employer_contributions"]
        + company["corporate_tax"]
    )

    return {
        "salary": round(planned_salary, 2),
        "total_dividend": round(total_dividend, 2),
        "user_share_percentage": round(data.user_share_percentage, 1),
        "spouse_share_percentage": round(data.spouse_share_percentage, 1),
        "user_net_from_company": round(user_net_from_company, 2),
        "household_net_from_company": round(household_net_from_company, 2),
        "distance_to_target": round(abs(user_net_from_company - data.target_user_net_income), 2),
        "shortfall_to_target": round(max(data.target_user_net_income - user_net_from_company, 0.0), 2),
        "overshoot_to_target": round(max(user_net_from_company - data.target_user_net_income, 0.0), 2),
        "extraction_total": round(extraction_total, 2),
        "total_tax_burden": round(total_tax_burden, 2),
        "company": company,
        "salary_tax": user_salary_tax.to_dict(),
        "spouse_baseline_tax": spouse_baseline_tax.to_dict(),
        "dividend_spaces": spaces.to_dict(),
        "user_dividend": user_dividend_result,
        "spouse_dividend": spouse_dividend_result,
    }


def choose_dividend_for_salary(data: PlanningInput, salary: float) -> dict[str, Any] | None:
    company = compute_company_budget(data, salary)
    if company["profit_after_salary_cost"] < 0:
        return None

    max_dividend = company["available_dividend_cash"]
    low = 0.0
    high = max_dividend
    best = evaluate_plan(data, salary, 0.0)

    for _ in range(32):
        midpoint = (low + high) / 2
        candidate = evaluate_plan(data, salary, midpoint)
        if candidate is None:
            high = midpoint
            continue
        best = candidate
        if candidate["user_net_from_company"] < data.target_user_net_income:
            low = midpoint
        else:
            high = midpoint

    candidates = [
        evaluate_plan(data, salary, 0.0),
        evaluate_plan(data, salary, round(low / 100.0) * 100.0),
        evaluate_plan(data, salary, round(high / 100.0) * 100.0),
        evaluate_plan(data, salary, round(max_dividend / 100.0) * 100.0),
    ]
    candidates = [candidate for candidate in candidates if candidate is not None]
    if not candidates:
        return None

    return min(
        candidates,
        key=lambda item: (
            0 if item["shortfall_to_target"] == 0 else 1,
            item["shortfall_to_target"],
            item["overshoot_to_target"],
            item["total_tax_burden"],
        ),
    )


def build_alternative_scenarios(data: PlanningInput, evaluated: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not evaluated:
        return []

    state_threshold_gross = SALARY_RULES[data.year].state_tax_threshold_taxable + 17_400
    recommendations = []

    recommendations.append(
        {
            "label": "Dividend-led",
            "description": "Lower salary focus with heavier reliance on dividends.",
            "scenario": min(evaluated, key=lambda item: (item["salary"], item["distance_to_target"], item["total_tax_burden"])),
        }
    )
    recommendations.append(
        {
            "label": "Near state tax breakpoint",
            "description": "Salary pushed close to the state income tax breakpoint before dividends.",
            "scenario": min(
                evaluated,
                key=lambda item: (
                    abs(item["salary"] - state_threshold_gross),
                    item["distance_to_target"],
                    item["total_tax_burden"],
                ),
            ),
        }
    )
    recommendations.append(
        {
            "label": "Maximum user net",
            "description": "Highest user after-tax income the model can find within the current company budget.",
            "scenario": max(evaluated, key=lambda item: (item["user_net_from_company"], -item["total_tax_burden"])),
        }
    )

    unique_labels = []
    seen = set()
    for item in recommendations:
        key = (item["label"], item["scenario"]["salary"], item["scenario"]["total_dividend"])
        if key not in seen:
            seen.add(key)
            unique_labels.append(item)

    return unique_labels


def build_split_variant(data: PlanningInput, user_share_percentage: float) -> PlanningInput:
    user_fraction = user_share_percentage / 100.0
    spouse_fraction = 1.0 - user_fraction
    total_saved_space = data.saved_dividend_space_user + data.saved_dividend_space_spouse
    total_cost_basis = data.user_share_cost_basis + data.spouse_share_cost_basis

    return data.model_copy(
        update={
            "user_share_percentage": round(user_share_percentage, 1),
            "saved_dividend_space_user": round(total_saved_space * user_fraction, 2),
            "saved_dividend_space_spouse": round(total_saved_space * spouse_fraction, 2),
            "user_share_cost_basis": round(total_cost_basis * user_fraction, 2),
            "spouse_share_cost_basis": round(total_cost_basis * spouse_fraction, 2),
        }
    )


def plan_core(data: PlanningInput) -> dict[str, Any]:
    max_salary = data.company_result_before_corporate_tax / (1 + EMPLOYER_CONTRIBUTION_RATE)
    step = 5_000 if max_salary > 300_000 else 2_500
    evaluated: list[dict[str, Any]] = []

    salary = 0.0
    while salary <= max_salary + 1:
        scenario = choose_dividend_for_salary(data, round(salary, 2))
        if scenario is not None:
            evaluated.append(scenario)
        salary += step

    if not evaluated:
        raise ValueError("No feasible scenario could be created from the provided company profit.")

    recommended = min(
        evaluated,
        key=lambda item: (
            0 if item["shortfall_to_target"] == 0 else 1,
            item["shortfall_to_target"],
            item["overshoot_to_target"],
            item["total_tax_burden"],
            item["salary"],
        ),
    )
    alternatives = build_alternative_scenarios(data, evaluated)
    return {"recommended": recommended, "alternatives": alternatives}


def suggest_ownership_split(data: PlanningInput) -> dict[str, Any] | None:
    current_result = plan_core(data)["recommended"]
    candidates: list[tuple[float, dict[str, Any]]] = []

    coarse_percentages = set(range(5, 100, 5))
    coarse_percentages.add(int(round(data.user_share_percentage)))

    for percentage in sorted(coarse_percentages):
        variant = build_split_variant(data, float(percentage))
        candidates.append((float(percentage), plan_core(variant)["recommended"]))

    coarse_best_percentage, _ = min(
        candidates,
        key=lambda item: (
            item[1]["total_tax_burden"],
            item[1]["distance_to_target"],
        ),
    )

    fine_start = max(5, int(round(coarse_best_percentage)) - 4)
    fine_end = min(95, int(round(coarse_best_percentage)) + 4)
    evaluated_percentages = {int(percentage) for percentage, _ in candidates}

    for percentage in range(fine_start, fine_end + 1):
        if percentage in evaluated_percentages:
            continue
        variant = build_split_variant(data, float(percentage))
        candidates.append((float(percentage), plan_core(variant)["recommended"]))

    best_percentage, best_result = min(
        candidates,
        key=lambda item: (
            item[1]["total_tax_burden"],
            item[1]["distance_to_target"],
        ),
    )

    tax_saving = round(current_result["total_tax_burden"] - best_result["total_tax_burden"], 2)
    if (
        best_percentage == round(data.user_share_percentage, 1)
        or tax_saving <= 0
        or best_result["distance_to_target"] > current_result["distance_to_target"]
    ):
        return None

    return {
        "current_user_share_percentage": round(data.user_share_percentage, 1),
        "current_spouse_share_percentage": round(data.spouse_share_percentage, 1),
        "suggested_user_share_percentage": round(best_percentage, 1),
        "suggested_spouse_share_percentage": round(100 - best_percentage, 1),
        "estimated_tax_saving": tax_saving,
        "current_total_tax_burden": current_result["total_tax_burden"],
        "suggested_total_tax_burden": best_result["total_tax_burden"],
        "note": {"key": "note.ownership_suggestion_scope", "params": {}},
    }


def build_ownership_analysis(payload: dict[str, Any]) -> dict[str, Any]:
    data = PlanningInput.model_validate(payload)
    return {"ownership_suggestion": suggest_ownership_split(data)}


def plan_compensation(payload: dict[str, Any], *, include_ownership_analysis: bool = True) -> dict[str, Any]:
    data = PlanningInput.model_validate(payload)
    planned = plan_core(data)
    recommended = planned["recommended"]
    alternatives = planned["alternatives"]
    salary_basis_year = DIVIDEND_RULES[data.year].salary_basis_year
    ownership_suggestion = suggest_ownership_split(data) if include_ownership_analysis else None

    return {
        "input": data.model_dump(),
        "meta": {
            "planning_year": data.year,
            "salary_basis_year": salary_basis_year,
            "supported_years": SUPPORTED_YEARS,
        },
        "recommended": recommended,
        "alternatives": alternatives,
        "ownership_suggestion": ownership_suggestion,
        "assumptions": [
            {
                "key": "assumption.swedish_limited_company",
                "params": {
                    "userSharePercentage": round(data.user_share_percentage, 1),
                    "spouseSharePercentage": round(data.spouse_share_percentage, 1),
                },
            },
            {"key": "assumption.only_user_company_salary", "params": {}},
            {"key": "assumption.dividend_limited_to_profit_and_retained", "params": {}},
            {"key": "assumption.municipal_rate_editable", "params": {"year": data.year}},
            {"key": "assumption.official_rule_data", "params": {}},
            {"key": "assumption.spouse_salary_affects_service_tax", "params": {}},
        ],
        "explanations": [
            {"key": "explanation.salary_uses_planning_year", "params": {"planningYear": data.year}},
            {"key": "explanation.dividend_uses_salary_basis_year", "params": {"planningYear": data.year, "salaryBasisYear": salary_basis_year}},
            {"key": "explanation.recommendation_scoring", "params": {}},
        ],
    }
