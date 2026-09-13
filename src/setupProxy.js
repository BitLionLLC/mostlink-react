const https = require("https");

// www.bitlion.us/apps.json does not send CORS headers, so the browser cannot
// read it cross-origin. In production Netlify proxies it (see netlify.toml);
// this does the same for `yarn start`.
module.exports = function (app) {
  app.get("/bitlion-apps.json", (req, res) => {
    https
      .get("https://www.bitlion.us/apps.json", (upstream) => {
        if (upstream.statusCode !== 200) {
          upstream.resume();
          res.sendStatus(502);
          return;
        }

        res.set("Content-Type", "application/json");
        upstream.pipe(res);
      })
      .on("error", () => res.sendStatus(502));
  });
};
