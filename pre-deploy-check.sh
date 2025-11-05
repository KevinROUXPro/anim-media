#!/bin/bash

# Script de vérification avant déploiement
# Usage: ./pre-deploy-check.sh

echo "🔍 Vérification du projet avant déploiement..."
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Fonction pour afficher les résultats
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((errors++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((warnings++))
}

# 1. Vérifier node_modules
echo "📦 Vérification des dépendances..."
if [ -d "node_modules" ]; then
    check_pass "node_modules existe"
else
    check_fail "node_modules n'existe pas. Exécutez 'npm install'"
fi

# 2. Vérifier .env.local
echo ""
echo "🔐 Vérification des variables d'environnement..."
if [ -f ".env.local" ]; then
    check_pass ".env.local existe"
    
    # Vérifier les variables Firebase
    required_vars=(
        "NEXT_PUBLIC_FIREBASE_API_KEY"
        "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
        "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
        "NEXT_PUBLIC_FIREBASE_APP_ID"
    )
    
    for var in "${required_vars[@]}"; do
        if grep -q "$var=" ".env.local"; then
            check_pass "$var défini"
        else
            check_fail "$var manquant dans .env.local"
        fi
    done
else
    check_fail ".env.local n'existe pas. Copiez .env.example"
fi

# 3. Vérifier .gitignore
echo ""
echo "📁 Vérification de .gitignore..."
if [ -f ".gitignore" ]; then
    if grep -q ".env" ".gitignore"; then
        check_pass ".env* est dans .gitignore"
    else
        check_fail ".env* n'est pas dans .gitignore"
    fi
    
    if grep -q ".vercel" ".gitignore"; then
        check_pass ".vercel est dans .gitignore"
    else
        check_warn ".vercel n'est pas dans .gitignore"
    fi
else
    check_fail ".gitignore n'existe pas"
fi

# 4. Vérifier vercel.json
echo ""
echo "⚙️  Vérification de la configuration Vercel..."
if [ -f "vercel.json" ]; then
    check_pass "vercel.json existe"
else
    check_warn "vercel.json n'existe pas (optionnel)"
fi

# 5. Vérifier package.json
echo ""
echo "📋 Vérification de package.json..."
if [ -f "package.json" ]; then
    check_pass "package.json existe"
    
    if grep -q '"build"' "package.json"; then
        check_pass "Script 'build' défini"
    else
        check_fail "Script 'build' manquant"
    fi
    
    if grep -q '"start"' "package.json"; then
        check_pass "Script 'start' défini"
    else
        check_fail "Script 'start' manquant"
    fi
else
    check_fail "package.json n'existe pas"
fi

# 6. Tester le build
echo ""
echo "🏗️  Test du build..."
echo "   (Cela peut prendre quelques minutes...)"

if npm run build > /dev/null 2>&1; then
    check_pass "Build réussi"
else
    check_fail "Build échoué. Exécutez 'npm run build' pour voir les erreurs"
fi

# Résumé
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✓ Prêt pour le déploiement !${NC}"
    echo ""
    echo "Prochaines étapes :"
    echo "1. git add ."
    echo "2. git commit -m 'Ready for deployment'"
    echo "3. git push"
    echo "4. Déployez sur Vercel (voir DEPLOYMENT.md)"
    exit 0
else
    echo -e "${RED}✗ ${errors} erreur(s) trouvée(s)${NC}"
    if [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠ ${warnings} avertissement(s)${NC}"
    fi
    echo ""
    echo "Corrigez les erreurs avant de déployer."
    exit 1
fi
