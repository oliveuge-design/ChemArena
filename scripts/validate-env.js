#!/usr/bin/env node

/**
 * ChemArena - Environment Variables Validator
 * Verifica che tutte le variabili d'ambiente necessarie siano configurate
 */

const fs = require('fs');
const path = require('path');

// Carica file .env.local se esiste
function loadEnvLocal() {
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
        const envContent = fs.readFileSync(envLocalPath, 'utf8');
        const lines = envContent.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const [key, ...valueParts] = trimmed.split('=');
                const value = valueParts.join('=');
                if (key && value && !process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
        console.log('📁 Loaded .env.local file');
    }
}

// Carica environment variables all'avvio
loadEnvLocal();

// Variabili d'ambiente richieste
const REQUIRED_ENV_VARS = {
    development: [
        'OPENAI_API_KEY',
        'NEXT_PUBLIC_SOCKET_URL'
    ],
    production: [
        'OPENAI_API_KEY',
        'NEXT_PUBLIC_SOCKET_URL',
        'NODE_ENV'
    ]
};

// Pattern per validare API keys
const VALIDATION_PATTERNS = {
    OPENAI_API_KEY: /^sk-(proj-)?[a-zA-Z0-9_-]{20,}$/,
    NEXT_PUBLIC_SOCKET_URL: /^https?:\/\/.+/
};

class EnvironmentValidator {
    constructor() {
        this.environment = process.env.NODE_ENV || 'development';
        this.errors = [];
        this.warnings = [];
    }

    validatePattern(varName, value, pattern) {
        if (!pattern.test(value)) {
            this.errors.push(`❌ ${varName}: Invalid format`);
            return false;
        }
        return true;
    }

    checkRequired() {
        console.log(`🔍 Validating environment: ${this.environment}`);
        console.log('');

        const required = REQUIRED_ENV_VARS[this.environment] || REQUIRED_ENV_VARS.development;

        for (const varName of required) {
            const value = process.env[varName];

            if (!value) {
                this.errors.push(`❌ ${varName}: Missing required environment variable`);
                continue;
            }

            // Validate format if pattern exists
            const pattern = VALIDATION_PATTERNS[varName];
            if (pattern) {
                if (this.validatePattern(varName, value, pattern)) {
                    console.log(`✅ ${varName}: Valid`);
                }
            } else {
                console.log(`✅ ${varName}: Present`);
            }
        }
    }

    checkSecurity() {
        console.log('\n🔐 Security checks:');

        // Check for common insecure values
        const insecureValues = ['test', 'demo', 'example', '123456', 'password'];

        for (const [key, value] of Object.entries(process.env)) {
            if (key.includes('API_KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
                if (insecureValues.some(bad => value?.toLowerCase().includes(bad))) {
                    this.warnings.push(`⚠️  ${key}: Appears to use insecure/demo value`);
                }

                if (value && value.length < 20) {
                    this.warnings.push(`⚠️  ${key}: Value seems too short for a secure key`);
                }
            }
        }
    }

    checkEnvFiles() {
        console.log('\n📁 Environment files check:');

        const envFiles = ['.env.local', '.env.development.local', '.env.production.local'];

        for (const file of envFiles) {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file}: Found`);

                // Check if .env file is in .gitignore
                if (fs.existsSync('.gitignore')) {
                    const gitignore = fs.readFileSync('.gitignore', 'utf8');
                    if (!gitignore.includes('.env.local') && !gitignore.includes('.env*.local')) {
                        this.warnings.push(`⚠️  .gitignore: Should include .env files`);
                    }
                }
            }
        }

        // Check .env.example
        if (fs.existsSync('.env.example')) {
            console.log(`✅ .env.example: Template found`);
        } else {
            this.warnings.push(`⚠️  .env.example: Missing template file`);
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(50));
        console.log('📊 ENVIRONMENT VALIDATION REPORT');
        console.log('='.repeat(50));

        if (this.errors.length === 0) {
            console.log('✅ All required environment variables are valid!');
        } else {
            console.log('\n🚨 ERRORS FOUND:');
            this.errors.forEach(error => console.log(`   ${error}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.forEach(warning => console.log(`   ${warning}`));
        }

        console.log('\n💡 TIPS:');
        console.log('   • Store secrets in .env.local (auto-ignored by Git)');
        console.log('   • Use different keys for development/production');
        console.log('   • Regenerate keys if they\'ve been exposed');
        console.log('   • Use GitHub Secrets for CI/CD');

        return this.errors.length === 0;
    }

    validate() {
        this.checkRequired();
        this.checkSecurity();
        this.checkEnvFiles();
        return this.generateReport();
    }
}

// Run validation
if (require.main === module) {
    const validator = new EnvironmentValidator();
    const isValid = validator.validate();
    process.exit(isValid ? 0 : 1);
}

module.exports = EnvironmentValidator;