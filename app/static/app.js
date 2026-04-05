const STORAGE_KEY = "skatteuttag-form-state";
const LANGUAGE_KEY = "skatteuttag-language";

const form = document.querySelector("#planner-form");
const yearInput = document.querySelector("#year");
const languageSwitch = document.querySelector("#language-switch");
const exportPdfButton = document.querySelector("#export-pdf");
const errorBox = document.querySelector("#error-box");
const summaryBox = document.querySelector("#recommendation-summary");
const finalPlanBox = document.querySelector("#final-plan-summary");
const breakdownGrid = document.querySelector("#breakdown-grid");
const alternativesBox = document.querySelector("#alternatives");
const assumptionsBox = document.querySelector("#assumptions");
const resetButton = document.querySelector("#reset-values");
const submitButton = form.querySelector('button[type="submit"]');
const metaDescription = document.querySelector("#meta-description");
const pageTitle = document.querySelector("#page-title");
const appNameElement = document.querySelector("#app-name");
const compensationMixBox = document.querySelector("#compensation-mix-analysis");
const ownershipSuggestionBox = document.querySelector("#ownership-suggestion");
const userDisplayNameInput = document.querySelector("#user-display-name");
const spouseDisplayNameInput = document.querySelector("#spouse-display-name");
const targetNetIncomeLabel = document.querySelector("#target-net-income-label");
const userOtherSalaryIncomeLabel = document.querySelector("#user-other-salary-income-label");
const spouseExternalSalaryLabel = document.querySelector("#spouse-external-salary-label");
const userCarBenefitLabel = document.querySelector("#user-car-benefit-label");
const plannedUserPensionLabel = document.querySelector("#planned-user-pension-label");
const userBirthYearLabel = document.querySelector("#user-birth-year-label");
const spouseBirthYearLabel = document.querySelector("#spouse-birth-year-label");
const taxMunicipalitySelect = document.querySelector("#tax-municipality");
const taxParishSelect = document.querySelector("#tax-parish");
const taxParishField = document.querySelector("#tax-parish-field");
const includeChurchFeeInput = document.querySelector("#include-church-fee");
const municipalTaxRateInput = document.querySelector("#municipal-tax-rate");
const burialFeeRateInput = document.querySelector("#burial-fee-rate");
const churchFeeRateInput = document.querySelector("#church-fee-rate");
const userShareLabel = document.querySelector("#user-share-label");
const spouseShareLabel = document.querySelector("#spouse-share-label");
const userShareDisplay = document.querySelector("#user-share-display");
const spouseShareDisplay = document.querySelector("#spouse-share-display");
const userShareSlider = document.querySelector("#user-share-slider");
const userSavedDividendSpaceLabel = document.querySelector("#user-saved-dividend-space-label");
const spouseSavedDividendSpaceLabel = document.querySelector("#spouse-saved-dividend-space-label");
const userShareCostBasisLabel = document.querySelector("#user-share-cost-basis-label");
const spouseShareCostBasisLabel = document.querySelector("#spouse-share-cost-basis-label");
const numericInputs = Array.from(document.querySelectorAll(".js-number"));
const infoPopovers = Array.from(document.querySelectorAll(".info-popover"));

const TRANSLATIONS = {
  sv: {
    "brand.app_name": "Skatteuttag",
    "meta.description": "Löne- och utdelningsplanering för ett svenskt aktiebolag med tydlig årskopplad skattelogik.",
    "language.label": "Språk",
    "button.export_pdf": "Exportera till pdf",
    "button.exporting_pdf": "Exporterar PDF...",
    "hero.eyebrow": "Svensk skatteplanering för ägarledda bolag",
    "hero.lede": "Planera lön och utdelning i ett svenskt aktiebolag med ett valt planeringsår. Appen förklarar hur utbetalningsåret och lönebasåret hänger ihop.",
    "hero.supported_years": "Stödda år: {years}",
    "hero.ownership": "Flexibel ägarfördelning mellan makar",
    "hero.persistence": "Sparas lokalt i webbläsaren",
    "inputs.title": "Inmatning",
    "inputs.subtitle": "Alla belopp anges som årsbelopp i SEK.",
    "inputs.people_title": "Personer",
    "inputs.people_subtitle": "Namn och födelseår används i resultatvyn och i åldersstyrda skatteregler.",
    "inputs.goal_title": "Planeringsmål",
    "inputs.goal_subtitle": "De här värdena styr vad rekommendationen ska optimeras mot.",
    "inputs.base_title": "Bolag och skatteunderlag",
    "inputs.base_subtitle": "Det här är historiska eller faktiska uppgifter som modellen bygger på.",
    "tag.base_data": "Grunddata",
    "tag.planning_choice": "Planeringsval",
    "field.planning_year": "Planeringsår",
    "field.target_user_net_income": "Önskad nettoinkomst för användaren efter skatt",
    "field.spouse_external_salary": "Makes/makas lön från annan arbetsgivare",
    "field.company_result_before_corporate_tax": "Bolagets resultat före bolagsskatt",
    "field.opening_retained_earnings": "Ingående fria vinstmedel tillgängliga för utdelning",
    "field.tax_municipality": "Kommun för skatteautoifyllning",
    "field.tax_parish": "Församling",
    "field.include_church_fee": "Medlem i Svenska kyrkan",
    "field.include_church_fee_hint": "Lägg till kyrkoavgift från vald församling.",
    "field.municipal_tax_rate": "Kommunalskatt",
    "field.tax_option_placeholder": "Välj kommun",
    "field.parish_option_placeholder": "Välj församling",
    "salary_basis.title": "Lönebasår för utdelningsutrymme",
    "salary_basis.text": "För planeringsår {planningYear} tittar utdelningsutrymmet tillbaka på löneår {salaryBasisYear}.",
    "field.prior_year_company_cash_salaries": "Bolagets kontanta löner under {salaryBasisYear}",
    "field.prior_year_user_company_salary": "Användarens lön från bolaget under {salaryBasisYear}",
    "shareholder.title": "Aktieägarvärden",
    "shareholder.subtitle": "Sparat utdelningsutrymme och omkostnadsbelopp anges separat för varje ägare.",
    "field.saved_dividend_space_user": "Användarens sparade utdelningsutrymme",
    "field.saved_dividend_space_spouse": "Makes/makas sparade utdelningsutrymme",
    "field.user_share_cost_basis": "Användarens omkostnadsbelopp",
    "field.spouse_share_cost_basis": "Makes/makas omkostnadsbelopp",
    "field.user_display_name": "Användarens namn",
    "field.spouse_display_name": "Makes/makas namn",
    "field.user_birth_year": "Användarens födelseår",
    "field.spouse_birth_year": "Makes/makas födelseår",
    "field.user_share_percentage": "Användarens aktieandel",
    "field.spouse_share_percentage": "Makes/makas aktieandel",
    "field.user_other_salary_income": "Användarens andra lön utanför bolaget",
    "field.user_car_benefit": "Bilförmån för användaren",
    "field.planned_user_pension": "Planerad tjänstepension för användaren",
    "field.car_benefit_is_pensionable": "Bilförmån räknas in i pensionsunderlaget",
    "field.car_benefit_is_pensionable_hint": "Räkna med bilförmånen",
    "field.periodization_fund_change": "Planerad avsättning (+) eller återföring (-) av periodiseringsfond",
    "field.periodization_fund_change_hint": "Positivt belopp minskar årets skattemässiga resultat. Negativt belopp betyder återföring från tidigare periodiseringsfond.",
    "field.opening_periodization_fund_balance": "Ingående saldo i periodiseringsfond",
    "field.opening_retained_earnings_hint": "Ange utdelningsbart fritt eget kapital från senast fastställda bokslut. Årets resultat anges separat ovan.",
    "info.company_result_before_corporate_tax": "Det här är bolagets resultat efter vanliga kostnader, men före bolagsskatt. Appen testar sedan olika nivåer på din lön ovanpå det beloppet.",
    "info.opening_retained_earnings": "Det här är pengar från tidigare år som redan får delas ut enligt senast fastställda bokslut. Det är alltså inte samma sak som årets vinst.",
    "info.periodization_fund_change": "Ange ett positivt belopp om du vill skjuta en del av årets vinst framåt och sänka skatten nu. Ange ett negativt belopp om du vill återföra en tidigare periodiseringsfond till beskattning i år.",
    "info.prior_year_company_cash_salaries": "Det här är bolagets totala kontanta löner under lönebasåret. Uppgiften används för att räkna fram det lönebaserade utdelningsutrymmet.",
    "info.prior_year_user_company_salary": "Det här är din egen kontanta lön från bolaget under lönebasåret. Appen använder den för att se om ditt utdelningsutrymme får använda löneunderlaget.",
    "info.municipal_tax_rate": "Fältet autoifylls med kommunal och regional inkomstskatt från vald kommun. Begravningsavgift och eventuell kyrkoavgift hanteras separat i beräkningen. Du kan fortfarande ändra den synliga procentsatsen manuellt.",
    "info.car_benefit_is_pensionable": "Kryssa bara i detta om ert pensionsupplägg faktiskt räknar bilförmånen som pensionsgrundande lön. Är du osäker är det normalt säkrast att låta den vara av. Det påverkar bara hur stor tjänstepension modellen tillåter.",
    "info.user_share_percentage": "Det enklaste normala sättet att ändra ägarandel är oftast att en ägare överlåter aktier till den andra genom gåva eller försäljning. Kontrollera bolagsordning och eventuellt aktieägaravtal, skriv en överlåtelsehandling, uppdatera aktieboken direkt och anmäl ändringen via verksamt.se.",
    "compensation.title": "Justeringar i ersättningen",
    "compensation.subtitle": "Bilförmån, tjänstepension och periodiseringsfond modelleras ovanpå vald kontant lön.",
    "placeholder.user_display_name": "Ditt namn",
    "placeholder.spouse_display_name": "Namn på make/maka",
    "button.calculate": "Beräkna rekommendation",
    "button.reset": "Återställ sparade värden",
    "inputs.helper": "Appen sparar formulärvärden i webbläsarens lokala lagring och återställer dem vid omladdning.",
    "recommended.title": "Rekommenderad plan",
    "recommended.subtitle": "Närmast målet, därefter prioritet på lägre total skatt.",
    "recommended.empty": "Skicka formuläret för att få en rekommendation.",
    "recommended.final_title": "Slutligt förslag",
    "recommended.final_summary_current": "Ta ut {salary} i lön, {dividend} i total utdelning och behåll aktiefördelningen {userName} {userShare} % / {spouseName} {spouseShare} %.",
    "recommended.final_summary_suggested": "Ta ut {salary} i lön, {dividend} i total utdelning och överväg aktiefördelningen {userName} {userShare} % / {spouseName} {spouseShare} %.",
    "recommended.final_status_pending": "Ägarfördelningen verifieras fortfarande i bakgrunden.",
    "recommended.final_status_same": "Det här är modellens bästa helhetsförslag givet nuvarande indata.",
    "recommended.final_status_better": "Modellen hittar ett bättre hushållsutfall med den föreslagna aktiefördelningen än med nuvarande fördelning.",
    "breakdown.title": "Nedbrytning",
    "breakdown.subtitle": "Bolagets kassaflöde, löneskatt, utdelningsskatt och utdelningsutrymme.",
    "alternatives.title": "Alternativa scenarier",
    "alternatives.subtitle": "Jämförelsepunkter runt rekommendationen.",
    "assumptions.title": "Så togs resultatet fram",
    "assumptions.subtitle": "Årskoppling, antaganden och regelnoter.",
    "metric.recommended_salary": "Rekommenderad lön",
    "metric.recommended_salary_sub": "Kontant bruttoårslön från bolaget",
    "metric.recommended_dividend": "Rekommenderad total utdelning",
    "metric.recommended_dividend_sub": "Fördelas enligt nuvarande aktieägande",
    "metric.user_net": "Användarens netto från bolaget",
    "metric.user_net_sub": "Närmaste modellerade nivå mot önskat mål",
    "metric.household_net": "Hushållets netto från bolaget",
    "metric.household_net_sub": "Användarens nettolön plus båda ägarnas nettoutdelning",
    "metric.distance_to_target": "Avstånd till mål",
    "metric.distance_target_reached": "Målet nås eller överskrids marginellt",
    "metric.distance_target_shortfall": "Målet nås inte fullt ut i detta scenario",
    "metric.total_tax_burden": "Total skattebelastning",
    "metric.total_tax_burden_sub": "Arbetsgivaravgifter, bolagsskatt, löneskatt och utdelningsskatt",
    "breakdown.company_budget": "Bolagsbudget",
    "breakdown.user_salary_tax": "Användarens löneskatt",
    "breakdown.dividend_room": "Utdelningsutrymme",
    "breakdown.dividend_taxation": "Utdelningsbeskattning",
    "label.profit_before_owner_salary": "Resultat före bolagsskatt",
    "label.owner_salary": "Ägarlön",
    "label.employer_contributions": "Arbetsgivaravgifter",
    "label.corporate_tax": "Bolagsskatt",
    "label.available_dividend_cash": "Tillgänglig utdelningslikvid",
    "label.gross_salary": "Bruttolön",
    "label.cash_salary": "Kontant lön",
    "label.user_other_salary_income": "Annan lön utanför bolaget",
    "label.car_benefit": "Bilförmån",
    "label.taxable_company_income": "Skattepliktig ersättning från bolaget",
    "label.base_deduction": "Grundavdrag",
    "label.municipal_tax": "Kommunal skatt",
    "label.burial_fee_tax": "Begravningsavgift",
    "label.church_fee_tax": "Kyrkoavgift",
    "label.state_tax": "Statlig skatt",
    "label.incremental_salary_tax": "Tillkommande skatt från bolaget",
    "label.net_salary": "Nettolön",
    "label.net_cash_salary": "Nettokontant lön",
    "label.pension": "Tjänstepension",
    "label.pension_slp": "Särskild löneskatt på pension",
    "label.periodization_fund_change": "Periodiseringsfond",
    "label.user_room": "Användarens utrymme",
    "label.user_rule": "Använd regel",
    "label.spouse_room": "Makes/makas utrymme",
    "label.spouse_rule": "Make/maka regel",
    "label.salary_basis_year": "Lönebasår",
    "label.user_qualified_dividend": "Användarens kvalificerade utdelning",
    "label.user_service_taxed_excess": "Användarens tjänstebeskattade överskjutande del",
    "label.spouse_qualified_dividend": "Makes/makas kvalificerade utdelning",
    "label.spouse_service_taxed_excess": "Makes/makas tjänstebeskattade överskjutande del",
    "label.combined_dividend_tax": "Samlad utdelningsskatt",
    "alternative.dividend_led": "Utdelningsdrivet",
    "alternative.dividend_led_desc": "Lägre lön med större tyngd på utdelning.",
    "alternative.near_state_breakpoint": "Nära brytpunkten för statlig skatt",
    "alternative.near_state_breakpoint_desc": "Lön pressad nära brytpunkten innan mer utdelning används.",
    "alternative.maximum_user_net": "Maximal användarnetto",
    "alternative.maximum_user_net_desc": "Högsta netto för användaren som modellen hittar inom bolagets budget.",
    "scenario.salary": "Lön",
    "scenario.total_dividend": "Total utdelning",
    "scenario.user_net": "Användarens netto",
    "scenario.total_tax_burden": "Total skattebelastning",
    "owner.user_default": "Användaren",
    "owner.spouse_default": "Make/maka",
    "noun.dividend_room": "Utrymme",
    "noun.rule": "Regel",
    "noun.qualified_dividend": "Kvalificerad utdelning",
    "noun.service_taxed_excess": "Tjänstebeskattad överskjutande del",
    "ownership.title": "Ägarfördelningsanalys",
    "ownership.input_label": "Indata",
    "ownership.proposal_label": "Förslag",
    "ownership.current_split": "Nuvarande fördelning: {userName} {userSharePercentage} % och {spouseName} {spouseSharePercentage} %.",
    "ownership.better_split": "Modellen hittar ett bättre hushållsutfall om {userName} äger {userSharePercentage} % och {spouseName} {spouseSharePercentage} %.",
    "ownership.optimized_for_household": "Förslaget är optimerat för hushållets maxläge, inte för närmast användarens personliga målnetto.",
    "ownership.tax_saving": "Beräknad förändring i total skatt: {taxSaving}.",
    "ownership.tax_saving_positive": "Total skatt minskar med {taxSaving}.",
    "ownership.tax_saving_negative": "Total skatt ökar med {taxSaving}.",
    "ownership.tax_saving_neutral": "Total skatt är i stort sett oförändrad.",
    "ownership.household_net_gain": "Beräknad ökning av hushållets netto från bolaget: {householdNetGain}.",
    "ownership.no_better_split": "Ingen bättre ägarfördelning hittades inom modellens sökyta.",
    "ownership.no_better_split_detail": "Nuvarande fördelning ser redan stark ut utifrån hushållets netto och total skatt givet inmatningen och de antaganden som används här.",
    "ownership.loading": "Huvudrekommendationen och löne- mot utdelningsanalysen visas redan. Nu testar appen alternativa ägarfördelningar för att se om hushållets netto från bolaget kan förbättras ytterligare.",
    "ownership.loading_title": "Ägarfördelning jämförs i bakgrunden",
    "ownership.loading_detail": "Det här steget påverkar bara förslaget om ägarandelar, inte huvudrekommendationen som redan visas.",
    "mix.title": "Löne- och utdelningsanalys",
    "mix.share_salary": "Andel som lön",
    "mix.share_dividend": "Andel som utdelning",
    "mix.summary_salary_only": "Rekommendationen lutar helt mot lön i det här spannet.",
    "mix.summary_dividend_only": "Rekommendationen lutar helt mot utdelning i det här spannet.",
    "mix.summary_mixed": "Rekommendationen använder en mix där cirka {salarySharePercentage} % tas som lön och {dividendSharePercentage} % som utdelning.",
    "mix.reason_target_priority": "Den här mixen valdes först för att komma så nära användarens nettomål som möjligt.",
    "mix.reason_dividend_room_used": "Utdelning används eftersom det finns kvalificerat utdelningsutrymme att nyttja.",
    "mix.reason_salary_dominant": "Modellen hittar ingen utdelning som förbättrar utfallet jämfört med ren lön i det här läget.",
    "mix.reason_near_state_breakpoint": "Lönen ligger nära brytpunkten för statlig skatt, vilket ofta är ett känsligt område i planeringen.",
    "mix.reason_above_state_breakpoint": "Lönen ligger tydligt över brytpunkten för statlig skatt, vilket betyder att högre lön redan ger statlig skatt.",
    "mix.comparison_more_dividend": "Jämförelse: mer utdelning och lägre lön",
    "mix.comparison_more_salary": "Jämförelse: mer lön och mindre utdelning",
    "mix.comparison_tax_higher": "Total skatt blir {amount} högre.",
    "mix.comparison_tax_lower": "Total skatt blir {amount} lägre.",
    "mix.comparison_net_higher": "Användarens netto blir {amount} högre.",
    "mix.comparison_net_lower": "Användarens netto blir {amount} lägre.",
    "mix.household_title": "Hushållets maxläge",
    "mix.household_same": "Den visade rekommendationen ligger redan vid modellens högsta hushållsnetto.",
    "mix.household_more": "Om fokus i stället är högsta gemensamma netto når modellen {householdNet} för hushållet, vilket är {delta} högre än rekommendationen.",
    "error.calculation_failed": "Beräkningen misslyckades.",
    "error.export_failed": "PDF-exporten misslyckades.",
    "status.calculating": "Beräknar rekommendation...",
    "button.calculating": "Beräknar...",
    "rule.main": "Huvudregeln",
    "rule.simplification": "Förenklingsregeln",
    "rule.new_combined": "2026 års kombinerade regel",
    "note.salary_basis_year": "Planeringsår {planningYear} använder lönedata från {salaryBasisYear} för det lönebaserade utdelningsutrymmet.",
    "note.ownership_structure": "Modellen utgår från att {userName} äger {userSharePercentage} % och {spouseName} {spouseSharePercentage} %, och att endast {userName} tar lön från bolaget.",
    "note.ownership_suggestion_scope": "Ägarfördelningsförslaget är en indikativ skattejämförelse och utgår från att sparat utdelningsutrymme och omkostnadsbelopp följer den nya ekonomiska fördelningen.",
    "note.old_rule_salary_requirement_met": "Det gamla lönekravet är uppfyllt eftersom bolagslönen under basåret är minst {salaryRequirement} SEK.",
    "note.old_rule_salary_requirement_not_met": "Det gamla lönekravet är inte uppfyllt. Bolagslönen under basåret behöver vara cirka {salaryRequirement} SEK för att låsa upp lönebaserat utrymme för 2025.",
    "note.old_rule_saved_space_uplift": "Sparat utdelningsutrymme räknas upp med 4,96 % för 2025 enligt reglerna före 2026.",
    "note.new_rule_combined_method": "2026 års regelverk använder en kombinerad metod: grundbelopp, lönebaserat utrymme, ränta på omkostnadsbelopp över 100 000 SEK och sparat utrymme.",
    "note.new_rule_wage_space_positive": "Det lönebaserade utrymmet är positivt eftersom bolagets kontanta löner under basåret överstiger avdraget på {wageDeduction} SEK.",
    "note.new_rule_wage_space_zero": "Det lönebaserade utrymmet är noll eftersom bolagets kontanta löner under basåret inte överstiger avdraget på {wageDeduction} SEK.",
    "assumption.swedish_limited_company": "Den aktuella modellen avser ett svenskt privat aktiebolag med två makar där {userName} äger {userSharePercentage} % och {spouseName} {spouseSharePercentage} %.",
    "assumption.only_user_company_salary": "Endast {userName} antas ta lön från bolaget.",
    "assumption.dividend_limited_to_profit_and_retained": "Utdelning begränsas till aktuell vinst efter lönekostnad och eventuell ingående fri vinst som användaren anger.",
    "assumption.municipal_rate_editable": "Det synliga kommunalskattefältet avser kommunal och regional inkomstskatt. Begravningsavgift och eventuell kyrkoavgift hämtas separat från vald kommun och församling, men den synliga procentsatsen kan fortfarande justeras manuellt.",
    "assumption.official_rule_data": "Appen modellerar årsspecifik löneskatt och 3:12-liknande utdelningsskatt med officiella regeldata för 2025 och 2026.",
    "assumption.spouse_salary_affects_service_tax": "Tjänstebeskattad överskjutande utdelning modelleras som extra tjänsteinkomst där lönen från annan arbetsgivare för {spouseName} påverkar skatteeffekten.",
    "assumption.birth_year_affects_tax": "Födelseår påverkar den personliga beskattningen och arbetsgivaravgiften enligt reglerna som gäller för valt år.",
    "assumption.user_other_salary_income": "Användarens andra lön utanför bolaget behandlas som ytterligare arbetsinkomst och påverkar grundavdrag, jobbskatteavdrag, pensionsavgift och marginalskatt.",
    "assumption.car_benefit_cash_vs_tax": "Bilförmån behandlas som skattepliktig förmån som påverkar skatt och arbetsgivaravgifter, men räknas inte som kontant nettolön mot användarens mål.",
    "assumption.pension_limit": "Tjänstepensionen valideras mot avdragsramen med utgångspunkt i det högsta av innevarande års pensionsunderlag och användarens kontanta lön från föregående år. Bilförmån räknas bara med om den markerats som pensionsgrundande.",
    "assumption.periodization_fund": "Positiv periodiseringsfond minskar årets beskattningsbara resultat. Negativt värde tolkas som återföring och får inte överstiga angivet ingående fondsaldo.",
    "explanation.salary_uses_planning_year": "Lön som tas ut under {planningYear} beskattas med lönereglerna för {planningYear}.",
    "explanation.dividend_uses_salary_basis_year": "Utdelningsutrymmet för {planningYear} använder lönebasåret {salaryBasisYear}.",
    "explanation.recommendation_scoring": "Rekommendationen minimerar först avståndet till användarens nettomål och föredrar därefter lägre total skatt."
  },
  en: {
    "brand.app_name": "TaxSplit",
    "meta.description": "Salary and dividend planning for a Swedish limited company with transparent year-based tax logic.",
    "language.label": "Language",
    "button.export_pdf": "Export PDF",
    "button.exporting_pdf": "Exporting PDF...",
    "hero.eyebrow": "Swedish tax planning for owner-managed companies",
    "hero.lede": "Plan salary and dividends for a Swedish limited company with one chosen planning year. The app explains how the payout year and the salary-base year interact.",
    "hero.supported_years": "Supported years: {years}",
    "hero.ownership": "Flexible spouse ownership split",
    "hero.persistence": "Local browser persistence",
    "inputs.title": "Inputs",
    "inputs.subtitle": "All amounts are annual SEK values.",
    "inputs.people_title": "People",
    "inputs.people_subtitle": "Names and birth years are used in the result view and in age-sensitive tax rules.",
    "inputs.goal_title": "Planning target",
    "inputs.goal_subtitle": "These values steer what the recommendation should optimize toward.",
    "inputs.base_title": "Company and tax basis",
    "inputs.base_subtitle": "These are historical or factual values that the model builds on.",
    "tag.base_data": "Base data",
    "tag.planning_choice": "Planning choice",
    "field.planning_year": "Planning year",
    "field.target_user_net_income": "Desired user net income after tax",
    "field.spouse_external_salary": "Spouse salary from other employer",
    "field.company_result_before_corporate_tax": "Company result before corporate tax",
    "field.opening_retained_earnings": "Opening retained earnings available for dividends",
    "field.tax_municipality": "Municipality for tax auto-fill",
    "field.tax_parish": "Parish",
    "field.include_church_fee": "Member of the Church of Sweden",
    "field.include_church_fee_hint": "Add church fee from the selected parish.",
    "field.municipal_tax_rate": "Municipal tax rate",
    "field.tax_option_placeholder": "Select municipality",
    "field.parish_option_placeholder": "Select parish",
    "salary_basis.title": "Salary-base year for dividend room",
    "salary_basis.text": "For planning year {planningYear}, the dividend room looks back to salary year {salaryBasisYear}.",
    "field.prior_year_company_cash_salaries": "Company cash salaries in {salaryBasisYear}",
    "field.prior_year_user_company_salary": "User salary from the company in {salaryBasisYear}",
    "shareholder.title": "Shareholder values",
    "shareholder.subtitle": "Saved dividend room and cost basis are entered separately for each owner.",
    "field.saved_dividend_space_user": "User saved dividend space",
    "field.saved_dividend_space_spouse": "Spouse saved dividend space",
    "field.user_share_cost_basis": "User share cost basis",
    "field.spouse_share_cost_basis": "Spouse share cost basis",
    "field.user_display_name": "User name",
    "field.spouse_display_name": "Spouse name",
    "field.user_birth_year": "User birth year",
    "field.spouse_birth_year": "Spouse birth year",
    "field.user_share_percentage": "User ownership share",
    "field.spouse_share_percentage": "Spouse ownership share",
    "field.user_other_salary_income": "User other salary income outside the company",
    "field.user_car_benefit": "Annual car benefit value for the user",
    "field.planned_user_pension": "Planned occupational pension for the user",
    "field.car_benefit_is_pensionable": "Car benefit counts toward pension base",
    "field.car_benefit_is_pensionable_hint": "Include the car benefit",
    "field.periodization_fund_change": "Planned periodization fund allocation (+) or reversal (-)",
    "field.periodization_fund_change_hint": "Positive amounts reduce the current taxable profit. Negative amounts mean reversal from an existing periodization fund balance.",
    "field.opening_periodization_fund_balance": "Opening periodization fund balance",
    "field.opening_retained_earnings_hint": "Use the distributable retained earnings from the latest adopted accounts. Current-year profit is entered separately above.",
    "info.company_result_before_corporate_tax": "This is the company's result after ordinary business costs, but before corporate tax. The app then tests different owner salary levels on top of that amount.",
    "info.opening_retained_earnings": "This is money from earlier years that can already be distributed according to the latest adopted annual accounts. It is not the same thing as this year's profit.",
    "info.periodization_fund_change": "Use a positive amount if you want to move part of this year's profit forward and lower tax now. Use a negative amount if you want to bring an earlier periodization fund back into taxation this year.",
    "info.prior_year_company_cash_salaries": "This is the company's total cash salary paid in the salary-base year. It is used to calculate the wage-linked part of the dividend room.",
    "info.prior_year_user_company_salary": "This is your own cash salary from the company in the salary-base year. The app uses it to test whether your dividend room can use the salary-based rule.",
    "info.municipal_tax_rate": "The field auto-fills municipal and regional income tax from the selected municipality. Burial fee and any church fee are handled separately in the calculation. You can still edit the visible rate manually.",
    "info.car_benefit_is_pensionable": "Tick this only if your pension setup actually treats the car benefit as pensionable salary. If you are unsure, it is usually safer to leave it unticked. It only changes how much occupational pension the model allows.",
    "info.user_share_percentage": "The simplest normal route is usually that one owner transfers shares to the other through a gift or sale. Check the articles of association and any shareholders' agreement first, write a transfer agreement, update the share register immediately, and report the change through verksamt.se.",
    "compensation.title": "Compensation adjustments",
    "compensation.subtitle": "Benefit value, pension, and periodization fund are modelled on top of the selected cash salary.",
    "placeholder.user_display_name": "Your name",
    "placeholder.spouse_display_name": "Spouse name",
    "button.calculate": "Calculate recommendation",
    "button.reset": "Reset saved values",
    "inputs.helper": "The app stores your form values in local browser storage and restores them on reload.",
    "recommended.title": "Recommended plan",
    "recommended.subtitle": "Closest to the target, then biased toward lower total tax.",
    "recommended.empty": "Submit the form to generate a recommendation.",
    "recommended.final_title": "Final recommendation",
    "recommended.final_summary_current": "Take {salary} as salary, {dividend} as total dividend, and keep the ownership split at {userName} {userShare}% / {spouseName} {spouseShare}%.",
    "recommended.final_summary_suggested": "Take {salary} as salary, {dividend} as total dividend, and consider the ownership split {userName} {userShare}% / {spouseName} {spouseShare}%.",
    "recommended.final_status_pending": "The ownership split is still being verified in the background.",
    "recommended.final_status_same": "This is the model's best overall proposal based on the current inputs.",
    "recommended.final_status_better": "The model finds a better household outcome with the suggested ownership split than with the current split.",
    "breakdown.title": "Breakdown",
    "breakdown.subtitle": "Company cash flow, salary tax, dividend tax, and dividend room.",
    "alternatives.title": "Alternative scenarios",
    "alternatives.subtitle": "Useful comparison points around the recommendation.",
    "assumptions.title": "How the result was derived",
    "assumptions.subtitle": "Year linkage, assumptions, and rule notes.",
    "metric.recommended_salary": "Recommended salary",
    "metric.recommended_salary_sub": "Gross annual cash salary from the company",
    "metric.recommended_dividend": "Recommended total dividend",
    "metric.recommended_dividend_sub": "Allocated according to the current ownership split",
    "metric.user_net": "User net income",
    "metric.user_net_sub": "Closest modelled value to the requested target",
    "metric.household_net": "Household net from company",
    "metric.household_net_sub": "User net salary plus both owners' net dividends",
    "metric.distance_to_target": "Distance to target",
    "metric.distance_target_reached": "The target is reached or slightly exceeded",
    "metric.distance_target_shortfall": "The target is not fully reached in this scenario",
    "metric.total_tax_burden": "Total tax burden",
    "metric.total_tax_burden_sub": "Employer charges, corporate tax, salary tax, and dividend tax",
    "breakdown.company_budget": "Company budget",
    "breakdown.user_salary_tax": "User salary tax",
    "breakdown.dividend_room": "Dividend room",
    "breakdown.dividend_taxation": "Dividend taxation",
    "label.profit_before_owner_salary": "Result before corporate tax",
    "label.owner_salary": "Owner salary",
    "label.employer_contributions": "Employer contributions",
    "label.corporate_tax": "Corporate tax",
    "label.available_dividend_cash": "Available dividend cash",
    "label.gross_salary": "Gross salary",
    "label.cash_salary": "Cash salary",
    "label.user_other_salary_income": "Other salary outside the company",
    "label.car_benefit": "Car benefit",
    "label.taxable_company_income": "Taxable company compensation",
    "label.base_deduction": "Base deduction",
    "label.municipal_tax": "Municipal tax",
    "label.burial_fee_tax": "Burial fee",
    "label.church_fee_tax": "Church fee",
    "label.state_tax": "State tax",
    "label.incremental_salary_tax": "Incremental tax from company",
    "label.net_salary": "Net salary",
    "label.net_cash_salary": "Net cash salary",
    "label.pension": "Occupational pension",
    "label.pension_slp": "Special payroll tax on pension",
    "label.periodization_fund_change": "Periodization fund",
    "label.user_room": "User room",
    "label.user_rule": "User rule",
    "label.spouse_room": "Spouse room",
    "label.spouse_rule": "Spouse rule",
    "label.salary_basis_year": "Salary-base year",
    "label.user_qualified_dividend": "User qualified dividend",
    "label.user_service_taxed_excess": "User service-taxed excess",
    "label.spouse_qualified_dividend": "Spouse qualified dividend",
    "label.spouse_service_taxed_excess": "Spouse service-taxed excess",
    "label.combined_dividend_tax": "Combined dividend tax",
    "alternative.dividend_led": "Dividend-led",
    "alternative.dividend_led_desc": "Lower salary focus with heavier reliance on dividends.",
    "alternative.near_state_breakpoint": "Near state tax breakpoint",
    "alternative.near_state_breakpoint_desc": "Salary pushed close to the state income tax breakpoint before dividends.",
    "alternative.maximum_user_net": "Maximum user net",
    "alternative.maximum_user_net_desc": "Highest user after-tax income the model can find within the company budget.",
    "scenario.salary": "Salary",
    "scenario.total_dividend": "Total dividend",
    "scenario.user_net": "User net",
    "scenario.total_tax_burden": "Total tax burden",
    "owner.user_default": "User",
    "owner.spouse_default": "Spouse",
    "noun.dividend_room": "Dividend room",
    "noun.rule": "Rule",
    "noun.qualified_dividend": "Qualified dividend",
    "noun.service_taxed_excess": "Service-taxed excess",
    "ownership.title": "Ownership analysis",
    "ownership.input_label": "Input",
    "ownership.proposal_label": "Proposal",
    "ownership.current_split": "Current split: {userName} {userSharePercentage}% and {spouseName} {spouseSharePercentage}%.",
    "ownership.better_split": "The model finds a better household outcome if {userName} owns {userSharePercentage}% and {spouseName} owns {spouseSharePercentage}%.",
    "ownership.optimized_for_household": "This proposal is optimized for the household maximum, not for the closest match to the user's personal net-income target.",
    "ownership.tax_saving": "Estimated change in total tax: {taxSaving}.",
    "ownership.tax_saving_positive": "Total tax decreases by {taxSaving}.",
    "ownership.tax_saving_negative": "Total tax increases by {taxSaving}.",
    "ownership.tax_saving_neutral": "Total tax is broadly unchanged.",
    "ownership.household_net_gain": "Estimated increase in household net from the company: {householdNetGain}.",
    "ownership.no_better_split": "No better ownership split was found within the model search space.",
    "ownership.no_better_split_detail": "The current split already looks strong on household net and total tax given the inputs and assumptions used here.",
    "ownership.loading": "The main recommendation and the salary-versus-dividend analysis are already shown. The app is now testing alternative ownership splits to see whether household net from the company can be improved further.",
    "ownership.loading_title": "Ownership split is being compared in the background",
    "ownership.loading_detail": "This step only affects the ownership suggestion, not the main recommendation that is already visible.",
    "mix.title": "Salary vs dividend analysis",
    "mix.share_salary": "Share taken as salary",
    "mix.share_dividend": "Share taken as dividend",
    "mix.summary_salary_only": "The recommendation leans entirely toward salary in this range.",
    "mix.summary_dividend_only": "The recommendation leans entirely toward dividends in this range.",
    "mix.summary_mixed": "The recommendation uses a mix where about {salarySharePercentage}% is taken as salary and {dividendSharePercentage}% as dividends.",
    "mix.reason_target_priority": "This mix was selected first to stay as close as possible to the user's net-income target.",
    "mix.reason_dividend_room_used": "Dividends are used because qualified dividend room is available.",
    "mix.reason_salary_dominant": "The model does not find any dividend usage that improves the result compared with salary only in this case.",
    "mix.reason_near_state_breakpoint": "Salary is close to the state-tax breakpoint, which is often a sensitive planning zone.",
    "mix.reason_above_state_breakpoint": "Salary is clearly above the state-tax breakpoint, so extra salary already triggers state tax.",
    "mix.comparison_more_dividend": "Comparison: more dividend and lower salary",
    "mix.comparison_more_salary": "Comparison: more salary and less dividend",
    "mix.comparison_tax_higher": "Total tax becomes {amount} higher.",
    "mix.comparison_tax_lower": "Total tax becomes {amount} lower.",
    "mix.comparison_net_higher": "The user's net income becomes {amount} higher.",
    "mix.comparison_net_lower": "The user's net income becomes {amount} lower.",
    "mix.household_title": "Household maximum",
    "mix.household_same": "The shown recommendation already sits at the model's highest household net income.",
    "mix.household_more": "If the focus is instead the highest combined household net income, the model reaches {householdNet}, which is {delta} higher than the recommendation.",
    "error.calculation_failed": "Calculation failed.",
    "error.export_failed": "PDF export failed.",
    "status.calculating": "Calculating recommendation...",
    "button.calculating": "Calculating...",
    "rule.main": "Main rule",
    "rule.simplification": "Simplification rule",
    "rule.new_combined": "2026 combined rule",
    "note.salary_basis_year": "Planning year {planningYear} uses salary data from {salaryBasisYear} for the wage-linked dividend room.",
    "note.ownership_structure": "The model uses an ownership split where {userName} owns {userSharePercentage}% and {spouseName} owns {spouseSharePercentage}%, and only {userName} receives salary from the company.",
    "note.ownership_suggestion_scope": "The ownership suggestion is an indicative tax comparison and assumes saved dividend room and cost basis follow the new economic split.",
    "note.old_rule_salary_requirement_met": "The old salary-threshold test is met because prior-year company salary is at least {salaryRequirement} SEK.",
    "note.old_rule_salary_requirement_not_met": "The old salary-threshold test is not met. Prior-year company salary needs about {salaryRequirement} SEK to unlock wage-based space for 2025.",
    "note.old_rule_saved_space_uplift": "Saved dividend room is uplifted by 4.96% for 2025 under the pre-2026 rules.",
    "note.new_rule_combined_method": "The 2026 rule set uses one combined method: ground amount, wage-based room, interest on cost basis above 100,000 SEK, and saved room.",
    "note.new_rule_wage_space_positive": "The wage-based room is positive because prior-year company cash salaries exceed the deduction amount of {wageDeduction} SEK.",
    "note.new_rule_wage_space_zero": "The wage-based room is zero because prior-year company cash salaries do not exceed the deduction amount of {wageDeduction} SEK.",
    "assumption.swedish_limited_company": "The current model covers a Swedish private limited company with two spouse owners where {userName} owns {userSharePercentage}% and {spouseName} owns {spouseSharePercentage}%.",
    "assumption.only_user_company_salary": "Only {userName} receives salary from the company.",
    "assumption.dividend_limited_to_profit_and_retained": "Dividends are limited to current-year profit after salary cost and any opening retained earnings entered by the user.",
    "assumption.municipal_rate_editable": "The visible municipal-tax field covers municipal and regional income tax. Burial fee and any church fee are fetched separately from the selected municipality and parish, while the visible percentage remains manually editable.",
    "assumption.official_rule_data": "The app models year-specific salary tax and 3:12-style dividend tax using official 2025 and 2026 rule data.",
    "assumption.spouse_salary_affects_service_tax": "Service-taxed excess dividend is modelled as additional service income with salary from another employer for {spouseName} affecting that personal tax outcome.",
    "assumption.birth_year_affects_tax": "Birth year affects personal taxation and employer contributions under the rules for the selected year.",
    "assumption.user_other_salary_income": "The user's other salary outside the company is treated as additional earned income and affects base deduction, earned-income credit, pension fee, and marginal tax.",
    "assumption.car_benefit_cash_vs_tax": "Car benefit is treated as a taxable benefit that affects tax and employer contributions, but it is not counted as cash net income toward the user's target.",
    "assumption.pension_limit": "The occupational pension is checked against the deduction envelope using the higher of the current pension base and the user's prior-year cash salary. Car benefit is included only if marked as pensionable.",
    "assumption.periodization_fund": "A positive periodization-fund amount reduces current taxable profit and a negative amount cannot exceed the stated opening balance.",
    "explanation.salary_uses_planning_year": "Salary paid during {planningYear} is taxed using {planningYear} salary-tax rules.",
    "explanation.dividend_uses_salary_basis_year": "Dividend room for {planningYear} uses the salary base year {salaryBasisYear}.",
    "explanation.recommendation_scoring": "The recommendation minimizes distance to the user's after-tax target and then prefers lower total tax burden."
  }
};

const YEAR_DEFAULTS = {
  2025: { municipalTaxRate: 32.41, burialFeeRate: 0.293 },
  2026: { municipalTaxRate: 32.38, burialFeeRate: 0.292 },
};

let currentLanguage = localStorage.getItem(LANGUAGE_KEY) || "sv";
let lastResult = null;
let taxCatalog = new Map();
let municipalTaxManualOverride = false;
let applyingMunicipalTaxRate = false;

function formatCurrency(value) {
  return new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-US", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function getTranslation(key) {
  return TRANSLATIONS[currentLanguage][key] || TRANSLATIONS.en[key] || key;
}

function interpolate(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (_, token) => {
    const value = params[token];
    return value === undefined ? `{${token}}` : value;
  });
}

function t(key, params = {}) {
  return interpolate(getTranslation(key), params);
}

function formatDisplayName(value) {
  const normalized = String(value || "").trim().toLocaleLowerCase("sv-SE");
  return normalized
    .split(/(\s+|\/|-)/)
    .map((segment) => {
      if (!segment || /^\s+$/.test(segment) || segment === "/" || segment === "-") {
        return segment;
      }
      return segment.charAt(0).toLocaleUpperCase("sv-SE") + segment.slice(1);
    })
    .join("");
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;
  languageSwitch.value = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const params = element.dataset.i18nVars ? JSON.parse(element.dataset.i18nVars) : {};
    element.textContent = t(element.dataset.i18n, params);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });
  metaDescription.setAttribute("content", t("meta.description"));
  pageTitle.textContent = t("brand.app_name");
  appNameElement.textContent = t("brand.app_name");
}

function readSavedState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { ...window.APP_DEFAULTS };
  }

  try {
    const parsed = JSON.parse(saved);
    if (parsed.user_other_salary_income === undefined && parsed.user_other_service_income !== undefined) {
      parsed.user_other_salary_income = parsed.user_other_service_income;
    }
    return { ...window.APP_DEFAULTS, ...parsed };
  } catch {
    return { ...window.APP_DEFAULTS };
  }
}

function normalizeNumericToken(token, kind = "amount") {
  if (kind === "percent") {
    const lastComma = token.lastIndexOf(",");
    const lastDot = token.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    return decimalSeparator === ","
      ? token.replace(/\./g, "").replace(",", ".")
      : token.replace(/,/g, "");
  }

  return token.replace(/[,.]/g, "");
}

function evaluateArithmeticExpression(raw, kind = "amount") {
  const compact = String(raw || "").replace(/\s+/g, "");
  if (!/[+\-*/()]/.test(compact) || !/^[0-9+\-*/().,]+$/.test(compact)) {
    return null;
  }

  const tokens = compact.match(/[0-9][0-9.,]*|[()+\-*/]/g);
  if (!tokens || tokens.join("") !== compact) {
    return null;
  }

  let index = 0;

  function parseExpression() {
    let value = parseTerm();
    while (tokens[index] === "+" || tokens[index] === "-") {
      const operator = tokens[index++];
      const rhs = parseTerm();
      value = operator === "+" ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    while (tokens[index] === "*" || tokens[index] === "/") {
      const operator = tokens[index++];
      const rhs = parseFactor();
      if (operator === "/" && rhs === 0) {
        throw new Error("Division by zero");
      }
      value = operator === "*" ? value * rhs : value / rhs;
    }
    return value;
  }

  function parseFactor() {
    const token = tokens[index];

    if (token === "+") {
      index += 1;
      return parseFactor();
    }

    if (token === "-") {
      index += 1;
      return -parseFactor();
    }

    if (token === "(") {
      index += 1;
      const value = parseExpression();
      if (tokens[index] !== ")") {
        throw new Error("Missing closing parenthesis");
      }
      index += 1;
      return value;
    }

    if (!token || !/^[0-9]/.test(token)) {
      throw new Error("Invalid token");
    }

    index += 1;
    const normalized = normalizeNumericToken(token, kind);
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid number");
    }
    return parsed;
  }

  try {
    const value = parseExpression();
    if (index !== tokens.length || !Number.isFinite(value)) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function parseLocaleNumber(value, kind = "amount") {
  if (typeof value === "number") {
    return value;
  }
  const raw = String(value || "").trim().replace(/\s/g, "");
  if (!raw) {
    return 0;
  }

  const expressionValue = evaluateArithmeticExpression(raw, kind);
  if (expressionValue !== null) {
    return expressionValue;
  }

  if (kind === "amount") {
    const parsed = Number(raw.replace(/[,.]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (kind === "signed-amount") {
    const normalized = raw.startsWith("-")
      ? `-${raw.slice(1).replace(/[,.]/g, "")}`
      : raw.replace(/[,.]/g, "");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : ".";
  const normalized = decimalSeparator === ","
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw.replace(/,/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatInputValue(value, kind = "amount") {
  const number = parseLocaleNumber(value, kind);
  if (kind === "percent") {
    return new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);
  }
  return new Intl.NumberFormat(currentLanguage === "sv" ? "sv-SE" : "en-US", {
    maximumFractionDigits: 0,
  }).format(number);
}

function refreshFormattedInputs() {
  numericInputs.forEach((input) => {
    input.value = formatInputValue(input.value, input.dataset.numberKind);
  });
  syncOwnershipDisplay();
}

function formatNumericField(input) {
  const kind = input.dataset.numberKind;
  if (!kind) {
    return;
  }
  input.value = formatInputValue(input.value, kind);
}

function formToObject() {
  const values = {};

  Array.from(form.elements).forEach((field) => {
    if (!field?.name || field.disabled) {
      return;
    }

    if (field.type === "checkbox") {
      values[field.name] = field.checked;
      return;
    }

    const kind = field.dataset?.numberKind;
    if (!kind) {
      values[field.name] = String(field.value || "").trim();
      return;
    }

    values[field.name] = parseLocaleNumber(field.value, kind);
  });

  return values;
}

function getOwnerName(ownerType) {
  const input = ownerType === "user" ? userDisplayNameInput : spouseDisplayNameInput;
  const value = String(input?.value || "").trim();
  if (value) {
    return value;
  }
  return t(ownerType === "user" ? "owner.user_default" : "owner.spouse_default");
}

function ownerLabel(ownerType, nounKey) {
  return `${getOwnerName(ownerType)}: ${t(nounKey)}`;
}

function ownerSpecificText(kind, ownerType, params = {}) {
  const owner = getOwnerName(ownerType);

  if (currentLanguage === "sv") {
    if (kind === "birth_year") return `Födelseår för ${owner}`;
    if (kind === "target_net_income") return `Önskad nettoinkomst efter skatt för ${owner}`;
    if (kind === "other_salary_income") return `Annan lön utanför bolaget för ${owner}`;
    if (kind === "external_salary") return `Lön från annan arbetsgivare för ${owner}`;
    if (kind === "salary_from_company") return `Lön från bolaget under ${params.salaryBasisYear} för ${owner}`;
    if (kind === "saved_dividend_space") return `Sparat utdelningsutrymme för ${owner}`;
    if (kind === "share_cost_basis") return `Omkostnadsbelopp för ${owner}`;
    if (kind === "car_benefit") return `Bilförmån för ${owner}`;
    if (kind === "pension") return `Planerad tjänstepension för ${owner}`;
    if (kind === "salary_tax") return `Löneskatt för ${owner}`;
    if (kind === "net_from_company") return `Netto från bolaget för ${owner}`;
    if (kind === "net_from_company_sub") return `Närmaste modellerade nivå mot målet för ${owner}`;
    if (kind === "scenario_net") return `Netto för ${owner}`;
  }

  if (kind === "birth_year") return `Birth year for ${owner}`;
  if (kind === "target_net_income") return `Desired net income after tax for ${owner}`;
  if (kind === "other_salary_income") return `Other salary outside the company for ${owner}`;
  if (kind === "external_salary") return `Salary from another employer for ${owner}`;
  if (kind === "salary_from_company") return `Salary from the company in ${params.salaryBasisYear} for ${owner}`;
  if (kind === "saved_dividend_space") return `Saved dividend space for ${owner}`;
  if (kind === "share_cost_basis") return `Share cost basis for ${owner}`;
  if (kind === "car_benefit") return `Car benefit for ${owner}`;
  if (kind === "pension") return `Planned occupational pension for ${owner}`;
  if (kind === "salary_tax") return `Salary tax for ${owner}`;
  if (kind === "net_from_company") return `Net income from company for ${owner}`;
  if (kind === "net_from_company_sub") return `Closest modelled value to the target for ${owner}`;
  if (kind === "scenario_net") return `Net income for ${owner}`;
  return owner;
}

function setFieldLabels(year) {
  const salaryBasisYear = Number(year) - 1;
  document.querySelector("#salary-basis-text").textContent = t("salary_basis.text", {
    planningYear: year,
    salaryBasisYear,
  });
  document.querySelector("#company-salary-label").textContent = t("field.prior_year_company_cash_salaries", {
    salaryBasisYear,
  });
  document.querySelector("#user-salary-label").textContent = ownerSpecificText("salary_from_company", "user", {
    salaryBasisYear,
  });
  targetNetIncomeLabel.textContent = ownerSpecificText("target_net_income", "user");
  userBirthYearLabel.textContent = ownerSpecificText("birth_year", "user");
  spouseBirthYearLabel.textContent = ownerSpecificText("birth_year", "spouse");
  userOtherSalaryIncomeLabel.textContent = ownerSpecificText("other_salary_income", "user");
  spouseExternalSalaryLabel.textContent = ownerSpecificText("external_salary", "spouse");
  userCarBenefitLabel.textContent = ownerSpecificText("car_benefit", "user");
  plannedUserPensionLabel.textContent = ownerSpecificText("pension", "user");
  userSavedDividendSpaceLabel.textContent = ownerSpecificText("saved_dividend_space", "user");
  spouseSavedDividendSpaceLabel.textContent = ownerSpecificText("saved_dividend_space", "spouse");
  userShareCostBasisLabel.textContent = ownerSpecificText("share_cost_basis", "user");
  spouseShareCostBasisLabel.textContent = ownerSpecificText("share_cost_basis", "spouse");
}

function syncOwnershipDisplay() {
  const userShare = Math.min(Math.max(parseLocaleNumber(form.elements.namedItem("user_share_percentage").value, "percent"), 0), 100);
  userShareLabel.textContent = getOwnerName("user");
  spouseShareLabel.textContent = getOwnerName("spouse");
  userShareDisplay.textContent = `${formatInputValue(userShare, "percent")} %`;
  spouseShareDisplay.textContent = `${formatInputValue(100 - userShare, "percent")} %`;
  setFieldLabels(yearInput.value);
}

function setFieldValue(field, value) {
  if (field.type === "checkbox") {
    field.checked = Boolean(value);
    return;
  }
  field.value = value ?? "";
}

async function fetchTaxCatalog(year) {
  if (taxCatalog.has(year)) {
    return taxCatalog.get(year);
  }

  const response = await fetch(`/api/municipal-tax/${year}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || t("error.calculation_failed"));
  }

  const payload = await response.json();
  taxCatalog.set(year, payload.municipalities);
  return payload.municipalities;
}

function selectedMunicipalityRecord() {
  const municipalities = taxCatalog.get(Number(yearInput.value)) || [];
  return municipalities.find((item) => item.municipality === taxMunicipalitySelect.value) || null;
}

function populateTaxMunicipalities(selectedMunicipality = "") {
  const municipalities = taxCatalog.get(Number(yearInput.value)) || [];
  const selectedValue = selectedMunicipality || taxMunicipalitySelect.value;
  const placeholder = t("field.tax_option_placeholder");

  taxMunicipalitySelect.innerHTML = [
    `<option value="">${placeholder}</option>`,
    ...municipalities.map((item) => {
      const selected = item.municipality === selectedValue ? " selected" : "";
      return `<option value="${item.municipality}"${selected}>${formatDisplayName(item.municipality)}</option>`;
    }),
  ].join("");
}

function populateTaxParishes(selectedParish = "") {
  const municipality = selectedMunicipalityRecord();
  const selectedValue = selectedParish || taxParishSelect.value;
  const placeholder = t("field.parish_option_placeholder");
  const parishes = municipality?.parishes || [];

  taxParishSelect.innerHTML = [
    `<option value="">${placeholder}</option>`,
    ...parishes.map((item) => {
      const selected = item.parish === selectedValue ? " selected" : "";
      return `<option value="${item.parish}"${selected}>${formatDisplayName(item.parish)}</option>`;
    }),
  ].join("");

  if (includeChurchFeeInput.checked && parishes.length > 0 && !taxParishSelect.value) {
    taxParishSelect.value = parishes[0].parish;
  }
}

function syncParishFieldVisibility() {
  const municipality = selectedMunicipalityRecord();
  const showParishField = includeChurchFeeInput.checked && Boolean(municipality?.parishes?.length);
  taxParishField.classList.toggle("hidden", !showParishField);
  taxParishSelect.disabled = !showParishField;
}

function findSelectedParish() {
  const municipality = selectedMunicipalityRecord();
  return municipality?.parishes?.find((item) => item.parish === taxParishSelect.value) || null;
}

function syncLocalTaxComponentInputs() {
  const municipality = selectedMunicipalityRecord();
  const yearDefaults = YEAR_DEFAULTS[Number(yearInput.value)] || YEAR_DEFAULTS[2026];
  if (!municipality) {
    burialFeeRateInput.value = formatInputValue(yearDefaults.burialFeeRate, "percent");
    churchFeeRateInput.value = formatInputValue(0, "percent");
    return;
  }

  burialFeeRateInput.value = formatInputValue(municipality.burial_fee || 0, "percent");
  const parish = findSelectedParish();
  const churchFee = includeChurchFeeInput.checked && parish ? parish.church_fee || 0 : 0;
  churchFeeRateInput.value = formatInputValue(churchFee, "percent");
}

function applyMunicipalTaxAutofill({ force = false } = {}) {
  const municipality = selectedMunicipalityRecord();
  syncLocalTaxComponentInputs();

  if (municipalTaxManualOverride && !force) {
    return;
  }
  const yearDefaults = YEAR_DEFAULTS[Number(yearInput.value)] || YEAR_DEFAULTS[2026];
  const localIncomeTax = municipality
    ? (municipality.municipal_tax || 0) + (municipality.regional_tax || 0)
    : yearDefaults.municipalTaxRate;

  applyingMunicipalTaxRate = true;
  municipalTaxRateInput.value = formatInputValue(localIncomeTax, "percent");
  applyingMunicipalTaxRate = false;
}

async function syncMunicipalTaxSelectors({ year, municipality, parish, forceAutofill = false } = {}) {
  const targetYear = Number(year || yearInput.value);
  yearInput.value = String(targetYear);
  await fetchTaxCatalog(targetYear);
  populateTaxMunicipalities(municipality);

  if (municipality) {
    taxMunicipalitySelect.value = municipality;
  }

  populateTaxParishes(parish);

  if (parish) {
    taxParishSelect.value = parish;
  }

  syncParishFieldVisibility();
  applyMunicipalTaxAutofill({ force: forceAutofill });
}

async function restoreState() {
  const source = readSavedState();
  municipalTaxManualOverride = Boolean(source._municipal_tax_manual_override);
  yearInput.value = String(source.year || window.APP_DEFAULTS.year);

  await syncMunicipalTaxSelectors({
    year: source.year || window.APP_DEFAULTS.year,
    municipality: source.tax_municipality || "",
    parish: source.tax_parish || "",
    forceAutofill: !municipalTaxManualOverride,
  });

  for (const [key, value] of Object.entries(source)) {
    const field = form.elements.namedItem(key);
    if (field) {
      setFieldValue(field, value);
    }
  }

  populateTaxMunicipalities(source.tax_municipality || "");
  populateTaxParishes(source.tax_parish || "");
  syncParishFieldVisibility();
  syncLocalTaxComponentInputs();
  if (!municipalTaxManualOverride) {
    applyMunicipalTaxAutofill({ force: true });
  }
  refreshFormattedInputs();
  setFieldLabels(source.year || window.APP_DEFAULTS.year);
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...formToObject(),
      _municipal_tax_manual_override: municipalTaxManualOverride,
    }),
  );
}

function saveStateIfFormField(event) {
  if (event.target && event.target.name && form.contains(event.target)) {
    saveState();
  }
}

function positionInfoPopover(popover) {
  const panel = popover.querySelector(".info-panel");
  if (!panel) {
    return;
  }

  popover.classList.remove("align-left", "open-upward");
  const rect = panel.getBoundingClientRect();

  if (rect.left < 16) {
    popover.classList.add("align-left");
  }

  if (rect.bottom > window.innerHeight - 16) {
    popover.classList.add("open-upward");
  }
}

function metric(label, value, subvalue) {
  return `
    <article class="metric">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
      <div class="subvalue">${subvalue}</div>
    </article>
  `;
}

function translateRule(label) {
  if (label === "Main rule") return t("rule.main");
  if (label === "Simplification rule") return t("rule.simplification");
  if (label === "2026 combined rule") return t("rule.new_combined");
  return label;
}

function localizeTranslationParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value !== "number") {
        return [key, value];
      }
      if (/Percentage$/i.test(key)) {
        return [key, formatInputValue(value, "percent")];
      }
      if (["salaryRequirement", "wageDeduction"].includes(key)) {
        return [key, formatInputValue(value, "amount")];
      }
      return [key, value];
    }),
  );
}

function translateMessage(item) {
  if (typeof item === "string") {
    return item;
  }
  const params = {
    userName: getOwnerName("user"),
    spouseName: getOwnerName("spouse"),
    ...localizeTranslationParams(item.params || {}),
  };
  return t(item.key, params);
}

function renderMetrics(result) {
  const recommendation = result.recommended;
  summaryBox.classList.remove("empty-state");
  summaryBox.innerHTML = `
    ${metric(t("metric.recommended_salary"), formatCurrency(recommendation.salary), t("metric.recommended_salary_sub"))}
    ${metric(t("metric.recommended_dividend"), formatCurrency(recommendation.total_dividend), t("metric.recommended_dividend_sub"))}
    ${metric(ownerSpecificText("net_from_company", "user"), formatCurrency(recommendation.user_net_from_company), ownerSpecificText("net_from_company_sub", "user"))}
    ${metric(t("metric.household_net"), formatCurrency(recommendation.household_net_from_company), t("metric.household_net_sub"))}
    ${metric(t("metric.distance_to_target"), formatCurrency(recommendation.distance_to_target), recommendation.shortfall_to_target > 0 ? t("metric.distance_target_shortfall") : t("metric.distance_target_reached"))}
    ${metric(t("metric.total_tax_burden"), formatCurrency(recommendation.total_tax_burden), t("metric.total_tax_burden_sub"))}
  `;
}

function renderFinalPlan(result) {
  const recommendation = result.recommended;
  const suggestion = result.ownership_suggestion;
  const userShare = suggestion ? suggestion.suggested_user_share_percentage : result.input.user_share_percentage;
  const spouseShare = suggestion ? suggestion.suggested_spouse_share_percentage : (100 - result.input.user_share_percentage);
  const summaryKey = suggestion ? "recommended.final_summary_suggested" : "recommended.final_summary_current";
  const statusKey = suggestion
    ? "recommended.final_status_better"
    : (result.ownership_suggestion === undefined ? "recommended.final_status_pending" : "recommended.final_status_same");

  finalPlanBox.innerHTML = `
    <div class="note final-plan-note">
      <strong>${t("recommended.final_title")}</strong>
      <p class="final-plan-summary">${t(summaryKey, {
        salary: formatCurrency(recommendation.salary),
        dividend: formatCurrency(recommendation.total_dividend),
        userName: getOwnerName("user"),
        spouseName: getOwnerName("spouse"),
        userShare: formatInputValue(userShare, "percent"),
        spouseShare: formatInputValue(spouseShare, "percent"),
      })}</p>
      <div class="final-plan-status">${t(statusKey)}</div>
    </div>
  `;
}

function comparisonDeltaText(type, amount) {
  if (Math.abs(amount) < 1) {
    amount = 0;
  }
  const value = formatCurrency(Math.abs(amount));
  const direction = amount <= 0 ? "lower" : "higher";
  return t(`mix.comparison_${type}_${direction}`, { amount: value });
}

function renderCompensationMixAnalysis(result) {
  const mix = result.compensation_mix;
  if (!mix) {
    compensationMixBox.innerHTML = "";
    return;
  }

  const comparisons = (mix.comparisons || [])
    .map((entry) => {
      const scenario = entry.scenario;
      return `
        <article class="mix-comparison-card">
          <h4>${t(entry.key)}</h4>
          <div class="kv">
            <div>${t("scenario.salary")}</div><div>${formatCurrency(scenario.salary)}</div>
            <div>${t("scenario.total_dividend")}</div><div>${formatCurrency(scenario.total_dividend)}</div>
            <div>${ownerSpecificText("scenario_net", "user")}</div><div>${formatCurrency(scenario.user_net_from_company)}</div>
            <div>${t("scenario.total_tax_burden")}</div><div>${formatCurrency(scenario.total_tax_burden)}</div>
          </div>
          <p>${comparisonDeltaText("tax", entry.tax_delta)} ${comparisonDeltaText("net", entry.net_delta)}</p>
        </article>
      `;
    })
    .join("");

  const householdNote = mix.household_max_delta > 1
    ? t("mix.household_more", {
      householdNet: formatCurrency(mix.household_max_net),
      delta: formatCurrency(mix.household_max_delta),
    })
    : t("mix.household_same");

  compensationMixBox.innerHTML = `
    <div class="note mix-note">
      <strong>${t("mix.title")}</strong>
      <p class="mix-summary">${translateMessage(mix.summary)}</p>
      <div class="mix-stat-grid">
        <div class="mix-stat">
          <span>${t("mix.share_salary")}</span>
          <strong>${formatInputValue(mix.salary_share_percentage, "percent")} %</strong>
        </div>
        <div class="mix-stat">
          <span>${t("mix.share_dividend")}</span>
          <strong>${formatInputValue(mix.dividend_share_percentage, "percent")} %</strong>
        </div>
      </div>
      <div class="mix-reasons">
        ${(mix.reasons || []).map((item) => `<div>${translateMessage(item)}</div>`).join("")}
      </div>
      <div class="mix-household-note">
        <strong>${t("mix.household_title")}</strong>
        <p>${householdNote}</p>
      </div>
      ${comparisons ? `<div class="mix-comparison-grid">${comparisons}</div>` : ""}
    </div>
  `;
}

function renderOwnershipSuggestion(result) {
  const suggestion = result.ownership_suggestion;
  const currentSplit = t("ownership.current_split", {
    userName: getOwnerName("user"),
    spouseName: getOwnerName("spouse"),
    userSharePercentage: formatInputValue(result.input.user_share_percentage, "percent"),
    spouseSharePercentage: formatInputValue(100 - result.input.user_share_percentage, "percent"),
  });

  if (!suggestion) {
    ownershipSuggestionBox.innerHTML = `
      <div class="note">
        <strong>${t("ownership.title")}</strong><br>
        <div class="ownership-comparison-row">
          <span class="ownership-chip">${t("ownership.input_label")}</span>
          <span>${currentSplit}</span>
        </div>
        ${t("ownership.no_better_split")}<br>
        ${t("ownership.no_better_split_detail")}
      </div>
    `;
    return;
  }

  let taxImpactText = t("ownership.tax_saving_neutral");
  if (suggestion.estimated_tax_saving > 1) {
    taxImpactText = t("ownership.tax_saving_positive", {
      taxSaving: formatCurrency(suggestion.estimated_tax_saving),
    });
  } else if (suggestion.estimated_tax_saving < -1) {
    taxImpactText = t("ownership.tax_saving_negative", {
      taxSaving: formatCurrency(Math.abs(suggestion.estimated_tax_saving)),
    });
  }

  ownershipSuggestionBox.innerHTML = `
    <div class="note">
      <strong>${t("ownership.title")}</strong><br>
      <div class="ownership-comparison">
        <div class="ownership-comparison-row">
          <span class="ownership-chip">${t("ownership.input_label")}</span>
          <span>${currentSplit}</span>
        </div>
        <div class="ownership-comparison-row ownership-comparison-row-highlight">
          <span class="ownership-chip ownership-chip-accent">${t("ownership.proposal_label")}</span>
          <span>${t("ownership.better_split", {
            userName: getOwnerName("user"),
            spouseName: getOwnerName("spouse"),
            userSharePercentage: formatInputValue(suggestion.suggested_user_share_percentage, "percent"),
            spouseSharePercentage: formatInputValue(suggestion.suggested_spouse_share_percentage, "percent"),
          })}</span>
        </div>
      </div>
      <div>${t("ownership.optimized_for_household")}</div>
      ${t("ownership.household_net_gain", {
        householdNetGain: formatCurrency(suggestion.estimated_household_net_gain),
      })}<br>
      ${taxImpactText}<br>
      ${translateMessage(suggestion.note)}
    </div>
  `;
}

function breakdownCard(title, rows) {
  return `
    <article class="breakdown-card">
      <h3>${title}</h3>
      <div class="kv">
        ${rows.map(([key, value]) => `<div>${key}</div><div>${value}</div>`).join("")}
      </div>
    </article>
  `;
}

function renderBreakdown(result) {
  const recommendation = result.recommended;
  const company = recommendation.company;
  const salaryTax = recommendation.salary_tax;
  const userDividend = recommendation.user_dividend;
  const spouseDividend = recommendation.spouse_dividend;
  const spaces = recommendation.dividend_spaces;

  breakdownGrid.innerHTML = [
    breakdownCard(t("breakdown.company_budget"), [
      [t("label.profit_before_owner_salary"), formatCurrency(result.input.company_result_before_corporate_tax)],
      [t("label.cash_salary"), formatCurrency(recommendation.salary)],
      [t("label.car_benefit"), formatCurrency(company.car_benefit)],
      [t("label.employer_contributions"), formatCurrency(company.employer_contributions)],
      [t("label.pension"), formatCurrency(company.planned_user_pension)],
      [t("label.pension_slp"), formatCurrency(company.pension_special_payroll_tax)],
      [t("label.periodization_fund_change"), formatCurrency(company.periodization_fund_change)],
      [t("label.corporate_tax"), formatCurrency(company.corporate_tax)],
      [t("label.available_dividend_cash"), formatCurrency(company.available_dividend_cash)],
    ]),
    breakdownCard(ownerSpecificText("salary_tax", "user"), [
      [t("label.cash_salary"), formatCurrency(recommendation.salary)],
      [t("label.user_other_salary_income"), formatCurrency(result.input.user_other_salary_income)],
      [t("label.car_benefit"), formatCurrency(company.car_benefit)],
      [t("label.taxable_company_income"), formatCurrency(company.taxable_salary_base)],
      [t("label.base_deduction"), formatCurrency(salaryTax.base_deduction)],
      [t("label.municipal_tax"), formatCurrency(salaryTax.municipal_tax)],
      [t("label.burial_fee_tax"), formatCurrency(salaryTax.burial_fee_tax)],
      [t("label.church_fee_tax"), formatCurrency(salaryTax.church_fee_tax)],
      [t("label.state_tax"), formatCurrency(salaryTax.state_tax)],
      [t("label.incremental_salary_tax"), formatCurrency(recommendation.incremental_user_salary_tax)],
      [t("label.net_cash_salary"), formatCurrency(recommendation.user_net_cash_salary)],
    ]),
    breakdownCard(t("breakdown.dividend_room"), [
      [ownerLabel("user", "noun.dividend_room"), formatCurrency(spaces.user_space)],
      [ownerLabel("user", "noun.rule"), translateRule(spaces.user_rule_label)],
      [ownerLabel("spouse", "noun.dividend_room"), formatCurrency(spaces.spouse_space)],
      [ownerLabel("spouse", "noun.rule"), translateRule(spaces.spouse_rule_label)],
      [t("label.salary_basis_year"), String(result.meta.salary_basis_year)],
    ]),
    breakdownCard(t("breakdown.dividend_taxation"), [
      [ownerLabel("user", "noun.qualified_dividend"), formatCurrency(userDividend.qualified_dividend)],
      [ownerLabel("user", "noun.service_taxed_excess"), formatCurrency(userDividend.service_taxed_dividend)],
      [ownerLabel("spouse", "noun.qualified_dividend"), formatCurrency(spouseDividend.qualified_dividend)],
      [ownerLabel("spouse", "noun.service_taxed_excess"), formatCurrency(spouseDividend.service_taxed_dividend)],
      [t("label.combined_dividend_tax"), formatCurrency(userDividend.total_dividend_tax + spouseDividend.total_dividend_tax)],
    ]),
  ].join("");
}

function renderAlternatives(result) {
  const labelMap = {
    "Dividend-led": "alternative.dividend_led",
    "Near state tax breakpoint": "alternative.near_state_breakpoint",
    "Maximum user net": "alternative.maximum_user_net",
  };
  const descriptionMap = {
    "Lower salary focus with heavier reliance on dividends.": "alternative.dividend_led_desc",
    "Salary pushed close to the state income tax breakpoint before dividends.": "alternative.near_state_breakpoint_desc",
    "Highest user after-tax income the model can find within the current company budget.": "alternative.maximum_user_net_desc",
  };

  alternativesBox.innerHTML = result.alternatives
    .map((entry) => {
      const scenario = entry.scenario;
      return `
        <article class="scenario-card">
          <h3>${t(labelMap[entry.label] || entry.label)}</h3>
          <p>${t(descriptionMap[entry.description] || entry.description)}</p>
          <div class="kv">
            <div>${t("scenario.salary")}</div><div>${formatCurrency(scenario.salary)}</div>
            <div>${t("scenario.total_dividend")}</div><div>${formatCurrency(scenario.total_dividend)}</div>
            <div>${ownerSpecificText("scenario_net", "user")}</div><div>${formatCurrency(scenario.user_net_from_company)}</div>
            <div>${t("scenario.total_tax_burden")}</div><div>${formatCurrency(scenario.total_tax_burden)}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderAssumptions(result) {
  const notes = [
    ...result.explanations.map(translateMessage),
    ...result.recommended.dividend_spaces.notes.map(translateMessage),
    ...result.assumptions.map(translateMessage),
  ];
  assumptionsBox.innerHTML = notes.map((note) => `<div class="note">${note}</div>`).join("");
}

function setError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function clearError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function setLoadingState() {
  summaryBox.classList.add("empty-state");
  summaryBox.innerHTML = `<span>${t("status.calculating")}</span>`;
  finalPlanBox.innerHTML = "";
  compensationMixBox.innerHTML = "";
  ownershipSuggestionBox.innerHTML = `
    <div class="note ownership-loading">
      <div class="loading-header">
        <span class="loading-spinner" aria-hidden="true"></span>
        <strong>${t("ownership.loading_title")}</strong>
      </div>
      <div>${t("ownership.loading")}</div>
      <div class="loading-detail">${t("ownership.loading_detail")}</div>
    </div>
  `;
  breakdownGrid.innerHTML = "";
  alternativesBox.innerHTML = "";
  assumptionsBox.innerHTML = "";
  submitButton.disabled = true;
  submitButton.textContent = t("button.calculating");
}

function clearLoadingState() {
  submitButton.disabled = false;
  submitButton.textContent = t("button.calculate");
}

async function fetchOwnershipAnalysis(payload) {
  const response = await fetch("/api/ownership-analysis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || t("error.calculation_failed"));
  }

  return response.json();
}

async function exportPdf() {
  clearError();
  saveState();
  const payload = { ...formToObject(), language: currentLanguage };
  exportPdfButton.disabled = true;
  exportPdfButton.textContent = t("button.exporting_pdf");

  try {
    const response = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || t("error.export_failed"));
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "skatteuttag-report.pdf";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  } finally {
    exportPdfButton.disabled = false;
    exportPdfButton.textContent = t("button.export_pdf");
  }
}

async function submitForm() {
  clearError();
  saveState();
  setLoadingState();
  const payload = formToObject();

  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    clearLoadingState();
    throw new Error(error.detail || t("error.calculation_failed"));
  }

  const result = await response.json();
  lastResult = result;
  renderMetrics(result);
  renderFinalPlan(result);
  renderCompensationMixAnalysis(result);
  renderBreakdown(result);
  renderAlternatives(result);
  renderAssumptions(result);

  try {
    const ownershipResult = await fetchOwnershipAnalysis(payload);
    lastResult = { ...result, ownership_suggestion: ownershipResult.ownership_suggestion };
    renderFinalPlan(lastResult);
    renderOwnershipSuggestion(lastResult);
  } finally {
    clearLoadingState();
  }
}

yearInput.addEventListener("change", (event) => {
  setFieldLabels(event.target.value);
  municipalTaxManualOverride = false;
  syncMunicipalTaxSelectors({
    year: event.target.value,
    municipality: taxMunicipalitySelect.value,
    parish: taxParishSelect.value,
    forceAutofill: true,
  }).then(saveState).catch((error) => setError(error.message));
});

form.addEventListener("input", saveStateIfFormField);
form.addEventListener("change", saveStateIfFormField);
form.addEventListener("change", syncOwnershipDisplay);
form.addEventListener("input", (event) => {
  if (event.target && ["user_share_percentage", "user_display_name", "spouse_display_name"].includes(event.target.name)) {
    syncOwnershipDisplay();
  }
});

numericInputs.forEach((input) => {
  input.addEventListener("blur", () => {
    formatNumericField(input);
    saveState();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    formatNumericField(input);
    saveState();
  });
});

infoPopovers.forEach((popover) => {
  popover.addEventListener("toggle", () => {
    if (!popover.open) {
      popover.classList.remove("align-left", "open-upward");
      return;
    }

    infoPopovers.forEach((otherPopover) => {
      if (otherPopover !== popover) {
        otherPopover.open = false;
      }
    });

    requestAnimationFrame(() => positionInfoPopover(popover));
  });
});

municipalTaxRateInput.addEventListener("input", () => {
  if (!applyingMunicipalTaxRate) {
    municipalTaxManualOverride = true;
  }
});

taxMunicipalitySelect.addEventListener("change", () => {
  municipalTaxManualOverride = false;
  populateTaxParishes("");
  syncParishFieldVisibility();
  applyMunicipalTaxAutofill({ force: true });
  saveState();
});

includeChurchFeeInput.addEventListener("change", () => {
  municipalTaxManualOverride = false;
  populateTaxParishes(taxParishSelect.value);
  syncParishFieldVisibility();
  applyMunicipalTaxAutofill({ force: true });
  saveState();
});

taxParishSelect.addEventListener("change", () => {
  municipalTaxManualOverride = false;
  applyMunicipalTaxAutofill({ force: true });
  saveState();
});

userShareSlider.addEventListener("input", () => {
  syncOwnershipDisplay();
  saveState();
});

languageSwitch.addEventListener("change", (event) => {
  currentLanguage = event.target.value;
  localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  applyStaticTranslations();
  populateTaxMunicipalities(taxMunicipalitySelect.value);
  populateTaxParishes(taxParishSelect.value);
  syncParishFieldVisibility();
  refreshFormattedInputs();
  setFieldLabels(yearInput.value);
  if (lastResult) {
    renderMetrics(lastResult);
    renderFinalPlan(lastResult);
    renderCompensationMixAnalysis(lastResult);
    renderOwnershipSuggestion(lastResult);
    renderBreakdown(lastResult);
    renderAlternatives(lastResult);
    renderAssumptions(lastResult);
  }
});

exportPdfButton.addEventListener("click", () => {
  exportPdf().catch((error) => setError(error.message));
});

document.addEventListener("click", (event) => {
  infoPopovers.forEach((popover) => {
    if (popover.open && !popover.contains(event.target)) {
      popover.open = false;
    }
  });
});

window.addEventListener("resize", () => {
  infoPopovers.forEach((popover) => {
    if (popover.open) {
      positionInfoPopover(popover);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  infoPopovers.forEach((popover) => {
    popover.open = false;
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await submitForm();
  } catch (error) {
    setError(error.message);
  }
});

resetButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  municipalTaxManualOverride = false;
  restoreState().then(() => submitForm().catch((error) => setError(error.message)));
});

async function init() {
  applyStaticTranslations();
  await restoreState();
  await submitForm();
}

init().catch((error) => setError(error.message));
