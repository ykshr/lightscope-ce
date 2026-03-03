### What changes were made
Added an Apollo Server plugin to intercept responses and change the HTTP status code to 500 when GraphQL errors are present in the response.

### Why they were made
Previously, GraphQL errors were returned with a 200 OK status. This change ensures that the HTTP status accurately reflects the presence of errors, making it easier for clients and network monitoring tools to detect failures.

### Implementation details
Hooked into `willSendResponse` within the `requestDidStart` lifecycle to inspect the `errors` array and mutate `response.http.status`.

---
This PR was written using [Vibe Kanban](https://vibekanban.com)