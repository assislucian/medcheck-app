#!/bin/bash

# Security Audit Script for MedCheck
# Runs comprehensive security checks on frontend and backend

set -e

echo "🔒 MedCheck Security Audit Starting..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0
CHECKS_PASSED=0

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((ISSUES_FOUND++))
    fi
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo
echo "🔍 Checking Environment..."
echo "----------------------------"

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

print_info "Current directory: $(pwd)"
print_info "Git branch: $(git branch --show-current 2>/dev/null || echo 'Not a git repository')"

echo
echo "🐍 Backend Security Audit..."
echo "------------------------------"

# Check if Python dependencies are installed
if command -v python &> /dev/null; then
    print_info "Python version: $(python --version)"
    
    # Install safety if not available
    if ! python -c "import safety" &> /dev/null; then
        print_warning "Installing Safety..."
        pip install safety bandit
    fi
    
    # Run Safety check
    print_info "Running Safety audit..."
    if safety check --json > safety-report.json 2>/dev/null; then
        VULNS=$(python -c "import json; data=json.load(open('safety-report.json')); print(data['report_meta']['vulnerabilities_found'])" 2>/dev/null || echo "0")
        if [ "$VULNS" -eq 0 ]; then
            print_status 0 "Safety audit - No vulnerabilities found"
        else
            print_status 1 "Safety audit - $VULNS vulnerabilities found"
        fi
    else
        print_status 1 "Safety audit failed"
    fi
    
    # Run Bandit check
    print_info "Running Bandit security analysis..."
    if bandit -r src/ -f json -o bandit-report.json -ll &> /dev/null; then
        print_status 0 "Bandit analysis - No high/medium severity issues"
    else
        BANDIT_ISSUES=$(cat bandit-report.json | python -c "import json, sys; data=json.load(sys.stdin); print(len([r for r in data['results'] if r['issue_severity'] in ['HIGH', 'MEDIUM']]))" 2>/dev/null || echo "0")
        if [ "$BANDIT_ISSUES" -eq 0 ]; then
            print_status 0 "Bandit analysis - No high/medium severity issues"
        else
            print_status 1 "Bandit analysis - $BANDIT_ISSUES high/medium issues found"
        fi
    fi
    
    # Check pip dependencies
    print_info "Checking pip dependencies..."
    if pip check &> /dev/null; then
        print_status 0 "Pip dependencies - No conflicts found"
    else
        print_status 1 "Pip dependencies - Conflicts detected"
    fi
    
else
    print_status 1 "Python not found"
fi

echo
echo "🌐 Frontend Security Audit..."
echo "------------------------------"

# Check if in frontend directory or if frontend exists
if [ -d "frontend" ]; then
    cd frontend
fi

if [ -f "package.json" ]; then
    print_info "Node.js version: $(node --version 2>/dev/null || echo 'Not installed')"
    print_info "npm version: $(npm --version 2>/dev/null || echo 'Not installed')"
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Installing npm dependencies..."
        npm ci
    fi
    
    # Run npm audit
    print_info "Running npm audit..."
    if npm audit --audit-level high &> /dev/null; then
        print_status 0 "npm audit - No high/critical vulnerabilities"
    else
        AUDIT_RESULT=$(npm audit --audit-level high --json 2>/dev/null | jq -r '.metadata.vulnerabilities.high + .metadata.vulnerabilities.critical' 2>/dev/null || echo "unknown")
        if [ "$AUDIT_RESULT" = "0" ]; then
            print_status 0 "npm audit - No high/critical vulnerabilities"
        else
            print_status 1 "npm audit - High/critical vulnerabilities found"
        fi
    fi
    
    # Run ESLint security check
    print_info "Running ESLint security check..."
    if npx eslint src/ --ext .ts,.tsx --max-warnings 0 &> /dev/null; then
        print_status 0 "ESLint - No security warnings"
    else
        print_status 1 "ESLint - Security warnings found"
    fi
    
    # Test build
    print_info "Testing production build..."
    if npm run build &> build.log; then
        print_status 0 "Production build - Success"
        rm -f build.log
    else
        print_status 1 "Production build - Failed (check build.log)"
    fi
    
else
    print_status 1 "package.json not found"
fi

# Return to root if we changed directories
if [ -d "../" ] && [ -f "../requirements.txt" ]; then
    cd ..
fi

echo
echo "🔐 Security Configuration Check..."
echo "-----------------------------------"

# Check for common security files
if [ -f ".github/workflows/security-audit.yml" ]; then
    print_status 0 "GitHub security workflow exists"
else
    print_status 1 "GitHub security workflow missing"
fi

if [ -f ".github/dependabot.yml" ]; then
    print_status 0 "Dependabot configuration exists"
else
    print_status 1 "Dependabot configuration missing"
fi

if [ -f "SECURITY.md" ]; then
    print_status 0 "Security policy exists"
else
    print_status 1 "Security policy missing"
fi

# Check for secrets in common files
print_info "Checking for exposed secrets..."
SECRETS_FOUND=0
for file in .env .env.local .env.production; do
    if [ -f "$file" ] && git ls-files --error-unmatch "$file" &> /dev/null; then
        print_status 1 "Environment file $file is tracked by git"
        ((SECRETS_FOUND++))
    fi
done

if [ $SECRETS_FOUND -eq 0 ]; then
    print_status 0 "No environment files tracked by git"
fi

echo
echo "📊 Security Audit Summary"
echo "=========================="
echo -e "${GREEN}Checks Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Issues Found: $ISSUES_FOUND${NC}"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 All security checks passed!${NC}"
    echo -e "${GREEN}Your application is secure and ready for deployment.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  $ISSUES_FOUND security issues need attention.${NC}"
    echo -e "${YELLOW}Please review the issues above before deploying.${NC}"
    exit 1
fi 