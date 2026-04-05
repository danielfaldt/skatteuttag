from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from pydantic import AliasChoices, BaseModel, Field, field_validator, model_validator

from .rules import (
    CAPITAL_TAX_RATE,
    CORPORATE_TAX_RATE,
    DIVIDEND_RULES,
    PENSION_DEDUCTION_PBB_CAP,
    PENSION_DEDUCTION_RATE,
    QUALIFIED_DIVIDEND_TAX_RATE,
    SALARY_RULES,
    SPECIAL_PAYROLL_TAX_RATE,
    SUPPORTED_YEARS,
    employer_contribution_rate,
)
from .tax import compute_personal_tax


class PlanningInput(BaseModel):
    year: int = Field(default=2026)
    user_display_name: str = Field(default="", max_length=40)
    spouse_display_name: str = Field(default="", max_length=40)
    user_birth_year: int = Field(default=1985, ge=1900, le=2010)
    spouse_birth_year: int = Field(default=1985, ge=1900, le=2010)
    tax_municipality: str = Field(default="")
    tax_parish: str = Field(default="")
    include_church_fee: bool = Field(default=False)
    target_user_net_income: float = Field(default=650_000, ge=0)
    user_other_salary_income: float = Field(
        default=0,
        ge=0,
        validation_alias=AliasChoices("user_other_salary_income", "user_other_service_income"),
    )
    spouse_external_salary: float = Field(default=520_000, ge=0)
    company_result_before_corporate_tax: float = Field(
        default=1_600_000,
        ge=0,
        validation_alias=AliasChoices("company_result_before_corporate_tax", "company_profit_before_owner_salary"),
    )
    opening_retained_earnings: float = Field(default=0, ge=0)
    planned_user_pension: float = Field(default=0, ge=0)
    car_benefit_is_pensionable: bool = Field(default=False)
    periodization_fund_change: float = Field(default=0)
    opening_periodization_fund_balance: float = Field(default=0, ge=0)
    user_car_benefit: float = Field(default=0, ge=0)
    prior_year_company_cash_salaries: float = Field(default=520_000, ge=0)
    prior_year_user_company_salary: float = Field(default=520_000, ge=0)
    saved_dividend_space_user: float = Field(default=0, ge=0)
    saved_dividend_space_spouse: float = Field(default=0, ge=0)
    user_share_cost_basis: float = Field(default=25_000, ge=0)
    spouse_share_cost_basis: float = Field(default=25_000, ge=0)
    user_share_percentage: float = Field(default=50.0, gt=0, lt=100)
    municipal_tax_rate: float | None = Field(default=None, ge=25, le=40)
    burial_fee_rate: float | None = Field(default=None, ge=0, le=1)
    church_fee_rate: float = Field(default=0.0, ge=0, le=2)

    @field_validator("year")
    @classmethod
    def validate_year(cls, value: int) -> int:
        if value not in SUPPORTED_YEARS:
            raise ValueError(f"Unsupported year. Choose one of: {', '.join(str(year) for year in SUPPORTED_YEARS)}.")
        return value

    @model_validator(mode="after")
    def apply_year_specific_tax_defaults(self) -> PlanningInput:
        rule = SALARY_RULES[self.year]
        if self.municipal_tax_rate is None:
            self.municipal_tax_rate = rule.municipal_rate_default
        if self.burial_fee_rate is None:
            self.burial_fee_rate = rule.burial_fee_default
        return self

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


def pension_deduction_limit(year: int, salary_base: float) -> float:
    rule = SALARY_RULES[year]
    return min(max(salary_base, 0.0) * PENSION_DEDUCTION_RATE, rule.pbb * PENSION_DEDUCTION_PBB_CAP)


def compute_company_budget(data: PlanningInput, planned_salary: float) -> dict[str, float]:
    taxable_salary_base = planned_salary + data.user_car_benefit
    current_employer_contribution_rate = employer_contribution_rate(data.year, data.user_birth_year)
    employer_contributions = taxable_salary_base * current_employer_contribution_rate
    pension_special_payroll_tax = data.planned_user_pension * SPECIAL_PAYROLL_TAX_RATE
    current_year_pension_base = planned_salary + (data.user_car_benefit if data.car_benefit_is_pensionable else 0.0)
    prior_year_pension_base = data.prior_year_user_company_salary
    pension_limit = pension_deduction_limit(data.year, max(current_year_pension_base, prior_year_pension_base))
    if data.planned_user_pension > pension_limit + 1:
        return {
            "valid": False,
            "pension_deduction_limit": round(pension_limit, 2),
            "max_periodization_allocation": 0.0,
            "opening_periodization_fund_balance": round(data.opening_periodization_fund_balance, 2),
        }

    profit_before_periodization = (
        data.company_result_before_corporate_tax
        - planned_salary
        - employer_contributions
        - data.planned_user_pension
        - pension_special_payroll_tax
    )
    max_periodization_allocation = max(profit_before_periodization, 0.0) * 0.25
    if data.periodization_fund_change > max_periodization_allocation + 1:
        return {
            "valid": False,
            "pension_deduction_limit": round(pension_limit, 2),
            "max_periodization_allocation": round(max_periodization_allocation, 2),
            "opening_periodization_fund_balance": round(data.opening_periodization_fund_balance, 2),
        }
    if abs(min(data.periodization_fund_change, 0.0)) > data.opening_periodization_fund_balance + 1:
        return {
            "valid": False,
            "pension_deduction_limit": round(pension_limit, 2),
            "max_periodization_allocation": round(max_periodization_allocation, 2),
            "opening_periodization_fund_balance": round(data.opening_periodization_fund_balance, 2),
        }

    taxable_profit = max(profit_before_periodization - data.periodization_fund_change, 0.0)
    corporate_tax = taxable_profit * CORPORATE_TAX_RATE
    post_tax_profit = taxable_profit - corporate_tax
    available_dividend_cash = data.opening_retained_earnings + post_tax_profit

    return {
        "valid": True,
        "planned_salary": round(planned_salary, 2),
        "taxable_salary_base": round(taxable_salary_base, 2),
        "car_benefit": round(data.user_car_benefit, 2),
        "employer_contribution_rate": round(current_employer_contribution_rate, 4),
        "employer_contributions": round(employer_contributions, 2),
        "planned_user_pension": round(data.planned_user_pension, 2),
        "car_benefit_is_pensionable": data.car_benefit_is_pensionable,
        "pension_special_payroll_tax": round(pension_special_payroll_tax, 2),
        "pension_deduction_limit": round(pension_limit, 2),
        "profit_before_periodization": round(profit_before_periodization, 2),
        "periodization_fund_change": round(data.periodization_fund_change, 2),
        "opening_periodization_fund_balance": round(data.opening_periodization_fund_balance, 2),
        "max_periodization_allocation": round(max_periodization_allocation, 2),
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
    burial_fee_rate: float,
    church_fee_rate: float,
    birth_year: int,
) -> dict[str, float]:
    rule = DIVIDEND_RULES[year]
    baseline_tax = compute_personal_tax(
        year=year,
        earned_income=baseline_earned_income,
        service_income=baseline_service_income,
        municipal_rate=municipal_tax_rate,
        burial_fee_rate=burial_fee_rate,
        church_fee_rate=church_fee_rate,
        birth_year=birth_year,
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
        burial_fee_rate=burial_fee_rate,
        church_fee_rate=church_fee_rate,
        birth_year=birth_year,
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
    if not company["valid"]:
        return None
    if company["profit_before_periodization"] < 0:
        return None
    if total_dividend > company["available_dividend_cash"] + 1:
        return None

    spaces = compute_dividend_spaces(data)
    user_baseline_tax = compute_personal_tax(
        year=data.year,
        earned_income=data.user_other_salary_income,
        service_income=0.0,
        municipal_rate=data.municipal_tax_rate,
        burial_fee_rate=data.burial_fee_rate,
        church_fee_rate=data.church_fee_rate,
        birth_year=data.user_birth_year,
    )
    user_salary_tax = compute_personal_tax(
        year=data.year,
        earned_income=planned_salary + data.user_car_benefit + data.user_other_salary_income,
        service_income=0.0,
        municipal_rate=data.municipal_tax_rate,
        burial_fee_rate=data.burial_fee_rate,
        church_fee_rate=data.church_fee_rate,
        birth_year=data.user_birth_year,
    )
    spouse_baseline_tax = compute_personal_tax(
        year=data.year,
        earned_income=data.spouse_external_salary,
        municipal_rate=data.municipal_tax_rate,
        burial_fee_rate=data.burial_fee_rate,
        church_fee_rate=data.church_fee_rate,
        birth_year=data.spouse_birth_year,
    )
    incremental_user_salary_tax = user_salary_tax.total_tax - user_baseline_tax.total_tax
    user_net_cash_salary = planned_salary - incremental_user_salary_tax

    user_dividend = total_dividend * data.user_share_fraction
    spouse_dividend = total_dividend * data.spouse_share_fraction

    user_dividend_result = compute_dividend_outcome(
        owner_dividend=user_dividend,
        owner_space=spaces.user_space,
        year=data.year,
        baseline_earned_income=planned_salary + data.user_car_benefit + data.user_other_salary_income,
        baseline_service_income=0.0,
        municipal_tax_rate=data.municipal_tax_rate,
        burial_fee_rate=data.burial_fee_rate,
        church_fee_rate=data.church_fee_rate,
        birth_year=data.user_birth_year,
    )
    spouse_dividend_result = compute_dividend_outcome(
        owner_dividend=spouse_dividend,
        owner_space=spaces.spouse_space,
        year=data.year,
        baseline_earned_income=data.spouse_external_salary,
        baseline_service_income=0.0,
        municipal_tax_rate=data.municipal_tax_rate,
        burial_fee_rate=data.burial_fee_rate,
        church_fee_rate=data.church_fee_rate,
        birth_year=data.spouse_birth_year,
    )

    user_net_from_company = user_net_cash_salary + user_dividend_result["net_dividend"]
    household_net_from_company = user_net_from_company + spouse_dividend_result["net_dividend"]
    extraction_total = (
        planned_salary
        + company["employer_contributions"]
        + company["planned_user_pension"]
        + company["pension_special_payroll_tax"]
        + total_dividend
        + company["corporate_tax"]
    )
    total_tax_burden = (
        incremental_user_salary_tax
        + user_dividend_result["total_dividend_tax"]
        + spouse_dividend_result["total_dividend_tax"]
        + company["employer_contributions"]
        + company["pension_special_payroll_tax"]
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
        "user_baseline_tax": user_baseline_tax.to_dict(),
        "incremental_user_salary_tax": round(incremental_user_salary_tax, 2),
        "user_net_cash_salary": round(user_net_cash_salary, 2),
        "spouse_baseline_tax": spouse_baseline_tax.to_dict(),
        "dividend_spaces": spaces.to_dict(),
        "user_dividend": user_dividend_result,
        "spouse_dividend": spouse_dividend_result,
    }


def recommendation_sort_key(item: dict[str, Any]) -> tuple[float, float, float, float, float]:
    return (
        0 if item["shortfall_to_target"] == 0 else 1,
        item["shortfall_to_target"],
        item["overshoot_to_target"],
        item["total_tax_burden"],
        item["salary"],
    )


def salary_search_steps(max_salary: float) -> tuple[float, float, float]:
    coarse = 5_000.0 if max_salary > 300_000 else 2_500.0
    medium = 500.0
    fine = 100.0
    return coarse, medium, fine


def choose_dividend_for_salary(data: PlanningInput, salary: float) -> dict[str, Any] | None:
    company = compute_company_budget(data, salary)
    if not company["valid"] or company["profit_before_periodization"] < 0:
        return None

    max_dividend = company["available_dividend_cash"]
    spaces = compute_dividend_spaces(data)
    low = 0.0
    high = max_dividend

    for _ in range(32):
        midpoint = (low + high) / 2
        candidate = evaluate_plan(data, salary, midpoint)
        if candidate is None:
            high = midpoint
            continue
        if candidate["user_net_from_company"] < data.target_user_net_income:
            low = midpoint
        else:
            high = midpoint

    candidate_dividends = {
        0.0,
        round(max_dividend / 100.0) * 100.0,
        round(low / 100.0) * 100.0,
        round(high / 100.0) * 100.0,
        round((low + high) / 200.0) * 100.0,
        round((spaces.user_space + spaces.spouse_space) / 100.0) * 100.0,
    }
    if data.user_share_fraction > 0:
        candidate_dividends.add(round((spaces.user_space / data.user_share_fraction) / 100.0) * 100.0)
    if data.spouse_share_fraction > 0:
        candidate_dividends.add(round((spaces.spouse_space / data.spouse_share_fraction) / 100.0) * 100.0)

    candidates = [
        evaluate_plan(data, salary, min(max(dividend, 0.0), max_dividend))
        for dividend in candidate_dividends
    ]
    candidates = [candidate for candidate in candidates if candidate is not None]
    if not candidates:
        return None

    return min(candidates, key=recommendation_sort_key)


def refine_salary_candidates(
    data: PlanningInput,
    salaries: set[float],
    *,
    window: float,
    step: float,
    max_salary: float,
) -> list[dict[str, Any]]:
    evaluated: list[dict[str, Any]] = []
    seen_salaries: set[float] = set()

    for center in sorted(salaries):
        start = max(center - window, 0.0)
        end = min(center + window, max_salary)
        current = round(start / step) * step
        while current <= end + 1e-9:
            normalized = round(current, 2)
            if normalized not in seen_salaries:
                seen_salaries.add(normalized)
                scenario = choose_dividend_for_salary(data, normalized)
                if scenario is not None:
                    evaluated.append(scenario)
            current += step

    return evaluated


def build_alternative_scenarios(data: PlanningInput, evaluated: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not evaluated:
        return []

    state_threshold_gross = max(
        SALARY_RULES[data.year].state_tax_threshold_taxable + 17_400 - data.user_other_salary_income - data.user_car_benefit,
        0.0,
    )
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


def build_compensation_mix_analysis(
    data: PlanningInput,
    recommended: dict[str, Any],
    evaluated: list[dict[str, Any]],
) -> dict[str, Any]:
    total_compensation = recommended["salary"] + recommended["total_dividend"]
    salary_share_percentage = (recommended["salary"] / total_compensation * 100.0) if total_compensation > 0 else 0.0
    dividend_share_percentage = (recommended["total_dividend"] / total_compensation * 100.0) if total_compensation > 0 else 0.0
    total_dividend_room = (
        recommended["dividend_spaces"]["user_space"] + recommended["dividend_spaces"]["spouse_space"]
    )
    state_threshold_gross = max(
        SALARY_RULES[data.year].state_tax_threshold_taxable + 17_400 - data.user_other_salary_income - data.user_car_benefit,
        0.0,
    )

    if recommended["salary"] <= 1 and recommended["total_dividend"] > 1:
        summary = {"key": "mix.summary_dividend_only", "params": {}}
    elif recommended["total_dividend"] <= 1:
        summary = {"key": "mix.summary_salary_only", "params": {}}
    else:
        summary = {
            "key": "mix.summary_mixed",
            "params": {
                "salarySharePercentage": round(salary_share_percentage, 1),
                "dividendSharePercentage": round(dividend_share_percentage, 1),
            },
        }

    reasons: list[dict[str, Any]] = [{"key": "mix.reason_target_priority", "params": {}}]
    if recommended["total_dividend"] > 1 and total_dividend_room > 1:
        reasons.append({"key": "mix.reason_dividend_room_used", "params": {}})
    elif recommended["total_dividend"] <= 1:
        reasons.append({"key": "mix.reason_salary_dominant", "params": {}})

    if abs(recommended["salary"] - state_threshold_gross) <= 20_000:
        reasons.append({"key": "mix.reason_near_state_breakpoint", "params": {}})
    elif recommended["salary"] > state_threshold_gross + 20_000:
        reasons.append({"key": "mix.reason_above_state_breakpoint", "params": {}})

    lower_salary_candidates = [item for item in evaluated if item["salary"] < recommended["salary"]]
    higher_salary_candidates = [item for item in evaluated if item["salary"] > recommended["salary"]]
    household_best = max(
        evaluated,
        key=lambda item: (
            item["household_net_from_company"],
            -item["total_tax_burden"],
        ),
    )

    comparisons: list[dict[str, Any]] = []
    if lower_salary_candidates:
        lower_salary = min(
            lower_salary_candidates,
            key=lambda item: (
                abs(item["salary"] - recommended["salary"]),
                item["distance_to_target"],
                item["total_tax_burden"],
            ),
        )
        comparisons.append(
            {
                "key": "mix.comparison_more_dividend",
                "scenario": lower_salary,
                "tax_delta": round(lower_salary["total_tax_burden"] - recommended["total_tax_burden"], 2),
                "net_delta": round(lower_salary["user_net_from_company"] - recommended["user_net_from_company"], 2),
            }
        )

    if higher_salary_candidates:
        higher_salary = min(
            higher_salary_candidates,
            key=lambda item: (
                abs(item["salary"] - recommended["salary"]),
                item["distance_to_target"],
                item["total_tax_burden"],
            ),
        )
        comparisons.append(
            {
                "key": "mix.comparison_more_salary",
                "scenario": higher_salary,
                "tax_delta": round(higher_salary["total_tax_burden"] - recommended["total_tax_burden"], 2),
                "net_delta": round(higher_salary["user_net_from_company"] - recommended["user_net_from_company"], 2),
            }
        )

    return {
        "salary_share_percentage": round(salary_share_percentage, 1),
        "dividend_share_percentage": round(dividend_share_percentage, 1),
        "summary": summary,
        "reasons": reasons,
        "comparisons": comparisons,
        "household_max_net": round(household_best["household_net_from_company"], 2),
        "household_max_delta": round(household_best["household_net_from_company"] - recommended["household_net_from_company"], 2),
    }


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
    current_employer_contribution_rate = employer_contribution_rate(data.year, data.user_birth_year)
    fixed_costs = (
        data.planned_user_pension
        + (data.planned_user_pension * SPECIAL_PAYROLL_TAX_RATE)
        + (data.user_car_benefit * current_employer_contribution_rate)
    )
    max_salary = max((data.company_result_before_corporate_tax - fixed_costs) / (1 + current_employer_contribution_rate), 0.0)
    coarse_step, medium_step, fine_step = salary_search_steps(max_salary)
    evaluated: list[dict[str, Any]] = refine_salary_candidates(
        data,
        {0.0, max_salary},
        window=max_salary,
        step=coarse_step,
        max_salary=max_salary,
    )

    if not evaluated:
        raise ValueError("No feasible scenario could be created from the provided company profit.")

    medium_centers = {item["salary"] for item in sorted(evaluated, key=recommendation_sort_key)[:8]}
    evaluated.extend(
        refine_salary_candidates(
            data,
            medium_centers,
            window=coarse_step,
            step=medium_step,
            max_salary=max_salary,
        )
    )

    fine_centers = {item["salary"] for item in sorted(evaluated, key=recommendation_sort_key)[:8]}
    evaluated.extend(
        refine_salary_candidates(
            data,
            fine_centers,
            window=medium_step,
            step=fine_step,
            max_salary=max_salary,
        )
    )

    recommended = min(evaluated, key=recommendation_sort_key)
    alternatives = build_alternative_scenarios(data, evaluated)
    compensation_mix = build_compensation_mix_analysis(data, recommended, evaluated)
    return {"recommended": recommended, "alternatives": alternatives, "compensation_mix": compensation_mix}


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
    compensation_mix = planned["compensation_mix"]
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
        "compensation_mix": compensation_mix,
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
            {"key": "assumption.birth_year_affects_tax", "params": {}},
            {"key": "assumption.user_other_salary_income", "params": {}},
            {"key": "assumption.car_benefit_cash_vs_tax", "params": {}},
            {"key": "assumption.pension_limit", "params": {}},
            {"key": "assumption.periodization_fund", "params": {}},
        ],
        "explanations": [
            {"key": "explanation.salary_uses_planning_year", "params": {"planningYear": data.year}},
            {"key": "explanation.dividend_uses_salary_basis_year", "params": {"planningYear": data.year, "salaryBasisYear": salary_basis_year}},
            {"key": "explanation.recommendation_scoring", "params": {}},
        ],
    }
