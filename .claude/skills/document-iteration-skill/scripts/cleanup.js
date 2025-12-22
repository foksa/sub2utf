#!/usr/bin/env node
/**
 * Document Iteration Skill - Cleanup Script (Node.js)
 *
 * Removes iteration markers from markdown files:
 * - %% ... %% blocks (user comments)
 * - •%%> ... <%%• blocks (Claude responses, with bullet markers)
 * - %%> ... <%% blocks (Claude responses, legacy format)
 * - ==text(TOKEN)== -> text (keeps content, strips markup)
 *
 * Usage:
 *     node cleanup.js document.md
 *     node cleanup.js --check document.md  (dry-run)
 *     node cleanup.js --recursive docs/    (process directory)
 */

const fs = require('fs');
const path = require('path');

/**
 * Remove all iteration markers from content.
 * @param {string} content - The file content
 * @returns {{cleaned: string, stats: object}}
 */
function removeMarkers(content) {
  const stats = {
    userComments: (content.match(/%%(?!>)[^%]*%%/g) || []).length,
    claudeResponses: (content.match(/•?%%>[^<]*<%%•?/g) || []).length,
    highlights: (content.match(/==([^=]+)\(([^)]+)\)==/g) || []).length,
  };

  // Remove •%%> ... <%%• (Claude responses with bullets) - multiline
  content = content.replace(/•%%>[\s\S]*?<%%•\n?/g, '');

  // Remove %%> ... <%% (Claude responses, legacy format) - multiline
  content = content.replace(/%%>[\s\S]*?<%%\n?/g, '');

  // Remove %% ... %% (user comments) - multiline
  // But NOT the %%> pattern (already handled above)
  content = content.replace(/%%(?!>)[\s\S]*?%%\n?/g, '');

  // Convert ==text(TOKEN)== to text (keep content, strip markup)
  content = content.replace(/==([^=]+)\(([^)]+)\)==/g, '$1');

  // Convert ==text== to text (highlights without tokens)
  content = content.replace(/==([^=]+)==/g, '$1');

  // Fix double blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  // Fix trailing whitespace on lines
  content = content.replace(/ +\n/g, '\n');

  return { cleaned: content, stats };
}

/**
 * Check for markers without removing them.
 * @param {string} content - The file content
 * @returns {object} - Marker counts
 */
function checkMarkers(content) {
  return {
    userComments: (content.match(/%%(?!>)[^%]*%%/g) || []).length,
    claudeResponses: (content.match(/•?%%>[^<]*<%%•?/g) || []).length,
    highlights: (content.match(/==([^=]+)\(([^)]+)\)==/g) || []).length,
    highlightsNoToken: (content.match(/==([^=(]+)==(?!\()/g) || []).length,
    wipSections: (content.match(/%%\s*WIP\s*%%/gi) || []).length,
  };
}

/**
 * Process a single file.
 * @param {string} filepath - Path to the file
 * @param {boolean} checkOnly - If true, only report markers without removing
 * @returns {{hasMarkers: boolean, stats: object}}
 */
function processFile(filepath, checkOnly = false) {
  const content = fs.readFileSync(filepath, 'utf-8');

  if (checkOnly) {
    const stats = checkMarkers(content);
    const hasMarkers = Object.values(stats).some(v => v > 0);
    return { hasMarkers, stats };
  } else {
    const { cleaned, stats } = removeMarkers(content);
    const hasMarkers = Object.values(stats).some(v => v > 0);
    if (hasMarkers) {
      fs.writeFileSync(filepath, cleaned, 'utf-8');
    }
    return { hasMarkers, stats };
  }
}

/**
 * Recursively find all markdown files in a directory.
 * @param {string} dir - Directory path
 * @param {boolean} recursive - Whether to search recursively
 * @returns {string[]} - Array of file paths
 */
function findMarkdownFiles(dir, recursive = false) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory() && recursive) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Parse command line arguments.
 * @returns {object} - Parsed arguments
 */
function parseArgs() {
  const args = {
    path: null,
    check: false,
    recursive: false,
    quiet: false,
  };

  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--check') {
      args.check = true;
    } else if (arg === '--recursive' || arg === '-r') {
      args.recursive = true;
    } else if (arg === '--quiet' || arg === '-q') {
      args.quiet = true;
    } else if (!arg.startsWith('-')) {
      args.path = arg;
    }
  }

  return args;
}

function main() {
  const args = parseArgs();

  if (!args.path) {
    console.error('Usage: node cleanup.js [--check] [--recursive] [--quiet] <file-or-directory>');
    process.exit(1);
  }

  if (!fs.existsSync(args.path)) {
    console.error(`Error: ${args.path} does not exist`);
    process.exit(1);
  }

  let filesToProcess = [];
  const stat = fs.statSync(args.path);

  if (stat.isFile()) {
    filesToProcess = [args.path];
  } else if (stat.isDirectory()) {
    filesToProcess = findMarkdownFiles(args.path, args.recursive);
  }

  if (filesToProcess.length === 0) {
    console.error('No markdown files found');
    process.exit(1);
  }

  let totalMarkers = 0;
  let filesWithMarkers = 0;

  for (const filepath of filesToProcess) {
    const { hasMarkers, stats } = processFile(filepath, args.check);

    if (hasMarkers) {
      filesWithMarkers++;
      const markerCount = Object.values(stats).reduce((a, b) => a + b, 0);
      totalMarkers += markerCount;

      if (!args.quiet) {
        const action = args.check ? 'Found' : 'Cleaned';
        console.log(`${action}: ${filepath}`);
        if (stats.userComments) {
          console.log(`  - ${stats.userComments} user comments`);
        }
        if (stats.claudeResponses) {
          console.log(`  - ${stats.claudeResponses} Claude responses`);
        }
        if (stats.highlights) {
          console.log(`  - ${stats.highlights} highlights with tokens`);
        }
        if (stats.highlightsNoToken) {
          console.log(`  - ${stats.highlightsNoToken} highlights without tokens`);
        }
        if (stats.wipSections) {
          console.log(`  - ${stats.wipSections} WIP sections`);
        }
      }
    }
  }

  if (!args.quiet) {
    console.log();
    if (args.check) {
      console.log(`Summary: ${totalMarkers} markers in ${filesWithMarkers} file(s)`);
    } else {
      console.log(`Cleaned: ${totalMarkers} markers from ${filesWithMarkers} file(s)`);
    }
  }

  // Exit code 1 if markers found (for CI/CD integration)
  if (args.check && totalMarkers > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main();