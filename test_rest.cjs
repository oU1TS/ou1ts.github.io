const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, 'env-config.js'), 'utf8');
const urlMatch = envFile.match(/SUPABASE_URL:\s*"([^"]+)"/);
const keyMatch = envFile.match(/SUPABASE_ANON_KEY:\s*"([^"]+)"/);

if (!urlMatch || !keyMatch) {
  console.log("Could not find credentials");
  process.exit(1);
}

const url = `${urlMatch[1]}/rest/v1/project_metrics?select=*`;
const headers = {
  apikey: keyMatch[1],
  Authorization: `Bearer ${keyMatch[1]}`
};

fetch(url, { headers })
  .then(async res => {
    console.log("Status:", res.status);
    const body = await res.text();
    console.log("Body:", body);
  })
  .catch(err => {
    console.error("Fetch error:", err);
  });
