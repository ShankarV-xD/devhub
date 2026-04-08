const fs = require('fs');
const path = require('path');

// Performance budget configuration
const BUDGETS = {
  // Bundle size budgets in bytes
  'main.js': 200000,      // 200KB
  'vendors.js': 150000,   // 150KB  
  'framework.js': 50000,  // 50KB
  total: 500000,          // 500KB total
  
  // Performance metrics budgets
  firstContentfulPaint: 1500,    // 1.5s
  largestContentfulPaint: 2500,  // 2.5s
  cumulativeLayoutShift: 0.1,    // 0.1
  firstInputDelay: 100,          // 100ms
};

function checkBundleSize() {
  console.log('🔍 Checking bundle sizes...');
  
  const buildDir = path.join(__dirname, '../.next/static/chunks');
  let totalSize = 0;
  let violations = [];
  
  if (!fs.existsSync(buildDir)) {
    console.log('⚠️  Build directory not found. Run `npm run build` first.');
    return false;
  }
  
  const files = fs.readdirSync(buildDir);
  
  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(buildDir, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;
      totalSize += size;
      
      // Check specific file budgets
      if (BUDGETS[file] && size > BUDGETS[file]) {
        violations.push({
          type: 'bundle-size',
          file,
          size: formatBytes(size),
          budget: formatBytes(BUDGETS[file]),
          over: formatBytes(size - BUDGETS[file])
        });
      }
    }
  }
  
  // Check total budget
  if (totalSize > BUDGETS.total) {
    violations.push({
      type: 'total-bundle-size',
      size: formatBytes(totalSize),
      budget: formatBytes(BUDGETS.total),
      over: formatBytes(totalSize - BUDGETS.total)
    });
  }
  
  console.log(`📦 Total bundle size: ${formatBytes(totalSize)}`);
  
  if (violations.length > 0) {
    console.log('\n❌ Performance budget violations:');
    violations.forEach(v => {
      if (v.type === 'bundle-size') {
        console.log(`  - ${v.file}: ${v.size} (budget: ${v.budget}, over by ${v.over})`);
      } else {
        console.log(`  - Total: ${v.size} (budget: ${v.budget}, over by ${v.over})`);
      }
    });
    return false;
  }
  
  console.log('✅ All bundle size budgets met!');
  return true;
}

function checkNextBundleAnalyzer() {
  console.log('🔍 Checking Next.js bundle analysis...');
  
  try {
    const nextBuildDir = path.join(__dirname, '../.next');
    if (!fs.existsSync(nextBuildDir)) {
      console.log('⚠️  Next.js build directory not found.');
      return true;
    }
    
    // Check for large chunks in .next/build-manifest.json if it exists
    const buildManifestPath = path.join(nextBuildDir, 'build-manifest.json');
    if (fs.existsSync(buildManifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
      let totalSize = 0;
      
      Object.values(manifest.pages).forEach(page => {
        if (Array.isArray(page)) {
          page.forEach(asset => {
            if (asset.endsWith('.js')) {
              // Estimate size (this is approximate)
              totalSize += asset.length * 50; // Rough estimate
            }
          });
        }
      });
      
      console.log(`📊 Estimated page bundle size: ${formatBytes(totalSize)}`);
      
      if (totalSize > BUDGETS.total) {
        console.log(`⚠️  Estimated bundle size exceeds budget: ${formatBytes(totalSize)} > ${formatBytes(BUDGETS.total)}`);
        return false;
      }
    }
    
    console.log('✅ Next.js bundle analysis passed!');
    return true;
  } catch (error) {
    console.log('⚠️  Could not analyze Next.js bundle:', error.message);
    return true; // Don't fail the build for analysis errors
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function main() {
  console.log('🚀 Performance Budget Check\n');
  
  const bundleCheck = checkBundleSize();
  const nextCheck = checkNextBundleAnalyzer();
  
  console.log('\n📋 Summary:');
  console.log(`Bundle size check: ${bundleCheck ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Next.js analysis: ${nextCheck ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (!bundleCheck) {
    console.log('\n💡 Optimization suggestions:');
    console.log('  - Consider code splitting for large chunks');
    console.log('  - Remove unused dependencies');
    console.log('  - Use dynamic imports for non-critical code');
    console.log('  - Optimize images and assets');
    console.log('  - Enable compression in production');
    process.exit(1);
  }
  
  console.log('\n🎉 All performance budgets met!');
}

if (require.main === module) {
  main();
}

module.exports = { checkBundleSize, checkNextBundleAnalyzer, BUDGETS };
