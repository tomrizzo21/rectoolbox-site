/* Where the planner's accounts live (Supabase project "rectoolbox", set up by Tom 2026-11-11; docs/ACCOUNTS_PLAN.md).
   Both values are public by design: the URL and the publishable key only let the page talk to the project, and the
   database's row-level security decides what each signed-in user may read or write. Never put the secret key here. */
const RT_SUPABASE = {
  url: "https://ixoqdbdnjkjccwhykbej.supabase.co", // also in the page's Content Security Policy (fieldhouse-planner.html)
  key: "sb_publishable_IozK0Ki9aF71yDT7CumyaQ_rALY243f",
  lib: "vendor/supabase-2.118.0/supabase.js", // @supabase/supabase-js 2.118.0 UMD build (MIT), loaded on first use
};
