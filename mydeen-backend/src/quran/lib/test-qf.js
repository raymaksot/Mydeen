// test-qf.js
const OAUTH = "https://prelive-oauth2.quran.foundation/oauth2/token";
const BASE  = "https://apis-prelive.quran.foundation/content/api/v4";
const ID = "3c68c951-8716-4466-9d0e-8093abc0863f";
const SECRET = "~UouPRvLBYpPVGaBQpR2dB4vGv";

(async () => {
  const basic = Buffer.from(`${ID}:${SECRET}`).toString("base64");
  const tokRes = await fetch(OAUTH, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials&scope=content",
  });
  const tok = await tokRes.json();
  console.log("token status:", tokRes.status);

  const res = await fetch(`${BASE}/chapters`, {
    headers: { "x-auth-token": tok.access_token, "x-client-id": ID },
  });
  console.log("chapters status:", res.status);
  console.log(await res.text());
})();
