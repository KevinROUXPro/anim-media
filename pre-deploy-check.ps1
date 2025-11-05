# Script de verification avant deploiement
# Usage: .\pre-deploy-check.ps1

Write-Host ""
Write-Host "Verification du projet avant deploiement..." -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

function Check-Pass {
    param([string]$message)
    Write-Host "[OK] $message" -ForegroundColor Green
}

function Check-Fail {
    param([string]$message)
    Write-Host "[ERREUR] $message" -ForegroundColor Red
    $script:errors++
}

function Check-Warn {
    param([string]$message)
    Write-Host "[ATTENTION] $message" -ForegroundColor Yellow
    $script:warnings++
}

# 1. Verifier node_modules
Write-Host "Verification des dependances..." -ForegroundColor White
if (Test-Path "node_modules") {
    Check-Pass "node_modules existe"
} else {
    Check-Fail "node_modules n'existe pas. Executez 'npm install'"
}

# 2. Verifier .env.local
Write-Host ""
Write-Host "Verification des variables d'environnement..." -ForegroundColor White
if (Test-Path ".env.local") {
    Check-Pass ".env.local existe"
    
    $envContent = Get-Content ".env.local" -Raw
    $required_vars = @(
        "NEXT_PUBLIC_FIREBASE_API_KEY",
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
        "NEXT_PUBLIC_FIREBASE_APP_ID"
    )
    
    foreach ($var in $required_vars) {
        if ($envContent -match "$var=") {
            Check-Pass "$var defini"
        } else {
            Check-Fail "$var manquant dans .env.local"
        }
    }
} else {
    Check-Fail ".env.local n'existe pas. Copiez .env.example"
}

# 3. Verifier .gitignore
Write-Host ""
Write-Host "Verification de .gitignore..." -ForegroundColor White
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    
    if ($gitignoreContent -match "\.env") {
        Check-Pass ".env* est dans .gitignore"
    } else {
        Check-Fail ".env* n'est pas dans .gitignore"
    }
    
    if ($gitignoreContent -match "\.vercel") {
        Check-Pass ".vercel est dans .gitignore"
    } else {
        Check-Warn ".vercel n'est pas dans .gitignore"
    }
} else {
    Check-Fail ".gitignore n'existe pas"
}

# 4. Verifier vercel.json
Write-Host ""
Write-Host "Verification de la configuration Vercel..." -ForegroundColor White
if (Test-Path "vercel.json") {
    Check-Pass "vercel.json existe"
} else {
    Check-Warn "vercel.json n'existe pas (optionnel)"
}

# 5. Verifier package.json
Write-Host ""
Write-Host "Verification de package.json..." -ForegroundColor White
if (Test-Path "package.json") {
    Check-Pass "package.json existe"
    
    $packageContent = Get-Content "package.json" -Raw
    
    if ($packageContent -match '"build"') {
        Check-Pass "Script 'build' defini"
    } else {
        Check-Fail "Script 'build' manquant"
    }
    
    if ($packageContent -match '"start"') {
        Check-Pass "Script 'start' defini"
    } else {
        Check-Fail "Script 'start' manquant"
    }
} else {
    Check-Fail "package.json n'existe pas"
}

# 6. Verifier les fichiers TypeScript critiques
Write-Host ""
Write-Host "Verification des fichiers TypeScript..." -ForegroundColor White
$criticalFiles = @(
    "src/lib/firebase.ts",
    "src/contexts/AuthContext.tsx",
    "src/types/index.ts"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Check-Pass "$file existe"
    } else {
        Check-Fail "$file manquant"
    }
}

# 7. Test du build
Write-Host ""
Write-Host "Test du build..." -ForegroundColor White
Write-Host "   (Cela peut prendre quelques minutes...)" -ForegroundColor Gray

try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Check-Pass "Build reussi"
    } else {
        Check-Fail "Build echoue. Executez 'npm run build' pour voir les erreurs"
        Write-Host $buildOutput -ForegroundColor Red
    }
} catch {
    Check-Fail "Erreur lors du test de build: $_"
}

# Resume
Write-Host ""
Write-Host "============================================" -ForegroundColor White

if ($errors -eq 0) {
    Write-Host ""
    Write-Host "Pret pour le deploiement !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes :" -ForegroundColor Cyan
    Write-Host "1. git add ." -ForegroundColor White
    Write-Host "2. git commit -m 'Ready for deployment'" -ForegroundColor White
    Write-Host "3. git push" -ForegroundColor White
    Write-Host "4. Deployez sur Vercel (voir docs/DEPLOYMENT.md)" -ForegroundColor White
    Write-Host ""
    exit 0
} else {
    Write-Host ""
    Write-Host "$errors erreur(s) trouvee(s)" -ForegroundColor Red
    if ($warnings -gt 0) {
        Write-Host "$warnings avertissement(s)" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Corrigez les erreurs avant de deployer." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
