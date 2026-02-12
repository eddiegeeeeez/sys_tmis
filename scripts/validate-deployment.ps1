# Pre-Deployment Validation Script
# Checks if everything is ready for deployment

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "TradeMatrix Pre-Deployment Validator" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true
$warnings = @()

# Change to project root
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "Project Root: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Check 1: .NET SDK
Write-Host "Check 1: .NET SDK..." -ForegroundColor Green
try {
    $dotnetVersion = dotnet --version
    Write-Host "  ✓ .NET SDK installed: $dotnetVersion" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ .NET SDK not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 2: Node.js
Write-Host ""
Write-Host "Check 2: Node.js..." -ForegroundColor Green
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Gray
} catch {
    Write-Host "  ✗ Node.js not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 3: Backend Configuration
Write-Host ""
Write-Host "Check 3: Backend Configuration..." -ForegroundColor Green
$appSettingsPath = "backend\TradeMatrix.Server\appsettings.Production.json"
if (Test-Path $appSettingsPath) {
    $appsettings = Get-Content $appSettingsPath -Raw | ConvertFrom-Json
    
    # Check Frontend URL
    $frontendUrl = $appsettings.Frontend.ProductionUrl
    if ($frontendUrl -eq "https://tradematrix.tryasp.net") {
        Write-Host "  ✓ Frontend URL configured: $frontendUrl" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ Frontend URL might be wrong: $frontendUrl" -ForegroundColor Yellow
        $warnings += "Frontend URL in appsettings.Production.json"
    }
    
    # Check JWT Key
    $jwtKey = $appsettings.Jwt.Key
    if ($jwtKey -like "*ChangeThis*" -or $jwtKey -like "*YourVerySecure*") {
        Write-Host "  ⚠ JWT Key needs to be changed!" -ForegroundColor Yellow
        $warnings += "JWT Key is still using default/placeholder value"
    } else {
        Write-Host "  ✓ JWT Key appears customized" -ForegroundColor Gray
    }
} else {
    Write-Host "  ✗ appsettings.Production.json not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 4: Frontend Configuration
Write-Host ""
Write-Host "Check 4: Frontend Configuration..." -ForegroundColor Green
$envProdPath = "frontend\.env.production"
if (Test-Path $envProdPath) {
    $envContent = Get-Content $envProdPath -Raw
    if ($envContent -match "tradematrix.tryasp.net") {
        Write-Host "  ✓ API URL configured for tradematrix.tryasp.net" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ API URL might not be configured correctly" -ForegroundColor Yellow
        $warnings += ".env.production API URL"
    }
} else {
    Write-Host "  ✗ .env.production not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 5: Next.js Config
Write-Host ""
Write-Host "Check 5: Next.js Configuration..." -ForegroundColor Green
$nextConfigPath = "frontend\next.config.ts"
if (Test-Path $nextConfigPath) {
    $nextConfig = Get-Content $nextConfigPath -Raw
    if ($nextConfig -match "output: 'export'") {
        Write-Host "  ✓ Static export enabled" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ Static export not enabled (needs to be uncommented)" -ForegroundColor Yellow
        $warnings += "next.config.ts - uncomment output: 'export'"
    }
} else {
    Write-Host "  ✗ next.config.ts not found!" -ForegroundColor Red
    $allGood = $false
}

# Check 6: Backend Build Test
Write-Host ""
Write-Host "Check 6: Backend Build..." -ForegroundColor Green
Push-Location "backend\TradeMatrix.Server"
try {
    $buildOutput = dotnet build --no-restore 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Backend builds successfully" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Backend build failed!" -ForegroundColor Red
        Write-Host "    Error: $buildOutput" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host "  ✗ Backend build error: $_" -ForegroundColor Red
    $allGood = $false
}
Pop-Location

# Check 7: Frontend Dependencies
Write-Host ""
Write-Host "Check 7: Frontend Dependencies..." -ForegroundColor Green
if (Test-Path "frontend\node_modules") {
    Write-Host "  ✓ node_modules exists" -ForegroundColor Gray
} else {
    Write-Host "  ⚠ node_modules not found - run 'npm install'" -ForegroundColor Yellow
    $warnings += "Run 'npm install' in frontend folder"
}

# Check 8: Required Files
Write-Host ""
Write-Host "Check 8: Required Files..." -ForegroundColor Green
$requiredFiles = @(
    "backend\TradeMatrix.Server\web.config",
    "frontend\web.config"
)
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file exists" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ $file missing!" -ForegroundColor Red
        $allGood = $false
    }
}

# Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Validation Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if ($allGood -and $warnings.Count -eq 0) {
    Write-Host "✓ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You are ready to deploy!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Run .\scripts\build-backend.ps1" -ForegroundColor White
    Write-Host "  2. Run .\scripts\build-frontend.ps1" -ForegroundColor White
    Write-Host "  3. Follow DEPLOY_TRADEMATRIX.md" -ForegroundColor White
} elseif ($warnings.Count -gt 0 -and $allGood) {
    Write-Host "⚠ CHECKS PASSED WITH WARNINGS" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Warnings to address:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  • $warning" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "You can proceed, but review warnings first." -ForegroundColor Yellow
} else {
    Write-Host "✗ VALIDATION FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the errors above before deploying." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
