// scripts/build-env.js
// Injects environment variables into env-config.js for Netlify and CI/CD environments.

const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const content = `// oU1TS Project Environment Configuration
// Automatically generated during build from deployment environment variables.
window.__ENV = {
  SUPABASE_URL: "${supabaseUrl}",
  SUPABASE_ANON_KEY: "${supabaseAnonKey}"
};
`;

try {
  fs.writeFileSync('env-config.js', content, 'utf8');
  if (supabaseUrl && supabaseAnonKey) {
    console.log('[build-env] Successfully generated env-config.js with Supabase credentials.');
  } else {
    console.warn('[build-env] Notice: SUPABASE_URL or SUPABASE_ANON_KEY was not found in environment variables. env-config.js generated with empty credentials (running in Local Mock mode).');
  }
} catch (err) {
  console.error('[build-env] Failed to generate env-config.js:', err);
  process.exit(1);
}
