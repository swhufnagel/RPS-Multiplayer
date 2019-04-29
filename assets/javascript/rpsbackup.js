//variables
var players = {
  number: 0,
  player1: "",
  player2: "",
  player1Choice: "",
  player2Choice: "",
  player1Picked: false,
  player2Picked: false
}
var scoreboard = {
  wins1: 0,
  wins2: 0,
  ties: 0
}
var currentPlayers;
var playerOneExists;
var playerTwoExists;
var playerOneData;
var playerTwoData;
var uid;
// var playAgain;
var config = {
  apiKey: "AIzaSyB08z3Po7GOR_UOFWv55Tg9gjCycdrBk3o",
  authDomain: "multiplay-rps.firebaseapp.com",
  databaseURL: "https://multiplay-rps.firebaseio.com",
  projectId: "multiplay-rps",
  storageBucket: "multiplay-rps.appspot.com",
  messagingSenderId: "478262105305"
};
firebase.initializeApp(config);
var database = firebase.database();
var playersRef = database.ref('players');
var user = firebase.auth().signInAnonymously();
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    uid = user.uid;
  } else {
    // User is signed out.
  }
});
//functions
function generateBtns() {
  for (var j = 0; j < 2; j++) {
    for (var i = 0; i < 3; i++) {
      var playerSides = [".player1choice", ".player2choice"];
      var choices = ["rock", "paper", "scissors"];
      var div = $("<div>");
      div.addClass("choices");
      var button = $("<button>");
      if (j === 0) {
        button.addClass("choice btn btn-outline-dark");
      }
      else { button.addClass("choice2 btn btn-outline-dark"); }
      button.attr("id", choices[i]);
      button.html(choices[i]);
      div.append(button);
      $(playerSides[j]).append(div);
    }
  }
}
function showGuesses() {
  $(".player1choice").html(playerOneData.choice);
  $(".player2choice").html(playerTwoData.choice);
}
function checkWin() {
    if (playerOneData.choice === playerTwoData.choice) {
      scoreboard.ties += 1;
      database.ref("/score").set({
        ties: scoreboard.ties
      })
      $(".resultsbox").html("Tie!");
      showGuesses();
      playAgain();
    }
    else if (playerOneData.choice === 'rock' && playerTwoData.choice === 'scissors' || playerOneData.choice === 'scissors' && playerTwoData.choice === 'paper' ||
      playerOneData.choice === 'paper' && playerTwoData.choice === 'rock') {
      scoreboard.wins1 += 1;
      database.ref("/score").set({
        wins1: scoreboard.wins1
      })
      $(".resultsbox").html(playerOneData.name + " Wins!")
      showGuesses();
      playAgain();
    }
    else if (playerOneData.choice === 'rock' && playerTwoData.choice === 'paper' || playerOneData.choice === 'scissors' && playerTwoData.choice === 'rock' ||
      playerOneData.choice === 'paper' && playerTwoData.choice === 'scissors') {
      scoreboard.wins2 += 1;
      database.ref("/score").set({
        wins2: scoreboard.wins2
      })
      $(".resultsbox").html(playerTwoData.name + " Wins!");
      showGuesses();
      playAgain();
    }
  }
function playAgain() {
  var button = $("<button>");
  button.addClass("playAgain");
  button.html("Play Again");
  $(".results").append(button);
  $(document).on("click", ".playAgain", function () {
            database.ref("playAgain").set({
              playAgain: true
            })
  })
}
database.ref("playAgain").on("value", function(snapshot){
    if(snapshot.val().playAgain === true){
    $(".player1choice").empty();
    $(".player2choice").empty();
    generateBtns();
    $("button").remove(".playAgain");
    $(".resultsbox").html("");
    players.player1Choice = "";
    players.player2Choice = "";
    players.player1Picked = false;
    players.player2Picked = false;
    database.ref("playAgain").set({
      playAgain: false
    })
    database.ref("/picked").set({
    player1: false,
    player2: false
    })
    }
})
// Initialize Firebase
playersRef.on("value", function (snapshot) {
  currentPlayers = snapshot.numChildren();

  playerOneExists = snapshot.child("0").exists();
  playerTwoExists = snapshot.child("1").exists();

  playerOneData = snapshot.child("0").val();
  playerTwoData = snapshot.child("1").val();
})
playersRef.on("child_added", function (snapshot) {
  if (playerOneExists) {
    console.log("hello");
    //Jquery displayer user 1 info
    $(".player1").html("").html(playerOneData.name);
  }
  else {
    //waiting for player 1
  }

  if (playerTwoExists) {
    //displayer user 2
    $(".player2").html("").html(playerTwoData.name)
  } else {
    $(".player2").html("Waiting...");
    //waiting for player two
  }

})
database.ref("score").on("value", function(snapshot){
  $(".text1").text("Wins: " + snapshot.val().wins1 + "<br> Ties: " + snapshot.val().ties);
  $(".text2").text("Wins: " + snapshot.val().wins2 + "<br> Ties: " + snapshot.val().ties);
})
$(window).on("load", function () {
  database.ref().set({});
  var playing = false;
  playersRef.on("value", function(){
    if(currentPlayers=== 2 & playing === false){
    generateBtns();
    playing = true;
    }
  })
  database.ref("/chat").on("child_added", function (data) {
    var type;
    if(data.val().user_id == uid){
      type="sent";
    }
    else{
      type="replies";
    }
    $('.chatbox').append("<div class ='"+type+"holder'><span class="+type+">" + data.val().message) + "</span></div>";
  })
  database.ref("/count").on("value", function(snapshot){
    if(snapshot.val().players > 1){
      $(".login").attr("display", "none");
    }
  })
  database.ref("/picked").on("value", function(snapshot){
    if(snapshot.val().player1 === true){
      $(".player1choice").empty();
      players.player1Picked = true;
    }
    if(snapshot.val().player2 === true){
      $(".player2choice").empty();
      players.player2Picked = true;

    }
    if(snapshot.val().player1 === true && snapshot.val().player2 === true){
      checkWin();
    }
  })
  });
  //on clicks
  //keep chat
  $(document).on("click", "#send", function () {
    event.preventDefault();
    var message = $("#message").val().trim();
    if(message !== ""){
    database.ref("/chat").push({
      user_id: uid,
      message: message
    });
    function ScrollDiv(){
      if(document.getElementById('ecran').scrollTop<(document.getElementById('ecran').scrollHeight-document.getElementById('ecran').offsetHeight)){-1
            document.getElementById('ecran').scrollTop=document.getElementById('ecran').scrollTop+1
            }
   }
   setInterval(ScrollDiv,20)
    $("#message").val(null);
  }
  })
$(document).on("click", ".submit", function () {
  event.preventDefault();
  if (currentPlayers === 0){
    var scoreboard = $("<div>");
    scoreboard.addClass("card score1");
    var cardHeader = $("<div>");
    cardHeader.addClass("card-header player1");
    cardHeader.text("Score");
    scoreboard.append(cardHeader);
    var cardBody = $("<div>");
    cardBody.addClass("card-body pick");
    scoreboard.append(cardBody);
    var cardTitle = $("<div>");
    cardTitle.addClass("card-title");
    cardBody.append(cardTitle);
    var cardText = $("<div>");
    cardText.addClass("card-text text1");
    cardText.text("Wins: 0");
    cardBody.append(cardText);
    $(".score1").append(scoreboard);
  }
  if (currentPlayers === 1) {
    var scoreboard = $("<div>");
    scoreboard.addClass("card score2");
    var cardHeader = $("<div>");
    cardHeader.addClass("card-header player2");
    cardHeader.text("Score");
    scoreboard.append(cardHeader);
    var cardBody = $("<div>");
    cardBody.addClass("card-body pick");
    scoreboard.append(cardBody);
    var cardTitle = $("<div>");
    cardTitle.addClass("card-title");
    cardBody.append(cardTitle);
    var cardText = $("<p>");
    cardText.addClass("card-text text2");
    cardText.text("Wins: 0");
    cardBody.append(cardText);
    $(".score2").append(scoreboard);
    $(".login").addClass('hide');
    $("body").removeClass("modal-open");
    $(".holychat").attr("style", "margin-top:-120px")
  }
  if (currentPlayers >= 2) {
    alert("Error: Game is Full");
  }
  if ($(".name").val().trim() !== "" && currentPlayers < 2) {
    players.number++;
    if(players.number < 3){
    database.ref("count/").set({
      players: players.number
    })
  }
    $(".modal").removeClass("in");
    $("div").remove(".modal-backdrop");
    $(".modal").attr("style='display:block;'");

    if (currentPlayers > 0 && playerOneData.name === $(".name").val().trim()) {
      players.number++;
      database.ref("count/").set({
        players: players.number
      })
      $(".login").addClass('hide');
      $(".login")
      database.ref("players/" + currentPlayers).set({
        name: $(".name").val().trim() + "2",
        choice: ""
      })
    }
    else {
      players.number++;
      database.ref("players/" + currentPlayers).set({
        name: $(".name").val().trim(),
        choice: ""
      })
    }
    $(".name").val("");
  }
})

$(document).on("click", ".choice", function () {
  players.player1Choice = $(this).attr("id");
  players.player1Picked = true;
  database.ref("/players/0").set({
    name: $(".player1").text(),
    choice: players.player1Choice
  });
  database.ref("/picked").set({
    player1: players.player1Picked,
    player2: players.player2Picked
  });
  $(".player1choice").empty();
})
$(document).on("click", ".choice2", function () {
  players.player2Choice = $(this).attr("id");
  players.player2Picked = true;
  database.ref("/players/1").set({
    name: $(".player2").text(),
    choice: players.player2Choice
  });
  database.ref("/picked").set({
    player1: players.player1Picked,
    player2: players.player2Picked
  });
})