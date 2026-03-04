const dbConfig = require("@/configs/db.config");
const mailService = require("@/services/mail.service");
const { getDateStringYmdHis } = require("@/utils/dateFormat");
const { spawn, execSync } = require("node:child_process");
const fs = require("fs");

async function backupDB_RClone() {
    /* BackupDB */
    const { host, user, password, port, database } = dbConfig;
    const dateStr = getDateStringYmdHis();
    const { backupLocalDir, backupRemoteDir, backupRemoteName } = dbConfig;
    const outputFile = `${backupLocalDir}/${database}_${dateStr}.sql`;

    // Khởi tạo luồng vào file output
    const outputStream = fs.createWriteStream(outputFile);

    // Dump file
    const mysqldump = spawn("mysqldump", [
        `-u${user}`,
        `-p${password}`,
        `-h${host}`,
        `-P${port}`,
        `${database}`,
    ]);

    // Lưu vào file output
    mysqldump.stdout.pipe(outputStream);

    // Thông báo lỗi
    mysqldump.on("error", (error) => {
        outputStream.end();
        console.log(`Error: ${error.message}`);
    });
    // Tiến trình kết thúc
    mysqldump.on("close", async (code) => {
        outputStream.end();
        console.log(`child process exited with code ${code}`);

        // Nếu thành công!
        if (code === 0) {
            console.log("Backup thành công!");
            const copyCmd = `rclone copy ${backupLocalDir} ${backupRemoteName}:${backupRemoteDir}`;

            // Backup lên Google Drive
            execSync(copyCmd);
            console.log("Upload Google Drive!");

            /* Gửi email sau khi Backup DB thành công! */
            await mailService.sendBackupRepost(
                "vietnmf8@fullstack.edu.vn",
                `Upload to Google Drive Successfully!`,
                outputFile,
            );
        } else {
            // Khi tiến trình kết thúc mà lỗi, xoá file đó
            fs.unlinkSync(outputFile);
        }
    });
}

module.exports = backupDB_RClone;
