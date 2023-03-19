# CruxAI - OpenAI API Client

CruxAI is an Angular application that utilizes the OpenAI API to generate intelligent responses for various prompts. The app comes loaded with features such as quality of life buttons, automatic token pruning, and a nice dark theme.

## Screenshots

![](https://i.imgur.com/eHH3POo.png)
![](https://i.imgur.com/GJ6aGHb.png)

## Features

- Usage of stream API
- Quality of life buttons such as stop and clear chat
- Automatic token pruning to circumvent token limitations
- Utilizes OpenAI's GPT-3 API for generating intelligent responses

## Installation

To install CruxAI, follow these steps:

1. Clone the repository to your local machine
2. Install [Node.js](https://nodejs.org/en/download/) if you haven't already
3. Open your terminal and navigate to the project root directory
4. Run `npm install` to install all dependencies
5. Add your OpenAI API key in `src/environments/environment.ts`
6. Run `ionic serve` to launch the app in your browser

## Usage

1. Type the prompt or question you want the AI to answer 
2. Press enter
3. The AI generated response will appear in the chatbox

## Limitations and Future Improvements

CruxAI is currently limited to text-based inputs and outputs. I plan to add theme support

## Roadmap

- [x] Implement the basic chat app with OpenAI's API ✔️ 

- [x] Implement stream mode for chat API 🌊 

- [x] Add a stop button 🛑 

- [x] Add a scroll to bottom button 🚀 

- [x] Add a clear chat button 🧹 

- [x] Add a delete chat button ❌ 

- [x] Implement multiple chat support 💬💬 

- [ ] Add a configuration for custom APIKEY, temperature, model selector, max response tokens and max prompt tokens ⚙️ 

- [x] Add a copy button for code blocks 📋 

- [x] Add syntax highlighting for code blocks 🌈 

- [ ] Support for image API 🖼️ 

- [ ] Support for audio API 🎧

# TODO

- [x] Dont remove newlines on chat send

- [ ] Stop the underlying chat div to trigger onclick when clicking close button

- [ ] Stop the previous message from continuing when a new one is sent

## Contributing

If you find a bug or have a feature suggestion, please create an issue or submit a pull request.