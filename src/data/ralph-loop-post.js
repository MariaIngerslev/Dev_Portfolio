const RALPH_LOOP_POST = {
    title:     "The Stateless Developer: Genvej til fejlfri AI-kode",
    heroImage: '/images/blog/ralph_loop.jpg',
    content: `<img src="/images/blog/ralph_loop.jpg" alt="The Stateless Developer" />

<h2>1. Krogen: Når AI'en mister den røde tråd</h2>

<p>Jeg er i øjeblikket ved at bygge en sikker blog fra bunden ved hjælp af Vanilla JS på frontend-siden og Express (Node.js) på backend-siden. For nylig begyndte jeg at eksperimentere med AI-værktøjer (som Claude Code) til at hjælpe med at "vibecode" - altså at frembringe hurtige iterationer af mit UX/UI.</p>

<p>I starten var det magisk. Men jeg stødte hurtigt på et kritisk problem: Når chat-historikken blev for lang, begyndte AI'en at opføre sig som en træt udvikler på sin 14. kop kaffe under en crunch-periode. Den blev forvirret, glemte alt om mine arkitekturkrav (som DRY-princippet og Separation of Concerns), og begyndte at introducere regulær spaghettikode. Den overskrev endda min opsætning for at validere data på serveren! Jeg havde brug for en måde at styre dyret på.</p>

<h2>2. Konceptet: Hvad er et "Ralph Loop"?</h2>

<p>Løsningen blev et koncept, jeg kalder et <em>Ralph Loop</em>. Navnet er en kærlig hilsen til Ralph Wiggum fra <em>The Simpsons</em> - karakteren, der er berømt for sin totale mangel på kontekst og ikoniske oneliners som "I'm a unit of measure!".</p>

<p>I AI-verdenen (populariseret af bl.a. HumanLayer) refererer et "Ralph Loop" til en <strong>stateless agent</strong>. I stedet for at lade AI'en svømme rundt i en uendelig strøm af tidligere beskeder, tvinger vi den til at operere i korte, isolerede loops uden hukommelse om fortiden.</p>

<p>Forestil dig en person, der lider af korttidshukommelsestab (ligesom i filmen <em>Memento</em>). Hver gang de skal løse en opgave, må de læse deres noter for at forstå, hvor de er, udføre opgaven, skrive resultatet ned, og derefter "glemme" alt igen. I min udvikling fungerer filsystemet (specifikt en <code>TODO.md</code> fil og Git) som AI'ens langtidshukommelse.</p>

<h2>3. Maskinrummet: Fra URL-validering til Git Commit</h2>

<p>For at se loopet i praksis, kan vi kigge på terminalen. Flowet er altid det samme: <strong>Read Context → Execute Task → Run Tests → Git Commit → Exit</strong></p>

<pre><code>Read Context → Execute Task → Run Tests → Git Commit → Exit</code></pre>

<img src="/images/blog/ralph_loop.png" alt="The Ralph Loop i terminalen" />

<p>Et konkret eksempel opstod, da jeg bad AI'en bygge en URL-validator til kommentarsporet for at forhindre XSS-angreb. I et normalt chat-interface ville AI'en måske have argumenteret for sin kode i en uendelighed. Men i mit "Ralph Loop" kørte Claude Code i terminalen, læste kravene fra <code>CLAUDE.md</code> og gik i gang.</p>

<p>Fordi jeg havde skrevet tests for Express-API'et på forhånd, fangede loopet automatisk, da AI'ens første forsøg fejlede i at afvise ulovlige domæner. AI'en fik ikke lov til at committe noget, før den havde rettet koden, så den rent faktisk bestod mine sikkerhedstests. Som du kan se i terminalen, er rækkefølgen benhård: <strong>tests kommer altid før commit.</strong> Hvis en test fejler, stopper loopet. Den må ikke "gemme problemet til næste gang" – fordi der ikke findes et "næste gang". Hver session starter med en frisk tavle.</p>

<h2>4. Resultatet: Fra rå HTML til Medium-klon</h2>

<p>Resultatet har været overvældende. Ved at fodre systemet med meget præcise, tilstandsløse prompts i min <code>TODO.md</code>, kunne jeg lade loopet køre i baggrunden.</p>

<p>Den transformerede min forside fra et basalt, råt HTML-layout til et fuldt responsivt design inspireret af Medium.com. Og fordi hver ændring blev valideret og committet isoleret, kunne jeg nemt rulle tilbage, hvis et designvalg ikke fungerede – alt imens backend-logikken (som URL-validatoren) forblev fuldstændig intakt og sikker.</p>

<h2>5. Konklusion: Fra Koder til Arkitekt</h2>

<p>Dette eksperiment har lært mig noget vigtigt om fremtiden for os udviklere. AI ændrer vores rolle fundamentalt. Vi bevæger os væk fra at være dem, der manuelt skriver hver eneste linje kode og flytter DOM-elementer rundt med JavaScript.</p>

<p>I stedet bliver vi "arkitekterne". Vores fineste opgave bliver at designe robuste systemer (med koncepter som SOLID), definere krystalklare krav og vigtigst af alt: skrive de tests, som sætter rammerne for, hvad AI'en kan og må operere indenfor. Hvis du kan styre processen og rammerne via et stateless loop, bliver AI'en din mest effektive (og mest disciplinerede) juniorkollega.</p>`
};

module.exports = RALPH_LOOP_POST;
