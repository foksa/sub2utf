#!/usr/bin/env python3
"""
Document Iteration Skill - Cleanup Script

Removes iteration markers from markdown files:
- %% ... %% blocks (user comments)
- •%%> ... <%%• blocks (Claude responses, with bullet markers)
- %%> ... <%% blocks (Claude responses, legacy format)
- ==text(TOKEN)== -> text (keeps content, strips markup)

Usage:
    python cleanup.py document.md
    python cleanup.py --check document.md  (dry-run)
    python cleanup.py --recursive docs/    (process directory)
"""

import argparse
import re
import sys
from pathlib import Path


def remove_markers(content: str) -> tuple[str, dict]:
    """
    Remove all iteration markers from content.

    Returns:
        tuple: (cleaned_content, stats_dict)
    """
    stats = {
        'user_comments': 0,
        'claude_responses': 0,
        'highlights': 0,
    }

    # Count before removing (both new bullet format and legacy format)
    stats['user_comments'] = len(re.findall(r'%%(?!>)[^%]*%%', content))
    stats['claude_responses'] = len(re.findall(r'•?%%>[^<]*<%%•?', content))
    stats['highlights'] = len(re.findall(r'==([^=]+)\(([^)]+)\)==', content))

    # Remove •%%> ... <%%• (Claude responses with bullets) - multiline
    content = re.sub(r'•%%>[\s\S]*?<%%•\n?', '', content)

    # Remove %%> ... <%% (Claude responses, legacy format) - multiline
    content = re.sub(r'%%>[\s\S]*?<%%\n?', '', content)

    # Remove %% ... %% (user comments) - multiline
    # But NOT the %%> pattern (already handled above)
    content = re.sub(r'%%(?!>)[\s\S]*?%%\n?', '', content)

    # Convert ==text(TOKEN)== to text (keep content, strip markup)
    content = re.sub(r'==([^=]+)\(([^)]+)\)==', r'\1', content)

    # Convert ==text== to text (highlights without tokens)
    content = re.sub(r'==([^=]+)==', r'\1', content)

    # Fix double blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Fix trailing whitespace on lines
    content = re.sub(r' +\n', '\n', content)

    return content, stats


def check_markers(content: str) -> dict:
    """
    Check for markers without removing them.

    Returns:
        dict with marker counts
    """
    return {
        'user_comments': len(re.findall(r'%%(?!>)[^%]*%%', content)),
        'claude_responses': len(re.findall(r'•?%%>[^<]*<%%•?', content)),
        'highlights': len(re.findall(r'==([^=]+)\(([^)]+)\)==', content)),
        'highlights_no_token': len(re.findall(r'==([^=(]+)==(?!\()', content)),
        'wip_sections': len(re.findall(r'%%\s*WIP\s*%%', content, re.IGNORECASE)),
    }


def process_file(filepath: Path, check_only: bool = False) -> tuple[bool, dict]:
    """
    Process a single file.

    Args:
        filepath: Path to the file
        check_only: If True, only report markers without removing

    Returns:
        tuple: (has_markers, stats_dict)
    """
    content = filepath.read_text(encoding='utf-8')

    if check_only:
        stats = check_markers(content)
        has_markers = any(stats.values())
        return has_markers, stats
    else:
        cleaned, stats = remove_markers(content)
        if any(stats.values()):
            filepath.write_text(cleaned, encoding='utf-8')
        return any(stats.values()), stats


def main():
    parser = argparse.ArgumentParser(
        description='Remove iteration markers from markdown files'
    )
    parser.add_argument(
        'path',
        type=Path,
        help='File or directory to process'
    )
    parser.add_argument(
        '--check',
        action='store_true',
        help='Check for markers without removing (dry-run)'
    )
    parser.add_argument(
        '--recursive', '-r',
        action='store_true',
        help='Process directory recursively'
    )
    parser.add_argument(
        '--quiet', '-q',
        action='store_true',
        help='Suppress output except errors'
    )

    args = parser.parse_args()

    if not args.path.exists():
        print(f"Error: {args.path} does not exist", file=sys.stderr)
        sys.exit(1)

    files_to_process = []

    if args.path.is_file():
        files_to_process = [args.path]
    elif args.path.is_dir():
        if args.recursive:
            files_to_process = list(args.path.rglob('*.md'))
        else:
            files_to_process = list(args.path.glob('*.md'))

    if not files_to_process:
        print("No markdown files found", file=sys.stderr)
        sys.exit(1)

    total_markers = 0
    files_with_markers = 0

    for filepath in files_to_process:
        has_markers, stats = process_file(filepath, check_only=args.check)

        if has_markers:
            files_with_markers += 1
            marker_count = sum(stats.values())
            total_markers += marker_count

            if not args.quiet:
                action = "Found" if args.check else "Cleaned"
                print(f"{action}: {filepath}")
                if stats.get('user_comments'):
                    print(f"  - {stats['user_comments']} user comments")
                if stats.get('claude_responses'):
                    print(f"  - {stats['claude_responses']} Claude responses")
                if stats.get('highlights'):
                    print(f"  - {stats['highlights']} highlights with tokens")
                if stats.get('highlights_no_token'):
                    print(f"  - {stats['highlights_no_token']} highlights without tokens")
                if stats.get('wip_sections'):
                    print(f"  - {stats['wip_sections']} WIP sections")

    if not args.quiet:
        print()
        if args.check:
            print(f"Summary: {total_markers} markers in {files_with_markers} file(s)")
        else:
            print(f"Cleaned: {total_markers} markers from {files_with_markers} file(s)")

    # Exit code 1 if markers found (for CI/CD integration)
    if args.check and total_markers > 0:
        sys.exit(1)

    sys.exit(0)


if __name__ == '__main__':
    main()
