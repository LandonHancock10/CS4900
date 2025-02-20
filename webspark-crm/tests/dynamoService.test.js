import { jest } from "@jest/globals";
import { getUserFromDB, saveUserToDB } from "../src/services/dynamoService";

jest.mock("@aws-sdk/lib-dynamodb", () => {
  const actualLib = jest.requireActual("@aws-sdk/lib-dynamodb");

  return {
    DynamoDBDocumentClient: {
      from: jest.fn(() => ({
        send: jest.fn(async (command) => {
          if (command instanceof actualLib.GetCommand) {
            return { Item: { id: "123", name: "John Doe", email: "john@example.com" } };
          }
          if (command instanceof actualLib.PutCommand) {
            return {};
          }
          return null;
        }),
      })),
    },
    GetCommand: actualLib.GetCommand,
    PutCommand: actualLib.PutCommand,
  };
});

describe("DynamoDB Service Tests", () => {
  it("should save and fetch a user successfully", async () => {
    const mockUser = { id: "123", name: "John Doe", email: "john@example.com" };

    // Save user to DynamoDB
    await saveUserToDB(mockUser);

    // Retrieve user from DynamoDB
    const result = await getUserFromDB("123");

    // Assertions
    expect(result).toEqual(mockUser);
  });
});
