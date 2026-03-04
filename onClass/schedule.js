require("dotenv").config();
require("module-alias/register");
const backupDB = require("@/schedulers/backupDB");
const autoClearRevokedToken = require("@/schedulers/autoClearRevokedToken");
const { CronJob } = require("cron");

/**
 * Cứ 2h sáng
 * Tự động Backup Database
 */
new CronJob("* 2 * * *", backupDB).start();

/**
 * 1h sáng mỗi ngày
 * Tự động Clear những token đã nằm trong Blacklist
 */

new CronJob("0 1 * * *", autoClearRevokedToken).start();
