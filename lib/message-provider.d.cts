export function smtpOptions(env?: NodeJS.ProcessEnv): import('nodemailer').TransportOptions;
export function smsConfigured(env?: NodeJS.ProcessEnv): boolean;
export function sendEmail(to:string,subject:string,text:string,env?:NodeJS.ProcessEnv):Promise<{accepted:boolean}>;
export function sendSms(to:string,text:string,reference:string,env?:NodeJS.ProcessEnv):Promise<{submitted:boolean}>;
