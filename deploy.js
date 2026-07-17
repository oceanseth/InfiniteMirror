const fs = require('fs');
const { execSync } = require('child_process');

try {
  // Read index.html
  const htmlContent = fs.readFileSync('index.html', 'utf8');

  // Construct payload
  const payload = {
    slug: 'hello-world-zero-mirrored',
    content: htmlContent,
    ttlHours: 336 // 14 days (maximum free tier)
  };

  // Write payload to payload.json
  fs.writeFileSync('payload.json', JSON.stringify(payload, null, 2), 'utf8');
  console.log('✓ Successfully created payload.json');

  // Run the Zero CLI command to fetch capability z_ixmlxN.1
  console.log('Deploying website to Zero...');
  const command = 'npx -y @zeroxyz/cli fetch --capability z_ixmlxN.1 -d @payload.json --json';
  
  const output = execSync(command, { encoding: 'utf8' });
  const result = JSON.parse(output);
  
  if (result.ok && result.body) {
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    console.log('\n==================================================');
    console.log('🚀 WEBSITE DEPLOYED SUCCESSFULLY TO ZERO!');
    console.log(`Live URL:   ${body.url}`);
    console.log(`Expires At: ${body.expiresAt}`);
    console.log(`Note:       ${body.note}`);
    console.log('==================================================\n');
  } else {
    console.error('Failed to deploy:', result);
  }
} catch (error) {
  console.error('An error occurred during deployment:', error.message);
  if (error.stdout) {
    console.error('Command output:', error.stdout);
  }
  process.exit(1);
}
