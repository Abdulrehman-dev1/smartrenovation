/**
 * Records a short silent training video for Cinzia:
 * reorder gallery photos, hide/restore, delete overview, change cover.
 *
 * Usage:
 *   npx playwright install chromium
 *   node scripts/record-project-images-guide.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.APP_URL || 'http://127.0.0.1:8020';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@smartrenovation.ae';
const PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const PROJECT_SLUG = process.env.DEMO_PROJECT_SLUG || 'onyx-tower';
const OUT_DIR = path.resolve('storage/app/public/training');

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function showCaption(page, text, ms = 2800) {
  await page.evaluate((message) => {
    let el = document.getElementById('training-caption');
    if (!el) {
      el = document.createElement('div');
      el.id = 'training-caption';
      el.style.cssText = [
        'position:fixed',
        'left:24px',
        'right:24px',
        'bottom:28px',
        'z-index:99999',
        'background:rgba(16,16,16,.92)',
        'color:#fff',
        'font:600 18px/1.35 system-ui,Segoe UI,sans-serif',
        'padding:16px 20px',
        'border-radius:14px',
        'box-shadow:0 12px 40px rgba(0,0,0,.35)',
        'pointer-events:none',
        'text-align:left',
      ].join(';');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = '1';
  }, text);
  await sleep(ms);
}

async function clearCaption(page) {
  await page.evaluate(() => {
    const el = document.getElementById('training-caption');
    if (el) el.style.opacity = '0';
  });
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    slowMo: 180,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: OUT_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  let videoPath;

  try {
    // --- Login ---
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('#email').waitFor({ timeout: 20000 });
    await showCaption(page, '1. Log in to the Smart Renovation admin', 2200);
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL(/\/admin/, { timeout: 30000 });
    await sleep(800);

    // --- Projects list ---
    await page.goto(`${BASE}/admin/projects`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: /projects/i }).first().waitFor({ timeout: 20000 }).catch(() => {});
    await showCaption(page, '2. Open Projects, then open a project', 2400);
    const editLink = page.locator(`a[href*="/admin/projects/${PROJECT_SLUG}/edit"]`).first();
    if (!(await editLink.count())) {
      const search = page.locator('input[name="search"], input[placeholder*="Search" i]').first();
      if (await search.count()) {
        await search.fill('Onyx');
        await search.press('Enter');
        await sleep(1500);
      }
    }
    await page.locator(`a[href*="/admin/projects/${PROJECT_SLUG}/edit"]`).first().click();
    await page.waitForURL(new RegExp(`/admin/projects/${PROJECT_SLUG}/edit`), { timeout: 30000 });
    await sleep(1000);

    // --- Images tab ---
    await showCaption(page, '3. Click the Images tab', 2000);
    await page.getByRole('button', { name: /^Images$/i }).click();
    await sleep(1200);
    await page.locator('text=Gallery images').first().waitFor({ timeout: 15000 });
    await showCaption(page, 'Cover is at the top. Gallery images are below.', 2600);

    const originalCoverSrc =
      (await page.locator('text=Cover image').locator('xpath=following::img[1]').getAttribute('src').catch(() => null));

    // --- Reorder ---
    await showCaption(page, '4. Change order with the ← → buttons on each photo', 2800);
    const gallerySection = page.locator('h3:has-text("Gallery images")').locator('xpath=ancestor::div[contains(@class,"overflow-hidden")][1]');
    await gallerySection.scrollIntoViewIfNeeded();
    await sleep(600);

    const firstMoveLater = gallerySection.locator('button[title="Move later"]').first();
    await firstMoveLater.scrollIntoViewIfNeeded();
    await firstMoveLater.click();
    await sleep(900);
    await showCaption(page, 'Moved the first gallery photo one step later. This is the public page order.', 3000);
    const firstMoveEarlier = gallerySection.locator('button[title="Move earlier"]').nth(1);
    await firstMoveEarlier.click();
    await sleep(900);
    await showCaption(page, 'Moved it back. Order is saved as soon as you click.', 2500);

    // --- Hide ---
    await showCaption(page, '5. Hide a photo (keeps the file, removes it from the public page)', 2800);
    const firstCheckbox = gallerySection.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();
    await sleep(500);
    await gallerySection.getByRole('button', { name: /Move to hidden/i }).click();
    await sleep(1200);
    await showCaption(page, 'Selected photo moved to Hidden gallery. It no longer shows on the website.', 3200);

    const hiddenSection = page.locator('h3:has-text("Hidden gallery")').locator('xpath=ancestor::div[contains(@class,"overflow-hidden")][1]');
    await hiddenSection.scrollIntoViewIfNeeded();
    await sleep(800);
    await showCaption(page, 'To restore: select it in Hidden gallery → Move to gallery', 2800);
    const hiddenCheckbox = hiddenSection.locator('input[type="checkbox"]').first();
    await hiddenCheckbox.check();
    await sleep(400);
    await hiddenSection.getByRole('button', { name: /Move to gallery/i }).click();
    await sleep(1200);
    await gallerySection.scrollIntoViewIfNeeded();
    await showCaption(page, 'Photo restored. Prefer Hide over Delete when unsure.', 2800);

    // --- Delete (show button only) ---
    await showCaption(page, '6. Permanent delete: the × button. This cannot be undone — only use when sure.', 3500);
    const deleteBtn = gallerySection.locator('button[title="Remove"]').first();
    await deleteBtn.scrollIntoViewIfNeeded();
    await deleteBtn.hover();
    await sleep(1500);

    // --- Set as cover ---
    await showCaption(page, '7. Change cover: click Set as cover on any gallery photo', 2800);
    const setCoverBtn = gallerySection.getByRole('button', { name: /Set as cover/i }).first();
    await setCoverBtn.scrollIntoViewIfNeeded();
    await setCoverBtn.click();
    await sleep(1500);
    await page.locator('text=Cover updated').first().waitFor({ timeout: 10000 }).catch(() => {});
    await showCaption(page, 'Cover swapped. Old cover moved into the gallery.', 2800);

    if (originalCoverSrc) {
      const restore = page.locator(`img[src="${originalCoverSrc}"]`).locator('xpath=ancestor::div[contains(@class,"group") or contains(@class,"overflow-hidden")][1]//button[contains(.,"Set as cover")]').first();
      if (await restore.count()) {
        await restore.click();
        await sleep(1200);
        await showCaption(page, 'Restored the original cover for this demo.', 2200);
      }
    }

    await page.locator('text=Cover image').first().scrollIntoViewIfNeeded();
    await showCaption(page, 'You can also upload a brand-new cover under Cover image at the top.', 3000);
    await sleep(800);

    await showCaption(page, 'Done. Open the public project page after changes to confirm. No developer needed.', 4000);
    await clearCaption(page);
    await sleep(600);
  } catch (err) {
    await page.screenshot({ path: path.join(OUT_DIR, 'recording-error.png'), fullPage: true }).catch(() => {});
    throw err;
  } finally {
    videoPath = await page.video()?.path();
    await context.close();
    await browser.close();
  }

  if (!videoPath || !fs.existsSync(videoPath)) {
    throw new Error('Video file was not created.');
  }

  const finalPath = path.join(OUT_DIR, 'cinzia-project-photos-guide.webm');
  if (fs.existsSync(finalPath)) fs.unlinkSync(finalPath);
  fs.renameSync(videoPath, finalPath);
  console.log(JSON.stringify({ ok: true, video: finalPath, size: fs.statSync(finalPath).size }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
