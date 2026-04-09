# TODO

<!-- next-id: 19 -->

<!-- screenshots: add [ss://...] at end of todo line; multiple separated by ; -->

## Open

- [ ] T002 · Add separate municipality tax inputs per owner, including burial fee and optional faith-community fee.
- [ ] T003 · Add explicit Svenska kyrkan membership handling per owner instead of assuming one shared municipal-style rate.
- [ ] T001 · Add support for planning years beyond `2026` once official constants and K10 rule details are available.
- [ ] T004 · Track ownership as of 1 January in the planning year and distinguish that from any suggested future ownership change.
- [ ] T005 · Add explicit support for outside owners and the related closely-held-company exceptions.
- [ ] T006 · Add drivmedelsförmån and bostadsförmån inputs instead of only the current simplified car-benefit field.
- [ ] T007 · Track multiple historical periodization-fund layers and original tax years instead of only one user-entered opening balance.
- [ ] T008 · Add a richer breakdown for scenarios where dividends exceed the service-tax ceiling and spill back into capital taxation.
- [ ] T009 · Expand the PDF export with appendix pages, signature metadata, and per-owner municipality/tax details.
- [ ] T010 · Add future production deployment tasks, including Nginx Proxy Manager hostname configuration and production URL wiring.
- [ ] T012 · Separate target-fit optimization from tax-minimization in the result view so the app can show both the closest-to-target plan and the lowest-tax plan when they differ materially.

## Closed

- [x] T018 · Vi vill ju inte länsa bolaget. Egentligen vill vi nog helst ligga under 20%-skattegränsen (eller 2/3 30%). Just nu känns det som att vi försöker länsa bolaget på medel istället för att ta ut lagom för ändamålet och målet. Finns heller inget alternativ för ”under statlig inkomstskatt och 20% skatt” eller vad det nu skulle vara.
- [x] T016 · Implement a function for exporting and importing data in JSON format along with the entire analysis if existing.
- [x] T017 · Fix the syntax error in the calculation and clarify any misunderstandings or typos. See attachment. User input error or calc error? Anyhow, the end result is wrong. [ss://skatteuttag/screenshots/img_1876-w8xo8k.jpeg]
- [x] T013 · Ägarfördelning jämförs i bakgrunden -> Även indikerat på "Slutgiltigt förslag" att den inte är färdigbehandlad. Formulera om denna även.
- [x] T014 · Styrparametrarna ska kunna justeras. Maximalt uttag/minimal skatt, minsta ”löneuttag netto” (inkl utdelning för båda) etc. Finns några begränsningar som slagit i? Typ max vinstuttag eller liknande.
- [x] T015 · Förklara hur analysen gjord och vilka parametrar som styrde. Lättbegripligt språk. Ändå tydligt. Gör detta för varje analys som görs. Vanlig svenska.
- [x] T011 · Add export and import of planning data as JSON so scenarios can be moved between browsers and archived outside local storage.
