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

// Define Headers
const headers = {
  "x-client-id": keys.XClientId,
  "x-client-secret": keys.XClientSecret,
  accept: "application/json",
  "content-type": "application/json",
  "x-api-version": "2023-08-01",
};

// Base URL Based on Environment
const baseURL =
  environment === "Production"
    ? "https://api.cashfree.com/pg/subscriptions/pay"
    : "https://sandbox.cashfree.com/pg/subscriptions/pay";

// Generate Random Payment ID
const generatePaymentId = () => {
  const randomBytes = crypto.randomBytes(4).toString("hex"); // Generate 8-character hex string
  return `PAY-${Date.now()}-${randomBytes}`;
};

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
  subscription_session_id: sessionData.subscription_session_id, // From JSON file
  payment_id: generatePaymentId(), // Generate a unique Payment ID
  payment_type: "AUTH",
  subscription_id: subData.subscription_id, // From JSON file
  payment_schedule_date: getScheduleDate(), // Dynamically calculated date
  payment_method: {
    card: {
      channel: "link",
      card_number: "4576238912771450",
      card_cvv: "123",
      card_expiry_mm: "12",
      card_expiry_yy: "25",
      card_holder_name: "John Doe",
      card_network: "VISA",
      card_type: "CREDIT",
    },
  },
};

// Function to Make Payment Request
const paySubscription = async () => {
  try {
    const response = await axios.post(baseURL, subscriptionPaymentData, { headers });
    console.log("Subscription Payment Successful:", response.data);
  } catch (error) {
    console.error("Error Paying Subscription:", error.response?.data || error.message);
  }
};

// Call the Function
paySubscription();
