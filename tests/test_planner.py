from app.calculator.planner import PlanningInput, compute_dividend_spaces, plan_compensation


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
    )
    spaces = compute_dividend_spaces(data)
    assert spaces.user_rule_label == "2026 combined rule"
    assert spaces.user_space > 161_200


def test_plan_compensation_returns_recommendation_and_alternatives():
    result = plan_compensation(PlanningInput().model_dump())
    assert result["recommended"]["user_net_from_company"] > 0
    assert len(result["alternatives"]) >= 2
    assert result["meta"]["salary_basis_year"] == 2025
