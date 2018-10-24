import * as zlib from 'zlib';

export default class S3Download {
  constructor(s3) {
    this.s3 = s3;
  }

  async retrieveAndUnGzipLog(logFile) {
    const gzippedContentFile = await this.s3.getObject(logFile).promise();
    return S3Download.unGzipContent(gzippedContentFile.Body);
  }

  static unGzipContent(zippedContent) {
    return new Promise((resolve, reject) => {
      zlib.gunzip(zippedContent, (err, result) => {
        if (err) {
          reject(err);
        } else {
          const unzippedLog = result.toString() ? JSON.parse(result.toString()) : { Records: [] };
          resolve(unzippedLog);
        }
      });
    });
  }
}
