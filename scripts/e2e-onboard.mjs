import { chromium } from "@playwright/test";

const baseUrl = process.env.BASE_URL ?? "https://finance-map-taupe.vercel.app";
const id = Date.now();
const email = `codex-finance-map-${id}@example.com`;
const password = `FinanceMap!${id}`;

async function textContentSafe(locator) {
  if ((await locator.count()) === 0) {
    return null;
  }

  return (await locator.first().textContent())?.trim() ?? null;
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const events = [];
page.on("console", (message) => {
  events.push({ type: "console", text: message.text() });
});
page.on("pageerror", (error) => {
  events.push({ type: "pageerror", text: error.message });
});
page.on("requestfailed", (request) => {
  events.push({
    type: "requestfailed",
    url: request.url(),
    method: request.method(),
    failure: request.failure()?.errorText ?? "unknown",
  });
});
page.on("response", (response) => {
  const url = response.url();

  if (
    url.includes("/auth/sign-up") ||
    url.includes("supabase") ||
    response.status() >= 400
  ) {
    events.push({
      type: "response",
      url,
      status: response.status(),
      method: response.request().method(),
    });
  }
});

try {
  await page.goto(`${baseUrl}/auth/sign-up`, { waitUntil: "networkidle" });
  console.log(
    JSON.stringify(
      {
        step: "loaded-sign-up",
        url: page.url(),
        title: await page.title(),
        bodySnippet: ((await page.locator("body").textContent()) ?? "").slice(0, 800),
      },
      null,
      2,
    ),
  );

  await page.locator('input[name="fullName"]').fill("Codex Tester");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForTimeout(15000);

  const afterSignUp = {
    url: page.url(),
    h1: await textContentSafe(page.locator("h1")),
    bodyText: await textContentSafe(page.locator("body")),
  };

  let onboarding = null;

  if (page.url().includes("/onboarding")) {
    onboarding = {
      initialUrl: page.url(),
      initialHeading: await textContentSafe(page.locator("h1")),
      initialBody: await textContentSafe(page.locator("body")),
      buttons: await page.getByRole("button").allTextContents(),
    };

    if ((await page.getByRole("button", { name: /continue/i }).count()) > 0) {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(1000);

      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(1000);
    }

    if ((await page.getByRole("button", { name: /finish setup/i }).count()) > 0) {
      await page.getByRole("button", { name: /finish setup/i }).click();
      await page.waitForTimeout(5000);
    }

    onboarding.finalUrl = page.url();
    onboarding.finalHeading = await textContentSafe(page.locator("h1"));
    onboarding.finalBody = await textContentSafe(page.locator("body"));
  }

  console.log(
    JSON.stringify(
      {
        email,
        password,
        afterSignUp,
        onboarding,
        events,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
