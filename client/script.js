import botImg from "./assets/bot.svg";
import userImg from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

//Function to load three dots while fetching the answer
const loader = (element) => {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
};

//Function to print the answer letter by letter
const typeText = (element, text) => {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
};

//Function to get unique ID
const generateUniqueID = () => {
  const timeStamp = Date.now();
  const randomNum = Math.random();
  const hexaDecString = randomNum.toString(16);

  return `id-${timeStamp}-${hexaDecString}`;
};

//Function to create Stripe area for question and ansewer
const chatStripe = (isAI, value, uniqueID) => {
  return `
    <div class="wrapper ${isAI && "ai"}">
      <div class="chat">
        <div class="profile">
          <img src="${isAI ? botImg : userImg}" alt="${
    isAI ? "bot-Img" : "user-Img"
  }" />
        </div>
        <div class="message ${!isAI && "user"}" id=${uniqueID}>
          ${value}
        </div>
      </div>
    </div>
    `;
};

//Function to handle form Submit
const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  //bot's chatStripe
  const uniquID = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true, " ", uniquID);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniquID);

  loader(messageDiv);

  //fetch data from server
  const response = await fetch("https://openai-chat-0zfs.onrender.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const error = await response.text();
    messageDiv.innerHTML = "something went wrong";
    console.log(error);
  }
};

//Call the formMethods on enter or submit
form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
