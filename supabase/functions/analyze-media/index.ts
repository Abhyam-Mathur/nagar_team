import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, username, password } = await req.json();

    if (!phone || !username || !password) {
      throw new Error("Missing required parameters: phone, username, or password.");
    }

    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
      const message = `Welcome to Nagar Rakshak! Your username is ${username} and your password is ${password}. Please keep them safe.`;
      
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: phone,
          From: TWILIO_PHONE_NUMBER,
          Body: message,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Twilio Error: ${errorData.message}`);
      }
    } else {
      console.log(`--- SMS to ${phone} ---`);
      console.log(`Welcome to Nagar Rakshak!`);
      console.log(`Your username: ${username}`);
      console.log(`Your password: ${password}`);
      console.log(`--- End of SMS ---`);
    }

    return new Response(JSON.stringify({ success: true, message: "Credentials sent successfully (logged)." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending credentials:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

