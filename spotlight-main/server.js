const express = require("express");
const { join } = require("path");
const app = express();

// Serve static assets from the /public folder
app.use(express.static(join(__dirname, "public")));

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
    res.sendFile(join(__dirname, "auth_config.json"));
});

// Serve the index page for all other requests
app.get("/*", (_, res) => {
    res.sendFile(join(__dirname, "login.html"));
});

// Listen on port 3000
app.listen(3000, () => console.log("Application running on port 3000"));
// Initial load of openai npm package 


//////////////////////////////////////////////////////////////////////////////////////////////////////
const { Configuration, OpenAIApi } = require('openai');

// Create an instance of the OpenAIApi class by passing a configuration object
const openai = new OpenAIApi(new Configuration({
    apiKey: "YOUR_API_KEY" // your API key goes here
}));

// Define a function to generate text
const generateText = async(prompt) => {
    // Make a call to the createCompletion method of the OpenAIApi class
    // and pass in an object with the desired parameters
    const response = await openai.createCompletion({
        model: 'text-davinci-003', // specify the model to use
        prompt: prompt, // specify the prompt
        temperature: 0.8, // specify the randomness of the generated text
        max_tokens: 800, // specify the maximum number of tokens to generate
    });

    // Return the generated text from the response
    return response.choices[0].text;
}

// Call the generateText function and pass the prompt
console.log(generateText("Write a short article on - how to write a book for beginners"));