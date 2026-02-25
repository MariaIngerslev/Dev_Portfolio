#!/bin/bash

TODO_FILE="TODO.md"

echo "🚀 Starter The Ralph Loop..."

# Uendelig loop, der kører indtil TODO.md er tom
while true; do
  # 1. READ CONTEXT: Læs den øverste linje fra TODO.md
  TASK=$(head -n 1 "$TODO_FILE")
  
  # Hvis filen er tom, afsluttes loopet
  if [ -z "$TASK" ]; then
    echo "🎉 Ingen flere opgaver i $TODO_FILE. Ralph er færdig!"
    break
  fi

  echo "---------------------------------------------------"
  echo "👉 Næste opgave: $TASK"
  echo "---------------------------------------------------"

  # 2. EXECUTE TASK: Start en helt ny (stateless) session med Claude.
  # Vi beder Claude om at læse opgaven og udføre ændringerne. 
  # (Sørg for at tilpasse denne kommando til præcis den CLI, du bruger. 
  # Hvis Claude Code beder om bekræftelse, skal du måske tilføje et flag for auto-accept).
  claude "Udfør følgende opgave: '$TASK'. Brug CLAUDE.md som overordnet guide. Ret kun de filer, der er nødvendige for opgaven."

  # 3. RUN TESTS: Kør dine Jest-tests fra npm
  echo "🧪 Kører tests for at validere ændringerne..."
  npm test
  TEST_RESULT=$?

  # Tjek om testene fejlede
  if [ $TEST_RESULT -ne 0 ]; then
    echo "❌ Tests fejlede! Ralph stopper loopet, så du kan inspicere fejlen manuelt."
    exit 1
  fi

  # 4. GIT COMMIT: Gem ændringerne i Git
  echo "✅ Tests bestået. Committer ændringer..."
  git add .
  git commit -m "feat(ai): $TASK"

  # 5. STATE UPDATE: Fjern den fuldførte opgave fra TODO.md
  # Dette gemmer resten af filen (fra linje 2 og ned) tilbage i TODO.md
  tail -n +2 "$TODO_FILE" > "$TODO_FILE.tmp" && mv "$TODO_FILE.tmp" "$TODO_FILE"

  echo "🔄 Opgave fuldført. Gør klar til næste iteration..."
  sleep 2 # En lille pause for at sikre, at filsystemet er med
done