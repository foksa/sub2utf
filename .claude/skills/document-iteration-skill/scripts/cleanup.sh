#!/bin/bash
#
# Document Iteration Skill - Cleanup Script (Bash)
#
# Removes iteration markers from markdown files:
# - %% ... %% blocks (user comments)
# - •%%> ... <%%• blocks (Claude responses)
# - ==text(TOKEN)== -> text (keeps content, strips markup)
#
# Usage:
#   ./cleanup.sh document.md
#   ./cleanup.sh --check document.md
#   ./cleanup.sh --recursive docs/

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Parse arguments
CHECK_ONLY=false
RECURSIVE=false
TARGET=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --check|-c)
            CHECK_ONLY=true
            shift
            ;;
        --recursive|-r)
            RECURSIVE=true
            shift
            ;;
        -*)
            echo "Unknown option: $1"
            echo "Usage: $0 [--check] [--recursive] <file-or-directory>"
            exit 1
            ;;
        *)
            TARGET="$1"
            shift
            ;;
    esac
done

if [[ -z "$TARGET" ]]; then
    echo "Usage: $0 [--check] [--recursive] <file-or-directory>"
    exit 1
fi

if [[ ! -e "$TARGET" ]]; then
    echo "Error: $TARGET does not exist"
    exit 1
fi

# Function to count markers in a file
count_markers() {
    local file="$1"

    # Count user comments: %% ... %% (not starting with >)
    local user_comments
    user_comments=$(grep -oE '%%[^%]*%%' "$file" 2>/dev/null | grep -v '^%%>' | wc -l | tr -d ' ')

    # Count Claude responses: •%%> ... <%%•
    local claude_responses
    claude_responses=$(grep -oE '•?%%>' "$file" 2>/dev/null | wc -l | tr -d ' ')

    # Count highlights with tokens: ==text(TOKEN)==
    local highlights
    highlights=$(grep -oE '==[^=]+\([^)]+\)==' "$file" 2>/dev/null | wc -l | tr -d ' ')

    # Count WIP sections
    local wip_sections
    wip_sections=$(grep -iE '%%\s*WIP\s*%%' "$file" 2>/dev/null | wc -l | tr -d ' ')

    echo "$user_comments $claude_responses $highlights $wip_sections"
}

# Function to clean a file
clean_file() {
    local file="$1"
    local tmpfile
    tmpfile=$(mktemp)

    # Use perl for reliable multiline regex (available on macOS and most Linux)
    if command -v perl &> /dev/null; then
        perl -0777 -pe '
            # Remove •%%> ... <%%• (Claude responses with bullets)
            s/•%%>[\s\S]*?<%%•\n?//g;
            # Remove %%> ... <%% (legacy format)
            s/%%>[\s\S]*?<%%\n?//g;
            # Remove %% ... %% (user comments, but not %%>)
            s/%%(?!>)[\s\S]*?%%\n?//g;
            # Convert ==text(TOKEN)== to text
            s/==([^=]+)\([^)]+\)==/$1/g;
            # Convert ==text== to text (no token)
            s/==([^=]+)==/$1/g;
            # Fix multiple blank lines
            s/\n{3,}/\n\n/g;
            # Fix trailing whitespace
            s/ +\n/\n/g;
        ' "$file" > "$tmpfile"

        cat "$tmpfile" > "$file"
        rm "$tmpfile"
    else
        echo "Error: perl is required for multiline regex support"
        exit 1
    fi
}

# Get list of files to process
FILES=()
if [[ -f "$TARGET" ]]; then
    FILES=("$TARGET")
elif [[ -d "$TARGET" ]]; then
    if $RECURSIVE; then
        while IFS= read -r -d '' file; do
            FILES+=("$file")
        done < <(find "$TARGET" -name "*.md" -type f -print0)
    else
        while IFS= read -r -d '' file; do
            FILES+=("$file")
        done < <(find "$TARGET" -maxdepth 1 -name "*.md" -type f -print0)
    fi
fi

if [[ ${#FILES[@]} -eq 0 ]]; then
    echo "No markdown files found"
    exit 1
fi

# Process files
total_markers=0
files_with_markers=0

for file in "${FILES[@]}"; do
    read -r user_comments claude_responses highlights wip_sections <<< "$(count_markers "$file")"
    marker_count=$((user_comments + claude_responses + highlights))

    if [[ $marker_count -gt 0 ]]; then
        ((files_with_markers++)) || true
        ((total_markers += marker_count)) || true

        if $CHECK_ONLY; then
            echo "Found: $file"
        else
            clean_file "$file"
            echo -e "${GREEN}Cleaned:${NC} $file"
        fi

        [[ $user_comments -gt 0 ]] && echo "  - $user_comments user comments"
        [[ $claude_responses -gt 0 ]] && echo "  - $claude_responses Claude responses"
        [[ $highlights -gt 0 ]] && echo "  - $highlights highlights"
        [[ $wip_sections -gt 0 ]] && echo -e "  - ${YELLOW}$wip_sections WIP sections${NC}"
    fi
done

echo ""
if $CHECK_ONLY; then
    echo "Summary: $total_markers markers in $files_with_markers file(s)"
    [[ $total_markers -gt 0 ]] && exit 1
else
    echo "Cleaned: $total_markers markers from $files_with_markers file(s)"
fi

exit 0
