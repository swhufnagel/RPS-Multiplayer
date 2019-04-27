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
    var isAnonymous = user.isAnonymous;
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
  console.log(playerOneData.choice);
  console.log(playerTwoData.choice);
  console.log(players.player2Choice);
  console.log(players.player1Choice);
  database.ref("/players/1").set({
    name: $(".player2").text(),
    choice: players.player2Choice
  });
  database.ref("/players/0").set({
    name: $(".player1").text(),
    choice: players.player1Choice
  });
    if (playerOneData.choice === playerTwoData.choice) {
      scoreboard.ties += 1;
      $(".resultsbox").html("Tie!");
      console.log("tie");
      showGuesses();
      playAgain();
    }
    else if (playerOneData.choice === 'rock' && playerTwoData.choice === 'scissors' || playerOneData.choice === 'scissors' && playerTwoData.choice === 'paper' ||
      playerOneData.choice === 'paper' && playerTwoData.choice === 'rock') {
      scoreboard.wins1 += 1;
      $(".resultsbox").html(playerOneData.name + " Wins!")
      showGuesses();
      playAgain();
      console.log("win");

    }
    else if (playerOneData.choice === 'rock' && playerTwoData.choice === 'paper' || playerOneData.choice === 'scissors' && playerTwoData.choice === 'rock' ||
      playerOneData.choice === 'paper' && playerTwoData.choice === 'scissors') {
      scoreboard.wins2 += 1;
      $(".resultsbox").html(playerTwoData.name + " Wins!");
      showGuesses();
      playAgain();
      console.log("loss");

    }
  }
function playAgain() {
  var button = $("<button>");
  button.addClass("playAgain");
  button.html("Play Again");
  $(".results").append(button);
  $(document).on("click", ".playAgain", function () {
    $(".player1choice").empty();
    $(".player2choice").empty();
    $(".player1Choice").append("Choose!");
    generateBtns();
    $("button").remove(".playAgain");
    $(".resultsbox").html("");
    players.player1Choice = "";
    players.player2Choice = "";
    players.player1Picked = false;
    players.player2Picked = false;
  })
}
// Initialize Firebase
playersRef.on("value", function (snapshot) {
  currentPlayers = snapshot.numChildren();

  playerOneExists = snapshot.child("0").exists();
  playerTwoExists = snapshot.child("1").exists();

  playerOneData = snapshot.child("0").val();
  playerTwoData = snapshot.child("1").val();

  if (playerOneExists) {
    //Jquery displayer user 1 info
    $(".player1").html(playerOneData.name);
  }
  else {
    //waiting for player 1
  }

  if (playerTwoExists) {
    //displayer user 2
    $(".player2").html(playerTwoData.name)
  } else {
    $(".player2").html("Waiting...");
    //waiting for player two
  }

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
      $(".login").addClass('hide');
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
  if (currentPlayers === 1) {
    $(".login").addClass('hide');
  }
  if (currentPlayers >= 2) {
    alert("Error: Game is Full");
  }
  if ($(".name").val().trim() !== "" && currentPlayers < 2) {
    players.number++;
    database.ref("count/").set({
      players: players.number
    })
    $(".modal").removeClass("in");
    $("div").remove(".modal-backdrop");
    $(".modal").attr("style='display:block;'");

    if (currentPlayers > 0 && playerOneData.name === $(".name").val().trim()) {
      players.number++;
      database.ref("count/").set({
        players: players.number
      })
      $(".login").addClass('hide');
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
  console.log('choice clicked')
  players.player1Choice = $(this).attr("id");
  players.player1Picked = true;
  database.ref("/picked").set({
    player1: players.player1Picked,
    player2: players.player2Picked
  });
  console.log('player1', playerOneData);
  database.ref("/players/0").set({
    name: $(".player1").text(),
    choice: players.player1Choice
  });
  // database.ref("/players/1").set({
  //   name: $(".player2").text(),
  //   choice: playerTwoData.choice
  // });
  
  $(".player1choice").empty();
})
$(document).on("click", ".choice2", function () {
  console.log('choice 2 clicked')

  database.ref().on('value', function(snapshot) {
    console.log('snapshot', snapshot);
  });
  players.player2Choice = $(this).attr("id");
  players.player2Picked = true;
  database.ref("/picked").set({
    player1: players.player1Picked,
    player2: players.player2Picked
  });
  console.log('player2', players.player2Choice);
  // database.ref("/players/0").set({
  //   name: $(".player1").text(),
  //   choice: playerOneData.choice
  // });
  database.ref("/players/1").set({
    name: $(".player2").text(),
    choice: players.player2Choice
  });
})