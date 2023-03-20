<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]
[![Ionic][Ionic]][Ionic-url]
[![Angular][Angular.io]][Angular-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/Gacrucis/basilisk">
    <img src="https://i.imgur.com/6aSG740.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Basilisk</h3>

  <p align="center">
    An OpenAI API Frontend
    <br />
    <!-- <a href="https://github.com/Gacrucis/basilisk"><strong>Explore the docs »</strong></a> -->
    <!-- <br /> -->
    <br />
    <a href="https://github.com/Gacrucis/basilisk">View Demo</a>
    ·
    <a href="https://github.com/Gacrucis/basilisk/issues">Report Bug</a>
    ·
    <a href="https://github.com/Gacrucis/basilisk/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

[![Product Name Screen Shot][product-screenshot]](https://github.com/Gacrucis/basilisk)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* Node.js `v14.20.1`
* An OpenAI API key

### Installation

To install Basilisk, follow these steps:

1. Clone the repository to your local machine
2. Open your terminal and navigate to the project root directory
3. Run `npm install` to install all dependencies
4. Add your OpenAI API key in `src/environments/environment.ts`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->
## Usage

1. Run `ionic serve` or `npm start` to launch the app in your browser
2. Type the prompt or question you want the AI to answer 
3. Press enter
4. The AI generated response will appear in the chatbox

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
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

## Known issues

- [x] Dont remove newlines on chat send

- [ ] Stop the underlying chat div to trigger onclick when clicking close button

- [ ] Stop the previous message from continuing when a new one is sent

See the [open issues](https://github.com/Gacrucis/basilisk/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

[![LinkedIn][linkedin-shield]][linkedin-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/Gacrucis/basilisk.svg?style=for-the-badge
[contributors-url]: https://github.com/Gacrucis/basilisk/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Gacrucis/basilisk.svg?style=for-the-badge
[forks-url]: https://github.com/Gacrucis/basilisk/network/members
[stars-shield]: https://img.shields.io/github/stars/Gacrucis/basilisk.svg?style=for-the-badge
[stars-url]: https://github.com/Gacrucis/basilisk/stargazers
[issues-shield]: https://img.shields.io/github/issues/Gacrucis/basilisk.svg?style=for-the-badge
[issues-url]: https://github.com/Gacrucis/basilisk/issues
[license-shield]: https://img.shields.io/github/license/Gacrucis/basilisk.svg?style=for-the-badge
[license-url]: https://github.com/Gacrucis/basilisk/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: https://i.imgur.com/4LrtyFj.png
[Ionic]: https://img.shields.io/badge/Ionic-%233880FF.svg?style=for-the-badge&logo=Ionic&logoColor=white
[Ionic-url]: https://ionicframework.com/docs/
[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/