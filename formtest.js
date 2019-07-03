const fs = require('fs');
const assert = require("assert");
const chrome = require('selenium-webdriver/chrome');
const { promisify } = require('util');

const webdriver = require("selenium-webdriver");
const { Builder, By, until } = webdriver;

let driver;

// コンテンツサイズにウインドウを合わせてキャプチャをとる
async function takeScreentJust(driver, fileName, ext)
{
  let contentWidth = await driver.executeScript("return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);");
  let contentHeight = await driver.executeScript("return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);");

  await driver.manage().window().setRect({
    width: contentWidth,
    height: contentHeight,
  });
  
  let base64 = await driver.takeScreenshot();
  let buffer = Buffer.from(base64, 'base64');
  await promisify(fs.writeFile)(fileName + "." + ext, buffer);

  await driver.manage().window().setRect({
    width: 1920,
    height: 1080,
  });
  
}

describe("デモ", () => {
  
  before(() => {
    driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(new chrome.Options().headless())
        .build();
  });

  after(() => {
    return driver.quit();
  });

  it("トップページ ページタイトル", async () => {

    // テスト対象のページへアクセス
    await driver.get(
        "https://www.securite.jp/"
    );

    // トップページのロード待ち
    await driver.wait(until.titleContains('セキュリテ'), 10000);

    await driver.getTitle().then(function (title) {
      
      /* @test */
      assert.equal(title, "セキュリテ - インパクト投資プラットフォーム");
    });

    await takeScreentJust(driver, '001_top', 'png');

  });
  
  it("トップページ ログインページに遷移", async () => {

    // ログインリンクをクリック
    await driver.findElement(By.linkText("ログイン")).click();

    // ログインページのロード待ち
    await driver.wait(until.titleContains('ログイン'), 10000);

    await driver.getTitle().then(function (title) {
      /* @test */
      assert.equal(title, "ログイン｜セキュリテ");
    });

    await takeScreentJust(driver, '002_login', 'png');
  });
  
  it("ログインページ ブランクフォームエラー", async () => {
    // フォームをブランクで送信
    await driver.findElement(By.xpath("//input[@value='ログイン']")).click();
    await takeScreentJust(driver, '003_loginfail', 'png');
    
    const errorMsg = await driver.findElement(By.className("error_msg")).getText();
    /* @test */
    assert.equal(errorMsg, "ログインIDまたはパスワードを見直してください。");
  });

});
