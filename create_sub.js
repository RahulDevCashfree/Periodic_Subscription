// Created the Plan in create_plan.js file and then using the same Plan ID here

const fs = require("fs");
const axios = require("axios");
const fsPromises = require("fs/promises"); // Promises-based file system API

// Set the environment to either "Test" or "Production"
const environment = "Test"; // Change this to "Production" for live

// Base URL for the environment
const baseUrls = {
  Test: "https://sandbox.cashfree.com/pg",
  Prod: "https://api.cashfree.com/pg"
};

// Load API Keys Dynamically from JSON File
const loadApiKeys = async () => {
  try {
    const data = await fsPromises.readFile("api_keys.json", "utf8");
    const config = JSON.parse(data);

    if (!config[environment]) {
      throw new Error(`Environment "${environment}" not found in api_keys.json`);
    }

    return {
      XClientId: config[environment].XClientId,
      XClientSecret: config[environment].XClientSecret,
      BaseUrl: baseUrls[environment], // Set the Base URL directly based on the environment
    };
  } catch (err) {
    throw new Error(`Error loading API keys: ${err.message}`);
  }
};

// Fetch the plan ID from plan_data.json
let planId;
try {
  const planData = JSON.parse(fs.readFileSync("plan_data.json", "utf8"));
  planId = planData.plan_id; // Fetch the plan_id
  console.log(`Fetched Plan ID: ${planId}`);
} catch (error) {
  console.error("Error reading plan_data.json:", error.message);
  process.exit(1); // Exit if the plan ID is not available
}

// Generate the dynamic subscription ID using the current timestamp
const currentTimestamp = Date.now();
const subscriptionId = `SUB_TEST_${currentTimestamp}`;

// Calculate the subscription first charge time (30 days from now, at 10:00 AM)
const thirtyDaysFromNow = new Date();
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
thirtyDaysFromNow.setHours(10, 0, 0, 0); // Set time to 10:00 AM

// Format as ISO8601 string with local timezone offset
const subscriptionFirstChargeTime =
  thirtyDaysFromNow.toISOString().split(".")[0] + "+05:30";

// Define the subscription data
const subscriptionData = {
  plan_details: {
    plan_id: planId, // Use the fetched plan_id or pass the plan ID here directly if you want to create subscription + Plan in same API call
    plan_amount: 2000,
    plan_name: "Prod_Test_1",
    plan_type: "PERIODIC",
    plan_currency: "INR",
    plan_max_amount: 10000,
    plan_intervals: 1,
    plan_interval_type: "DAY",
  },
  authorization_details: {},
  subscription_id: subscriptionId,
  customer_details: {
    customer_name: "Rahul Raman",
    customer_email: "test@cashfree.com",
    customer_phone: "9999999999",
  },
  subscription_first_charge_time: subscriptionFirstChargeTime,
  subscription_note: "This is Test Subscription",
};

// Save the subscription ID to a JSON file
const saveSubscriptionId = () => {
  fs.writeFileSync(
    "subscription_id.json",
    JSON.stringify({ subscription_id: subscriptionId }, null, 2),
    "utf8"
  );
};

// Save the session ID to session_data.json file
const saveSessionId = (sessionId) => {
  fs.writeFileSync(
    "session_data.json",
    JSON.stringify({ subscription_session_id: sessionId }, null, 2),
    "utf8"
  );
};

// Function to create the subscription
const createSubscription = async () => {
  try {
    // Load API keys dynamically
    const Cashfree = await loadApiKeys();


    const response = await axios.post(
      `${Cashfree.BaseUrl}/subscriptions`, // Base URL based on environment
      subscriptionData,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2023-08-01", // Replace with your API version
          "x-client-id": Cashfree.XClientId,
          "x-client-secret": Cashfree.XClientSecret,
        },
      }
    );

    console.log("Subscription created successfully:", response.data);

    // Save the subscription ID after successful creation
    saveSubscriptionId();

    // Save the session ID into session_data.json file
    const subscriptionSessionId = response.data.subscription_session_id;
    if (subscriptionSessionId) {
      saveSessionId(subscriptionSessionId); // Save session ID dynamically
      console.log("Subscription Session ID saved successfully:", subscriptionSessionId);
    } else {
      console.log("Subscription Session ID not found in the response.");
    }
  } catch (error) {
    console.error("Error creating subscription:", error.response?.data || error.message);
  }
};

// Call the function to create the subscription
createSubscription();


//Once the Subscription session ID is created use below link to redirect the user to auth page. 
// https://codepen.io/Harshith-Kanigalpula-the-styleful/pen/MWMJWeN
// Merchant need to implement the same JS SDK on their react JS code as well so that our SDK handles the Session ID.
