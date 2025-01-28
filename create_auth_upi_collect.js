// Import Required Modules
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

// Load API Keys and Configurations from JSON
const loadConfig = (filename) => {
  try {
    const filePath = path.join(__dirname, filename);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error.message);
    process.exit(1);
  }
};

// Environment Configuration (Set 'Test' or 'Prod')
const environment = "Test"; // Use 'Test' or 'Prod'
const config = loadConfig("api_keys.json")[environment];

// Base URL Based on Environment
const baseURL =
  environment === "Prod"
    ? "https://api.cashfree.com/pg/subscriptions/pay"
    : "https://sandbox.cashfree.com/pg/subscriptions/pay";

// Generate Random Payment ID
const generatePaymentId = () => {
  const randomBytes = crypto.randomBytes(4).toString("hex"); // Generate 8-character hex string
  return `PAY-${Date.now()}-${randomBytes}`;
};

// Fetch Data from JSON File
const getDataFromFile = (filename) => {
  try {
    const filePath = path.join(__dirname, filename);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return data;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    process.exit(1);
  }
};

// Fetch Subscription and Session Data from JSON Files
const subData = getDataFromFile("subscription_id.json");
const sessionData = getDataFromFile("session_data.json");

// Dummy Data for Subscription Payment
const subscriptionPaymentData = {
  payment_method: {
    upi: {
      channel: "collect",
      upi_id:"testsuccess@gocash"
    },
  },
  subscription_id: subData.subscription_id,
  subscription_session_id: sessionData.subscription_session_id,
  payment_id: generatePaymentId(), // Dynamic Payment ID
  payment_type: "AUTH",
  payment_schedule_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // T+2 Date
};

// Function to Pay Subscription
const paySubscription = async () => {
  try {
    const response = await axios.post(baseURL, subscriptionPaymentData, {
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": config.XClientId,
        "x-client-secret": config.XClientSecret,
      },
    });

    // Print Response to Terminal
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(
      "Error Paying Subscription:",
      error.response?.data || error.message
    );
  }
};

// Call the Function
paySubscription();
