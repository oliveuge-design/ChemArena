#!/usr/bin/env node

/**
 * ChemArena - Security Setup Script
 * Configura automaticamente le protezioni anti-esposizione secrets
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SecuritySetup {
    constructor() {
        this.projectRoot = process.cwd();
        this.errors = [];
        this.successes = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const icon = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔧';
        console.log(`[${timestamp}] ${icon} ${message}`);
    }

    setupGitHooks() {
        try {
            this.log('Setting up Git hooks...');

            // Create .githooks directory
            const hooksDir = path.join(this.projectRoot, '.githooks');
            if (!fs.existsSync(hooksDir)) {
                fs.mkdirSync(hooksDir, { recursive: true });
            }

            // Make pre-commit hook executable
            const preCommitPath = path.join(hooksDir, 'pre-commit');
            if (fs.existsSync(preCommitPath)) {
                try {
                    execSync(`chmod +x "${preCommitPath}"`);
                    this.log('Pre-commit hook made executable', 'success');
                } catch (error) {
                    // Windows doesn't need chmod, ignore error
                    this.log('Pre-commit hook configured (Windows)', 'success');
                }
            }

            // Configure Git to use .githooks directory
            try {
                execSync('git config core.hooksPath .githooks');
                this.log('Git hooks path configured', 'success');
            } catch (error) {
                this.errors.push('Failed to configure Git hooks path');
                this.log('Failed to configure Git hooks path', 'error');
            }

            this.successes.push('Git hooks setup completed');
        } catch (error) {
            this.errors.push(`Git hooks setup failed: ${error.message}`);
            this.log(`Git hooks setup failed: ${error.message}`, 'error');
        }
    }

    setupEnvironmentTemplate() {
        try {
            this.log('Checking environment template...');

            const envExamplePath = path.join(this.projectRoot, '.env.example');
            const envLocalPath = path.join(this.projectRoot, '.env.local');

            // Ensure .env.example exists
            if (!fs.existsSync(envExamplePath)) {
                const templateContent = `# ChemArena Environment Variables
# Copy this file to .env.local and fill in your actual values

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ORG_ID=your_openai_org_id_here

# Socket.io Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Development Configuration
NODE_ENV=development
`;
                fs.writeFileSync(envExamplePath, templateContent);
                this.log('Created .env.example template', 'success');
            }

            // Check if .env.local exists
            if (!fs.existsSync(envLocalPath)) {
                this.log('⚠️  .env.local not found. Copy .env.example to .env.local and configure it');
            } else {
                this.log('✅ .env.local found');
            }

            this.successes.push('Environment template configured');
        } catch (error) {
            this.errors.push(`Environment setup failed: ${error.message}`);
            this.log(`Environment setup failed: ${error.message}`, 'error');
        }
    }

    setupPackageScripts() {
        try {
            this.log('Adding security scripts to package.json...');

            const packageJsonPath = path.join(this.projectRoot, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

                // Add security scripts
                packageJson.scripts = packageJson.scripts || {};
                packageJson.scripts['security:validate'] = 'node scripts/validate-env.js';
                packageJson.scripts['security:scan'] = 'npm run security:validate && git diff --cached --name-only | xargs -I {} grep -l "sk-" {} || true';
                packageJson.scripts['security:setup'] = 'node scripts/setup-security.js';

                fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
                this.log('Security scripts added to package.json', 'success');
                this.successes.push('Package.json scripts updated');
            }
        } catch (error) {
            this.errors.push(`Package.json update failed: ${error.message}`);
            this.log(`Package.json update failed: ${error.message}`, 'error');
        }
    }

    validateCurrentSetup() {
        this.log('Validating current security setup...');

        const checks = [
            {
                name: 'Git hooks directory',
                path: '.githooks',
                type: 'directory'
            },
            {
                name: 'Pre-commit hook',
                path: '.githooks/pre-commit',
                type: 'file'
            },
            {
                name: 'Environment validator',
                path: 'scripts/validate-env.js',
                type: 'file'
            },
            {
                name: 'Security workflow',
                path: '.github/workflows/security-scan.yml',
                type: 'file'
            },
            {
                name: 'Gitignore protection',
                path: '.gitignore',
                type: 'file',
                validate: (content) => content.includes('API*.txt')
            }
        ];

        for (const check of checks) {
            const fullPath = path.join(this.projectRoot, check.path);
            const exists = check.type === 'directory'
                ? fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()
                : fs.existsSync(fullPath);

            if (exists) {
                if (check.validate) {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    if (check.validate(content)) {
                        this.log(`✅ ${check.name}: Valid`);
                    } else {
                        this.log(`⚠️  ${check.name}: Exists but needs update`);
                    }
                } else {
                    this.log(`✅ ${check.name}: Found`);
                }
            } else {
                this.log(`❌ ${check.name}: Missing`);
            }
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('🛡️  CHEMARENA SECURITY SETUP REPORT');
        console.log('='.repeat(60));

        if (this.successes.length > 0) {
            console.log('\n✅ COMPLETED:');
            this.successes.forEach(success => console.log(`   • ${success}`));
        }

        if (this.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.errors.forEach(error => console.log(`   • ${error}`));
        }

        console.log('\n🔧 NEXT STEPS:');
        console.log('   1. Copy .env.example to .env.local');
        console.log('   2. Configure your OpenAI API keys in .env.local');
        console.log('   3. Run: npm run security:validate');
        console.log('   4. Test pre-commit hook with a dummy commit');
        console.log('   5. Enable GitHub Secret Scanning in repository settings');

        console.log('\n📚 USAGE:');
        console.log('   • npm run security:validate  - Check environment');
        console.log('   • npm run security:scan      - Scan for secrets');
        console.log('   • git commit                 - Auto-scan before commit');

        return this.errors.length === 0;
    }

    run() {
        console.log('🚀 ChemArena Security Setup Starting...\n');

        this.setupGitHooks();
        this.setupEnvironmentTemplate();
        this.setupPackageScripts();
        this.validateCurrentSetup();

        return this.generateReport();
    }
}

// Run setup
if (require.main === module) {
    const setup = new SecuritySetup();
    const success = setup.run();
    process.exit(success ? 0 : 1);
}

module.exports = SecuritySetup;