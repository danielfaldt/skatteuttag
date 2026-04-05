from __future__ import annotations

from dataclasses import dataclass


CORPORATE_TAX_RATE = 0.206
FULL_EMPLOYER_CONTRIBUTION_RATE = 0.3142
REDUCED_EMPLOYER_CONTRIBUTION_RATE = 0.1021
SPECIAL_PAYROLL_TAX_RATE = 0.2426
QUALIFIED_DIVIDEND_TAX_RATE = 0.20
CAPITAL_TAX_RATE = 0.30
STATE_INCOME_TAX_RATE = 0.20
SENIOR_TAX_AGE = 66
REDUCED_EMPLOYER_CONTRIBUTION_AGE = 67
PENSION_DEDUCTION_RATE = 0.35
PENSION_DEDUCTION_PBB_CAP = 10.0


@dataclass(frozen=True)
class SalaryTaxRule:
    year: int
    pbb: float
    ibb: float
    municipal_rate_default: float
    state_tax_threshold_taxable: float
    public_service_multiplier: float
    public_service_cap_multiplier: float
    pgi_floor: float
    under66_credit_mid_slope: float
    under66_credit_high_slope: float
    under66_credit_high_constant_pbb: float


@dataclass(frozen=True)
class DividendRule:
    year: int
    salary_basis_year: int
    service_tax_cap: float
    saved_space_uplift: float | None = None
    simplification_total: float | None = None
    old_interest_rate: float | None = None
    old_salary_requirement_base_low: float | None = None
    old_salary_requirement_cap: float | None = None
    new_ground_amount_total: float | None = None
    new_interest_rate: float | None = None
    new_wage_deduction_total: float | None = None


SALARY_RULES: dict[int, SalaryTaxRule] = {
    2025: SalaryTaxRule(
        year=2025,
        pbb=58_800,
        ibb=80_600,
        municipal_rate_default=32.41,
        state_tax_threshold_taxable=625_800,
        public_service_multiplier=0.01,
        public_service_cap_multiplier=1.55,
        pgi_floor=24_873,
        under66_credit_mid_slope=0.3874,
        under66_credit_high_slope=0.1990,
        under66_credit_high_constant_pbb=2.776,
    ),
    2026: SalaryTaxRule(
        year=2026,
        pbb=59_200,
        ibb=83_400,
        municipal_rate_default=32.38,
        state_tax_threshold_taxable=643_000,
        public_service_multiplier=0.01,
        public_service_cap_multiplier=1.42,
        pgi_floor=25_042,
        under66_credit_mid_slope=0.3874,
        under66_credit_high_slope=0.2510,
        under66_credit_high_constant_pbb=3.027,
    ),
}


DIVIDEND_RULES: dict[int, DividendRule] = {
    2025: DividendRule(
        year=2025,
        salary_basis_year=2024,
        service_tax_cap=7_254_000,
        saved_space_uplift=1.0496,
        simplification_total=209_550,
        old_interest_rate=0.1096,
        old_salary_requirement_base_low=457_200,
        old_salary_requirement_cap=731_520,
    ),
    2026: DividendRule(
        year=2026,
        salary_basis_year=2025,
        service_tax_cap=7_506_000,
        new_ground_amount_total=322_400,
        new_interest_rate=0.1155,
        new_wage_deduction_total=644_800,
    ),
}


SUPPORTED_YEARS = sorted(SALARY_RULES.keys())


def age_at_year_start(year: int, birth_year: int) -> int:
    return year - birth_year - 1


def has_senior_tax_treatment(year: int, birth_year: int) -> bool:
    return age_at_year_start(year, birth_year) >= SENIOR_TAX_AGE


def employer_contribution_rate(year: int, birth_year: int) -> float:
    if age_at_year_start(year, birth_year) >= REDUCED_EMPLOYER_CONTRIBUTION_AGE:
        return REDUCED_EMPLOYER_CONTRIBUTION_RATE
    return FULL_EMPLOYER_CONTRIBUTION_RATE
