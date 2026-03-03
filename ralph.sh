#!/bin/bash

TODO_FILE="TODO.md"

echo "🚀 Starter The Ralph Loop..."

while true; do
    # 1. READ CONTEXT: Læs alt indtil den første '---' separator
    # Vi bruger awk til at snappe den første blok
    TASK=$(awk '/---/{exit} {print}' "$TODO_FILE")

    # Hvis TASK er tom (pga. tom fil), så stop
    if [[ -z "${TASK//[[:space:]]/}" ]]; then
        echo "🎉 Ingen flere opgaver i $TODO_FILE. Ralph er færdig!"
        break
    fi

    echo "---------------------------------------------------"
    echo "👉 Næste del-opgave:"
    echo "$TASK"
    echo "---------------------------------------------------"

    # 2. EXECUTE TASK: One-shot mode med /dev/null fix
    claude -y "Udfør følgende del-opgave: $TASK. Brug CLAUDE.md som guide." < /dev/null

    # 3. RUN TESTS
    echo "🧪 Kører tests..."
    npm test
    TEST_RESULT=$?

    if [ $TEST_RESULT -ne 0 ]; then
        echo "❌ Tests fejlede! Ralph stopper."
        exit 1
    fi

    # 4. GIT COMMIT & PUSH
    echo "✅ Committer ændringer..."
    git add .
    git commit -m "Ralph Loop: Fuldført del-opgave"
    git push

    # 5. STATE UPDATE: Fjern den udførte blok (alt indtil første ---)
    # Hvis der er en '---', sletter vi alt til og med den. 
    # Hvis ikke, tømmer vi bare filen.
    if grep -q "---" "$TODO_FILE"; then
        sed -i '1,/---/d' "$TODO_FILE"
    else
        > "$TODO_FILE"
    fi

    echo "🔄 Blok fuldført. Venter 2 sekunder på næste blok..."
    sleep 2
done