import { DynamoDBClient, ScanCommand, BatchWriteItemCommand, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs"; // Ensure bcrypt is installed using `npm install bcryptjs`
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({ region: "us-west-2" });

const CUSTOMERS_TABLE = "Customers";
const USERS_TABLE = "Users";

// ** Sample Customers Data **
const customersSeedData = [
  { customerId: "1", name: "John Doe", address: "123 Main St", company: "Acme Corp" },
  { customerId: "2", name: "Jane Smith", address: "456 Elm St", company: "Tech Solutions" },
  { customerId: "3", name: "Michael Johnson", address: "789 Oak Ave", company: "Innovate LLC" },
  { customerId: "4", name: "Emily Davis", address: "321 Maple Rd", company: "BuildRight Inc." },
  { customerId: "5", name: "David Wilson", address: "654 Pine Dr", company: "Green Energy" },
];

// ** Sample Users Data **
const usersSeedData = [
  {
    userId: uuidv4(),
    email: "hancocklandon@gmail.com",
    firstName: "Landon",
    lastName: "Hancock",
    passwordHash: bcrypt.hashSync("landon10", 10),
    profilePicture: null,
  },
  {
    userId: uuidv4(),
    email: "jwick@gmail.com",
    firstName: "Josh",
    lastName: "Wick",
    passwordHash: bcrypt.hashSync("babayaga", 10),
    profilePicture: null,
  },
  {
    userId: uuidv4(),
    email: "test@gmail.com",
    firstName: "test",
    lastName: "tester",
    passwordHash: bcrypt.hashSync("password123", 10),
    profilePicture: null,
  },
];

/** Function to delete all records from a table */
async function clearTable(tableName, primaryKey) {
  try {
    const scanCommand = new ScanCommand({ TableName: tableName });
    const data = await client.send(scanCommand);

    if (!data.Items || data.Items.length === 0) {
      console.log(`No records to delete from ${tableName}.`);
      return;
    }

    for (const item of data.Items) {
      const key = {};
      key[primaryKey] = item[primaryKey];

      await client.send(new DeleteItemCommand({
        TableName: tableName,
        Key: key,
      }));
    }

    console.log(`Deleted ${data.Items.length} existing records from ${tableName}.`);
  } catch (error) {
    console.error(`Error deleting records from ${tableName}:`, error);
  }
}

/** Function to seed Customers table */
async function seedCustomersTable() {
  try {
    for (const customer of customersSeedData) {
      await client.send(new PutItemCommand({
        TableName: CUSTOMERS_TABLE,
        Item: {
          customerId: { S: customer.customerId },
          name: { S: customer.name },
          address: { S: customer.address },
          company: { S: customer.company },
        },
      }));
    }

    console.log(`Inserted ${customersSeedData.length} new customers.`);
  } catch (error) {
    console.error("Error inserting customer records:", error);
  }
}

/** Function to seed Users table */
async function seedUsersTable() {
  try {
    for (const user of usersSeedData) {
      await client.send(new PutItemCommand({
        TableName: USERS_TABLE,
        Item: {
          userId: { S: user.userId },
          email: { S: user.email },
          firstName: { S: user.firstName },
          lastName: { S: user.lastName },
          passwordHash: { S: user.passwordHash },
          profilePicture: user.profilePicture ? { S: user.profilePicture } : { NULL: true },
        },
      }));
    }

    console.log(`Inserted ${usersSeedData.length} new users.`);
  } catch (error) {
    console.error("Error inserting user records:", error);
  }
}

/** Function to reset and seed the database */
async function resetAndSeed() {
  console.log("Starting database reset and seeding...");

  await clearTable(CUSTOMERS_TABLE, "customerId");
  await clearTable(USERS_TABLE, "userId");

  await seedCustomersTable();
  await seedUsersTable();

  console.log("Database reset and seeded successfully! ✅");
}

resetAndSeed();