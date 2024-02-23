const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const common = require('../common/commonFunctionalities');

const s3Client = new S3Client(
    {
        region: common.AWS_REGION,
        credentials : {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    }
);

const retrieveProfilePicture = async (key) => {
    return await s3Client.send(
        new GetObjectCommand(
            {
                Bucket: common.S3_BUCKET_NAME,
                Key: key
            }
        )
    );
};

const storeProfilePicture = async (key, body) => {
    const format = body.substring(body.indexOf('data:')+5, body.indexOf(';base64'))
    const base64Data = body.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    await s3Client.send(
        new PutObjectCommand(
            {
                Bucket: common.S3_BUCKET_NAME,
                Key: key,
                Body: imageBuffer,
                ContentType: format,
            }
        )
    );
};

module.exports = {
    retrieveProfilePicture,
    storeProfilePicture
}
