import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// --- Environment Variables ---
// Best practice to fetch these at the start.
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

// --- CORS Headers ---
// Standard headers for enabling cross-origin requests.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Main Server Logic ---
serve(async (req) => {
  // Immediately handle OPTIONS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, username, password } = await req.json();

    // --- Input Validation ---
    // Ensure all required parameters are present and valid.
    if (!phone || !username || !password) {
      throw new Error("Missing required parameters: phone, username, or password.");
    }
    // Simple validation for an Indian phone number format.
    if (!/^\+91\d{10}$/.test(phone)) {
        throw new Error("Invalid phone number format. Expected '+91' followed by 10 digits.");
    }


    // --- SMS Sending Logic ---
    // Check if Twilio credentials are configured in the environment.
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
        // Provide more detailed error feedback from the Twilio API.
        throw new Error(`Twilio Error: ${errorData.message || 'Failed to send SMS.'}`);
      }
    } else {
      // --- Fallback for Local Development ---
      // If Twilio credentials are not set, log the credentials to the console.
      console.log("--- Twilio credentials not found. Logging SMS content instead. ---");
      console.log(`--- SMS to ${phone} ---`);
      console.log(`Welcome to Nagar Rakshak!`);
      console.log(`Your username: ${username}`);
      console.log(`Your password: ${password}`);
      console.log(`--- End of SMS ---`);
    }

    // --- Success Response ---
    return new Response(JSON.stringify({ success: true, message: "Credentials sent successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // --- Error Handling ---
    // Catch any errors and return a structured error response.
    console.error('Error sending credentials:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 400, // Use 400 for client-side errors, 500 for server-side.
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});