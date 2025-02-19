const { DynamoDBClient, ScanCommand, BatchWriteItemCommand } = require("@aws-sdk/client-dynamodb");

// Configure AWS DynamoDB Client
const client = new DynamoDBClient({ region: "us-west-2" });

const TABLE_NAME = "Customers";

// Sample seed data
const seedData = [
  { customerId: "1", name: "John Doe", address: "123 Main St", company: "Acme Corp" },
  { customerId: "2", name: "Jane Smith", address: "456 Elm St", company: "Tech Solutions" }
];

// Function to delete all existing records
async function clearTable() {
  try {
    const scanCommand = new ScanCommand({ TableName: TABLE_NAME });
    const data = await client.send(scanCommand);

    if (!data.Items || data.Items.length === 0) {
      console.log("No records to delete.");
      return;
    }

    const deleteRequests = data.Items.map((item) => ({
      DeleteRequest: { Key: { customerId: item.customerId } }
    }));

    const deleteParams = {
      RequestItems: { [TABLE_NAME]: deleteRequests }
    };

    await client.send(new BatchWriteItemCommand(deleteParams));
    console.log(`Deleted ${deleteRequests.length} existing records.`);
  } catch (error) {
    console.error("Error deleting records:", error);
  }
}

// Function to seed the database
async function seedDatabase() {
  try {
    const putRequests = seedData.map((item) => ({
      PutRequest: { Item: { customerId: { S: item.customerId }, name: { S: item.name }, address: { S: item.address }, company: { S: item.company } } }
    }));

    const putParams = {
      RequestItems: { [TABLE_NAME]: putRequests }
    };

    await client.send(new BatchWriteItemCommand(putParams));
    console.log(`Inserted ${putRequests.length} new records.`);
  } catch (error) {
    console.error("Error inserting records:", error);
  }
}

// Run the script
async function resetAndSeed() {
  await clearTable();
  await seedDatabase();
  console.log("Database reset and seeded successfully.");
}

resetAndSeed();
