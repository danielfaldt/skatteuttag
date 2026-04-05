from __future__ import annotations

from dataclasses import asdict, dataclass
import math

from .rules import SALARY_RULES, STATE_INCOME_TAX_RATE


def round_up_to_100(amount: float) -> float:
    return math.ceil(amount / 100.0) * 100.0


def round_down_to_100(amount: float) -> float:
    return math.floor(amount / 100.0) * 100.0


def round_nearest_100(amount: float) -> float:
    return round(amount / 100.0) * 100.0


@dataclass(frozen=True)
class PersonalTaxResult:
    total_income: float
    taxable_income: float
    base_deduction: float
    municipal_tax: float
    state_tax: float
    pension_fee: float
    pension_credit: float
    earned_income_credit: float
    income_credit: float
    public_service_fee: float
    total_tax: float
    net_income: float

    def to_dict(self) -> dict[str, float]:
        return asdict(self)


def ordinary_base_deduction(year: int, ffi: float) -> float:
    rule = SALARY_RULES[year]
    pbb = rule.pbb

    if ffi <= 0.99 * pbb:
        raw = 0.423 * pbb
    elif ffi <= 2.72 * pbb:
        raw = 0.423 * pbb + 0.20 * (ffi - 0.99 * pbb)
    elif ffi <= 3.11 * pbb:
        raw = 0.77 * pbb
    elif ffi <= 7.88 * pbb:
        raw = 0.77 * pbb - 0.10 * (ffi - 3.11 * pbb)
    else:
        raw = 0.293 * pbb

    return min(round_up_to_100(raw), ffi)


def earned_income_credit(year: int, earned_income: float, base_deduction: float, municipal_rate: float) -> float:
    rule = SALARY_RULES[year]
    pbb = rule.pbb
    ai = round_down_to_100(earned_income)
    ki = municipal_rate / 100.0

    if ai <= 0:
        return 0.0
    if ai <= 0.91 * pbb:
        credit = max((ai - base_deduction) * ki, 0.0)
    elif ai <= 3.24 * pbb:
        credit = ((0.91 * pbb) + rule.under66_credit_mid_slope * (ai - 0.91 * pbb) - base_deduction) * ki
    elif ai <= 8.08 * pbb:
        credit = ((1.813 * pbb) + rule.under66_credit_high_slope * (ai - 3.24 * pbb) - base_deduction) * ki
    else:
        credit = ((rule.under66_credit_high_constant_pbb * pbb) - base_deduction) * ki

    return max(math.floor(credit), 0.0)


def income_credit(taxable_income: float) -> float:
    if taxable_income < 40_000:
        return 0.0
    if taxable_income <= 240_000:
        return math.floor((taxable_income - 40_000) * 0.0075)
    return 1_500.0


def compute_personal_tax(
    *,
    year: int,
    earned_income: float,
    service_income: float = 0.0,
    municipal_rate: float | None = None,
) -> PersonalTaxResult:
    rule = SALARY_RULES[year]
    municipal_rate = municipal_rate if municipal_rate is not None else rule.municipal_rate_default
    total_income = max(earned_income, 0.0) + max(service_income, 0.0)
    base_deduction = ordinary_base_deduction(year, total_income)
    taxable_income = max(total_income - base_deduction, 0.0)
    municipal_tax = taxable_income * (municipal_rate / 100.0)
    state_tax = max(taxable_income - rule.state_tax_threshold_taxable, 0.0) * STATE_INCOME_TAX_RATE

    pension_base = min(max(earned_income, 0.0), 8.07 * rule.ibb)
    if earned_income < rule.pgi_floor:
        pension_fee = 0.0
    else:
        pension_fee = round_nearest_100(pension_base * 0.07)

    pension_credit = min(pension_fee, municipal_tax + state_tax)
    earned_credit_raw = earned_income_credit(year, earned_income, base_deduction, municipal_rate)
    available_municipal_after_pension = max(municipal_tax - pension_credit, 0.0)
    earned_credit = min(earned_credit_raw, available_municipal_after_pension)
    income_credit_amount = min(
        income_credit(taxable_income),
        max(available_municipal_after_pension - earned_credit, 0.0),
    )
    public_service_cap = rule.ibb * rule.public_service_cap_multiplier * rule.public_service_multiplier
    public_service_fee = min(taxable_income * rule.public_service_multiplier, public_service_cap)

    total_tax = (
        municipal_tax
        + state_tax
        + pension_fee
        + public_service_fee
        - pension_credit
        - earned_credit
        - income_credit_amount
    )
    total_tax = max(total_tax, 0.0)

    return PersonalTaxResult(
        total_income=round(total_income, 2),
        taxable_income=round(taxable_income, 2),
        base_deduction=round(base_deduction, 2),
        municipal_tax=round(municipal_tax, 2),
        state_tax=round(state_tax, 2),
        pension_fee=round(pension_fee, 2),
        pension_credit=round(pension_credit, 2),
        earned_income_credit=round(earned_credit, 2),
        income_credit=round(income_credit_amount, 2),
        public_service_fee=round(public_service_fee, 2),
        total_tax=round(total_tax, 2),
        net_income=round(total_income - total_tax, 2),
    )
