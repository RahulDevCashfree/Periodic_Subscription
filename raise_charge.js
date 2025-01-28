const fs = require("fs");
const axios = require("axios");
const path = require("path");
const crypto = require("crypto"); // For generating random Payment ID

// Load API keys from file
const apiKeys = JSON.parse(fs.readFileSync(path.join(__dirname, "api_keys.json"), "utf-8"));

// Function to get API keys based on environment
const getApiKeys = (environment) => {
  if (!["Test", "Production"].includes(environment)) {
    throw new Error('Invalid environment. Must be "Test" or "Production".');
  }
  return apiKeys[environment];
};

// Set environment (change to 'Production' for production keys)
const environment = "Test";
const keys = getApiKeys(environment);

// Define headers
const headers = {
  "Content-Type": "application/json",
  "x-api-version": "2023-08-01",
  "x-client-id": keys.XClientId,
  "x-client-secret": keys.XClientSecret,
};

// Base URL based on environment
const baseURL =
  environment === "Production"
    ? "https://api.cashfree.com/pg/subscriptions/pay"
    : "https://sandbox.cashfree.com/pg/subscriptions/pay";

// Generate random Payment ID
const generatePaymentId = () => {
  const randomBytes = crypto.randomBytes(4).toString("hex"); // Generate 8-character hex string
  return `PAY-${Date.now()}-${randomBytes}`;
};

// Helper function to read data from JSON file
const getDataFromFile = (fileName) => {
  try {
    const data = JSON.parse(fs.readFileSync(fileName, "utf8"));
    return data;
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error.message);
    process.exit(1); // Exit script if file read fails
  }
};

// Fetch subscription ID from JSON file
const subData = getDataFromFile("subscription_id.json");

// Calculate T+2 date
const getScheduleDate = () => {
  const now = new Date();
  now.setDate(now.getDate() + 2); // Add 2 days
  now.setHours(10, 20, 12, 0); // Set time to 10:20:12
  return now.toISOString(); // Convert to ISO string
};

// Request data for subscription charge
const subscriptionChargeData = {
  payment_id: generatePaymentId(),
  payment_type: "CHARGE",
  subscription_id: subData.subscription_id, // Fetch from sub_data.json
  payment_amount: 10, // Payment amount
  payment_remarks: "Charge Subscription",
  payment_schedule_date: getScheduleDate(), // T+2 date. The field only for UPI and Card
};

// Function to write payment_id to a new JSON file
const writePaymentIdToFile = (paymentId) => {
  const paymentIdData = {
    payment_id: paymentId,
  };

  fs.writeFileSync("payment_id_data.json", JSON.stringify(paymentIdData, null, 2), "utf-8");
  console.log("Payment ID stored successfully in payment_id_data.json");
};

// Function to make the API call
const chargeSubscription = async () => {
  try {
    // Generate payment ID and add it to the charge data
    const paymentId = subscriptionChargeData.payment_id;
    writePaymentIdToFile(paymentId); // Store the generated payment ID in the file

    // Make the API call to charge the subscription
    const response = await axios.post(baseURL, subscriptionChargeData, { headers });
    console.log("Subscription Charged Successfully:", response.data);
  } catch (error) {
    console.error("Error Charging Subscription:", error.response?.data || error.message);
  }
};

// Call the function
chargeSubscription();
