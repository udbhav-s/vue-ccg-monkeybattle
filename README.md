# Monkeybattle

Monkeybattle is a Hearthstone-style CCG made with Vue 3 & NestJS in TypeScript. It uses Vue to render the game in the DOM and features a completely reactive game state from the server down to the front end by using a combination of JS Proxies, JSON patching and a reactive Vue state.  

![image](https://user-images.githubusercontent.com/50021387/184352031-5b9542e5-f7ae-4a5d-b343-511b51f0b748.png)

# Setup  
Create a postgres database and a .env file in `/monkeybattle-server` with the following info  
```
DATABASE_HOST
DATABASE_USERNAME
DATABASE_PASSWORD
DATABASE_NAME
```

Running the project
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

# State Management Overview

![game state](https://user-images.githubusercontent.com/50021387/184360079-d55741b4-8566-4ad2-8f70-3dc8c041fd46.png)
