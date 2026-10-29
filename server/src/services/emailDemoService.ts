import { ENV } from '../config/env';

export interface EmailPayload {
  to: string;
  subject: string;
  template: 'booking_confirmation' | 'cancellation' | 'announcement' | 'reminder' | 'password_reset';
  data: Record<string, any>;
}

export const sendDemoEmail = async (payload: EmailPayload): Promise<{ success: boolean; simulated: boolean }> => {
  if (ENV.DEMO_EMAIL_LOG) {
    console.log('\n=================== [DEMO EMAIL MODE] ===================');
    console.log(`To: ${payload.to}`);
    console.log(`Subject: ${payload.subject}`);
    console.log(`Template: ${payload.template}`);
    console.log('Payload Data:', JSON.stringify(payload.data, null, 2));
    console.log('=========================================================\n');
  }
  return { success: true, simulated: true };
};
