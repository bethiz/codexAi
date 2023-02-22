//connect to open AI API

import bot from './assets/bot.svg';
import user from '/assets/user.svg';

const form=document.querySelector('form');
const chatContainer=document.querySelector('#chat-container');

let loadInterval;

//to load our mssages(hasilkan dot)
function loader(element){
  element.textContent='';

  loadInterval=setInterval(()=>{
    element.textContent+='.'; //hasilkan dot
      if(element.textContent==='....'){ //kalau dot = 4 kali dot
      element.textContent='';//hasilkan empty string
      }
  },300)//callback hasilkan dot ,hasilkan dot selama 300 milisecond
}

//to load answer,show chat AI is thinking by typing one by one
function typeText(element,text){
  let index=0;

  let interval=setInterval(()=>{
    if(index<text.lenght){
      element.innerHTML +=text.chartAt(index);
      index++;
    }else{
      clearInterval(interval);
    }
  },20)//20 miliscond for each letter
}


//create unique id for EVERY MESSAGE TO ABLE mapping
//using date and time
function generateUniqueId(){
  const timestamp=Date.now();
  const randomNumber=Math.random();
  const hexadecimalString=randomNumber.toString(16);

  return 'id-${timestamp}-${hexadecimalString}';//generate unique id
}


//chat stripe 
// ` this is template string can create space and enter
function chatStripe(isAi,value,uniqueId){
  return (
    ` 
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">

        <div class="profile">
          <img src="${isAi ? bot: user}" alt="${isAi ? 'bot': 'user'}"/>
        </div>

        <div class="message" id=${uniqueId}>${value}>
        </div>

      </div>
    </div>
    `
  )
}

const handleSubmit=async(e) =>{
  e.preventDefault(); //prevent default behaavior of browser

  const data = new FormData(form);

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //bot's chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from server -- bot's response
  const response = await fetch('http://localhost:5000/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    console.log({parsedData})

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "something went wrong";

    alert(err);
  }
}

form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup',(e)=>{
  if(e.keyCode===13){
    handleSubmit(e);
  }
})
