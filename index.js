let schedule = require('node-schedule');
// let fs = require('fs');
let login = require('./login');
let j = '';
const config = {
	username: '15107915609', //微博账号名
	password: 'skique7', //微博密码
}

timing();

function timing() {
    let rule = null;
    rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [new schedule.Range(1, 6)];
    rule.hour = 12;
    rule.minute = 0;
    try {
        login(config.username, config.password);
    } catch (error) {
        console.log(error);
    }

    j = schedule.scheduleJob(rule, async () => { //定时任务
        try {
            login(config.username, config.password);
        } catch (error) {
            console.log(error);
        }
    });
	
}
