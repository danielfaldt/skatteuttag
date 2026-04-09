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
        "section_mix": "3. Lön kontra utdelning",
        "section_breakdown": "4. Nedbrytning av beräkning",
        "section_ownership": "5. Ägarfördelningsanalys",
        "section_alternatives": "6. Alternativa scenarier",
        "section_notes": "7. Antaganden och förklaringar",
        "label_user_name": "Användare",
        "label_spouse_name": "Make/maka",
        "label_year": "Planeringsår",
        "label_optimization_profile": "Optimeringsprofil",
        "label_household_floor": "Minsta hushållsnetto från bolaget",
        "label_target": "Önskad nettoinkomst efter skatt",
        "label_other_salary_income": "Annan lön utanför bolaget",
        "label_spouse_salary": "Lön från annan arbetsgivare",
        "label_company_result": "Bolagets resultat före bolagsskatt",
        "label_opening_retained": "Ingående fria vinstmedel",
        "label_municipality": "Kommun",
        "label_parish": "Församling",
        "label_church_member": "Medlem i Svenska kyrkan",
        "label_tax_rate": "Kommunalskatt",
        "label_burial_fee_rate": "Begravningsavgift",
        "label_church_fee_rate": "Kyrkoavgift",
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
        "label_car_benefit_pensionable": "Bilförmån pensionsgrundande",
        "label_periodization": "Periodiseringsfond",
        "label_opening_periodization_balance": "Ingående periodiseringsfond",
        "label_salary": "Rekommenderad lön",
        "label_dividend": "Rekommenderad total utdelning",
        "label_user_net": "Netto från bolaget för användaren",
        "label_household_net": "Hushållets netto från bolaget",
        "label_distance": "Avstånd till mål",
        "label_tax_burden": "Total skattebelastning",
        "label_salary_share": "Andel som lön",
        "label_dividend_share": "Andel som utdelning",
        "label_mix_assessment": "Bedömning",
        "label_mix_comparison": "Jämförelsepunkt",
        "label_result_before_corporate_tax": "Resultat före bolagsskatt",
        "label_cash_salary": "Kontant lön",
        "label_employer_contributions": "Arbetsgivaravgifter",
        "label_corporate_tax_detail": "Bolagsskatt",
        "label_available_dividend_cash": "Tillgänglig utdelningslikvid",
        "label_municipal_tax_detail": "Kommunal skatt",
        "label_state_tax_detail": "Statlig skatt",
        "label_incremental_salary_tax": "Tillkommande löneskatt",
        "label_net_cash_salary": "Nettokontant lön",
        "label_alt_salary": "Lön",
        "label_alt_dividend": "Utdelning",
        "label_alt_user_net": "Användarnetto",
        "label_alt_tax": "Skatt",
        "label_company_budget": "Bolagsbudget",
        "label_salary_tax": "Löneskatt",
        "label_dividend_room": "Utdelningsutrymme",
        "label_dividend_tax": "Utdelningsbeskattning",
        "label_current_split": "Nuvarande fordelning",
        "label_suggested_split": "Föreslagen fördelning",
        "label_tax_saving": "Beräknad förändring i total skatt",
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
        "section_mix": "3. Salary versus dividend",
        "section_breakdown": "4. Calculation breakdown",
        "section_ownership": "5. Ownership analysis",
        "section_alternatives": "6. Alternative scenarios",
        "section_notes": "7. Assumptions and explanations",
        "label_user_name": "User",
        "label_spouse_name": "Spouse",
        "label_year": "Planning year",
        "label_optimization_profile": "Optimization profile",
        "label_household_floor": "Minimum household net from company",
        "label_target": "Desired net income after tax",
        "label_other_salary_income": "Other salary outside the company",
        "label_spouse_salary": "Salary from other employer",
        "label_company_result": "Company result before corporate tax",
        "label_opening_retained": "Opening retained earnings",
        "label_municipality": "Municipality",
        "label_parish": "Parish",
        "label_church_member": "Member of the Church of Sweden",
        "label_tax_rate": "Municipal tax rate",
        "label_burial_fee_rate": "Burial fee",
        "label_church_fee_rate": "Church fee",
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
        "label_car_benefit_pensionable": "Car benefit pensionable",
        "label_periodization": "Periodization fund",
        "label_opening_periodization_balance": "Opening periodization-fund balance",
        "label_salary": "Recommended salary",
        "label_dividend": "Recommended total dividend",
        "label_user_net": "Net from company for the user",
        "label_household_net": "Household net from company",
        "label_distance": "Distance to target",
        "label_tax_burden": "Total tax burden",
        "label_salary_share": "Share taken as salary",
        "label_dividend_share": "Share taken as dividend",
        "label_mix_assessment": "Assessment",
        "label_mix_comparison": "Comparison point",
        "label_result_before_corporate_tax": "Result before corporate tax",
        "label_cash_salary": "Cash salary",
        "label_employer_contributions": "Employer contributions",
        "label_corporate_tax_detail": "Corporate tax",
        "label_available_dividend_cash": "Available dividend cash",
        "label_municipal_tax_detail": "Municipal tax",
        "label_state_tax_detail": "State tax",
        "label_incremental_salary_tax": "Incremental salary tax",
        "label_net_cash_salary": "Net cash salary",
        "label_alt_salary": "Salary",
        "label_alt_dividend": "Dividend",
        "label_alt_user_net": "User net",
        "label_alt_tax": "Tax",
        "label_company_budget": "Company budget",
        "label_salary_tax": "Salary tax",
        "label_dividend_room": "Dividend room",
        "label_dividend_tax": "Dividend taxation",
        "label_current_split": "Current split",
        "label_suggested_split": "Suggested split",
        "label_tax_saving": "Estimated change in total tax",
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
        "alternative.Lowest total tax": "Lägsta total skatt",
        "alternative.Highest household net": "Högsta hushållsnetto",
        "alternative.Within lower tax guardrails": "Under brytpunkt och 20 %",
        "explanation.salary_uses_planning_year": "Lön som tas ut under {planningYear} beskattas med lönereglerna för {planningYear}.",
        "explanation.dividend_uses_salary_basis_year": "Utdelningsutrymmet för {planningYear} använder lönebasåret {salaryBasisYear}.",
        "explanation.recommendation_scoring": "Rekommendationen väljs först efter närhet till användarens nettomål och därefter efter lägre total skatt.",
        "explanation.recommendation_profile_target_then_tax": "Huvudförslaget styrs först mot användarens nettomål och därefter mot lägre total skatt.",
        "explanation.recommendation_profile_guardrails": "Huvudförslaget styrs först mot att hålla lönen under statlig skatt och utdelningen inom kvalificerat utdelningsutrymme när det går.",
        "explanation.recommendation_profile_household_max": "Huvudförslaget styrs mot högsta möjliga hushållsnetto från bolaget och därefter mot lägre total skatt.",
        "explanation.recommendation_profile_tax_min": "Huvudförslaget styrs mot lägsta total skatt men försöker samtidigt nå inmatade mål så långt det går.",
        "explanation.household_floor_active": "En miniminivå på {householdMinNetIncome} kr netto från bolaget används som styrande villkor.",
        "explanation.household_floor_none": "Ingen särskild miniminivå för hushållets netto från bolaget används i rekommendationen.",
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
        "assumption.municipal_rate_editable": "Det synliga kommunalskattefältet avser kommunal och regional inkomstskatt. Begravningsavgift och eventuell kyrkoavgift hämtas separat från vald kommun och församling.",
        "assumption.official_rule_data": "Beräkningen använder årsspecifika officiella regeldata för 2025 och 2026.",
        "assumption.spouse_salary_affects_service_tax": "Makes/makas externa lön påverkar skatteeffekten när utdelning övergår till tjänstebeskattning.",
        "assumption.birth_year_affects_tax": "Födelseår påverkar personlig beskattning och arbetsgivaravgifter.",
        "assumption.user_other_salary_income": "Användarens andra lön utanför bolaget behandlas som ytterligare arbetsinkomst och påverkar marginalskatten i modellen.",
        "assumption.car_benefit_cash_vs_tax": "Bilförmån behandlas som skattepliktig förmån men räknas inte som kontant nettolön mot målet.",
        "assumption.pension_limit": "Tjänstepensionen kontrolleras mot avdragsramen med utgångspunkt i det högsta av innevarande års pensionsunderlag och användarens kontanta lön från föregående år.",
        "assumption.periodization_fund": "Positiv periodiseringsfond minskar årets beskattningsbara resultat och negativt värde får inte överstiga angivet ingående fondsaldo.",
        "mix.summary_salary_only": "Rekommendationen lutar helt mot lön i det här spannet.",
        "mix.summary_dividend_only": "Rekommendationen lutar helt mot utdelning i det här spannet.",
        "mix.summary_mixed": "Rekommendationen använder en mix där cirka {salarySharePercentage} % tas som lön och {dividendSharePercentage} % som utdelning.",
        "mix.reason_target_priority": "Den här mixen valdes först för att komma så nära användarens nettomål som möjligt.",
        "mix.reason_guardrails_priority": "Den här mixen valdes först för att hålla lönen under statlig skatt och utdelningen inom kvalificerat utdelningsutrymme när det är möjligt.",
        "mix.reason_dividend_room_used": "Utdelning används eftersom det finns kvalificerat utdelningsutrymme att nyttja.",
        "mix.reason_salary_dominant": "Modellen hittar ingen utdelning som förbättrar utfallet jämfört med ren lön i det här läget.",
        "mix.reason_near_state_breakpoint": "Lönen ligger nära brytpunkten för statlig skatt, vilket ofta är ett känsligt område i planeringen.",
        "mix.reason_above_state_breakpoint": "Lönen ligger tydligt över brytpunkten för statlig skatt, vilket betyder att högre lön redan ger statlig skatt.",
        "mix.comparison_more_dividend": "Mer utdelning och lägre lön",
        "mix.comparison_more_salary": "Mer lön och mindre utdelning",
    },
    "en": {
        "alternative.Dividend-led": "Dividend-led scenario",
        "alternative.Near state tax breakpoint": "Near the state tax breakpoint",
        "alternative.Maximum user net": "Maximum user net",
        "alternative.Lowest total tax": "Lowest total tax",
        "alternative.Highest household net": "Highest household net",
        "alternative.Within lower tax guardrails": "Below state tax and inside 20%",
        "explanation.salary_uses_planning_year": "Salary paid during {planningYear} is taxed using the salary-tax rules for {planningYear}.",
        "explanation.dividend_uses_salary_basis_year": "Dividend room for {planningYear} uses salary-base year {salaryBasisYear}.",
        "explanation.recommendation_scoring": "The recommendation is selected first by closeness to the user net target and then by lower total tax.",
        "explanation.recommendation_profile_target_then_tax": "The main recommendation is driven first by the user's net-income target and then by lower total tax.",
        "explanation.recommendation_profile_guardrails": "The main recommendation is driven first by keeping salary below state income tax and dividends inside qualified dividend room where possible.",
        "explanation.recommendation_profile_household_max": "The main recommendation is driven by the highest feasible household net from the company and then by lower total tax.",
        "explanation.recommendation_profile_tax_min": "The main recommendation is driven by the lowest total tax while still trying to meet the entered goals as far as possible.",
        "explanation.household_floor_active": "A household floor of {householdMinNetIncome} SEK net from the company is used as a steering condition.",
        "explanation.household_floor_none": "No specific household floor is used in the recommendation.",
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
        "assumption.municipal_rate_editable": "The visible municipal-tax field covers municipal and regional income tax. Burial fee and any church fee are fetched separately from the selected municipality and parish.",
        "assumption.official_rule_data": "The calculation uses official year-specific rule data for 2025 and 2026.",
        "assumption.spouse_salary_affects_service_tax": "The spouse's external salary affects the tax outcome when dividends spill into service taxation.",
        "assumption.birth_year_affects_tax": "Birth year affects personal tax and employer contributions.",
        "assumption.user_other_salary_income": "The user's other salary outside the company is treated as additional earned income and affects the marginal-tax outcome in the model.",
        "assumption.car_benefit_cash_vs_tax": "Car benefit is treated as taxable compensation but is not counted as cash net salary toward the target.",
        "assumption.pension_limit": "Occupational pension is checked against the deduction envelope using the higher of the current pension base and the user's prior-year cash salary.",
        "assumption.periodization_fund": "A positive periodization-fund amount reduces current taxable profit and a negative amount cannot exceed the stated opening balance.",
        "mix.summary_salary_only": "The recommendation leans entirely toward salary in this range.",
        "mix.summary_dividend_only": "The recommendation leans entirely toward dividends in this range.",
        "mix.summary_mixed": "The recommendation uses a mix where about {salarySharePercentage}% is taken as salary and {dividendSharePercentage}% as dividends.",
        "mix.reason_target_priority": "This mix was selected first to stay as close as possible to the user's net-income target.",
        "mix.reason_guardrails_priority": "This mix was selected first to keep salary below state income tax and dividends inside qualified dividend room where possible.",
        "mix.reason_dividend_room_used": "Dividends are used because qualified dividend room is available.",
        "mix.reason_salary_dominant": "The model does not find any dividend usage that improves the result compared with salary only in this case.",
        "mix.reason_near_state_breakpoint": "Salary is close to the state-tax breakpoint, which is often a sensitive planning zone.",
        "mix.reason_above_state_breakpoint": "Salary is clearly above the state-tax breakpoint, so extra salary already triggers state tax.",
        "mix.comparison_more_dividend": "More dividend and lower salary",
        "mix.comparison_more_salary": "More salary and less dividend",
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


def optimization_profile_label(profile: str, language: str) -> str:
    labels = {
        "sv": {
            "target_then_tax": "Närmast användarens mål, sedan lägre skatt",
            "guardrails": "Under brytpunkt och 20 %, sedan lägre skatt",
            "household_max": "Högsta hushållsnetto, sedan lägre skatt",
            "tax_min": "Lägsta skatt efter att mål nås så långt som möjligt",
        },
        "en": {
            "target_then_tax": "Closest to the user's target, then lower tax",
            "guardrails": "Below state tax and inside 20%, then lower tax",
            "household_max": "Highest household net, then lower tax",
            "tax_min": "Lowest tax after goals are met as far as possible",
        },
    }
    return labels[language].get(profile, profile)


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


def localize_message_params(params: dict[str, Any], language: str) -> dict[str, Any]:
    localized: dict[str, Any] = {}
    for key, value in params.items():
        if isinstance(value, (int, float)):
            if key.endswith("Percentage"):
                localized[key] = percentage(float(value), language).replace(f" {COPY[language]['percent_suffix']}", "")
                continue
            if key in {"salaryRequirement", "wageDeduction"}:
                localized[key] = money(float(value), language).replace(f" {COPY[language]['currency_suffix']}", "")
                continue
        localized[key] = value
    return localized


def translate_message(item: dict[str, Any], language: str, user_name: str, spouse_name: str) -> str:
    template = MESSAGE_COPY[language].get(item["key"], item["key"])
    params = {"userName": user_name, "spouseName": spouse_name, **localize_message_params(item.get("params", {}), language)}
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
    mix = result["compensation_mix"]
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
                (copy["label_optimization_profile"], optimization_profile_label(input_data["optimization_profile"], language)),
                (copy["label_target"], money(input_data["target_user_net_income"], language)),
                (copy["label_household_floor"], money(input_data["household_min_net_income"], language)),
                (copy["label_other_salary_income"], money(input_data["user_other_salary_income"], language)),
                (copy["label_spouse_salary"], money(input_data["spouse_external_salary"], language)),
                (copy["label_company_result"], money(input_data["company_result_before_corporate_tax"], language)),
                (copy["label_opening_retained"], money(input_data["opening_retained_earnings"], language)),
                (copy["label_municipality"], input_data["tax_municipality"] or "-"),
                (copy["label_parish"], input_data["tax_parish"] or "-"),
                (copy["label_church_member"], copy["yes"] if input_data["include_church_fee"] else copy["no"]),
                (copy["label_tax_rate"], percentage(input_data["municipal_tax_rate"], language)),
                (copy["label_burial_fee_rate"], percentage(input_data["burial_fee_rate"], language)),
                (copy["label_church_fee_rate"], percentage(input_data["church_fee_rate"], language)),
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
                (copy["label_car_benefit_pensionable"], copy["yes"] if input_data["car_benefit_is_pensionable"] else copy["no"]),
                (copy["label_pension"], money(input_data["planned_user_pension"], language)),
                (copy["label_periodization"], money(input_data["periodization_fund_change"], language)),
                (copy["label_opening_periodization_balance"], money(input_data["opening_periodization_fund_balance"], language)),
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
        paragraph(copy["section_mix"], styles["section"]),
        rows_to_table(
            [
                (copy["label_salary_share"], percentage(mix["salary_share_percentage"], language)),
                (copy["label_dividend_share"], percentage(mix["dividend_share_percentage"], language)),
                (copy["label_mix_assessment"], translate_message(mix["summary"], language, user_name, spouse_name)),
            ],
            styles,
        ),
        paragraph(copy["section_breakdown"], styles["section"]),
        rows_to_table(
            [
                (copy["label_company_budget"], ""),
                (copy["label_result_before_corporate_tax"], money(input_data["company_result_before_corporate_tax"], language)),
                (copy["label_cash_salary"], money(recommended["salary"], language)),
                (copy["label_employer_contributions"], money(company["employer_contributions"], language)),
                (copy["label_corporate_tax_detail"], money(company["corporate_tax"], language)),
                (copy["label_available_dividend_cash"], money(company["available_dividend_cash"], language)),
                (copy["label_salary_tax"], ""),
                (copy["label_municipal_tax_detail"], money(salary_tax["municipal_tax"], language)),
                (copy["label_burial_fee_rate"], money(salary_tax["burial_fee_tax"], language)),
                (copy["label_church_fee_rate"], money(salary_tax["church_fee_tax"], language)),
                (copy["label_state_tax_detail"], money(salary_tax["state_tax"], language)),
                (copy["label_incremental_salary_tax"], money(recommended["incremental_user_salary_tax"], language)),
                (copy["label_net_cash_salary"], money(recommended["user_net_cash_salary"], language)),
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

    for note in mix["reasons"]:
        story.append(paragraph(f"- {translate_message(note, language, user_name, spouse_name)}", styles["body"]))

    for comparison in mix["comparisons"]:
        story.append(
            paragraph(
                f"- {copy['label_mix_comparison']}: {translate_message({'key': comparison['key'], 'params': {}}, language, user_name, spouse_name)}. "
                f"{copy['label_alt_salary']} {money(comparison['scenario']['salary'], language)}, "
                f"{copy['label_alt_dividend']} {money(comparison['scenario']['total_dividend'], language)}, "
                f"{copy['label_alt_user_net']} {money(comparison['scenario']['user_net_from_company'], language)}, "
                f"{copy['label_alt_tax']} {money(comparison['scenario']['total_tax_burden'], language)}.",
                styles["body"],
            )
        )

    story.extend(
        [
            paragraph(copy["section_alternatives"], styles["section"]),
            rows_to_table(
                [
                    (
                        MESSAGE_COPY[language].get(f"alternative.{entry['label']}", entry["label"]),
                        ", ".join(
                            [
                                f"{copy['label_alt_salary']} {money(entry['scenario']['salary'], language)}",
                                f"{copy['label_alt_dividend']} {money(entry['scenario']['total_dividend'], language)}",
                                f"{copy['label_alt_user_net']} {money(entry['scenario']['user_net_from_company'], language)}",
                                f"{copy['label_alt_tax']} {money(entry['scenario']['total_tax_burden'], language)}",
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
