const path = require('path');
const client = require('firebase-tools');

async function deploy() {
  console.log('🚀 Deploying 2-Minute Sermon to Firebase Hosting...');
  try {
    await client.deploy({
      project: 'minute-sermon-d8e16',
      only: 'hosting',
      cwd: path.resolve(__dirname, '..')
    });
    console.log('✅ Deployed successfully to https://minute-sermon-d8e16.web.app (and custom domain)!');
  } catch (err) {
    console.error('❌ Deployment error:', err);
    process.exit(1);
  }
}

deploy();
