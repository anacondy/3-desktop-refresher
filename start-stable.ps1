Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Retro Desktop Refresher (Stable)..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$StableVersionUrl = "https://raw.githubusercontent.com/anacondy/3-desktop-refresher/main/stable-version.txt"
$StartScriptUrl = "https://raw.githubusercontent.com/anacondy/3-desktop-refresher/main/start.ps1"

function Get-StableVersion {
    param(
        [string]$Url
    )

    try {
        $version = (Invoke-RestMethod -Uri $Url -UseBasicParsing).Trim()
    }
    catch {
        Write-Host "  ❌ Unable to fetch stable version info: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }

    if ($version -match '^[0-9a-fA-F]{7,40}$') {
        return $version
    }

    return $null
}

$stableRef = Get-StableVersion -Url $StableVersionUrl

if (-not $stableRef) {
    Write-Host "  ❌ Unable to determine the stable version." -ForegroundColor Red
    Write-Host "  💡 Check https://github.com/anacondy/3-desktop-refresher/blob/main/stable-version.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host "Using stable version $stableRef" -ForegroundColor Yellow
$env:RETRO_REFRESHER_REF = $stableRef

try {
    $startScript = Invoke-RestMethod -Uri $StartScriptUrl -UseBasicParsing
}
catch {
    Write-Host "  ❌ Unable to download the startup script." -ForegroundColor Red
    exit 1
}

Invoke-Expression $startScript
