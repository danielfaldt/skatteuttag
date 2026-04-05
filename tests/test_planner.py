from app.calculator.planner import (
    PlanningInput,
    build_ownership_analysis,
    compute_company_budget,
    compute_dividend_spaces,
    plan_compensation,
)


def test_2025_dividend_space_uses_old_rules():
    data = PlanningInput(
        year=2025,
        prior_year_company_cash_salaries=600_000,
        prior_year_user_company_salary=500_000,
        saved_dividend_space_user=10_000,
        saved_dividend_space_spouse=20_000,
    )
    spaces = compute_dividend_spaces(data)
    assert spaces.user_rule_label in {"Main rule", "Simplification rule"}
    assert spaces.user_space > 100_000
    assert spaces.spouse_space > 100_000


def test_2026_dividend_space_uses_new_combined_rule():
    data = PlanningInput(
        year=2026,
        prior_year_company_cash_salaries=900_000,
        prior_year_user_company_salary=900_000,
        user_share_percentage=60,
    )
    spaces = compute_dividend_spaces(data)
    assert spaces.user_rule_label == "2026 combined rule"
    assert spaces.user_space > 161_200
    assert spaces.user_space > spaces.spouse_space


def test_plan_compensation_returns_recommendation_and_alternatives():
    result = plan_compensation(PlanningInput().model_dump())
    assert result["recommended"]["user_net_from_company"] > 0
    assert len(result["alternatives"]) >= 2
    assert result["meta"]["salary_basis_year"] == 2025


def test_plan_compensation_returns_share_percentages():
    result = plan_compensation(PlanningInput(user_share_percentage=70).model_dump(), include_ownership_analysis=False)
    assert result["recommended"]["user_share_percentage"] == 70
    assert result["recommended"]["spouse_share_percentage"] == 30
    assert result["ownership_suggestion"] is None


def test_build_ownership_analysis_can_suggest_better_ownership_split():
    result = build_ownership_analysis(
        PlanningInput(
            year=2026,
            user_share_percentage=50,
            target_user_net_income=650_000,
            company_result_before_corporate_tax=1_600_000,
            spouse_external_salary=900_000,
            opening_retained_earnings=0,
            prior_year_company_cash_salaries=900_000,
            prior_year_user_company_salary=900_000,
            saved_dividend_space_user=0,
            saved_dividend_space_spouse=0,
            user_share_cost_basis=25_000,
            spouse_share_cost_basis=25_000,
        ).model_dump()
    )
    suggestion = result["ownership_suggestion"]
    assert suggestion is not None
    assert suggestion["estimated_tax_saving"] > 0
    assert suggestion["suggested_user_share_percentage"] != 50


def test_company_budget_applies_car_benefit_pension_and_periodization():
    data = PlanningInput(
        year=2026,
        user_birth_year=1985,
        company_result_before_corporate_tax=1_600_000,
        planned_user_pension=120_000,
        periodization_fund_change=100_000,
        user_car_benefit=60_000,
    )
    budget = compute_company_budget(data, planned_salary=700_000)

    assert budget["valid"] is True
    assert budget["employer_contributions"] > 0
    assert budget["pension_special_payroll_tax"] == 29_112
    assert budget["taxable_profit"] < budget["profit_before_periodization"]


def test_plan_compensation_uses_other_service_income_and_car_benefit_without_counting_benefit_as_cash():
    result = plan_compensation(
        PlanningInput(
            year=2026,
            user_other_service_income=180_000,
            user_car_benefit=72_000,
            spouse_birth_year=1959,
        ).model_dump(),
        include_ownership_analysis=False,
    )

    assert result["recommended"]["salary_tax"]["total_income"] >= result["recommended"]["salary"] + 72_000
    assert result["recommended"]["user_net_cash_salary"] < result["recommended"]["salary"]
    assert result["recommended"]["incremental_user_salary_tax"] > 0
