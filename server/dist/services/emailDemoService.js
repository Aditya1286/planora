"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDemoEmail = void 0;
const env_1 = require("../config/env");
const sendDemoEmail = async (payload) => {
    if (env_1.ENV.DEMO_EMAIL_LOG) {
        console.log('\n=================== [DEMO EMAIL MODE] ===================');
        console.log(`To: ${payload.to}`);
        console.log(`Subject: ${payload.subject}`);
        console.log(`Template: ${payload.template}`);
        console.log('Payload Data:', JSON.stringify(payload.data, null, 2));
        console.log('=========================================================\n');
    }
    return { success: true, simulated: true };
};
exports.sendDemoEmail = sendDemoEmail;
