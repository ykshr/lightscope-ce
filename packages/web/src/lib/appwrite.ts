import { Client, Account } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
const account = new Account(client);

export { client, account };

export async function login() {
  // try {
  //   const user = await account.get();
  //   console.log('User is authenticated:', user);
  //   return user;
  // } catch (error) {
  //   console.error('User is not authenticated:', error);
  // }
  // await account.createAnonymousSession();
  // await new Promise((resolve) => setTimeout(resolve, 500));
  // return login();
}
