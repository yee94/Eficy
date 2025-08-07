#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 获取所有包的路径
function getPackages() {
  const packagesDir = path.join(__dirname, '..', 'packages');
  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(packagesDir, dirent.name))
    .filter(pkgPath => {
      const packageJsonPath = path.join(pkgPath, 'package.json');
      return fs.existsSync(packageJsonPath);
    });
  
  return packages;
}

// 读取包的版本
function getPackageVersion(packagePath) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

// 更新包的版本
function updatePackageVersion(packagePath, newVersion) {
  const packageJsonPath = path.join(packagePath, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
}

// 验证版本格式
function validateVersion(version) {
  const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
  if (!semverRegex.test(version)) {
    throw new Error(`Invalid version format: ${version}`);
  }
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('Usage: node scripts/release.js <command> [version]');
    console.log('Commands:');
    console.log('  version <new-version>  - Update all package versions');
    console.log('  publish                - Publish all packages');
    console.log('  status                 - Show current versions');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'version':
        const newVersion = args[1];
        if (!newVersion) {
          throw new Error('Version is required');
        }
        
        validateVersion(newVersion);
        console.log(`Updating all packages to version ${newVersion}...`);
        
        const packages = getPackages();
        packages.forEach(pkgPath => {
          const pkgName = path.basename(pkgPath);
          console.log(`Updating ${pkgName}...`);
          updatePackageVersion(pkgPath, newVersion);
        });
        
        // 更新根目录的 package.json
        const rootPackageJsonPath = path.join(__dirname, '..', 'package.json');
        if (fs.existsSync(rootPackageJsonPath)) {
          updatePackageVersion(path.join(__dirname, '..'), newVersion);
        }
        
        console.log('✅ All packages updated successfully');
        console.log('\nNext steps:');
        console.log('1. Review the changes');
        console.log('2. Commit the changes');
        console.log('3. Create a git tag: git tag v' + newVersion);
        console.log('4. Push the tag: git push origin v' + newVersion);
        break;
        
      case 'publish':
        console.log('Publishing all packages...');
        execSync('pnpm -r publish --access public --no-git-checks', { 
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
        console.log('✅ All packages published successfully');
        break;
        
      case 'status':
        console.log('Current package versions:');
        const statusPackages = getPackages();
        statusPackages.forEach(pkgPath => {
          const pkgName = path.basename(pkgPath);
          const version = getPackageVersion(pkgPath);
          console.log(`  ${pkgName}: ${version}`);
        });
        break;
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
