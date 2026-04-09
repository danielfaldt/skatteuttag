from app.calculator.planner import (
    CalculationInputError,
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


def test_year_specific_local_tax_defaults_follow_selected_year():
    data_2025 = PlanningInput(year=2025)
    data_2026 = PlanningInput(year=2026)

    assert data_2025.municipal_tax_rate == 32.41
    assert data_2025.burial_fee_rate == 0.293
    assert data_2026.municipal_tax_rate == 32.38
    assert data_2026.burial_fee_rate == 0.292


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


def test_plan_compensation_can_optimize_for_household_maximum():
    base_input = PlanningInput(
        year=2026,
        target_user_net_income=650_000,
        company_result_before_corporate_tax=1_600_000,
        spouse_external_salary=900_000,
        opening_retained_earnings=0,
        prior_year_company_cash_salaries=900_000,
        prior_year_user_company_salary=900_000,
    )

    target_result = plan_compensation(base_input.model_dump(), include_ownership_analysis=False)
    household_result = plan_compensation(
        base_input.model_copy(update={"optimization_profile": "household_max"}).model_dump(),
        include_ownership_analysis=False,
    )

    assert household_result["input"]["optimization_profile"] == "household_max"
    assert household_result["recommended"]["household_net_from_company"] >= target_result["recommended"]["household_net_from_company"]


def test_plan_compensation_tracks_household_floor_shortfall():
    result = plan_compensation(
        PlanningInput(
            year=2026,
            household_min_net_income=2_000_000,
        ).model_dump(),
        include_ownership_analysis=False,
    )

    assert result["recommended"]["household_shortfall_to_floor"] > 0
    assert result["input"]["household_min_net_income"] == 2_000_000


def test_plan_compensation_reports_unreachable_target_problem():
    result = plan_compensation(
        PlanningInput(
            year=2026,
            target_user_net_income=2_000_000,
            company_result_before_corporate_tax=600_000,
            opening_retained_earnings=0,
        ).model_dump(),
        include_ownership_analysis=False,
    )

    assert any(problem["key"] == "problem.user_target_unreachable" for problem in result["problems"])


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
    assert suggestion["estimated_household_net_gain"] > 0
    assert isinstance(suggestion["estimated_tax_saving"], (int, float))
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


def test_company_budget_uses_prior_year_salary_for_pension_limit():
    budget = compute_company_budget(
        PlanningInput(
            year=2026,
            prior_year_user_company_salary=300_000,
            planned_user_pension=80_000,
            user_car_benefit=40_000,
            car_benefit_is_pensionable=False,
        ),
        planned_salary=100_000,
    )

    assert budget["valid"] is True
    assert budget["pension_deduction_limit"] == 105_000


def test_company_budget_rejects_reversal_above_opening_periodization_balance():
    budget = compute_company_budget(
        PlanningInput(
            year=2026,
            periodization_fund_change=-90_000,
            opening_periodization_fund_balance=50_000,
        ),
        planned_salary=400_000,
    )

    assert budget["valid"] is False
    assert budget["opening_periodization_fund_balance"] == 50_000


def test_plan_compensation_uses_other_salary_income_and_car_benefit_without_counting_benefit_as_cash():
    result = plan_compensation(
        PlanningInput(
            year=2026,
            user_other_salary_income=180_000,
            user_car_benefit=72_000,
            spouse_birth_year=1959,
        ).model_dump(),
        include_ownership_analysis=False,
    )

    assert result["recommended"]["salary_tax"]["total_income"] >= result["recommended"]["salary"] + 72_000
    assert result["recommended"]["salary_tax"]["pension_fee"] > 0
    assert result["recommended"]["user_net_cash_salary"] < result["recommended"]["salary"]
    assert result["recommended"]["incremental_user_salary_tax"] > 0


def test_plan_compensation_rejects_periodization_fund_above_allowed_maximum():
    try:
        plan_compensation(
            PlanningInput(
                year=2026,
                company_result_before_corporate_tax=846_312,
                opening_retained_earnings=1_051_367,
                spouse_external_salary=1_500_000,
                user_car_benefit=74_688,
                planned_user_pension=180_000,
                opening_periodization_fund_balance=650_000,
                prior_year_company_cash_salaries=650_599,
                prior_year_user_company_salary=650_599,
                periodization_fund_change=150_000,
            ).model_dump(),
            include_ownership_analysis=False,
        )
    except CalculationInputError as exc:
        assert exc.key == "error.periodization_allocation_too_high"
        assert exc.params["maxAmount"] == 149_794.26
        assert exc.params["requestedAmount"] == 150_000
    else:
        raise AssertionError("Expected CalculationInputError for excessive periodization allocation")
