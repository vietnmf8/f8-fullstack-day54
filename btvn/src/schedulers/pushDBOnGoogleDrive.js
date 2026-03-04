require("dotenv").config();
const readline = require("node:readline");
const fs = require("node:fs");
const { google } = require("googleapis");
const dbConfig = require("@/configs/db.config");
const { getDateStringYmdHis } = require("@/utils/dateFormat");

/* Khởi tạo Google Auth với Service Account */
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000",
);

/* Get Refresh Token */
async function getRefreshToken() {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/drive.file"],
        prompt: "consent",
    });

    console.log("🔗 Truy cập URL để xác thực:");
    console.log(authUrl);
    console.log("\n");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question("📄 Paste authorization code từ URL: ", async (code) => {
            rl.close();

            const { tokens } = await oauth2Client.getToken(code);

            console.log("\n✅ Refresh Token:");
            console.log(tokens.refresh_token);

            console.log("\n📁 Lưu vào .env:");
            console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);

            resolve(tokens);
        });
    });
}

// getRefreshToken().catch(console.error);

/* Set Thông tin xác thực với Refresh Token */
oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

/* Tạo instance Google Drive API v3 */
const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
});

async function pushDBOnGoogleDrive() {
    /* BackupDB */
    const { database } = dbConfig;
    const dateStr = getDateStringYmdHis();
    const { backupLocalDir } = dbConfig;
    const outputFile = `${backupLocalDir}/${database}_${dateStr}.sql`;

    const res = await drive.files.create({
        requestBody: {
            name: outputFile,
            mimeType: "text/plain",
            parents: ["1KQ72vRY8sSBEG1EQUVSAedSV-mMn1l-E"], // Id của Folder trên Google Drive
        },
        media: {
            mimeType: "text/plain",
            body: fs.createReadStream(outputFile),
        },
    });

    console.log(res.data);
}

// backupDB().catch(console.error);
module.exports = pushDBOnGoogleDrive;
