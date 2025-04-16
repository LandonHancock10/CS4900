import { DynamoDBClient, ScanCommand, BatchWriteItemCommand, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import bcrypt from "bcryptjs"; 
import { v4 as uuidv4 } from "uuid";
import fs from 'fs';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const dynamoClient = new DynamoDBClient({ region: "us-west-2" });
const s3Client = new S3Client({ region: "us-west-2" });
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "webspark-crm";

const CUSTOMERS_TABLE = "Customers";
const USERS_TABLE = "Users";

// Profile picture placeholder URLs
const defaultUserPicUrl = "https://webspark-crm.s3.amazonaws.com/users/default/profile.jpg";
const defaultCustomerPicUrls = [
  "https://webspark-crm.s3.amazonaws.com/customers/default/profile1.jpg",
  "https://webspark-crm.s3.amazonaws.com/customers/default/profile2.jpg",
  "https://webspark-crm.s3.amazonaws.com/customers/default/profile3.jpg",
  "https://webspark-crm.s3.amazonaws.com/customers/default/profile4.jpg"
];

// ** Sample Users Data **
const usersSeedData = [
  {
    userId: uuidv4(),
    email: "hancocklandon@gmail.com",
    firstName: "Landon",
    lastName: "Hancock",
    passwordHash: bcrypt.hashSync("landon10", 10),
    profilePicture: defaultUserPicUrl,
    createdAt: new Date().toISOString()
  }
];

// ** Sample Customers Data with comprehensive information **
const customersSeedData = [
  {
    customerId: uuidv4(),
    name: "Samantha Smith",
    address: "104 Nine Iron Court, American Fork, UT 84003",
    companyName: "Webspark Marketing",
    email: "samanthasmith@example.com",
    phone: "385-216-2482",
    notes: "Samantha is looking for a complete website redesign and branding update. She has a marketing budget of $10,000/month and wants to focus on organic growth.",
    profilePicture: defaultCustomerPicUrls[0],
    createdAt: new Date().toISOString(),
    tasks: [
      {
        title: "Send website redesign proposal",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "Schedule branding workshop",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
        createdAt: new Date().toISOString()
      },
      {
        title: "Review competitor analysis report",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      }
    ],
    assignedUsers: []
  },
  {
    customerId: uuidv4(),
    name: "Robert Johnson",
    address: "2376 Highland Drive, Salt Lake City, UT 84106",
    companyName: "Mountain View Construction",
    email: "robert.johnson@example.com",
    phone: "801-555-1234",
    notes: "Robert is interested in a custom CRM solution for his construction business. He manages over 25 projects simultaneously and needs better tracking for materials and labor.",
    profilePicture: defaultCustomerPicUrls[1],
    createdAt: new Date().toISOString(),
    tasks: [
      {
        title: "Finalize CRM requirements document",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "Develop project timeline",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "Demo prototype dashboard",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "Collect payment for initial deposit",
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
        createdAt: new Date().toISOString()
      }
    ],
    assignedUsers: []
  },
  {
    customerId: uuidv4(),
    name: "Emily Chen",
    address: "987 Tech Park Way, Lehi, UT 84043",
    companyName: "Innovative Solutions",
    email: "emily.chen@example.com",
    phone: "435-555-9876",
    notes: "Emily's startup needs a mobile app that integrates with their existing web platform. Their focus is on user experience and fast deployment.",
    profilePicture: defaultCustomerPicUrls[2],
    createdAt: new Date().toISOString(),
    tasks: [
      {
        title: "Mobile app wireframe review",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "API integration planning",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "User testing session",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      }
    ],
    assignedUsers: []
  },
  {
    customerId: uuidv4(),
    name: "Michael Taylor",
    address: "432 Oakwood Lane, Provo, UT 84604",
    companyName: "Taylor Family Dental",
    email: "dr.taylor@example.com",
    phone: "801-555-7890",
    notes: "Dr. Taylor needs a new patient management system with online booking capabilities. His office sees approximately 75 patients per week across three dentists.",
    profilePicture: defaultCustomerPicUrls[3],
    createdAt: new Date().toISOString(),
    tasks: [
      {
        title: "Interview office staff about workflow",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
        createdAt: new Date().toISOString()
      },
      {
        title: "Present booking system options",
        dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "Create data migration plan",
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "Schedule staff training session",
        dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "Set up automated appointment reminders",
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      }
    ],
    assignedUsers: []
  },
  {
    customerId: uuidv4(),
    name: "Sarah Williams",
    address: "567 Mountain View Road, Sandy, UT 84070",
    companyName: "Elevation Outdoors",
    email: "sarah@example.com",
    phone: "801-555-4321",
    notes: "Sarah's outdoor equipment company needs an e-commerce platform with inventory management. They're expanding to multiple locations and need a system that can scale.",
    profilePicture: defaultCustomerPicUrls[0],
    createdAt: new Date().toISOString(),
    tasks: [
      {
        title: "Inventory audit and system requirements",
        dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "E-commerce platform comparison",
        dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        completed: true,
        createdAt: new Date().toISOString()
      },
      {
        title: "Payment gateway integration planning",
        dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      },
      {
        title: "Product photography session",
        dueDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: new Date().toISOString()
      }
    ],
    assignedUsers: []
  }
];

// Function to upload profile pictures to S3
async function uploadDefaultImages() {
  try {
    // Default user profile picture
    const userImageUrl = "https://i.pravatar.cc/300?img=12"; // Random professional looking avatar
    const userImageResponse = await fetch(userImageUrl);
    const userImageBuffer = await userImageResponse.buffer();
    
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'users/default/profile.jpg',
      Body: userImageBuffer,
      ContentType: 'image/jpeg'
    }));
    
    console.log("Uploaded default user profile picture");
    
    // Default customer profile pictures
    for (let i = 1; i <= 4; i++) {
      const customerImageUrl = `https://i.pravatar.cc/300?img=${i + 20}`; // Random avatars
      const customerImageResponse = await fetch(customerImageUrl);
      const customerImageBuffer = await customerImageResponse.buffer();
      
      await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `customers/default/profile${i}.jpg`,
        Body: customerImageBuffer,
        ContentType: 'image/jpeg'
      }));
      
      console.log(`Uploaded default customer profile picture ${i}`);
    }
    
    console.log("All default profile pictures uploaded successfully");
  } catch (error) {
    console.error("Error uploading default images:", error);
  }
}

/** Function to delete all records from a table */
async function clearTable(tableName, primaryKey) {
  try {
    const scanCommand = new ScanCommand({ TableName: tableName });
    const data = await dynamoClient.send(scanCommand);

    if (!data.Items || data.Items.length === 0) {
      console.log(`No records to delete from ${tableName}.`);
      return;
    }

    for (const item of data.Items) {
      const key = {};
      key[primaryKey] = item[primaryKey];

      await dynamoClient.send(new DeleteItemCommand({
        TableName: tableName,
        Key: key,
      }));
    }

    console.log(`Deleted ${data.Items.length} existing records from ${tableName}.`);
  } catch (error) {
    console.error(`Error deleting records from ${tableName}:`, error);
  }
}

/** Function to convert JS object to DynamoDB format */
function convertToDynamoDBFormat(item) {
  const dynamoDBItem = {};
  
  for (const [key, value] of Object.entries(item)) {
    if (value === null) {
      dynamoDBItem[key] = { NULL: true };
    } else if (typeof value === 'string') {
      dynamoDBItem[key] = { S: value };
    } else if (typeof value === 'number') {
      dynamoDBItem[key] = { N: value.toString() };
    } else if (typeof value === 'boolean') {
      dynamoDBItem[key] = { BOOL: value };
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        dynamoDBItem[key] = { L: [] };
      } else {
        dynamoDBItem[key] = { 
          L: value.map(item => {
            if (typeof item === 'string') {
              return { S: item };
            } else if (typeof item === 'number') {
              return { N: item.toString() };
            } else if (typeof item === 'object') {
              return { M: convertToDynamoDBFormat(item) };
            } else {
              return { S: String(item) };
            }
          }) 
        };
      }
    } else if (typeof value === 'object') {
      dynamoDBItem[key] = { M: convertToDynamoDBFormat(value) };
    } else {
      dynamoDBItem[key] = { S: String(value) };
    }
  }
  
  return dynamoDBItem;
}

/** Function to seed Users table */
async function seedUsersTable() {
  try {
    for (const user of usersSeedData) {
      const dynamoDBUser = convertToDynamoDBFormat(user);
      
      await dynamoClient.send(new PutItemCommand({
        TableName: USERS_TABLE,
        Item: dynamoDBUser
      }));
    }

    console.log(`Inserted ${usersSeedData.length} new users.`);
  } catch (error) {
    console.error("Error inserting user records:", error);
  }
}

/** Function to seed Customers table */
async function seedCustomersTable() {
  try {
    for (const customer of customersSeedData) {
      const dynamoDBCustomer = convertToDynamoDBFormat(customer);
      
      await dynamoClient.send(new PutItemCommand({
        TableName: CUSTOMERS_TABLE,
        Item: dynamoDBCustomer
      }));
    }

    console.log(`Inserted ${customersSeedData.length} new customers.`);
  } catch (error) {
    console.error("Error inserting customer records:", error);
  }
}

/** Main function to reset and seed the database */
async function resetAndSeed() {
  console.log("Starting database reset and seeding...");

  // Upload default profile pictures to S3
  console.log("Uploading default profile pictures...");
  await uploadDefaultImages();

  // Clear tables
  console.log("Clearing existing database records...");
  await clearTable(CUSTOMERS_TABLE, "customerId");
  await clearTable(USERS_TABLE, "userId");

  // Seed tables
  console.log("Seeding database with new records...");
  await seedUsersTable();
  await seedCustomersTable();

  console.log("Database reset and seeded successfully! ✅");
}

// Run the script
resetAndSeed();