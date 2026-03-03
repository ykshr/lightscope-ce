import fetch from "node-fetch";

async function run() {
  const query = `
    query {
      unknownField
    }
  `;
  const res = await fetch("http://localhost:3000/gql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  console.log("Status:", res.status);
  const json = await res.json();
  console.log("JSON:", JSON.stringify(json).substring(0, 100));
}
run();
