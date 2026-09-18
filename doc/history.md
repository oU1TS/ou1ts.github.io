<!-- Frontmatter Tags: #changelog #history #ou1ts #login #database -->

# 18.09.26

### **Database Schema Alignment, Project AGENTS.md & Step-by-Step Login Setup Guide**
- **Added Blood Group Attribute**: Updated `profiles` schema in [`[DoNotCommit]oU1TS_Central_Database_Guide(from portal repo).md`](doc/idea/[DoNotCommit]oU1TS_Central_Database_Guide(from%20portal%20repo).md), [`user_profile_schema.sql`](doc/db/user_profile_schema.sql), and [`supabase_setup_guide.md`](doc/db/supabase_setup_guide.md) to define `blood_group` with check constraints and auto-insertion in `handle_new_user` trigger.
- **Created Step-by-Step Login Guide**: Added [`doc/step_by_step_login_setup_guide.md`](doc/step_by_step_login_setup_guide.md) containing an end-to-end guide covering Supabase project creation, SQL script execution, auth redirect configuration, local `env-config.js` testing, and GitHub Actions secret deployment.
- **Adopted Project Rules**: Created [`AGENTS.md`](AGENTS.md) adapted from `b1t-Acad` guidelines establishing rules for changelog maintenance (`doc/history.md`), per-turn prompt archiving (`doc/prompts/`), code quality standards, and commit message suggestions.
- **Session Prompt Archive**: Initialized [`doc/prompts/5. Central Database Setup and Login Integration Guide.md`](doc/prompts/5.%20Central%20Database%20Setup%20and%20Login%20Integration%20Guide.md) archiving user requests, internal reasoning, and assistant responses.
