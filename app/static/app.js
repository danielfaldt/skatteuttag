const STORAGE_KEY = "skatteuttag-form-state";
const LANGUAGE_KEY = "skatteuttag-language";

const form = document.querySelector("#planner-form");
const yearInput = document.querySelector("#year");
const languageSwitch = document.querySelector("#language-switch");
const actionMenu = document.querySelector("#action-menu");
const importAnnualReportButton = document.querySelector("#import-annual-report");
const importAnnualReportFileInput = document.querySelector("#import-annual-report-file");
const exportDataButton = document.querySelector("#export-data");
const importDataButton = document.querySelector("#import-data");
const importDataFileInput = document.querySelector("#import-data-file");
const exportPdfButton = document.querySelector("#export-pdf");
const annualReportStatusBox = document.querySelector("#annual-report-status");
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
const recommendedSubtitle = document.querySelector("#recommended-subtitle");
const compensationMixBox = document.querySelector("#compensation-mix-analysis");
const problemSignalsBox = document.querySelector("#problem-signals");
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
const localTaxSummary = document.querySelector("#local-tax-summary");
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
const EXPORT_SCHEMA = "skatteuttag-planning-export";
const EXPORT_VERSION = 1;

const TRANSLATIONS = {
  sv: {
    "brand.app_name": "Skatteuttag",
    "meta.description": "Löne- och utdelningsplanering för ett svenskt aktiebolag med tydlig årskopplad skattelogik.",
    "language.label": "Språk",
    "button.actions": "Åtgärder",
    "button.import_annual_report": "Läs in årsredovisning",
    "button.export_pdf": "Exportera till pdf",
    "button.export_data": "Exportera data",
    "button.import_data": "Importera data",
    "button.importing_annual_report": "Läser in årsredovisning...",
    "button.exporting_pdf": "Exporterar PDF...",
    "button.exporting_data": "Exporterar data...",
    "button.importing_data": "Importerar data...",
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
    "field.household_min_net_income": "Minsta hushållsnetto från bolaget",
    "field.household_min_net_income_hint": "Ange 0 om rekommendationen inte ska tvingas upp till en viss hushållsnivå.",
    "field.optimization_profile": "Så ska huvudförslaget optimeras",
    "field.spouse_external_salary": "Makes/makas lön från annan arbetsgivare",
    "field.company_result_before_corporate_tax": "Bolagets resultat före bolagsskatt",
    "field.opening_retained_earnings": "Ingående fria vinstmedel tillgängliga för utdelning",
    "field.tax_municipality": "Kommun för skatteautoifyllning",
    "field.tax_parish": "Församling",
    "field.include_church_fee": "Medlem i Svenska kyrkan",
    "field.include_church_fee_hint": "Ta med kyrkoavgift",
    "field.municipal_tax_rate": "Kommunalskatt",
    "field.local_tax_total": "Total lokal skatt i modellen",
    "field.local_tax_detail_base": "Kommunal/regional skatt + begravningsavgift",
    "field.local_tax_detail_church": "Kommunal/regional skatt + begravningsavgift + kyrkoavgift",
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
    "info.company_result_before_corporate_tax": "Det här är årets resultat innan bolagsskatt och innan en ny avsättning till periodiseringsfond i appen. Om årsredovisningen visar bokslutsdispositioner ska du normalt utgå från raden resultat efter finansiella poster. Raden resultat före skatt kan annars bli för låg här om periodiseringsfonden redan dragits av där. Har du en aktuell resultatrapport är den ofta ännu bättre som underlag.",
    "info.opening_retained_earnings": "Det här är fria vinstmedel från tidigare år som redan får delas ut enligt senast fastställda bokslut. I årsredovisningen hittar du dem normalt i balansräkningen eller i förändringen av eget kapital, ofta som balanserad vinst eller annat fritt eget kapital. Sätt inte detta till noll om bolaget redan har utdelningsbara vinstmedel från tidigare år.",
    "info.periodization_fund_change": "Ange ett positivt belopp om du vill göra en ny avsättning i år och skjuta en del av årets vinst framåt. Ange ett negativt belopp om du vill återföra en tidigare periodiseringsfond till beskattning i år. Lägg inte in förra årets redan bokförda avsättning här en gång till; den hör i stället hemma i ingående saldo om den fortfarande finns kvar.",
    "info.prior_year_company_cash_salaries": "Det här är bolagets totala kontanta löner under lönebasåret. Det hämtas oftast inte direkt från årsredovisningen utan från lönerapporter, arbetsgivardeklarationer eller bokföringens lönekonton för året.",
    "info.prior_year_user_company_salary": "Det här är din egen kontanta lön från bolaget under lönebasåret. Den hittar du normalt i lönebesked, arbetsgivardeklarationer eller en lönesammanställning för året, snarare än direkt i årsredovisningen.",
    "info.municipal_tax_rate": "Fältet autoifylls med kommunal och regional inkomstskatt från vald kommun. Begravningsavgift och eventuell kyrkoavgift hanteras separat i beräkningen. Du kan fortfarande ändra den synliga procentsatsen manuellt.",
    "info.car_benefit_is_pensionable": "Kryssa bara i detta om ert pensionsupplägg faktiskt räknar bilförmånen som pensionsgrundande lön. Är du osäker är det normalt säkrast att låta den vara av. Det påverkar bara hur stor tjänstepension modellen tillåter.",
    "info.user_share_percentage": "Det enklaste normala sättet att ändra ägarandel är oftast att en ägare överlåter aktier till den andra genom gåva eller försäljning. Kontrollera bolagsordning och eventuellt aktieägaravtal, skriv en överlåtelsehandling, uppdatera aktieboken direkt och anmäl ändringen via verksamt.se.",
    "info.goal_section": "Här styr du vad huvudförslaget ska optimera mot och vilka resultatnivåer modellen ska försöka respektera.",
    "info.optimization_profile": "Välj om appen främst ska jaga användarens mål, hushållets högsta netto eller lägsta total skatt. Det valet avgör vilket scenario som blir huvudförslag.",
    "compensation.title": "Justeringar i ersättningen",
    "compensation.subtitle": "Bilförmån, tjänstepension och periodiseringsfond modelleras ovanpå vald kontant lön.",
    "placeholder.user_display_name": "Ditt namn",
    "placeholder.spouse_display_name": "Namn på make/maka",
    "button.calculate": "Beräkna rekommendation",
    "button.reset": "Återställ sparade värden",
    "inputs.helper": "Appen sparar formulärvärden i webbläsarens lokala lagring och återställer dem vid omladdning.",
    "annual_report.badge": "Årsredovisning",
    "annual_report.status_title": "Inlästa värden från årsredovisning",
    "annual_report.status_intro": "{count} fält fylldes i automatiskt. Kontrollera dem gärna innan du räknar vidare.",
    "annual_report.status_report": "Källa: {filename}{meta}.",
    "annual_report.status_report_meta": " ({companyName}, räkenskapsår {reportYear})",
    "annual_report.field_source": "{fieldLabel}: {value} från {sourceLabel} på sida {page}.",
    "annual_report.field_source_no_page": "{fieldLabel}: {value} från {sourceLabel}.",
    "annual_report.warning_prefix": "Obs:",
    "annual_report.loading_title": "Läser in årsredovisning",
    "annual_report.loading_detail": "PDF:n tolkas nu och relevanta fält fylls i så snart importen är klar.",
    "recommended.title": "Rekommenderad plan",
    "recommended.subtitle": "Närmast målet, därefter prioritet på lägre total skatt.",
    "recommended.subtitle_target_then_tax": "Optimerad för att komma nära användarens mål, därefter lägre total skatt.",
    "recommended.subtitle_household_max": "Optimerad för hushållets högsta netto från bolaget, därefter lägre total skatt.",
    "recommended.subtitle_tax_min": "Optimerad för lägsta total skatt efter att satta mål nås så långt som möjligt.",
    "recommended.empty": "Skicka formuläret för att få en rekommendation.",
    "recommended.final_title": "Slutligt förslag",
    "recommended.final_summary_pending": "Ta ut {salary} i lön och {dividend} i total utdelning. Aktiefördelningen visas tills vidare som {userName} {userShare} % / {spouseName} {spouseShare} % medan bakgrundsanalysen räknar klart.",
    "recommended.final_summary_current": "Ta ut {salary} i lön, {dividend} i total utdelning och behåll aktiefördelningen {userName} {userShare} % / {spouseName} {spouseShare} %.",
    "recommended.final_summary_suggested": "Ta ut {salary} i lön, {dividend} i total utdelning och överväg aktiefördelningen {userName} {userShare} % / {spouseName} {spouseShare} %.",
    "recommended.final_status_pending": "Slutligt förslag är fortfarande preliminärt. Lön och utdelning visas redan, men aktiefördelningen kan ändras när ägaranalysen är färdig.",
    "recommended.final_status_same": "Det här är modellens bästa helhetsförslag givet nuvarande indata.",
    "recommended.final_status_better": "Modellen hittar ett bättre hushållsutfall med den föreslagna aktiefördelningen än med nuvarande fördelning.",
    "problem.title": "Problem att känna till",
    "problem.user_target_unreachable": "Med nuvarande indata når modellen som mest {maxUserNet} i användarnetto från bolaget. Målet ligger cirka {targetGap} högre.",
    "problem.user_target_not_met_under_profile": "Det valda huvudförslaget ligger cirka {targetGap} under användarens mål. Inom bolagets budget finns scenarier som når upp till {maxUserNet} i användarnetto, men de väljs inte av nuvarande optimeringsprofil.",
    "problem.household_floor_unreachable": "Det angivna hushållsgolvet verkar inte nåbart med nuvarande indata. Modellen når som mest {maxHouseholdNet} i hushållsnetto från bolaget, vilket är cirka {householdGap} under golvet.",
    "problem.salary_cap_reached": "Förslaget ligger redan vid modellens högsta möjliga kontanta lön inom nuvarande bolagsbudget.",
    "problem.dividend_cap_reached": "Förslaget använder i praktiken hela den tillgängliga utdelningslikviden i modellen.",
    "optimization.target_then_tax.title": "Närmast mål",
    "optimization.target_then_tax.description": "Prioritera användarens önskade netto, välj sedan lägre total skatt.",
    "optimization.household_max.title": "Högst hushållsnetto",
    "optimization.household_max.description": "Prioritera högsta gemensamma netto från bolaget för hushållet.",
    "optimization.tax_min.title": "Lägst skatt",
    "optimization.tax_min.description": "Prioritera lägsta total skatt när inmatade mål går att nå eller komma nära.",
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
    "label.profit_before_owner_salary": "Resultat före ägarlön och bolagsskatt",
    "label.owner_salary": "Ägarlön",
    "label.employer_contributions": "Arbetsgivaravgifter",
    "label.corporate_tax": "Bolagsskatt",
    "label.available_dividend_cash": "Tillgänglig utdelningslikvid",
    "label.gross_salary": "Bruttolön",
    "label.cash_salary": "Kontant lön",
    "label.user_other_salary_income": "Annan lön utanför bolaget",
    "label.car_benefit": "Bilförmån",
    "label.car_benefit_non_cash": "Bilförmån (ej kontant utbetalning)",
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
    "alternative.lowest_total_tax": "Lägsta total skatt",
    "alternative.lowest_total_tax_desc": "Det scenario som ger lägst total skatt inom samma bolagsbudget.",
    "alternative.highest_household_net": "Högsta hushållsnetto",
    "alternative.highest_household_net_desc": "Det scenario som ger högst gemensamt netto från bolaget för hushållet.",
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
    "ownership.optimized_comparison_intro": "Jämförelsen nedan avser ett nytt optimerat upplägg under föreslagen ägarfördelning, inte bara en ren procentändring med samma lön och utdelning.",
    "ownership.household_net_gain": "Med nytt optimerat upplägg ökar hushållets netto från bolaget med {householdNetGain}.",
    "ownership.extraction_change_positive": "Det nya upplägget tar ut {amount} mer totalt från bolaget än nuvarande huvudförslag.",
    "ownership.extraction_change_negative": "Det nya upplägget tar ut {amount} mindre totalt från bolaget än nuvarande huvudförslag.",
    "ownership.extraction_change_neutral": "Det nya upplägget tar ut ungefär lika mycket totalt från bolaget som nuvarande huvudförslag.",
    "ownership.tax_saving_positive": "Total skatt minskar med {taxSaving}.",
    "ownership.tax_saving_negative": "Total skatt ökar med {taxSaving}.",
    "ownership.tax_saving_neutral": "Total skatt är i stort sett oförändrad.",
    "ownership.same_plan_title": "Ren effekt av bara ägarändringen",
    "ownership.same_plan_household_gain_positive": "Om lön och utdelning hålls oförändrade ökar hushållets netto med {amount}.",
    "ownership.same_plan_household_gain_negative": "Om lön och utdelning hålls oförändrade minskar hushållets netto med {amount}.",
    "ownership.same_plan_household_gain_neutral": "Om lön och utdelning hålls oförändrade blir hushållets netto i stort sett oförändrat.",
    "ownership.same_plan_tax_change_positive": "Med samma lön och utdelning ökar total skatt med {amount}.",
    "ownership.same_plan_tax_change_negative": "Med samma lön och utdelning minskar total skatt med {amount}.",
    "ownership.same_plan_tax_change_neutral": "Med samma lön och utdelning är total skatt i stort sett oförändrad.",
    "ownership.same_plan_guidance_small": "Det tyder på att själva ägarändringen har liten ekonomisk effekt på egen hand.",
    "ownership.same_plan_guidance_large": "Det tyder på att själva ägarändringen i sig har märkbar ekonomisk effekt.",
    "ownership.no_better_split": "Ingen bättre ägarfördelning hittades inom modellens sökyta.",
    "ownership.no_better_split_detail": "Nuvarande fördelning ser redan stark ut utifrån hushållets netto och total skatt givet inmatningen och de antaganden som används här.",
    "ownership.loading": "Huvudrekommendationen och löne- mot utdelningsanalysen visas redan. Nu testar appen alternativa ägarfördelningar för att se om hushållets netto från bolaget kan förbättras ytterligare.",
    "ownership.loading_title": "Ägaranalysen räknas färdigt i bakgrunden",
    "ownership.loading_detail": "Det här steget kan fortfarande påverka slutligt förslag genom att föreslå en annan aktiefördelning, men ändrar inte huvudberäkningen för lön och utdelning som redan visas.",
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
    "analysis.how_title": "Så lästes den fram",
    "analysis.controls_title": "Styrdes av",
    "analysis.constraints_title": "Begränsningar just nu",
    "analysis.recommendation_method": "Appen sökte igenom möjliga kombinationer av lön och utdelning inom bolagets budget och valde sedan bästa scenario enligt vald optimeringsprofil.",
    "note.company_budget_non_cash": "Bilförmån visas här eftersom den påverkar arbetsgivaravgifter och skatt, men den är inte ett kontant utflöde från bolaget.",
    "analysis.mix_method": "Appen jämförde närliggande scenarier runt huvudförslaget för att visa vad mer lön eller mer utdelning gör med netto och skatt.",
    "analysis.ownership_method": "Appen räknade om huvudförslaget för flera möjliga ägarandelar och jämförde hushållsnetto, total skatt och målträff.",
    "analysis.alternatives_method": "De här scenarierna är nyttiga jämförelsepunkter inom samma bolagsbudget och regelverk som huvudförslaget.",
    "analysis.control_profile_target_then_tax": "Profil: närmast användarens nettomål, sedan lägre total skatt.",
    "analysis.control_profile_household_max": "Profil: högsta hushållsnetto från bolaget, sedan lägre total skatt.",
    "analysis.control_profile_tax_min": "Profil: lägsta total skatt efter att satta mål nås så långt som möjligt.",
    "analysis.control_household_floor_active": "En miniminivå på {amount} netto från bolaget är satt för hushållet.",
    "analysis.control_household_floor_none": "Ingen särskild miniminivå för hushållets netto från bolaget är satt.",
    "analysis.constraint_none": "Inga tydliga modellbegränsningar slog i för det visade huvudförslaget.",
    "analysis.constraint_user_target": "Användarens nettomål nås inte fullt ut. Det saknas cirka {amount}.",
    "analysis.constraint_household_floor": "Den angivna miniminivån för hushållets netto från bolaget nås inte fullt ut. Det saknas cirka {amount}.",
    "analysis.constraint_dividend_cap": "Förslaget använder i praktiken hela den tillgängliga utdelningslikviden.",
    "analysis.constraint_salary_cap": "Förslaget ligger vid modellens högsta möjliga kontanta lön inom nuvarande bolagsbudget.",
    "analysis.constraint_household_not_max": "Det finns ett annat scenario i modellen som ger högre hushållsnetto, men huvudförslaget följer den valda optimeringsprofilen.",
    "error.calculation_failed": "Beräkningen misslyckades.",
    "error.export_failed": "PDF-exporten misslyckades.",
    "error.import_failed": "Importen misslyckades.",
    "error.import_invalid_format": "Filen kunde inte läsas. Välj en giltig export från Skatteuttag.",
    "error.annual_report_invalid_format": "Filen kunde inte läsas. Välj en giltig PDF med årsredovisningen.",
    "error.annual_report_failed": "Årsredovisningen kunde inte läsas in.",
    "error.no_feasible_scenario_from_company_profit": "Inget genomförbart scenario kunde räknas fram från nuvarande bolagsresultat.",
    "error.periodization_allocation_too_high": "Den planerade avsättningen till periodiseringsfond är för hög. Med nuvarande indata tillåter modellen högst {maxAmount}. Du har angett {requestedAmount}.",
    "error.periodization_reversal_too_high": "Den planerade återföringen från periodiseringsfond är för hög. Ingående fondsaldo är {openingBalance}, men du har angett {requestedAmount}.",
    "error.pension_deduction_limit_exceeded": "Den planerade tjänstepensionen är för hög för nuvarande underlag. Modellen tillåter högst {pensionLimit}, men du har angett {requestedPension}.",
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
    "explanation.recommendation_scoring": "Rekommendationen minimerar först avståndet till användarens nettomål och föredrar därefter lägre total skatt.",
    "explanation.recommendation_profile_target_then_tax": "Huvudförslaget är styrt mot användarens nettomål först och lägre total skatt därefter.",
    "explanation.recommendation_profile_household_max": "Huvudförslaget är styrt mot högsta möjliga hushållsnetto från bolaget och lägre total skatt därefter.",
    "explanation.recommendation_profile_tax_min": "Huvudförslaget är styrt mot lägsta total skatt, men försöker samtidigt nå inmatade mål så långt det går.",
    "explanation.household_floor_active": "En miniminivå på {householdMinNetIncome} kr netto från bolaget används som styrande villkor i rekommendationen.",
    "explanation.household_floor_none": "Ingen särskild miniminivå för hushållets netto från bolaget används i rekommendationen."
  },
  en: {
    "brand.app_name": "TaxSplit",
    "meta.description": "Salary and dividend planning for a Swedish limited company with transparent year-based tax logic.",
    "language.label": "Language",
    "button.actions": "Actions",
    "button.import_annual_report": "Read annual report",
    "button.export_pdf": "Export PDF",
    "button.export_data": "Export data",
    "button.import_data": "Import data",
    "button.importing_annual_report": "Reading annual report...",
    "button.exporting_pdf": "Exporting PDF...",
    "button.exporting_data": "Exporting data...",
    "button.importing_data": "Importing data...",
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
    "field.household_min_net_income": "Minimum household net from the company",
    "field.household_min_net_income_hint": "Use 0 if you do not want the recommendation to respect a household floor.",
    "field.optimization_profile": "How the main recommendation should be optimized",
    "field.spouse_external_salary": "Spouse salary from other employer",
    "field.company_result_before_corporate_tax": "Company result before corporate tax",
    "field.opening_retained_earnings": "Opening retained earnings available for dividends",
    "field.tax_municipality": "Municipality for tax auto-fill",
    "field.tax_parish": "Parish",
    "field.include_church_fee": "Member of the Church of Sweden",
    "field.include_church_fee_hint": "Include church fee",
    "field.municipal_tax_rate": "Municipal tax rate",
    "field.local_tax_total": "Total local tax in the model",
    "field.local_tax_detail_base": "Municipal/regional income tax + burial fee",
    "field.local_tax_detail_church": "Municipal/regional income tax + burial fee + church fee",
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
    "info.company_result_before_corporate_tax": "This is the year's profit before corporate tax and before any new periodization-fund allocation inside the app. If the annual accounts include appropriations, you should usually start from profit after financial items. Profit before tax can otherwise be too low here if a periodization-fund allocation has already been deducted there. A current profit report is often an even better source.",
    "info.opening_retained_earnings": "This is distributable retained profit from earlier years according to the latest adopted annual accounts. In annual accounts you usually find it in the balance sheet or in the change in equity, often labelled retained earnings or other unrestricted equity. Do not leave this at zero if the company already has distributable retained earnings from earlier years.",
    "info.periodization_fund_change": "Use a positive amount if you want to make a new allocation this year and move part of the year's profit forward. Use a negative amount if you want to bring an earlier periodization fund back into taxation this year. Do not enter last year's already booked allocation here again; if it still exists, it belongs in the opening balance instead.",
    "info.prior_year_company_cash_salaries": "This is the company's total cash salary paid in the salary-base year. It usually comes from payroll reports, employer declarations, or salary accounts in the bookkeeping rather than directly from the annual report.",
    "info.prior_year_user_company_salary": "This is your own cash salary from the company in the salary-base year. You usually find it in payroll statements, employer declarations, or a yearly salary summary rather than directly in the annual report.",
    "info.municipal_tax_rate": "The field auto-fills municipal and regional income tax from the selected municipality. Burial fee and any church fee are handled separately in the calculation. You can still edit the visible rate manually.",
    "info.car_benefit_is_pensionable": "Tick this only if your pension setup actually treats the car benefit as pensionable salary. If you are unsure, it is usually safer to leave it unticked. It only changes how much occupational pension the model allows.",
    "info.user_share_percentage": "The simplest normal route is usually that one owner transfers shares to the other through a gift or sale. Check the articles of association and any shareholders' agreement first, write a transfer agreement, update the share register immediately, and report the change through verksamt.se.",
    "info.goal_section": "This section controls what the main recommendation should optimize for and which result levels the model should try to respect.",
    "info.optimization_profile": "Choose whether the app should mainly chase the user's target, the household's highest net outcome, or the lowest total tax. That choice decides which scenario becomes the main recommendation.",
    "compensation.title": "Compensation adjustments",
    "compensation.subtitle": "Benefit value, pension, and periodization fund are modelled on top of the selected cash salary.",
    "placeholder.user_display_name": "Your name",
    "placeholder.spouse_display_name": "Spouse name",
    "button.calculate": "Calculate recommendation",
    "button.reset": "Reset saved values",
    "inputs.helper": "The app stores your form values in local browser storage and restores them on reload.",
    "annual_report.badge": "Annual report",
    "annual_report.status_title": "Imported values from annual report",
    "annual_report.status_intro": "{count} fields were filled automatically. Review them before you continue.",
    "annual_report.status_report": "Source: {filename}{meta}.",
    "annual_report.status_report_meta": " ({companyName}, financial year {reportYear})",
    "annual_report.field_source": "{fieldLabel}: {value} from {sourceLabel} on page {page}.",
    "annual_report.field_source_no_page": "{fieldLabel}: {value} from {sourceLabel}.",
    "annual_report.warning_prefix": "Note:",
    "annual_report.loading_title": "Reading annual report",
    "annual_report.loading_detail": "The PDF is being parsed and matching fields will be filled in as soon as the import finishes.",
    "recommended.title": "Recommended plan",
    "recommended.subtitle": "Closest to the target, then biased toward lower total tax.",
    "recommended.subtitle_target_then_tax": "Optimized to stay close to the user's target, then toward lower total tax.",
    "recommended.subtitle_household_max": "Optimized for the household's highest net income from the company, then toward lower total tax.",
    "recommended.subtitle_tax_min": "Optimized for the lowest total tax after the entered goals are met as far as possible.",
    "recommended.empty": "Submit the form to generate a recommendation.",
    "recommended.final_title": "Final recommendation",
    "recommended.final_summary_pending": "Take {salary} as salary and {dividend} as total dividend. The ownership split is shown for now as {userName} {userShare}% / {spouseName} {spouseShare}% while the background ownership analysis finishes.",
    "recommended.final_summary_current": "Take {salary} as salary, {dividend} as total dividend, and keep the ownership split at {userName} {userShare}% / {spouseName} {spouseShare}%.",
    "recommended.final_summary_suggested": "Take {salary} as salary, {dividend} as total dividend, and consider the ownership split {userName} {userShare}% / {spouseName} {spouseShare}%.",
    "recommended.final_status_pending": "The final recommendation is still preliminary. Salary and dividend are already shown, but the ownership split may still change when the ownership analysis finishes.",
    "recommended.final_status_same": "This is the model's best overall proposal based on the current inputs.",
    "recommended.final_status_better": "The model finds a better household outcome with the suggested ownership split than with the current split.",
    "problem.title": "Important constraints",
    "problem.user_target_unreachable": "With the current inputs, the model reaches at most {maxUserNet} in user net income from the company. The target is about {targetGap} higher.",
    "problem.user_target_not_met_under_profile": "The selected main recommendation sits about {targetGap} below the user's target. Within the current company budget there are scenarios that reach up to {maxUserNet} in user net income, but the current optimization profile does not select them.",
    "problem.household_floor_unreachable": "The entered household floor does not appear reachable with the current inputs. The model reaches at most {maxHouseholdNet} in household net from the company, which is about {householdGap} below the floor.",
    "problem.salary_cap_reached": "The proposal already sits at the model's highest feasible cash salary within the current company budget.",
    "problem.dividend_cap_reached": "The proposal is effectively using the full available dividend cash in the model.",
    "optimization.target_then_tax.title": "Closest to target",
    "optimization.target_then_tax.description": "Prioritize the user's requested net income, then prefer lower total tax.",
    "optimization.household_max.title": "Highest household net",
    "optimization.household_max.description": "Prioritize the highest combined net income from the company for the household.",
    "optimization.tax_min.title": "Lowest tax",
    "optimization.tax_min.description": "Prioritize the lowest total tax when the entered goals can be met or approached.",
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
    "label.profit_before_owner_salary": "Result before owner salary and corporate tax",
    "label.owner_salary": "Owner salary",
    "label.employer_contributions": "Employer contributions",
    "label.corporate_tax": "Corporate tax",
    "label.available_dividend_cash": "Available dividend cash",
    "label.gross_salary": "Gross salary",
    "label.cash_salary": "Cash salary",
    "label.user_other_salary_income": "Other salary outside the company",
    "label.car_benefit": "Car benefit",
    "label.car_benefit_non_cash": "Car benefit (non-cash benefit)",
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
    "alternative.lowest_total_tax": "Lowest total tax",
    "alternative.lowest_total_tax_desc": "The scenario that gives the lowest total tax within the same company budget.",
    "alternative.highest_household_net": "Highest household net",
    "alternative.highest_household_net_desc": "The scenario that gives the highest combined net income from the company for the household.",
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
    "ownership.optimized_comparison_intro": "The comparison below reflects a newly optimized plan under the suggested ownership split, not just a pure percentage change with the same salary and dividend.",
    "ownership.household_net_gain": "With a newly optimized plan, household net from the company increases by {householdNetGain}.",
    "ownership.extraction_change_positive": "The new plan extracts {amount} more in total from the company than the current main recommendation.",
    "ownership.extraction_change_negative": "The new plan extracts {amount} less in total from the company than the current main recommendation.",
    "ownership.extraction_change_neutral": "The new plan extracts roughly the same total amount from the company as the current main recommendation.",
    "ownership.tax_saving_positive": "Total tax decreases by {taxSaving}.",
    "ownership.tax_saving_negative": "Total tax increases by {taxSaving}.",
    "ownership.tax_saving_neutral": "Total tax is broadly unchanged.",
    "ownership.same_plan_title": "Pure effect of the ownership change alone",
    "ownership.same_plan_household_gain_positive": "If salary and dividends are kept unchanged, household net increases by {amount}.",
    "ownership.same_plan_household_gain_negative": "If salary and dividends are kept unchanged, household net decreases by {amount}.",
    "ownership.same_plan_household_gain_neutral": "If salary and dividends are kept unchanged, household net is broadly unchanged.",
    "ownership.same_plan_tax_change_positive": "With the same salary and dividends, total tax increases by {amount}.",
    "ownership.same_plan_tax_change_negative": "With the same salary and dividends, total tax decreases by {amount}.",
    "ownership.same_plan_tax_change_neutral": "With the same salary and dividends, total tax is broadly unchanged.",
    "ownership.same_plan_guidance_small": "That suggests the ownership change itself has only a small economic effect on its own.",
    "ownership.same_plan_guidance_large": "That suggests the ownership change itself has a meaningful economic effect on its own.",
    "ownership.no_better_split": "No better ownership split was found within the model search space.",
    "ownership.no_better_split_detail": "The current split already looks strong on household net and total tax given the inputs and assumptions used here.",
    "ownership.loading": "The main recommendation and the salary-versus-dividend analysis are already shown. The app is now testing alternative ownership splits to see whether household net from the company can be improved further.",
    "ownership.loading_title": "The ownership analysis is still running in the background",
    "ownership.loading_detail": "This step can still change the final recommendation by suggesting a different ownership split, but it does not change the salary and dividend calculation that is already visible.",
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
    "analysis.how_title": "How it was derived",
    "analysis.controls_title": "Driven by",
    "analysis.constraints_title": "Current limits",
    "analysis.recommendation_method": "The app searched across feasible salary and dividend combinations within the company budget and then selected the best scenario under the chosen optimization profile.",
    "note.company_budget_non_cash": "Car benefit is shown here because it affects employer contributions and tax, but it is not a cash outflow from the company.",
    "analysis.mix_method": "The app compared nearby scenarios around the main recommendation to show what more salary or more dividend does to net income and tax.",
    "analysis.ownership_method": "The app recalculated the main recommendation for multiple ownership splits and compared household net, total tax, and target fit.",
    "analysis.alternatives_method": "These scenarios are useful comparison points within the same company budget and rule set as the main recommendation.",
    "analysis.control_profile_target_then_tax": "Profile: closest to the user's net-income target, then lower total tax.",
    "analysis.control_profile_household_max": "Profile: highest household net from the company, then lower total tax.",
    "analysis.control_profile_tax_min": "Profile: lowest total tax after the entered goals are met as far as possible.",
    "analysis.control_household_floor_active": "The household floor is set to at least {amount} net from the company.",
    "analysis.control_household_floor_none": "No specific household floor is set.",
    "analysis.constraint_none": "No clear model constraints are currently binding for the displayed main recommendation.",
    "analysis.constraint_user_target": "The user's net-income target is not fully reached. The gap is about {amount}.",
    "analysis.constraint_household_floor": "The entered household floor is not fully reached. The gap is about {amount}.",
    "analysis.constraint_dividend_cap": "The proposal uses essentially all available dividend cash.",
    "analysis.constraint_salary_cap": "The proposal sits at the model's highest feasible cash salary within the current company budget.",
    "analysis.constraint_household_not_max": "Another scenario in the model gives a higher household net outcome, but the main recommendation follows the chosen optimization profile.",
    "error.calculation_failed": "Calculation failed.",
    "error.export_failed": "PDF export failed.",
    "error.import_failed": "Import failed.",
    "error.import_invalid_format": "The file could not be read. Choose a valid export from TaxSplit.",
    "error.annual_report_invalid_format": "The file could not be read. Choose a valid annual report PDF.",
    "error.annual_report_failed": "The annual report could not be read.",
    "error.no_feasible_scenario_from_company_profit": "No feasible scenario could be calculated from the current company result.",
    "error.periodization_allocation_too_high": "The planned periodization fund allocation is too high. With the current inputs the model allows at most {maxAmount}. You entered {requestedAmount}.",
    "error.periodization_reversal_too_high": "The planned periodization fund reversal is too high. The opening balance is {openingBalance}, but you entered {requestedAmount}.",
    "error.pension_deduction_limit_exceeded": "The planned occupational pension is too high for the current basis. The model allows at most {pensionLimit}, but you entered {requestedPension}.",
    "status.calculating": "Calculating recommendation...",
    "button.calculating": "Calculating...",
    "rule.main": "Main rule",
    "rule.simplification": "Simplification rule",
    "rule.new_combined": "2026 combined rule",
    "explanation.recommendation_profile_target_then_tax": "The main recommendation is driven first by the user's net-income target and then by lower total tax.",
    "explanation.recommendation_profile_household_max": "The main recommendation is driven by the highest feasible household net from the company and then by lower total tax.",
    "explanation.recommendation_profile_tax_min": "The main recommendation is driven by the lowest total tax, while still trying to meet the entered goals as far as possible.",
    "explanation.household_floor_active": "A household floor of {householdMinNetIncome} SEK net from the company is used as a steering condition in the recommendation.",
    "explanation.household_floor_none": "No specific household floor is used in the recommendation.",
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
let activeSubmitRequestId = 0;
let taxCatalog = new Map();
let municipalTaxManualOverride = false;
let applyingMunicipalTaxRate = false;
let annualReportImportState = null;
let annualReportImportPending = false;

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
  if (annualReportImportState) {
    applyAnnualReportFieldMarkers();
    renderAnnualReportStatus();
  }
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

function buildPortableState() {
  return {
    ...formToObject(),
    _municipal_tax_manual_override: municipalTaxManualOverride,
  };
}

function normalizeAnalysisComparableValue(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function isCurrentFormSyncedWithAnalysis() {
  if (!lastResult || !lastResult.input || typeof lastResult.input !== "object") {
    return false;
  }

  const formState = buildPortableState();
  const analysisInput = lastResult.input;
  return Object.keys(window.APP_DEFAULTS).every((key) => {
    if (key.startsWith("_")) {
      return true;
    }
    return normalizeAnalysisComparableValue(formState[key]) === normalizeAnalysisComparableValue(analysisInput[key]);
  });
}

function buildExportPayload() {
  return {
    schema: EXPORT_SCHEMA,
    version: EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    app_name: t("brand.app_name"),
    language: currentLanguage,
    form: buildPortableState(),
    analysis: isCurrentFormSyncedWithAnalysis() ? lastResult : null,
  };
}

function formatApiErrorDetail(detail, fallbackKey) {
  if (detail && typeof detail === "object" && detail.key) {
    return t(detail.key, detail.params || {});
  }
  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }
  return t(fallbackKey);
}

function sanitizeImportedState(rawState) {
  if (!rawState || typeof rawState !== "object" || Array.isArray(rawState)) {
    throw new Error(t("error.import_invalid_format"));
  }

  const merged = { ...window.APP_DEFAULTS, ...rawState };
  if (merged.user_other_salary_income === undefined && merged.user_other_service_income !== undefined) {
    merged.user_other_salary_income = merged.user_other_service_income;
  }
  return merged;
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

    if (field.type === "radio") {
      if (field.checked) {
        values[field.name] = field.value;
      }
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
  if (field && typeof field.length === "number" && field.length > 0 && field[0]?.type === "radio") {
    Array.from(field).forEach((option) => {
      option.checked = option.value === value;
    });
    return;
  }
  if (field.type === "checkbox") {
    field.checked = Boolean(value);
    return;
  }
  if (field.type === "radio") {
    field.checked = field.value === value;
    return;
  }
  field.value = value ?? "";
}

function getFieldWrapper(fieldName) {
  const field = form.elements.namedItem(fieldName);
  if (!field || typeof field.length === "number") {
    return null;
  }
  return field.closest(".field");
}

function getFieldLabel(fieldName) {
  const wrapper = getFieldWrapper(fieldName);
  if (!wrapper) {
    return fieldName;
  }
  const label = wrapper.querySelector(".label-text, span, small, legend");
  return label ? label.textContent.trim() : fieldName;
}

function clearAnnualReportFieldMarkers() {
  form.querySelectorAll(".field-autofilled").forEach((wrapper) => {
    wrapper.classList.remove("field-autofilled");
    delete wrapper.dataset.importedBadge;
  });
}

function applyAnnualReportFieldMarkers() {
  clearAnnualReportFieldMarkers();
  if (!annualReportImportState?.fields) {
    return;
  }

  Object.keys(annualReportImportState.fields).forEach((fieldName) => {
    const wrapper = getFieldWrapper(fieldName);
    if (!wrapper) {
      return;
    }
    wrapper.classList.add("field-autofilled");
    wrapper.dataset.importedBadge = t("annual_report.badge");
  });
}

function clearAnnualReportField(fieldName) {
  if (!annualReportImportState?.fields?.[fieldName]) {
    return;
  }

  const nextFields = { ...annualReportImportState.fields };
  delete nextFields[fieldName];

  annualReportImportState = Object.keys(nextFields).length > 0
    ? { ...annualReportImportState, fields: nextFields }
    : null;

  applyAnnualReportFieldMarkers();
  renderAnnualReportStatus();
}

function renderAnnualReportStatus() {
  if (!annualReportStatusBox) {
    return;
  }

  if (annualReportImportPending) {
    annualReportStatusBox.innerHTML = `
      <div class="note annual-report-loading">
        <div class="loading-header">
          <span class="loading-spinner" aria-hidden="true"></span>
          <strong>${t("annual_report.loading_title")}</strong>
        </div>
        <div class="loading-detail">${t("annual_report.loading_detail")}</div>
      </div>
    `;
    annualReportStatusBox.classList.remove("hidden");
    return;
  }

  if (!annualReportImportState?.fields || Object.keys(annualReportImportState.fields).length === 0) {
    annualReportStatusBox.innerHTML = "";
    annualReportStatusBox.classList.add("hidden");
    return;
  }

  const fieldEntries = Object.entries(annualReportImportState.fields);
  const meta = annualReportImportState.company_name && annualReportImportState.report_year
    ? t("annual_report.status_report_meta", {
      companyName: annualReportImportState.company_name,
      reportYear: annualReportImportState.report_year,
    })
    : "";

  const fieldItems = fieldEntries.map(([fieldName, detail]) => {
    const sourceKey = detail.page
      ? "annual_report.field_source"
      : "annual_report.field_source_no_page";

    return `<li>${t(sourceKey, {
      fieldLabel: getFieldLabel(fieldName),
      value: formatCurrency(detail.value),
      sourceLabel: detail.source_label,
      page: detail.page,
    })}</li>`;
  }).join("");

  const warningItems = (annualReportImportState.warnings || []).map((warning) => (
    `<li>${t("annual_report.warning_prefix")} ${warning}</li>`
  )).join("");

  annualReportStatusBox.innerHTML = `
    <div class="note">
      <strong>${t("annual_report.status_title")}</strong><br>
      <div>${t("annual_report.status_intro", { count: fieldEntries.length })}</div>
      <div>${t("annual_report.status_report", {
        filename: annualReportImportState.filename,
        meta,
      })}</div>
      <ul class="annual-report-list">${fieldItems}${warningItems}</ul>
    </div>
  `;
  annualReportStatusBox.classList.remove("hidden");
}

function applyAnnualReportImport(payload) {
  const importedFields = payload?.fields || {};
  const nextState = { ...payload, fields: {} };

  Object.entries(importedFields).forEach(([fieldName, detail]) => {
    const field = form.elements.namedItem(fieldName);
    if (!field || typeof field.length === "number") {
      return;
    }

    const kind = field.dataset?.numberKind;
    setFieldValue(field, kind ? formatInputValue(detail.value, kind) : detail.value);
    nextState.fields[fieldName] = detail;
  });

  annualReportImportState = Object.keys(nextState.fields).length > 0 ? nextState : null;
  refreshFormattedInputs();
  saveState();
  applyAnnualReportFieldMarkers();
  renderAnnualReportStatus();
}

async function importAnnualReportFile(file) {
  if (!file) {
    return;
  }

  clearError();
  annualReportImportPending = true;
  renderAnnualReportStatus();
  importAnnualReportButton.disabled = true;
  importAnnualReportButton.textContent = t("button.importing_annual_report");

  try {
    const body = new FormData();
    body.append("file", file, file.name);

    const response = await fetch("/api/import-annual-report", {
      method: "POST",
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || t("error.annual_report_failed"));
    }

    const payload = await response.json();
    applyAnnualReportImport(payload);
    await submitForm();
  } catch (error) {
    throw new Error(error.message || t("error.annual_report_invalid_format"));
  } finally {
    annualReportImportPending = false;
    renderAnnualReportStatus();
    importAnnualReportButton.disabled = false;
    importAnnualReportButton.textContent = t("button.import_annual_report");
    importAnnualReportFileInput.value = "";
    if (actionMenu) {
      actionMenu.open = false;
    }
  }
}

async function fetchTaxCatalog(year) {
  if (taxCatalog.has(year)) {
    return taxCatalog.get(year);
  }

  const response = await fetch(`/api/municipal-tax/${year}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(formatApiErrorDetail(error.detail, "error.calculation_failed"));
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
    renderLocalTaxSummary();
    return;
  }

  burialFeeRateInput.value = formatInputValue(municipality.burial_fee || 0, "percent");
  const parish = findSelectedParish();
  const churchFee = includeChurchFeeInput.checked && parish ? parish.church_fee || 0 : 0;
  churchFeeRateInput.value = formatInputValue(churchFee, "percent");
  renderLocalTaxSummary();
}

function renderLocalTaxSummary() {
  const incomeTax = parseLocaleNumber(municipalTaxRateInput.value, "percent");
  const burialFee = parseLocaleNumber(burialFeeRateInput.value, "percent");
  const churchFee = parseLocaleNumber(churchFeeRateInput.value, "percent");
  const totalLocalTax = incomeTax + burialFee + churchFee;
  const parts = [
    `${formatInputValue(incomeTax, "percent")} %`,
    `${formatInputValue(burialFee, "percent")} %`,
  ];

  if (churchFee > 0.0001) {
    parts.push(`${formatInputValue(churchFee, "percent")} %`);
  }

  const detailKey = churchFee > 0.0001
    ? "field.local_tax_detail_church"
    : "field.local_tax_detail_base";

  localTaxSummary.innerHTML = `
    <div class="tax-summary-label">${t("field.local_tax_total")}</div>
    <div class="tax-summary-value">${formatInputValue(totalLocalTax, "percent")} %</div>
    <div class="tax-summary-detail">${t(detailKey)}: ${parts.join(" + ")}</div>
  `;
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
    JSON.stringify(buildPortableState()),
  );
}

function downloadJsonFile(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildExportFilename() {
  const datePart = new Date().toISOString().slice(0, 10);
  return `skatteuttag-${datePart}.json`;
}

function applyImportedState(source) {
  const imported = sanitizeImportedState(source);
  municipalTaxManualOverride = Boolean(imported._municipal_tax_manual_override);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
  annualReportImportState = null;
  applyAnnualReportFieldMarkers();
  renderAnnualReportStatus();
  if (typeof imported.language === "string" && ["sv", "en"].includes(imported.language)) {
    currentLanguage = imported.language;
    localStorage.setItem(LANGUAGE_KEY, currentLanguage);
    applyStaticTranslations();
  }
  return restoreState();
}

function saveStateIfFormField(event) {
  if (event.target && event.target.name && form.contains(event.target)) {
    clearAnnualReportField(event.target.name);
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

function currentOptimizationProfile(result = null) {
  return result?.input?.optimization_profile || form.elements.namedItem("optimization_profile")?.value || "target_then_tax";
}

function recommendationSubtitleKey(profile) {
  if (profile === "household_max") return "recommended.subtitle_household_max";
  if (profile === "tax_min") return "recommended.subtitle_tax_min";
  return "recommended.subtitle_target_then_tax";
}

function recommendationControlTexts(result) {
  const profileKey = {
    target_then_tax: "analysis.control_profile_target_then_tax",
    household_max: "analysis.control_profile_household_max",
    tax_min: "analysis.control_profile_tax_min",
  }[currentOptimizationProfile(result)] || "analysis.control_profile_target_then_tax";

  const controls = [t(profileKey)];
  const householdFloor = Number(result?.input?.household_min_net_income || 0);
  controls.push(
    householdFloor > 0
      ? t("analysis.control_household_floor_active", { amount: formatCurrency(householdFloor) })
      : t("analysis.control_household_floor_none"),
  );
  return controls;
}

function recommendationConstraintTexts(result) {
  const constraints = [];
  const recommendation = result.recommended;
  const householdFloor = Number(result.input.household_min_net_income || 0);
  const maxFeasibleSalary = Number(result.meta.max_feasible_salary || 0);

  if (recommendation.shortfall_to_target > 1) {
    constraints.push(t("analysis.constraint_user_target", { amount: formatCurrency(recommendation.shortfall_to_target) }));
  }
  if (householdFloor > recommendation.household_net_from_company + 1) {
    constraints.push(
      t("analysis.constraint_household_floor", {
        amount: formatCurrency(householdFloor - recommendation.household_net_from_company),
      }),
    );
  }
  if (recommendation.company.available_dividend_cash > 0 && recommendation.total_dividend >= recommendation.company.available_dividend_cash - 100) {
    constraints.push(t("analysis.constraint_dividend_cap"));
  }
  if (maxFeasibleSalary > 0 && recommendation.salary >= maxFeasibleSalary - 100) {
    constraints.push(t("analysis.constraint_salary_cap"));
  }
  if ((result.compensation_mix?.household_max_delta || 0) > 1) {
    constraints.push(t("analysis.constraint_household_not_max"));
  }

  return constraints.length ? constraints : [t("analysis.constraint_none")];
}

function analysisMetaBlock({ method, controls, constraints = [] }) {
  return `
    <div class="analysis-meta">
      <div class="analysis-meta-row">
        <strong>${t("analysis.how_title")}</strong>
        <span>${method}</span>
      </div>
      <div class="analysis-meta-row">
        <strong>${t("analysis.controls_title")}</strong>
        <span>${controls.join(" ")}</span>
      </div>
      <div class="analysis-meta-row">
        <strong>${t("analysis.constraints_title")}</strong>
        <span>${constraints.join(" ")}</span>
      </div>
    </div>
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
  recommendedSubtitle.textContent = t(recommendationSubtitleKey(currentOptimizationProfile(result)));
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

function renderProblemSignals(result) {
  const problems = result.problems || [];
  if (!problems.length) {
    problemSignalsBox.innerHTML = "";
    return;
  }

  problemSignalsBox.innerHTML = `
    <div class="note problem-note">
      <strong>${t("problem.title")}</strong>
      <div class="problem-list">
        ${problems.map((item) => `<div>${translateMessage(item)}</div>`).join("")}
      </div>
    </div>
  `;
}

function renderFinalPlan(result) {
  const recommendation = result.recommended;
  const suggestion = result.ownership_suggestion;
  const ownershipPending = result.ownership_suggestion === undefined;
  const userShare = suggestion ? suggestion.suggested_user_share_percentage : result.input.user_share_percentage;
  const spouseShare = suggestion ? suggestion.suggested_spouse_share_percentage : (100 - result.input.user_share_percentage);
  const summaryKey = ownershipPending
    ? "recommended.final_summary_pending"
    : (suggestion ? "recommended.final_summary_suggested" : "recommended.final_summary_current");
  const statusKey = suggestion
    ? "recommended.final_status_better"
    : (ownershipPending ? "recommended.final_status_pending" : "recommended.final_status_same");
  const analysisMeta = analysisMetaBlock({
    method: t("analysis.recommendation_method"),
    controls: recommendationControlTexts(result),
    constraints: recommendationConstraintTexts(result),
  });

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
      ${analysisMeta}
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
      ${analysisMetaBlock({
        method: t("analysis.mix_method"),
        controls: recommendationControlTexts(result),
        constraints: [(mix.household_max_delta || 0) > 1 ? t("analysis.constraint_household_not_max") : t("analysis.constraint_none")],
      })}
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
        ${analysisMetaBlock({
          method: t("analysis.ownership_method"),
          controls: [t("ownership.optimized_for_household")],
          constraints: [t("analysis.constraint_none")],
        })}
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

  let extractionImpactText = t("ownership.extraction_change_neutral");
  if (suggestion.estimated_extraction_change > 1) {
    extractionImpactText = t("ownership.extraction_change_positive", {
      amount: formatCurrency(suggestion.estimated_extraction_change),
    });
  } else if (suggestion.estimated_extraction_change < -1) {
    extractionImpactText = t("ownership.extraction_change_negative", {
      amount: formatCurrency(Math.abs(suggestion.estimated_extraction_change)),
    });
  }

  let samePlanHouseholdText = t("ownership.same_plan_household_gain_neutral");
  if (suggestion.same_plan_household_net_change > 1) {
    samePlanHouseholdText = t("ownership.same_plan_household_gain_positive", {
      amount: formatCurrency(suggestion.same_plan_household_net_change),
    });
  } else if (suggestion.same_plan_household_net_change < -1) {
    samePlanHouseholdText = t("ownership.same_plan_household_gain_negative", {
      amount: formatCurrency(Math.abs(suggestion.same_plan_household_net_change)),
    });
  }

  let samePlanTaxText = t("ownership.same_plan_tax_change_neutral");
  if (suggestion.same_plan_total_tax_change > 1) {
    samePlanTaxText = t("ownership.same_plan_tax_change_positive", {
      amount: formatCurrency(suggestion.same_plan_total_tax_change),
    });
  } else if (suggestion.same_plan_total_tax_change < -1) {
    samePlanTaxText = t("ownership.same_plan_tax_change_negative", {
      amount: formatCurrency(Math.abs(suggestion.same_plan_total_tax_change)),
    });
  }

  const samePlanGuidanceKey = Math.max(
    Math.abs(suggestion.same_plan_household_net_change || 0),
    Math.abs(suggestion.same_plan_total_tax_change || 0),
  ) > 10_000
    ? "ownership.same_plan_guidance_large"
    : "ownership.same_plan_guidance_small";

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
      <div>${t("ownership.optimized_comparison_intro")}</div>
      ${t("ownership.household_net_gain", {
        householdNetGain: formatCurrency(suggestion.estimated_household_net_gain),
      })}<br>
      ${extractionImpactText}<br>
      ${taxImpactText}<br>
      <div class="ownership-same-plan">
        <strong>${t("ownership.same_plan_title")}</strong><br>
        ${samePlanHouseholdText}<br>
        ${samePlanTaxText}<br>
        ${t(samePlanGuidanceKey)}
      </div>
      ${translateMessage(suggestion.note)}
      ${analysisMetaBlock({
        method: t("analysis.ownership_method"),
        controls: [t("ownership.optimized_for_household")],
        constraints: [extractionImpactText, taxImpactText],
      })}
    </div>
  `;
}

function breakdownCard(title, rows, note = "") {
  return `
    <article class="breakdown-card">
      <h3>${title}</h3>
      <div class="kv">
        ${rows.map(([key, value]) => `<div>${key}</div><div>${value}</div>`).join("")}
      </div>
      ${note ? `<p class="breakdown-note">${note}</p>` : ""}
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
      [t("label.car_benefit_non_cash"), formatCurrency(company.car_benefit)],
      [t("label.employer_contributions"), formatCurrency(company.employer_contributions)],
      [t("label.pension"), formatCurrency(company.planned_user_pension)],
      [t("label.pension_slp"), formatCurrency(company.pension_special_payroll_tax)],
      [t("label.periodization_fund_change"), formatCurrency(company.periodization_fund_change)],
      [t("label.corporate_tax"), formatCurrency(company.corporate_tax)],
      [t("label.available_dividend_cash"), formatCurrency(company.available_dividend_cash)],
    ], t("note.company_budget_non_cash")),
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
    "Lowest total tax": "alternative.lowest_total_tax",
    "Highest household net": "alternative.highest_household_net",
  };
  const descriptionMap = {
    "Lower salary focus with heavier reliance on dividends.": "alternative.dividend_led_desc",
    "Salary pushed close to the state income tax breakpoint before dividends.": "alternative.near_state_breakpoint_desc",
    "Highest user after-tax income the model can find within the current company budget.": "alternative.maximum_user_net_desc",
    "Lowest total tax burden that the model can find within the current company budget.": "alternative.lowest_total_tax_desc",
    "Highest combined household net from the company that the model can find within the current company budget.": "alternative.highest_household_net_desc",
  };

  const cards = result.alternatives
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

  alternativesBox.innerHTML = `
    <div class="note">
      <strong>${t("analysis.how_title")}</strong><br>
      ${t("analysis.alternatives_method")}<br><br>
      <strong>${t("analysis.controls_title")}</strong><br>
      ${recommendationControlTexts(result).join(" ")}
    </div>
    ${cards}
  `;
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

function syncRecommendedSubtitle(result = null) {
  recommendedSubtitle.textContent = t(recommendationSubtitleKey(currentOptimizationProfile(result)));
}

function setLoadingState() {
  syncRecommendedSubtitle();
  summaryBox.classList.add("empty-state");
  summaryBox.innerHTML = `<span>${t("status.calculating")}</span>`;
  problemSignalsBox.innerHTML = "";
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
    throw new Error(formatApiErrorDetail(error.detail, "error.calculation_failed"));
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
      throw new Error(formatApiErrorDetail(error.detail, "error.export_failed"));
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
    if (actionMenu) {
      actionMenu.open = false;
    }
  }
}

function exportData() {
  clearError();
  saveState();
  exportDataButton.disabled = true;
  exportDataButton.textContent = t("button.exporting_data");

  try {
    downloadJsonFile(buildExportFilename(), buildExportPayload());
  } finally {
    exportDataButton.disabled = false;
    exportDataButton.textContent = t("button.export_data");
    if (actionMenu) {
      actionMenu.open = false;
    }
  }
}

async function importDataFile(file) {
  if (!file) {
    return;
  }

  clearError();
  importDataButton.disabled = true;
  importDataButton.textContent = t("button.importing_data");

  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    const importedForm = parsed?.schema === EXPORT_SCHEMA ? parsed.form : parsed;

    if (parsed?.schema === EXPORT_SCHEMA && parsed.language && ["sv", "en"].includes(parsed.language)) {
      currentLanguage = parsed.language;
      localStorage.setItem(LANGUAGE_KEY, currentLanguage);
      applyStaticTranslations();
    }

    await applyImportedState(importedForm);
    lastResult = parsed?.schema === EXPORT_SCHEMA && parsed.analysis ? parsed.analysis : null;
    syncRecommendedSubtitle(lastResult);
    await submitForm();
  } catch (error) {
    throw new Error(error instanceof SyntaxError ? t("error.import_invalid_format") : (error.message || t("error.import_failed")));
  } finally {
    importDataButton.disabled = false;
    importDataButton.textContent = t("button.import_data");
    importDataFileInput.value = "";
    if (actionMenu) {
      actionMenu.open = false;
    }
  }
}

async function submitForm() {
  clearError();
  saveState();
  setLoadingState();
  const payload = formToObject();
  const requestId = ++activeSubmitRequestId;

  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    clearLoadingState();
    throw new Error(formatApiErrorDetail(error.detail, "error.calculation_failed"));
  }

  const result = await response.json();
  if (requestId !== activeSubmitRequestId) {
    return;
  }
  lastResult = result;
  renderMetrics(result);
  renderProblemSignals(result);
  renderFinalPlan(result);
  renderCompensationMixAnalysis(result);
  renderBreakdown(result);
  renderAlternatives(result);
  renderAssumptions(result);
  clearLoadingState();

  fetchOwnershipAnalysis(payload)
    .then((ownershipResult) => {
      if (requestId !== activeSubmitRequestId) {
        return;
      }
      lastResult = { ...result, ownership_suggestion: ownershipResult.ownership_suggestion };
      renderProblemSignals(lastResult);
      renderFinalPlan(lastResult);
      renderOwnershipSuggestion(lastResult);
    })
    .catch((error) => {
      if (requestId !== activeSubmitRequestId) {
        return;
      }
      renderOwnershipSuggestion(result);
      setError(error.message || t("error.calculation_failed"));
    });
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
  renderLocalTaxSummary();
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
  syncRecommendedSubtitle(lastResult);
  populateTaxMunicipalities(taxMunicipalitySelect.value);
  populateTaxParishes(taxParishSelect.value);
  syncParishFieldVisibility();
  refreshFormattedInputs();
  renderLocalTaxSummary();
  setFieldLabels(yearInput.value);
  if (lastResult) {
    renderMetrics(lastResult);
    renderProblemSignals(lastResult);
    renderFinalPlan(lastResult);
    renderCompensationMixAnalysis(lastResult);
    renderOwnershipSuggestion(lastResult);
    renderBreakdown(lastResult);
    renderAlternatives(lastResult);
    renderAssumptions(lastResult);
  }
});

form.addEventListener("change", (event) => {
  if (event.target?.name === "optimization_profile") {
    syncRecommendedSubtitle();
  }
});

exportPdfButton.addEventListener("click", () => {
  exportPdf().catch((error) => setError(error.message));
});

exportDataButton.addEventListener("click", () => {
  try {
    exportData();
  } catch (error) {
    setError(error.message);
  }
});

importAnnualReportButton.addEventListener("click", () => {
  importAnnualReportFileInput.click();
});

importAnnualReportFileInput.addEventListener("change", () => {
  importAnnualReportFile(importAnnualReportFileInput.files?.[0]).catch((error) => setError(error.message));
});

importDataButton.addEventListener("click", () => {
  importDataFileInput.click();
});

importDataFileInput.addEventListener("change", () => {
  importDataFile(importDataFileInput.files?.[0]).catch((error) => setError(error.message));
});

document.addEventListener("click", (event) => {
  infoPopovers.forEach((popover) => {
    if (popover.open && !popover.contains(event.target)) {
      popover.open = false;
    }
  });
  if (actionMenu?.open && !actionMenu.contains(event.target)) {
    actionMenu.open = false;
  }
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
  annualReportImportState = null;
  applyAnnualReportFieldMarkers();
  renderAnnualReportStatus();
  restoreState().then(() => submitForm().catch((error) => setError(error.message)));
});

async function init() {
  applyStaticTranslations();
  await restoreState();
  syncRecommendedSubtitle();
  await submitForm();
}

init().catch((error) => setError(error.message));
