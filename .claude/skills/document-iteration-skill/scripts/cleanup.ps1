<#
.SYNOPSIS
    Document Iteration Skill - Cleanup Script (PowerShell)

.DESCRIPTION
    Removes iteration markers from markdown files:
    - %% ... %% blocks (user comments)
    - •%%> ... <%%• blocks (Claude responses)
    - ==text(TOKEN)== -> text (keeps content, strips markup)

.PARAMETER Path
    File or directory to process

.PARAMETER Check
    Check for markers without removing (dry-run)

.PARAMETER Recursive
    Process directory recursively

.EXAMPLE
    .\cleanup.ps1 document.md
    .\cleanup.ps1 -Check document.md
    .\cleanup.ps1 -Recursive docs\
#>

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Path,

    [switch]$Check,
    [switch]$Recursive
)

function Remove-Markers {
    param([string]$Content)

    $stats = @{
        UserComments = 0
        ClaudeResponses = 0
        Highlights = 0
    }

    # Count markers before removing
    $stats.UserComments = ([regex]::Matches($Content, '%%(?!>)[^%]*%%')).Count
    $stats.ClaudeResponses = ([regex]::Matches($Content, '•?%%>[\s\S]*?<%%•?')).Count
    $stats.Highlights = ([regex]::Matches($Content, '==([^=]+)\(([^)]+)\)==')).Count

    # Remove •%%> ... <%%• (Claude responses with bullets)
    $Content = [regex]::Replace($Content, '•%%>[\s\S]*?<%%•\r?\n?', '')

    # Remove %%> ... <%% (legacy format)
    $Content = [regex]::Replace($Content, '%%>[\s\S]*?<%%\r?\n?', '')

    # Remove %% ... %% (user comments)
    $Content = [regex]::Replace($Content, '%%(?!>)[\s\S]*?%%\r?\n?', '')

    # Convert ==text(TOKEN)== to text
    $Content = [regex]::Replace($Content, '==([^=]+)\(([^)]+)\)==', '$1')

    # Convert ==text== to text (no token)
    $Content = [regex]::Replace($Content, '==([^=]+)==', '$1')

    # Fix multiple blank lines
    $Content = [regex]::Replace($Content, '(\r?\n){3,}', "`n`n")

    # Fix trailing whitespace
    $Content = [regex]::Replace($Content, ' +(\r?\n)', '$1')

    return @{
        Content = $Content
        Stats = $stats
    }
}

function Get-MarkerStats {
    param([string]$Content)

    return @{
        UserComments = ([regex]::Matches($Content, '%%(?!>)[^%]*%%')).Count
        ClaudeResponses = ([regex]::Matches($Content, '•?%%>[\s\S]*?<%%•?')).Count
        Highlights = ([regex]::Matches($Content, '==([^=]+)\(([^)]+)\)==')).Count
        HighlightsNoToken = ([regex]::Matches($Content, '==([^=(]+)==(?!\()')).Count
        WipSections = ([regex]::Matches($Content, '(?i)%%\s*WIP\s*%%')).Count
    }
}

# Main
if (-not (Test-Path $Path)) {
    Write-Error "Path does not exist: $Path"
    exit 1
}

$files = @()

if (Test-Path $Path -PathType Leaf) {
    $files = @(Get-Item $Path)
} else {
    if ($Recursive) {
        $files = Get-ChildItem -Path $Path -Filter "*.md" -Recurse
    } else {
        $files = Get-ChildItem -Path $Path -Filter "*.md"
    }
}

if ($files.Count -eq 0) {
    Write-Host "No markdown files found"
    exit 1
}

$totalMarkers = 0
$filesWithMarkers = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

    if ([string]::IsNullOrEmpty($content)) {
        continue
    }

    if ($Check) {
        $stats = Get-MarkerStats -Content $content
        $markerCount = $stats.UserComments + $stats.ClaudeResponses + $stats.Highlights
        $hasMarkers = $markerCount -gt 0

        if ($hasMarkers) {
            $filesWithMarkers++
            $totalMarkers += $markerCount

            Write-Host "Found: $($file.FullName)"
            if ($stats.UserComments -gt 0) { Write-Host "  - $($stats.UserComments) user comments" }
            if ($stats.ClaudeResponses -gt 0) { Write-Host "  - $($stats.ClaudeResponses) Claude responses" }
            if ($stats.Highlights -gt 0) { Write-Host "  - $($stats.Highlights) highlights with tokens" }
            if ($stats.HighlightsNoToken -gt 0) { Write-Host "  - $($stats.HighlightsNoToken) highlights without tokens" }
            if ($stats.WipSections -gt 0) { Write-Host "  - $($stats.WipSections) WIP sections" -ForegroundColor Yellow }
        }
    } else {
        $result = Remove-Markers -Content $content
        $stats = $result.Stats
        $markerCount = $stats.UserComments + $stats.ClaudeResponses + $stats.Highlights
        $hasMarkers = $markerCount -gt 0

        if ($hasMarkers) {
            $filesWithMarkers++
            $totalMarkers += $markerCount

            Set-Content -Path $file.FullName -Value $result.Content -Encoding UTF8 -NoNewline

            Write-Host "Cleaned: $($file.FullName)" -ForegroundColor Green
            if ($stats.UserComments -gt 0) { Write-Host "  - $($stats.UserComments) user comments" }
            if ($stats.ClaudeResponses -gt 0) { Write-Host "  - $($stats.ClaudeResponses) Claude responses" }
            if ($stats.Highlights -gt 0) { Write-Host "  - $($stats.Highlights) highlights" }
        }
    }
}

Write-Host ""
if ($Check) {
    Write-Host "Summary: $totalMarkers markers in $filesWithMarkers file(s)"
    if ($totalMarkers -gt 0) { exit 1 }
} else {
    Write-Host "Cleaned: $totalMarkers markers from $filesWithMarkers file(s)"
}

exit 0
