let fs = require('fs');
let readline = require('readline');
let puppeteer = require('puppeteer');
let searchText = '盘石'

function readSyncByRl(tips) {
    tips = tips || '> ';
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(tips, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function operation(browser) {
    const page = (await browser.pages())[0];
    await page.type(".gn_search_v2>input", searchText);  // 等待新窗口加载后 搜索框输入“盘石”
    await page.click(".gn_search_v2>a");  // 点击搜索
    await page.waitFor(3000);
    await page.click('.m-con-l> div > div.card-wrap:nth-child(1) .avator');  // 点击搜索后出现的用户头像
    await page.waitFor(10000); // 等待5s 新窗口打开搜索后的用户主页页面
    const page2 = ( await browser.pages() )[1]; //得到所有窗口使用列表索引得到新的窗口
    await page2.setViewport({
        width: 1280,
        height: 800
    });
    await page2.waitFor('.WB_feed.WB_feed_v3.WB_feed_v4'); // 等待加载元素
    const result = await page2.evaluate(() => {
        let text = document.querySelector("#Pl_Official_MyProfileFeed__23 > div > div:nth-child(2) > div.WB_feed_detail.clearfix > div.WB_detail > div.WB_text.W_f14").innerText;
        return {
            text,
        };
    });
    await page2.click('#Pl_Official_MyProfileFeed__23 > div > div:nth-child(2) > div.WB_feed_handle > div > ul > li:nth-child(2) > a > span > span')
    await page2.waitFor('.p_input.p_textarea');
    await page2.type('.p_input.p_textarea', result.text)
    await page2.click('div.content > div.layer_forward > div > div:nth-child(2) > div > div.WB_feed_repeat.forward_rpt1 > div > div.WB_feed_publish.clearfix > div > div.p_opt.clearfix > div.btn.W_fr > a');
    await page.waitFor(1000);
    await browser.close();//关闭打开的浏览器
}

async function login(username, password) {
    console.log('开始执行任务~')
    const browser = await puppeteer.launch({
        // headless: false,
        slowMo: 250,
        executablePath: '',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ]
    });
    const page = (await browser.pages())[0];
    await page.setViewport({
        width: 1280,
        height: 800
    });

    await page.goto("https://weibo.com/");
    await page.waitForNavigation();
    await page.type("#loginname", username); // 输入用户名
    await page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.password > div > input", password);   // 输入密码
    await page.click("#pl_login_form > div > div:nth-child(3) > div:nth-child(6)");  // 点击登录
    await page.waitForNavigation().then(result => {
        return new Promise((resolve) => {
            operation(browser);
        })
    }).catch(e => {
        page.screenshot({
            path: 'code.png',
            type: 'png',
            x: 800,
            y: 200,
            width: 100,
            height: 100
        });
        return new Promise((resolve, reject) => {
            readSyncByRl("请输入验证码").then(async (code) => {
                await page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.verify.clearfix > div > input", code);
                await page.click("#pl_login_form > div > div:nth-child(3) > div:nth-child(6)");
                await page.waitForNavigation();
                operation(browser);
            })
        })
    })
}
module.exports = login;