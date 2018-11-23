"use strict";

console.log("LOADED game.js");

const W = 1000;
const H = 700;
const MEME_HEIGHT = 250;
const MEME_WIDTH = 210;
const MEME_COUNT = 7;

var ctx = document.getElementById("AppCanvas").getContext("2d");
var memes = [];
var loaded = false;

function onMemeRetrieval() {
  let response = this;
  let jsonResponse = JSON.parse(response.responseText);
  console.log(jsonResponse);
  jsonResponse.data.memes.forEach(
    meme => 
    {
    let img = new Image(MEME_WIDTH, MEME_HEIGHT);
    img.src = meme.url;
    memes.push(img);
    //console.log(img.src);
    //console.log(memes[jsonResponse.data.memes.indexOf(meme)]);
    }
  );
  loaded = true;
  setTimeout(draw,1000);
  //draw();
}

function init() {

  var memeReq = new XMLHttpRequest();
  memeReq.addEventListener("load", onMemeRetrieval);
  memeReq.open("GET", "https://api.imgflip.com/get_memes", true);
  memeReq.send();

}

var earth = new Image();
earth.src = "https://mdn.mozillademos.org/files/1429/Canvas_earth.png";

function draw() {

  
  ctx.globalCompositeOperation = 'destination-over';

  //console.log("DRAWING");

  for (let i = 0; i < 10; i++) {
    //ctx.drawImage(memes[i],i,0);
    //ctx.drawImage(earth,i,20);
    let randIndex =  parseInt( (Math.random() * 100 ) % memes.length );
    console.log(randIndex);
    ctx.drawImage(memes[randIndex],MEME_WIDTH*i,0,MEME_WIDTH,MEME_HEIGHT);

  }


}

init();


