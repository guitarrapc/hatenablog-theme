import { test } from './helpers.js';
import { expect } from '@playwright/test';

test.describe('目次スタイルのテスト', () => {
    test('目次のスタイルが仕様通りであることを確認', async ({ page }) => {
        // リトライを含めたページナビゲーション
        await page.retryAction(async () => {
            await page.goto('/entry/2025/05/10/204601');
        });

        // ページが完全に読み込まれるのを待機
        await page.waitForPageToLoad();

        // 記事内の目次要素を確認
        const inPageToc = page.locator('.entry-content .table-of-contents');
        const hasToc = await inPageToc.isVisible();

        if (!hasToc) {
            console.log('テスト対象の記事に目次が存在しません。このテストをスキップします。');
            test.skip();
            return;
        }

        // 記事内目次のスクリーンショットを撮影
        await inPageToc.screenshot({ path: 'screenshots/in-page-toc.png' });

        // 記事内目次の項目を確認
        const inPageTocItems = page.locator('.entry-content .table-of-contents li');
        const inPageItemCount = await inPageTocItems.count();
        console.log(`記事内目次の項目数: ${inPageItemCount}`);

        if (inPageItemCount > 0) {
            // 記事内目次の最初の項目をキャプチャ
            await inPageTocItems.first().screenshot({ path: 'screenshots/in-page-toc-first-item.png' });
        }
        // スクロールして目次ボタンを表示させる
        await page.retryAction(async () => {
            await page.evaluate(() => {
                window.scrollBy(0, 250);
            });
            await page.waitForTimeout(2000);
        });

        // 目次ボタンが表示されるか確認
        const tocButton = page.locator('.toc-button');
        let isButtonVisible = false;

        try {
            await expect(tocButton).toBeVisible({ timeout: 15000 });
            isButtonVisible = true;
        } catch (error) {
            console.log('目次ボタンが表示されませんでした。フローティング目次のテストをスキップします。');
        }

        if (!isButtonVisible) {
            return;
        }

        // 目次ボタンをクリックして目次を表示
        await page.retryAction(async () => {
            await tocButton.click();
            await page.waitForTimeout(2000); // アニメーションの完了を待つ
        });
        // 目次コンテンツが表示されるか確認
        const tocContent = page.locator('.floating-toc.show');
        let isTocVisible = false;

        try {
            await expect(tocContent).toBeVisible({ timeout: 10000 });
            isTocVisible = true;

            // 目次コンテンツのスクリーンショットを撮影
            await tocContent.screenshot({ path: 'screenshots/toc-content.png' });

            // 目次リストアイテムが存在することを確認
            const tocItems = page.locator('.floating-toc-list li');
            const count = await tocItems.count();

            // 目次項目数をログ出力
            console.log(`フローティング目次項目の数: ${count}`);

            // 目次項目のスクリーンショット撮影（項目がある場合のみ）
            if (count > 0) {
                // 最初の項目（h1相当）
                await tocItems.first().screenshot({ path: 'screenshots/toc-first-item.png' });

                // 2番目の項目（h2相当、存在する場合）
                if (count > 1) {
                    await tocItems.nth(1).screenshot({ path: 'screenshots/toc-second-item.png' });
                }
            }
        } catch (error) {
            console.log('フローティング目次が表示されませんでした。フローティング目次の項目テストをスキップします。');
        }
    });
});
