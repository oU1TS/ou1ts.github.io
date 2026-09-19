// scripts/build-env.js
// Injects environment variables into env-config.js for Netlify and CI/CD environments.

const fs = require('fs');

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

// Safeguard: If running locally without environment variables and env-config.js already exists, do not overwrite it.
if (!supabaseUrl && !supabaseAnonKey && fs.existsSync('env-config.js') && !process.env.CI && !process.env.NETLIFY && !process.env.GITHUB_ACTIONS) {
  console.log('[build-env] Existing local env-config.js detected and no CI variables provided. Preserving local credentials.');
  process.exit(0);
}

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
