from __future__ import annotations

from datetime import datetime
from io import BytesIO
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from .calculator.planner import plan_compensation


COPY: dict[str, dict[str, str]] = {
    "sv": {
        "title": "Skatteuttag",
        "subtitle": "Formell planeringsrapport för lön, utdelning och skatt",
        "generated": "Genererad",
        "section_inputs": "1. Indata",
        "section_recommendation": "2. Rekommenderad plan",
        "section_breakdown": "3. Nedbrytning av beräkning",
        "section_ownership": "4. Ägarfördelningsanalys",
        "section_alternatives": "5. Alternativa scenarier",
        "section_notes": "6. Antaganden och förklaringar",
        "label_user_name": "Användare",
        "label_spouse_name": "Make/maka",
        "label_year": "Planeringsår",
        "label_target": "Önskad nettoinkomst efter skatt",
        "label_other_service_income": "Övriga tjänsteinkomster",
        "label_spouse_salary": "Lön från annan arbetsgivare",
        "label_company_result": "Bolagets resultat före bolagsskatt",
        "label_opening_retained": "Ingående fria vinstmedel",
        "label_municipality": "Kommun",
        "label_parish": "Församling",
        "label_church_member": "Medlem i Svenska kyrkan",
        "label_tax_rate": "Kommunalskatt",
        "label_salary_basis_year": "Lönebasår",
        "label_company_salaries": "Bolagets kontanta löner under lönebasåret",
        "label_user_salary_basis": "Användarens lön från bolaget under lönebasåret",
        "label_user_birth_year": "Användarens födelseår",
        "label_spouse_birth_year": "Makes/makas födelseår",
        "label_user_share": "Användarens aktieandel",
        "label_spouse_share": "Makes/makas aktieandel",
        "label_user_saved_space": "Användarens sparade utdelningsutrymme",
        "label_spouse_saved_space": "Makes/makas sparade utdelningsutrymme",
        "label_user_cost_basis": "Användarens omkostnadsbelopp",
        "label_spouse_cost_basis": "Makes/makas omkostnadsbelopp",
        "label_car_benefit": "Bilförmån",
        "label_pension": "Planerad tjänstepension",
        "label_periodization": "Periodiseringsfond",
        "label_salary": "Rekommenderad lön",
        "label_dividend": "Rekommenderad total utdelning",
        "label_user_net": "Netto från bolaget för användaren",
        "label_household_net": "Hushållets netto från bolaget",
        "label_distance": "Avstånd till mål",
        "label_tax_burden": "Total skattebelastning",
        "label_company_budget": "Bolagsbudget",
        "label_salary_tax": "Löneskatt",
        "label_dividend_room": "Utdelningsutrymme",
        "label_dividend_tax": "Utdelningsbeskattning",
        "label_current_split": "Nuvarande fordelning",
        "label_suggested_split": "Föreslagen fördelning",
        "label_tax_saving": "Beräknad skattebesparing",
        "label_none": "Ingen fördelaktigare ägarfördelning hittades i modellens sökyta.",
        "yes": "Ja",
        "no": "Nej",
        "currency_suffix": "kr",
        "percent_suffix": "%",
    },
    "en": {
        "title": "TaxSplit",
        "subtitle": "Formal planning report for salary, dividends, and tax",
        "generated": "Generated",
        "section_inputs": "1. Inputs",
        "section_recommendation": "2. Recommended plan",
        "section_breakdown": "3. Calculation breakdown",
        "section_ownership": "4. Ownership analysis",
        "section_alternatives": "5. Alternative scenarios",
        "section_notes": "6. Assumptions and explanations",
        "label_user_name": "User",
        "label_spouse_name": "Spouse",
        "label_year": "Planning year",
        "label_target": "Desired net income after tax",
        "label_other_service_income": "Other service income",
        "label_spouse_salary": "Salary from other employer",
        "label_company_result": "Company result before corporate tax",
        "label_opening_retained": "Opening retained earnings",
        "label_municipality": "Municipality",
        "label_parish": "Parish",
        "label_church_member": "Member of the Church of Sweden",
        "label_tax_rate": "Municipal tax rate",
        "label_salary_basis_year": "Salary-base year",
        "label_company_salaries": "Company cash salaries in the salary-base year",
        "label_user_salary_basis": "User salary from the company in the salary-base year",
        "label_user_birth_year": "User birth year",
        "label_spouse_birth_year": "Spouse birth year",
        "label_user_share": "User ownership share",
        "label_spouse_share": "Spouse ownership share",
        "label_user_saved_space": "User saved dividend room",
        "label_spouse_saved_space": "Spouse saved dividend room",
        "label_user_cost_basis": "User cost basis",
        "label_spouse_cost_basis": "Spouse cost basis",
        "label_car_benefit": "Car benefit",
        "label_pension": "Planned occupational pension",
        "label_periodization": "Periodization fund",
        "label_salary": "Recommended salary",
        "label_dividend": "Recommended total dividend",
        "label_user_net": "Net from company for the user",
        "label_household_net": "Household net from company",
        "label_distance": "Distance to target",
        "label_tax_burden": "Total tax burden",
        "label_company_budget": "Company budget",
        "label_salary_tax": "Salary tax",
        "label_dividend_room": "Dividend room",
        "label_dividend_tax": "Dividend taxation",
        "label_current_split": "Current split",
        "label_suggested_split": "Suggested split",
        "label_tax_saving": "Estimated tax saving",
        "label_none": "No more favorable ownership split was found in the model search space.",
        "yes": "Yes",
        "no": "No",
        "currency_suffix": "SEK",
        "percent_suffix": "%",
    },
}

MESSAGE_COPY: dict[str, dict[str, str]] = {
    "sv": {
        "alternative.Dividend-led": "Utdelningsdrivet scenario",
        "alternative.Near state tax breakpoint": "Nära brytpunkten för statlig skatt",
        "alternative.Maximum user net": "Högsta användarnetto",
        "explanation.salary_uses_planning_year": "Lön som tas ut under {planningYear} beskattas med lönereglerna för {planningYear}.",
        "explanation.dividend_uses_salary_basis_year": "Utdelningsutrymmet för {planningYear} använder lönebasåret {salaryBasisYear}.",
        "explanation.recommendation_scoring": "Rekommendationen väljs först efter närhet till användarens nettomål och därefter efter lägre total skatt.",
        "note.salary_basis_year": "Planeringsår {planningYear} använder lönedata från {salaryBasisYear} för lönebaserat utdelningsutrymme.",
        "note.ownership_structure": "Modellen utgår från att {userName} äger {userSharePercentage} % och {spouseName} {spouseSharePercentage} %, och att endast {userName} tar lön från bolaget.",
        "note.old_rule_salary_requirement_met": "Det gamla lönekravet är uppfyllt eftersom bolagslönen under basåret är minst {salaryRequirement} kr.",
        "note.old_rule_salary_requirement_not_met": "Det gamla lönekravet är inte uppfyllt. Bolagslönen under basåret behöver vara cirka {salaryRequirement} kr för att låsa upp lönebaserat utrymme för 2025.",
        "note.old_rule_saved_space_uplift": "Sparat utdelningsutrymme räknas upp med 4,96 % för 2025 enligt reglerna före 2026.",
        "note.new_rule_combined_method": "2026 års regelverk använder en kombinerad metod med grundbelopp, lönebaserat utrymme, ränta på omkostnadsbelopp över 100 000 kr och sparat utrymme.",
        "note.new_rule_wage_space_positive": "Det lönebaserade utrymmet är positivt eftersom bolagets kontanta löner under basåret överstiger avdraget på {wageDeduction} kr.",
        "note.new_rule_wage_space_zero": "Det lönebaserade utrymmet är noll eftersom bolagets kontanta löner under basåret inte överstiger avdraget på {wageDeduction} kr.",
        "assumption.swedish_limited_company": "Modellen avser ett svenskt privat aktiebolag med två makar där {userName} äger {userSharePercentage} % och {spouseName} {spouseSharePercentage} %.",
        "assumption.only_user_company_salary": "Endast {userName} antas ta lön från bolaget.",
        "assumption.dividend_limited_to_profit_and_retained": "Utdelning begränsas till aktuell vinst efter lönekostnad samt eventuella ingående fria vinstmedel.",
        "assumption.municipal_rate_editable": "Kommunalskatten kan autoifyllas från vald kommun och vid behov vald församling, men kan fortfarande justeras manuellt.",
        "assumption.official_rule_data": "Beräkningen använder årsspecifika officiella regeldata för 2025 och 2026.",
        "assumption.spouse_salary_affects_service_tax": "Makes/makas externa lön påverkar skatteeffekten när utdelning övergår till tjänstebeskattning.",
        "assumption.birth_year_affects_tax": "Födelseår påverkar personlig beskattning och arbetsgivaravgifter.",
        "assumption.user_other_service_income": "Användarens övriga tjänsteinkomster påverkar marginalskatten i modellen.",
        "assumption.car_benefit_cash_vs_tax": "Bilförmån behandlas som skattepliktig förmån men räknas inte som kontant nettolön mot målet.",
        "assumption.pension_limit": "Tjänstepensionen kontrolleras mot avdragsramen i modellen.",
        "assumption.periodization_fund": "Positiv periodiseringsfond minskar årets beskattningsbara resultat och negativt värde tolkas som återföring.",
    },
    "en": {
        "alternative.Dividend-led": "Dividend-led scenario",
        "alternative.Near state tax breakpoint": "Near the state tax breakpoint",
        "alternative.Maximum user net": "Maximum user net",
        "explanation.salary_uses_planning_year": "Salary paid during {planningYear} is taxed using the salary-tax rules for {planningYear}.",
        "explanation.dividend_uses_salary_basis_year": "Dividend room for {planningYear} uses salary-base year {salaryBasisYear}.",
        "explanation.recommendation_scoring": "The recommendation is selected first by closeness to the user net target and then by lower total tax.",
        "note.salary_basis_year": "Planning year {planningYear} uses salary data from {salaryBasisYear} for wage-linked dividend room.",
        "note.ownership_structure": "The model assumes that {userName} owns {userSharePercentage}% and {spouseName} {spouseSharePercentage}%, and that only {userName} receives salary from the company.",
        "note.old_rule_salary_requirement_met": "The old salary threshold is met because prior-year company salary is at least {salaryRequirement} SEK.",
        "note.old_rule_salary_requirement_not_met": "The old salary threshold is not met. Prior-year company salary needs to be about {salaryRequirement} SEK to unlock wage-based room for 2025.",
        "note.old_rule_saved_space_uplift": "Saved dividend room is uplifted by 4.96% for 2025 under the pre-2026 rules.",
        "note.new_rule_combined_method": "The 2026 rules use one combined method with a ground amount, wage-based room, interest on cost basis above 100,000 SEK, and saved room.",
        "note.new_rule_wage_space_positive": "Wage-based room is positive because prior-year company cash salaries exceed the deduction of {wageDeduction} SEK.",
        "note.new_rule_wage_space_zero": "Wage-based room is zero because prior-year company cash salaries do not exceed the deduction of {wageDeduction} SEK.",
        "assumption.swedish_limited_company": "The model covers a Swedish private limited company with two spouse owners where {userName} owns {userSharePercentage}% and {spouseName} {spouseSharePercentage}%.",
        "assumption.only_user_company_salary": "Only {userName} is assumed to receive salary from the company.",
        "assumption.dividend_limited_to_profit_and_retained": "Dividends are limited to current-year profit after salary cost plus any opening retained earnings.",
        "assumption.municipal_rate_editable": "Municipal tax can be auto-filled from the selected municipality and, when relevant, parish, but remains manually editable.",
        "assumption.official_rule_data": "The calculation uses official year-specific rule data for 2025 and 2026.",
        "assumption.spouse_salary_affects_service_tax": "The spouse's external salary affects the tax outcome when dividends spill into service taxation.",
        "assumption.birth_year_affects_tax": "Birth year affects personal tax and employer contributions.",
        "assumption.user_other_service_income": "The user's other service income affects the marginal-tax outcome in the model.",
        "assumption.car_benefit_cash_vs_tax": "Car benefit is treated as taxable compensation but is not counted as cash net salary toward the target.",
        "assumption.pension_limit": "Occupational pension is checked against the model's deduction envelope.",
        "assumption.periodization_fund": "A positive periodization-fund amount reduces current taxable profit and a negative amount is treated as reversal.",
    },
}


def money(value: float, language: str) -> str:
    text = f"{value:,.0f}".replace(",", " ")
    return f"{text} {COPY[language]['currency_suffix']}"


def percentage(value: float, language: str) -> str:
    text = f"{value:.2f}".rstrip("0").rstrip(".").replace(".", ",")
    if language == "en":
        text = text.replace(",", ".")
    return f"{text} {COPY[language]['percent_suffix']}"


def paragraph(text: str, style: ParagraphStyle) -> Paragraph:
    safe_text = (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )
    return Paragraph(safe_text, style)


def interpolate(template: str, params: dict[str, Any]) -> str:
    result = template
    for key, value in params.items():
        result = result.replace(f"{{{key}}}", str(value))
    return result


def translate_message(item: dict[str, Any], language: str, user_name: str, spouse_name: str) -> str:
    template = MESSAGE_COPY[language].get(item["key"], item["key"])
    params = {"userName": user_name, "spouseName": spouse_name, **item.get("params", {})}
    return interpolate(template, params)


def rows_to_table(rows: list[tuple[str, str]], styles: dict[str, ParagraphStyle]) -> Table:
    data = [[paragraph(left, styles["body"]), paragraph(right, styles["body"])] for left, right in rows]
    table = Table(data, colWidths=[74 * mm, 92 * mm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LINEBELOW", (0, 0), (-1, -1), 0.25, colors.HexColor("#dbe6e1")),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def build_styles() -> dict[str, ParagraphStyle]:
    stylesheet = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "ReportTitle",
            parent=stylesheet["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=colors.HexColor("#18302b"),
            spaceAfter=6,
        ),
        "subtitle": ParagraphStyle(
            "ReportSubtitle",
            parent=stylesheet["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#5c746c"),
            spaceAfter=10,
        ),
        "section": ParagraphStyle(
            "SectionHeading",
            parent=stylesheet["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=18,
            textColor=colors.HexColor("#1d7a63"),
            spaceBefore=12,
            spaceAfter=8,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=stylesheet["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#18302b"),
            alignment=TA_LEFT,
        ),
    }


def owner_name(value: str, fallback: str) -> str:
    return value.strip() or fallback


def generate_pdf_report(payload: dict[str, Any], language: str = "sv") -> bytes:
    language = language if language in COPY else "sv"
    copy = COPY[language]
    result = plan_compensation(payload, include_ownership_analysis=True)
    styles = build_styles()

    input_data = result["input"]
    recommended = result["recommended"]
    company = recommended["company"]
    salary_tax = recommended["salary_tax"]
    spaces = recommended["dividend_spaces"]
    user_dividend = recommended["user_dividend"]
    spouse_dividend = recommended["spouse_dividend"]
    ownership = result["ownership_suggestion"]
    user_name = owner_name(input_data["user_display_name"], copy["label_user_name"])
    spouse_name = owner_name(input_data["spouse_display_name"], copy["label_spouse_name"])
    spouse_share_percentage = round(100.0 - float(input_data["user_share_percentage"]), 1)

    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title=copy["title"],
        author="Skatteuttag",
    )

    story: list[Any] = [
        paragraph(copy["title"], styles["title"]),
        paragraph(copy["subtitle"], styles["subtitle"]),
        paragraph(
            f"{copy['generated']}: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            styles["body"],
        ),
        Spacer(1, 6),
        paragraph(copy["section_inputs"], styles["section"]),
        rows_to_table(
            [
                (copy["label_user_name"], user_name),
                (copy["label_spouse_name"], spouse_name),
                (copy["label_year"], str(input_data["year"])),
                (copy["label_target"], money(input_data["target_user_net_income"], language)),
                (copy["label_other_service_income"], money(input_data["user_other_service_income"], language)),
                (copy["label_spouse_salary"], money(input_data["spouse_external_salary"], language)),
                (copy["label_company_result"], money(input_data["company_result_before_corporate_tax"], language)),
                (copy["label_opening_retained"], money(input_data["opening_retained_earnings"], language)),
                (copy["label_municipality"], input_data["tax_municipality"] or "-"),
                (copy["label_parish"], input_data["tax_parish"] or "-"),
                (copy["label_church_member"], copy["yes"] if input_data["include_church_fee"] else copy["no"]),
                (copy["label_tax_rate"], percentage(input_data["municipal_tax_rate"], language)),
                (copy["label_salary_basis_year"], str(result["meta"]["salary_basis_year"])),
                (copy["label_company_salaries"], money(input_data["prior_year_company_cash_salaries"], language)),
                (copy["label_user_salary_basis"], money(input_data["prior_year_user_company_salary"], language)),
                (copy["label_user_birth_year"], str(input_data["user_birth_year"])),
                (copy["label_spouse_birth_year"], str(input_data["spouse_birth_year"])),
                (copy["label_user_share"], percentage(input_data["user_share_percentage"], language)),
                (copy["label_spouse_share"], percentage(spouse_share_percentage, language)),
                (copy["label_user_saved_space"], money(input_data["saved_dividend_space_user"], language)),
                (copy["label_spouse_saved_space"], money(input_data["saved_dividend_space_spouse"], language)),
                (copy["label_user_cost_basis"], money(input_data["user_share_cost_basis"], language)),
                (copy["label_spouse_cost_basis"], money(input_data["spouse_share_cost_basis"], language)),
                (copy["label_car_benefit"], money(input_data["user_car_benefit"], language)),
                (copy["label_pension"], money(input_data["planned_user_pension"], language)),
                (copy["label_periodization"], money(input_data["periodization_fund_change"], language)),
            ],
            styles,
        ),
        paragraph(copy["section_recommendation"], styles["section"]),
        rows_to_table(
            [
                (copy["label_salary"], money(recommended["salary"], language)),
                (copy["label_dividend"], money(recommended["total_dividend"], language)),
                (copy["label_user_net"], money(recommended["user_net_from_company"], language)),
                (copy["label_household_net"], money(recommended["household_net_from_company"], language)),
                (copy["label_distance"], money(recommended["distance_to_target"], language)),
                (copy["label_tax_burden"], money(recommended["total_tax_burden"], language)),
            ],
            styles,
        ),
        paragraph(copy["section_breakdown"], styles["section"]),
        rows_to_table(
            [
                (copy["label_company_budget"], ""),
                ("Result before corporate tax", money(input_data["company_result_before_corporate_tax"], language)),
                ("Cash salary", money(recommended["salary"], language)),
                ("Employer contributions", money(company["employer_contributions"], language)),
                ("Corporate tax", money(company["corporate_tax"], language)),
                ("Available dividend cash", money(company["available_dividend_cash"], language)),
                (copy["label_salary_tax"], ""),
                ("Municipal tax", money(salary_tax["municipal_tax"], language)),
                ("State tax", money(salary_tax["state_tax"], language)),
                ("Incremental salary tax", money(recommended["incremental_user_salary_tax"], language)),
                ("Net cash salary", money(recommended["user_net_cash_salary"], language)),
                (copy["label_dividend_room"], ""),
                (f"{user_name}", money(spaces["user_space"], language)),
                (f"{spouse_name}", money(spaces["spouse_space"], language)),
                (copy["label_dividend_tax"], ""),
                (f"{user_name}", money(user_dividend["total_dividend_tax"], language)),
                (f"{spouse_name}", money(spouse_dividend["total_dividend_tax"], language)),
            ],
            styles,
        ),
        paragraph(copy["section_ownership"], styles["section"]),
    ]

    if ownership:
        story.append(
            rows_to_table(
                [
                    (
                        copy["label_current_split"],
                        f"{user_name} {percentage(ownership['current_user_share_percentage'], language)}, {spouse_name} {percentage(ownership['current_spouse_share_percentage'], language)}",
                    ),
                    (
                        copy["label_suggested_split"],
                        f"{user_name} {percentage(ownership['suggested_user_share_percentage'], language)}, {spouse_name} {percentage(ownership['suggested_spouse_share_percentage'], language)}",
                    ),
                    (copy["label_tax_saving"], money(ownership["estimated_tax_saving"], language)),
                ],
                styles,
            )
        )
    else:
        story.append(paragraph(copy["label_none"], styles["body"]))

    story.extend(
        [
            paragraph(copy["section_alternatives"], styles["section"]),
            rows_to_table(
                [
                    (
                        MESSAGE_COPY[language].get(f"alternative.{entry['label']}", entry["label"]),
                        ", ".join(
                            [
                                f"Salary {money(entry['scenario']['salary'], language)}",
                                f"Dividend {money(entry['scenario']['total_dividend'], language)}",
                                f"User net {money(entry['scenario']['user_net_from_company'], language)}",
                                f"Tax {money(entry['scenario']['total_tax_burden'], language)}",
                            ]
                        ),
                    )
                    for entry in result["alternatives"]
                ],
                styles,
            ),
            paragraph(copy["section_notes"], styles["section"]),
        ]
    )

    for note in [*result["explanations"], *spaces["notes"], *result["assumptions"]]:
        story.append(paragraph(f"- {translate_message(note, language, user_name, spouse_name)}", styles["body"]))

    document.build(story)
    return buffer.getvalue()
