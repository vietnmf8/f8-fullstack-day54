const dbConfig = require("@/configs/db.config");
const { getDateStringYmdHis } = require("@/utils/dateFormat");
const { promisify } = require("node:util");
const { exec: childExec } = require("node:child_process");

// Biến một hàm trở thành một promise
const exec = promisify(childExec);

async function backupDB() {
    const { host, user, password, port, database } = dbConfig;
    const dateStr = getDateStringYmdHis();
    const { backupLocalDir, backupRemoteDir, backupRemoteName } = dbConfig;
    const backupCmd = `mysqldump -u${user} -p${password} -h${host} -P${port} ${database} > ${backupLocalDir}/${database}_${dateStr}.sql`;

    try {
        /* Backup Database về Server */
        const { stdout, stderr } = await exec(backupCmd);
        console.log("Backup Success!");

        /* Rclone: Copy file Backup lên Google Drive */
        // rclone copy <thư_mục_nguồn> <tên_remote>:<thư_mục_đích>
        const copyCmd = `rclone copy ${backupLocalDir} ${backupRemoteName}:${backupRemoteDir}`;
        await exec(copyCmd);
        console.log("Upload to Google Drive Successfully!");
    } catch (error) {
        console.log(error);
    }
}

module.exports = backupDB;
