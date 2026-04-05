from app.calculator.tax import compute_personal_tax, ordinary_base_deduction, total_base_deduction


def test_ordinary_base_deduction_2026_matches_official_example():
    assert ordinary_base_deduction(2026, 120_000) == 37_400


def test_ordinary_base_deduction_2025_matches_official_example():
    assert ordinary_base_deduction(2025, 324_000) == 31_200


def test_personal_tax_2026_is_reasonable_for_mid_income():
    result = compute_personal_tax(year=2026, earned_income=240_000, municipal_rate=32.84)
    assert round(result.base_deduction) == 40_000
    assert 25_000 < result.earned_income_credit < 27_000
    assert 200_000 < result.net_income < 201_000


def test_senior_base_deduction_2025_matches_official_example():
    assert total_base_deduction(2025, 90_000, birth_year=1958) == 71_700


def test_senior_personal_tax_gets_higher_base_deduction_and_credit():
    under_66 = compute_personal_tax(year=2026, earned_income=240_000, municipal_rate=32.84, birth_year=1985)
    over_66 = compute_personal_tax(year=2026, earned_income=240_000, municipal_rate=32.84, birth_year=1959)

    assert over_66.base_deduction > under_66.base_deduction
    assert over_66.earned_income_credit > under_66.earned_income_credit
    assert over_66.total_tax < under_66.total_tax
