# Monkeybattle

Monkeybattle is a Hearthstone-style CCG made with Vue 3 & NestJS in TypeScript. It uses Vue to render the game in the DOM and features a completely reactive game state from the server down to the front end by using a combination of JS Proxies, JSON patching and a reactive Vue state.  

![image](https://user-images.githubusercontent.com/50021387/184352031-5b9542e5-f7ae-4a5d-b343-511b51f0b748.png)

# Setup

```
# compile the shared code used between server and client
cd engine
npm install
npm run compile

# Run the server
cd ../monkeybattle-server
npm install
npm run start

# Run the client
cd ../monkeybattle-client
npm install
npm run serve
```
