I want to build an HTML, CSS, JS landing page for my resume parser, where I should be able to upload an PDF and get the score out of it. Here I just want to see the score, what skills are present, and what skills are missing. And I'm gonna call this as 0 to shipped resume parser. This is gonna be a mock design, so just build html css is fine, no back-end server is needed
*/---------------------------------------------------------------------------------------/*

Convert this entire project into a react project in frontend folder

*/---------------------------------------------------------------------------------------/*

Build backend folder contains express server to handle requests, lets connect to MongoDB. 
The application should take resume PDF and a JD for comparison, AI part will be added later.

Backend folder should container server.js, routes folder, controller folder, service folder, config folder, middleware folder and utils.js.

Remove if unwanted files present in frontend folder after doing this part.

*/---------------------------------------------------------------------------------------/*

add vercel.json folder to both Frontend and Backend folder, I am gonna create two projects in vercel for deployment

*/---------------------------------------------------------------------------------------/*

**labd connection prompt**

Below is the format to connect to labd AI, lets connect and parse the resume and give the score and top 3 fixes in the uploaded resume.

#quick start: call labd from a program

Send the conversation so far as messages, each a role (user or assistant) and its content, ending on the user's turn. labd answers once, in JSON: message.content is the reply and credits.percentLeft is what is left of your allowance. Nothing is remembered between requests, so send the earlier turns yourself when you want a conversation.

curl https://agent.thedevlabs.io/v1/api/chat \
  -H "Authorization: Bearer $LABD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Explain closures in one paragraph."}]}'
const res = await fetch('https://agent.thedevlabs.io/v1/api/chat', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.LABD_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Explain closures in one paragraph.' }],
  }),
});
const { message, credits } = await res.json();
console.log(message.content, `${credits.percentLeft}% left`);
Keep the key on a server. labd does not answer browsers on other sites, so a key in a web page is a key anyone viewing it can copy and nothing you can use.
401 the key is wrong or revoked · 402 the allowance is used up · 403 the API is switched off · 429 too many requests this minute, wait and retry.
Every answer spends the same allowance as labd in the portal, your editor and your terminal.

*/---------------------------------------------------------------------------------------/*

Configure this repository to deploy on Vercel as a project with multiple services. Here is a suggested `vercel.json` to add to the repo root directory, auto-detected from the repository layout. Treat it as a starting point, not a finished answer: ```json { "$schema": "https://openapi.vercel.sh/vercel.json", "services": { "backend": { "root": "Backend", "framework": "express" }, "frontend": { "root": "Frontend", "framework": "vite" } }, "rewrites": [] } ``` 

## How Vercel services work Services let one repository deploy multiple backends and frontends as a single Vercel project, with shared routing, environment variables, and one domain. Each service is built independently, and at request time Vercel routes to a service based on the top-level rewrites.

- Define each service under the top-level `services` key. A service's `root` is its directory relative to the directory containing `vercel.json`; `framework`, `runtime`, `entrypoint`, and `buildCommand` are set per service.
- A service is **internal by default** and receives no public traffic. It is only reachable from the internet if a top-level rewrite targets it, using the object form: `{ "source": "/api/(.*)", "destination": { "service": "my_backend" } }`.
- Order rewrites from the most specific path to the least; a catch-all `/(.*)` should come last.
- In services mode, build and runtime keys (`functions`, `installCommand`, `buildCommand`, `devCommand`, `ignoreCommand`, `outputDirectory`, `framework`) are not valid at the top level and must move into the service they belong to. Public routing keys stay at the top level.
- `vercel dev` runs all services together locally and injects binding variables. Use this command for testing.

Docs: https://vercel.com/docs/services 

## What I need you to do

1. **Add bindings for internal services.** Any service that calls another service should use a binding, declared on the *calling* service. A binding injects the target's internal URL into the calling service — it does not make the target public. Each entry looks like: ```json "bindings": [ { "type": "service", "service": "inventory", "format": "url", "env": "INVENTORY_URL" } ] ``` All four fields are required: `type` is always `"service"`, `service` is the target's name in `services`, `format` is always `"url"`, and `env` is the variable Vercel injects the target's base URL into. Do not set that variable yourself.

2. **Update the application code to match the routing and bindings.** Read the code to find where services currently call each other — hardcoded hostnames, localhost ports, internal base URLs, service-discovery config, docker-compose hostnames — and change them to read the bound variable, e.g. `await fetch(new URL('items/123', process.env.INVENTORY_URL))`. Also reconcile the code with the public paths: if a service is mounted under a path prefix, make sure its routes and any client-side URLs agree with it. Bindings resolve at runtime in functions only — not during builds, and not in middleware. 

3. **Confirm the details with me before you finish.** The service names, the public rewrites, and the bindings in the snippet above are inferred and may be wrong. Show me the final `vercel.json` and explicitly ask me to confirm: 
		- the **name** of each service, 
		- which services should be **public** and on what path, and which should stay internal, 
		- the **bindings** you added, i.e. which service calls which.