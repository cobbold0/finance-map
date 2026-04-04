import { expect, test } from "@playwright/test";

test("welcome page renders the core marketing flow", async ({ page }) => {
  await page.goto("/welcome");

  await expect(
    page.getByRole("heading", {
      name: /money management,?\s+with more grace and less noise/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /create your account/i }),
  ).toBeVisible();
});

test("sign-in page stays reachable for signed-out visitors", async ({ page }) => {
  await page.goto("/auth/sign-in");

  await expect(
    page.getByRole("button", { name: /^sign in$/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /create an account/i }),
  ).toBeVisible();
});
