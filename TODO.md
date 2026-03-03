🚀 Epic: Refactor "Om Mig" & Interactive Skill Deep-Dive
Role: Senior Frontend Developer & UI/UX Engineer

Context: Opgradering af personlig portefølje til at reflektere en "Senior Tech Profile" med 12 års erfaring, herunder en transformation fra statisk indhold til interaktive "Show, Don't Tell" komponenter.

🎯 Task 1: "Om mig" Content & Copy Refactor
[ ] Technical Copywriting: Omskriv "Om mig" sektionen på dansk. Tonen skal være professionel, erfaren og resultatorienteret (Senior-niveau). Fremhæv 12 års samlet erhvervserfaring.

[ ] Service Industry Integration: Tilføj en undersektion "Erhvervsmæssigt Fundament".

Indhold: Fitness World (Receptionist, 3 år) og SuperBrugsen (3 år).

Fokus: Bløde kompetencer som kundeforståelse, teamwork under pres og 6 års dokumenteret loyalitet/stabilitet.

[ ] Visual Hierarchy: Implementér sektionen for service-erfaring med lavere visuel prioritet (f.eks. text-sm, opacity-70 eller en diskret grå farve) for at holde fokus på tech-profilen.

[ ] Tech Stack: Brug semantisk HTML/JSX og eksisterende Tailwind konfiguration.

---

🛠️ Task 2: Interactive "Skill Deep-Dive" Component
[ ] Architecture: Erstat den nuværende punktopstilling i "Kompetencer" med en SkillDeepDive komponent.

[ ] Categorized Tag Cloud: Gruppér kompetencer i:

Technical Core

Quality & Security

Workflow & Soft Skills

[ ] Interactive Chips:

Design: Subtle border, hover state (slight lift + accent green background/text).

Iconography: Tilføj et lille "Code" eller "Plus" ikon til hver chip for at indikere interaktivitet.

[ ] "Code Peek" Logic:

Implementér en Slide-over (desktop) eller Expandable Card (mobile) ved klik på en chip.

Animation: Smooth transition (duration: 300ms, ease-in-out).

[ ] Content Mapping (The "Show" part):

Sikkerhed: Vis sanitizeHtml() util med DOMParser allow-list.

Database: Vis Mongoose schema med custom validation & indexing.

API Design: Vis Express 5 route med async error handling.

Testing: Vis et Jest/Supertest snippet af en integrations-test.

[ ] Visual Styling:

Tema: "Cream & Dark Green" (minimalistisk).

Code Blocks: Brug et mørkt high-contrast tema (fx Nord eller Monokai) inde i Code Peek for at skabe dybde.

Responsiveness: Chips skal wrappe elegant; Code Peek skal fylde 100% i bredden på mobile.

✅ Definition of Done
[ ] Siden reflekterer en senior profil med både teknisk tyngde og menneskelig stabilitet.

[ ] "Skill Deep-Dive" fungerer fejlfrit uden layout shifts.

[ ] Al tekst er på fejlfrit dansk.

[ ] Koden følger projektets eksisterende struktur og Tailwind-konventioner.