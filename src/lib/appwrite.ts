import { Client, Databases } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

const client = new Client();

if (endpoint) {
  client.setEndpoint(endpoint);
}

if (projectId) {
  client.setProject(projectId);
}

if (apiKey) {
  client.setKey(apiKey);
}

const databases = new Databases(client);

export { client, databases };
