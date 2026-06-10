import { chromium } from "playwright";
import fs from "fs";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: {
      dir: './',
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Helper to click by inner text
  const clickText = async (text) => {
    await page.evaluate((txt) => {
      const els = Array.from(document.querySelectorAll('button, a, div, span'));
      const target = els.find(e => e.textContent && e.textContent.includes(txt) && !e.children.length);
      if(target) {
        target.click();
      } else {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent && b.textContent.includes(txt));
        if(btn) btn.click();
      }
    }, text);
  };

  try {
    console.log("Navigating to Dashboard...");
    await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await wait(3000);

    console.log("Navigating to Products...");
    await clickText("管理商品");
    await wait(2000);

    console.log("Adding Product...");
    await clickText("添加商品");
    await wait(1500);
    
    // Fill the input
    await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        const linkInput = inputs.find(i => i.placeholder && i.placeholder.includes('粘贴商品链接'));
        if (linkInput) {
            linkInput.value = 'https://example.com/product/123';
            linkInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await wait(1000);
    
    await clickText("智能提取");
    await wait(3000);
    
    await clickText("下一步，管理素材");
    await wait(2000);
    
    await clickText("确认添加商品");
    await wait(3000);

    console.log("Opening Product...");
    await clickText("自动提取商品名称");
    await wait(3000);

    console.log("Starting Video Generation...");
    await clickText("AI 创作视频");
    await wait(3000);

    // Fill the description textarea
    await page.evaluate(() => {
        const txt = document.querySelector('textarea');
        if (txt) {
            txt.value = '帮我生成一个爆款口播带货视频';
            txt.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await wait(1000);

    // Click "生成视频方案" which is a button with title="生成视频方案"
    await page.evaluate(() => {
        const btn = document.querySelector('button[title="生成视频方案"]');
        if (btn) btn.click();
    });
    await wait(15000);

    console.log("Navigating to Projects...");
    await page.goto("http://localhost:5173/#/projects", { waitUntil: "networkidle" });
    await wait(4000);

    await context.close();
    await browser.close();

    const files = fs.readdirSync('./');
    const videoFile = files.find(f => f.endsWith('.webm') && f !== 'demo_recording_full.webm');
    if (videoFile) {
        if(fs.existsSync('demo_recording_full.webm')) {
           fs.unlinkSync('demo_recording_full.webm');
        }
        fs.renameSync(videoFile, 'demo_recording_full.webm');
        console.log("Saved video to demo_recording_full.webm");
    }

    console.log("Done");
  } catch (err) {
    console.error(err);
    await context.close();
    await browser.close();
  }
})();
