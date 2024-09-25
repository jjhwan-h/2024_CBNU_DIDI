"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestCredentialMail = exports.alreadyVerifiedHtml = exports.successMail = exports.errMail = exports.successHtml = exports.transporter = void 0;
const nodeMailer = __importStar(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: { user: 'jjhwan.h@gmail.com', pass: process.env.EMAIL_PW },
});
const successHtml = (date) => {
    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification Success</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-image: url('https://storage.googleapis.com/cbnu_didi/public/vote3.jpg');
        background-size: cover; /* 화면에 꽉 차도록 배경 이미지 크기 조절 */
        background-position: center; /* 배경 이미지 중앙 정렬 */
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      .container {
        background-color: #fff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
        text-align: center;
        width: 400px;
      }
      h1 {
        color: #007bff;
      }
      p {
        color: #333;
      }
      .success-icon {
        width: 80px;
        height: 80px;
        margin-bottom: 20px;
      }
      .btn {
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s ease;
      }
      .btn:hover {
        background-color: #0056b3;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Email Verification Success!</h1>
      <p>Your email has been successfully verified.</p>
      <p>${date}까지 회원가입 페이지로 돌아가서 작업을 마저 완료해주세요.</p>
      <p>이후에는 다시 email 검증을 받아야합니다.</p>
    </div>
  </body>
  </html>
  `;
    return html;
};
exports.successHtml = successHtml;
exports.errMail = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-image: url('https://storage.googleapis.com/cbnu_didi/public/vote3.jpg');
              background-size: cover; /* 화면에 꽉 차도록 배경 이미지 크기 조절 */
              background-position: center; /* 배경 이미지 중앙 정렬 */
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              background-color: #007BFF;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
          }
          .content {
              padding: 20px;
              text-align: center;
          }
          .content p {
              font-size: 16px;
              line-height: 1.5;
              color: #333333;
          }
          .content a {
              display: inline-block;
              background-color: #007BFF;
              color: #ffffff;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 4px;
              margin-top: 10px;
          }
          .footer {
              padding: 10px;
              text-align: center;
              font-size: 12px;
              color: #777777;
          }
      </style>
  </head>
  <body>
                  <div class="container">
                  <div class="header">
                      <h1>Email Verification</h1>
                  </div>
                  <div class="content">
                      <p>해당 이메일은 이미 가입이 완료된 회원입니다.</p>
                  </div>
                  <div class="footer">
                      <p>&copy; 2024 Your Company. All rights reserved.</p>
                  </div>
                  </div>
              </body>
          </html>
  `;
const successMail = (email, result) => {
    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-image: url('https://storage.googleapis.com/cbnu_didi/public/vote3.jpg');
              background-size: cover; /* 화면에 꽉 차도록 배경 이미지 크기 조절 */
              background-position: center; /* 배경 이미지 중앙 정렬 */
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              background-color: #007BFF;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              border-top-left-radius: 8px;
              border-top-right-radius: 8px;
          }
          .content {
              padding: 20px;
              text-align: center;
          }
          .content p {
              font-size: 16px;
              line-height: 1.5;
              color: #333333;
          }
          .content a {
              display: inline-block;
              background-color: #007BFF;
              color: #ffffff;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 4px;
              margin-top: 10px;
          }
          .footer {
              padding: 10px;
              text-align: center;
              font-size: 12px;
              color: #777777;
          }
      </style>
  </head>
  <body>
        <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>Please click the following link to verify your email address:</p>
            <p>
                <h3><a href="${process.env.SERVER_URL}/auth/email/?email=${email}&token=${result.token}">Verify email</a></h3>
            </p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Your Company. All rights reserved.</p>
        </div>
        </div>
    </body>
  </html>
  `;
    return html;
};
exports.successMail = successMail;
const alreadyVerifiedHtml = () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-image: url('https://storage.googleapis.com/cbnu_didi/public/vote3.jpg');
            background-size: cover; /* 화면에 꽉 차도록 배경 이미지 크기 조절 */
            background-position: center; /* 배경 이미지 중앙 정렬 */
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007BFF;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .content a {
            display: inline-block;
            background-color: #007BFF;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .footer {
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>
      <div class="container">
          <h1>Email Verification</h1>
      <div class="content">
          <p>이미 인증이 완료되었습니다. 회원가입을 완료해주세요</p>
      </div>
      <div class="footer">
          <p>&copy; 2024 Your Company. All rights reserved.</p>
      </div>
      </div>
  </body>
</html>
`;
    return html;
};
exports.alreadyVerifiedHtml = alreadyVerifiedHtml;
const requestCredentialMail = (v, roomName) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-image: url('https://storage.googleapis.com/cbnu_didi/public/vote3.jpg');
            background-size: cover; /* 화면에 꽉 차도록 배경 이미지 크기 조절 */
            background-position: center; /* 배경 이미지 중앙 정렬 */
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #007BFF;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .content a {
            display: inline-block;
            background-color: #007BFF;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin-top: 10px;
        }
        .footer {
            padding: 10px;
            text-align: center;
            font-size: 12px;
            color: #777777;
        }
    </style>
</head>
<body>
      <div class="container">
          <h1>투표요청</h1>
      <div class="content">
          <p>"${v.name}"님은 "${roomName}" 투표의 유권자로 등록되었습니다. </p>
          <p>사이트를 방문하여 "${v.name}, ${v.email}"로 가입을 완료해주세요. </p>
      </div>
      <h3><a href="link">SITE LINK</a></h3>
      <div class="footer">
          <p>&copy; 2024 Your Company. All rights reserved.</p>
      </div>
      </div>
  </body>
</html>
`;
    return html;
};
exports.requestCredentialMail = requestCredentialMail;
