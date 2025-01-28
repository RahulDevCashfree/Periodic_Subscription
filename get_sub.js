const fs = require("fs");
const axios = require("axios");
const path = require("path");

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
const environment = "Test"; // Change to 'Production' for production
const keys = getApiKeys(environment);

// Define headers
const headers = {
  "x-api-version": "2023-08-01",
  "x-client-id": keys.XClientId,
  "x-client-secret": keys.XClientSecret,
};

// Base URL based on environment
const baseURL = environment === "Production"
  ? "https://api.cashfree.com/pg/subscriptions"
  : "https://sandbox.cashfree.com/pg/subscriptions";

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

// Function to fetch subscription details
const fetchSubscriptionDetails = async () => {
  try {
    const url = `${baseURL}/${subData.subscription_id}`; // Append subscription ID to the base URL
    const response = await axios.get(url, { headers });
    console.log("Subscription Details:", response.data);
  } catch (error) {
    console.error("Error Fetching Subscription Details:", error.response?.data || error.message);
  }
};

// Call the function
fetchSubscriptionDetails();
