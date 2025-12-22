#!/bin/bash
#
# Test runner for cleanup scripts
# Compares Python, Node, Bash, and PowerShell implementations
#

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PARENT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "======================================"
echo "Cleanup Script Test Runner"
echo "======================================"
echo ""

# Find all input files
INPUT_FILES=("$SCRIPT_DIR"/*-input.md)

if [[ ${#INPUT_FILES[@]} -eq 0 ]]; then
    echo "No test files found"
    exit 1
fi

echo "Found ${#INPUT_FILES[@]} test cases"
echo ""

# Scripts to test (name|command pairs)
SCRIPTS="python|python3 $PARENT_DIR/cleanup.py
node|node $PARENT_DIR/cleanup.js
bash|$PARENT_DIR/cleanup.sh"

# Add PowerShell if available
if command -v pwsh &> /dev/null; then
    SCRIPTS="$SCRIPTS
powershell|pwsh $PARENT_DIR/cleanup.ps1"
fi

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

for input_file in "${INPUT_FILES[@]}"; do
    test_name=$(basename "$input_file" -input.md)
    result_file="${input_file/-input.md/-result.md}"

    if [[ ! -f "$result_file" ]]; then
        echo -e "${YELLOW}SKIP${NC}: $test_name (no result file)"
        continue
    fi

    echo "Testing: $test_name"
    echo "----------------------------------------"

    echo "$SCRIPTS" | while IFS='|' read -r script_name script_cmd; do
        TOTAL_TESTS=$((TOTAL_TESTS + 1))

        # Create temp file with input content
        tmp_file=$(mktemp)
        cp "$input_file" "$tmp_file"

        # Run the script
        eval "$script_cmd" "$tmp_file" > /dev/null 2>&1 || true

        # Compare output
        if diff -q "$tmp_file" "$result_file" > /dev/null 2>&1; then
            echo -e "  ${GREEN}PASS${NC}: $script_name"
        else
            echo -e "  ${RED}FAIL${NC}: $script_name"
            echo "    --- Expected ---"
            cat "$result_file" | head -10 | sed 's/^/    /'
            echo "    --- Got ---"
            cat "$tmp_file" | head -10 | sed 's/^/    /'
        fi

        rm "$tmp_file"
    done

    echo ""
done

echo "======================================"
echo "Test run complete"
