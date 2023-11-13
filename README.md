# node+puppeteer定时发送微博

## 实现功能：登录微博自动转发特定用户的下的第一条微博
## 实现步骤：
### 1. 初始化项目
你需要安装版本 8 以上的 Node，你可以在[这里](https://nodejs.org/en/)找到安装方法。确保选择Current版本，因为它是 8+。 安装完node后新建一个项目文件夹
```
mkdir Project
cd Project
```
初始化一个node项目，在交互式命令中输入依次项目名、版本号、描述...等信息。直接enter键保持默认选项即可
```
MacdeMacBook-Pro:Project mac$ npm init
...
package name: (project) test
version: (1.0.0) 
description: 
entry point: (index.js) 
test command: 
git repository: 
keywords: 
author: 
license: (ISC) 
About to write to /Users/mac/Project/package.json:

{
"name": "test",
"version": "1.0.0",
"description": "",
"main": "index.js",
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
},
"author": "",
"license": "ISC"
}


Is this OK? (yes) 
```
这是会生成一个如下目录结构的文件夹
```
    Project
        - index.js  // 入口文件
        - package.json
```
### 2. 安装依赖

#### puppeteer 

Puppeteer(中文翻译”木偶”) Google Chrome 团队官方的无界面（Headless）Chrome 工具。也可以通过配置使用完整的（非无头）Chrome. 使用 Puppeteer，相当于同时具有 Linux 和 Chrome 双端的操作能力，在浏览器中手动完成的大部分事情都可以使用 Puppeteer 完成，应用场景可谓非常之多。如：

- 从网站抓取你需要的内容。
- 模拟人为操作自动表单提交，UI测试，键盘输入等。
- 创建一个最新的自动化测试环境。使用最新的JavaScript和浏览器功能，直接在最新版本的Chrome中运行测试。
- 捕获您的网站的时间线跟踪，以帮助诊断性能问题。   

##### 安装
`npm i puppeteer -S -D`

##### 用法   
puppeteer的具体用法可以参考[puppeteer中文文档](https://zhaoqize.github.io/puppeteer-api-zh_CN/#/)
#### node-schedule    
Node Schedule是用于Node.js下的灵活的cron式和非cron式任务调度程序。 它允许您使用可选的重复规则来安排任务（任意函数）在特定日期执行。    
   
##### 安装：
`npm i node-schedule -S -D`

##### 用法：
1. Cron风格定时器
```
const schedule = require('node-schedule');

const  scheduleCronstyle = ()=>{
  //每分钟的第30秒定时执行一次:
    schedule.scheduleJob('30 * * * * *',()=>{
        console.log('scheduleCronstyle:' + new Date());
    }); 
}

scheduleCronstyle();
```
schedule.scheduleJob的回调函数中写入要执行的任务代码，一个定时器就完成了！
> 规则参数讲解 *代表通配符
```
*  *  *  *  *  *
┬ ┬ ┬ ┬ ┬ ┬
│ │ │ │ │  |
│ │ │ │ │ └ day of week (0 - 7) (0 or 7 is Sun)
│ │ │ │ └───── month (1 - 12)
│ │ │ └────────── day of month (1 - 31)
│ │ └─────────────── hour (0 - 23)
│ └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, OPTIONAL)
```
6个占位符从左到右分别代表：秒、分、时、日、月、周几

*表示通配符，匹配任意，当秒是*时，表示任意秒数都触发，其它类推

关于cron表达式具体用法可以参考[cron表达式工具](http://cron.qqe2.com/)

2. 对象文本语法定时器
```
const schedule = require('node-schedule');

function scheduleObjectLiteralSyntax(){

    // 每周一的下午16：11分触发，其它组合可以根据我代码中的注释参数名自由组合
    schedule.scheduleJob({hour: 16, minute: 11, dayOfWeek: 1}, function(){
        console.log('scheduleObjectLiteralSyntax:' + new Date());
    });
}
scheduleObjectLiteralSyntax();
```
3. 递归规则调度定时器

您可以构建重复规则以指定何时应重复作业。 例如，考虑以下规则，该规则在每小时的42分钟之后每小时执行一次函数：
```
var schedule = require('node-schedule');
 
var rule = new schedule.RecurrenceRule();
rule.minute = 42;
 
var j = schedule.scheduleJob(rule, function(){
  console.log('The answer to life, the universe, and everything!');
});
```
您还可以使用数组来指定可接受值的列表，并使用Range对象来指定起始值和结束值的范围，以及可选的step参数。 例如，这将在周四，周五，周六和周日下午5点打印一条消息：
```
var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 17;
rule.minute = 0;
 
var j = schedule.scheduleJob(rule, function(){
  console.log('Today is recognized by Rebecca Black!');
});
```
> RecurrenceRule属性
> - second (0-59)
> - minute (0-59)
> - hour (0-23)
> - date (1-31)
> - month (0-11)
> - year
> - dayOfWeek (0-6) Starting with Sunday

### 3. 代码编写
#### 登录功能：
```
const browser = await puppeteer.launch({
    headless: false,
    slowMo: 250,
    executablePath: ''
});  // 创建一个 Browser 实例
const page = (await browser.pages())[0];
await page.setViewport({
    width: 1280,
    height: 800
});  // 设置视口

await page.goto("https://weibo.com/"); // 跳转目标页面
await page.waitForNavigation();   //等待页面加载完成
await page.type("#loginname", username); // 输入用户名
await page.type("#pl_login_form > div > div:nth-child(3) > div.info_list.password > div > input", password);   // 输入密码
await page.click("#pl_login_form > div > div:nth-child(3) > div:nth-child(6)");  // 点击登录
await page.waitForNavigation();   //等待跳转的页面加载完成
```
#### 登录以后转发操作：
```
await page.type(".gn_search_v2>input", searchText);  // 等待新窗口加载后 搜索框输入需要搜索的用户
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
```
#### 任务定时触发
这里使用的的是基于递归规则调度定时器
```
let rule = null;
rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(1, 6)];
rule.hour = 12;
rule.minute = 0; // 定义一个每周1到周六中午12点的规则
try {
    login(config.username, config.password);
} catch (error) {
    console.log(error);
}

j = schedule.scheduleJob(rule, async () => { // 定时任务
    try {
        login(config.username, config.password);
    } catch (error) {
        console.log(error);
    }
});
```
### docker部署
#### 创建Dockerfile文件
```
# 这里是别人已经搭建好的的一个puppeteer运行换季环境                                                           
FROM buildkite/puppeteer                                                                         
                                                                                                 
WORKDIR /app                                                                                     
                                                                                                 
# 把当当前目录的模样   所有内容都拷贝到 app工作目录                                                                   
COPY . /app                                                                                      
                                                                                                 
                                                                                                 
RUN npm install -g yarn                                                                          
RUN yarn install                                                                                 
                                                                                                 
# 完成  
```
#### 创建Docker镜像
```
# 不要忘记最后有一个点
docker build --tag=pptr-image .

# 这里我们把镜像的名称叫做pptr-image
# 创建镜像需要一些时间，请耐心等待
```
#### 使用我们刚刚创建的镜像启动一个实例（实例也称为container）
```
docker run -it pptr-image bash

# 然后在出现的新的命令行交互界面敲击

node index.js
```   
如你所见，我们的puppeteer应用程序正常启动并且正常运行了，这一切多亏了Docker还有别人已经给我们做好的 buildkite/puppeteer 镜像，这个镜像中已经安装好了 pptr 在linux环境运行时候所需要的一些环境依赖。


源码地址：[github地址](https://github.com/skique/weibopost.git)


测
试


test
