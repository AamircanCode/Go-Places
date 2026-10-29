/*
 * GO PLACES — account settings
 * ============================
 * Accounts (sign-in, profiles, wishlist, photo uploads) use a free Supabase
 * project. Until both values below are filled in, the site works exactly as
 * before, without accounts, and "explored" is saved on the device only.
 *
 * Where to find the values: Supabase dashboard → your project → Project
 * Settings → API (or "Connect"). Copy the Project URL and the publishable key
 * (older projects call it the "anon public" key).
 *
 * Both values are safe to publish: the publishable key only allows what the
 * database rules in supabase/schema.sql allow. Never put the "secret" or
 * "service_role" key here.
 */
window.GO_PLACES_CONFIG = {
  supabaseUrl: "",
  supabaseKey: "sb_publishable_ZETvdGJviqG-XXTCbcgkSw_N70gVw8R"
};
