const fs = require("fs");
const axios = require("axios");
const path = require("path");
const crypto = require("crypto"); // Import crypto module

// Load API keys
const apiKeys = JSON.parse(fs.readFileSync(path.join(__dirname, "api_keys.json"), "utf-8"));

// Function to get API keys based on environment
const getApiKeys = (environment) => {
  if (!["Test", "Production"].includes(environment)) {
    throw new Error('Invalid environment. Must be "Test" or "Production".');
  }
  return apiKeys[environment];
};

// Example usage
const environment = "Test"; // Change to 'Production' for production keys
const keys = getApiKeys(environment);

const headers = {
  "x-client-id": keys.XClientId,
  "x-client-secret": keys.XClientSecret,
};

// Generate Random Payment ID
const generatePaymentId = () => {
  const randomBytes = crypto.randomBytes(4).toString("hex"); // Generate 8-character hex string
  return `PAY-${Date.now()}-${randomBytes}`;
};

// Base URL Based on Environment
const baseURL =
  environment === "Production"
    ? "https://api.cashfree.com/pg/subscriptions/pay"
    : "https://sandbox.cashfree.com/pg/subscriptions/pay";

// Helper Function to Read Data from JSON File
const getDataFromFile = (fileName) => {
  try {
    const data = JSON.parse(fs.readFileSync(fileName, "utf8"));
    return data;
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error.message);
    process.exit(1); // Exit script if file read fails
  }
};

// Fetching Subscription and Session Data from JSON Files
const subData = getDataFromFile("subscription_id.json");
const sessionData = getDataFromFile("session_data.json");

// Calculate T+2 Date
const getScheduleDate = () => {
  const now = new Date();
  now.setDate(now.getDate() + 2); // Add 2 days to the current date
  now.setHours(10, 20, 12, 0); // Set time to 10:20:12
  return now.toISOString(); // Convert to ISO string format
};

// Request Data for Subscription Payment
const subscriptionPaymentData = {
  payment_method: {
    enach: {
      channel: "link",
      account_holder_name: "Rahul Raman",
      account_number: "8971520311",
      account_ifsc: "YESB0000262",
      account_type: "SAVINGS",
      auth_mode: "net_banking",
      account_bank_code: "YESB",
    },
  },
  subscription_id: subData.subscription_id,
  subscription_session_id: sessionData.subscription_session_id,
  payment_id: generatePaymentId(), // Dynamic Payment ID
  payment_type: "AUTH",
  payment_schedule_date: getScheduleDate(), // Dynamically calculated date
};

// Function to Pay Subscription
const paySubscription = async () => {
  try {
    const response = await axios.post(baseURL, subscriptionPaymentData, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-version": "2023-08-01", // Replace with your API version
        "x-client-id": keys.XClientId, // Correct client_id from keys
        "x-client-secret": keys.XClientSecret, // Correct client_secret from keys
      },
    });

    console.log("Subscription Payment Successful:", response.data);
  } catch (error) {
    console.error("Error Paying Subscription:", error.response?.data || error.message);
  }
};

// Call the Function
paySubscription();
