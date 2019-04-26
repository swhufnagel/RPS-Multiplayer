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
var message = $("#message").val().trim();
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
        button.addClass("choice");
      }
      else { button.addClass("choice2"); }
      button.attr("id", choices[i]);
      button.html(choices[i]);
      div.append(button);
      $(playerSides[j]).append(div);
    }
  }
}
function checkWin() {
  console.log(players.player1Choice);
  console.log(players.player2Choice);
  if (players.player1Picked === true && players.player2Picked === true) {
    if (players.player1Choice === players.player2Choice) {
      scoreboard.ties += 1;
      $(".resultsbox").html("Tie!");
      playAgain();
    }
    else if (players.player1Choice === 'rock' && players.player2Choice === 'scissors' || players.player1Choice === 'scissors' && players.player2Choice === 'paper' ||
      players.player1Choice === 'paper' && players.player2Choice === 'rock') {
      scoreboard.wins1 += 1;
      $(".resultsbox").html(players.player1 + " Wins!")
      playAgain();
    }
    else if (players.player1Choice === 'rock' && players.player2Choice === 'paper' || players.player1Choice === 'scissors' && players.player2Choice === 'rock' ||
      players.player1Choice === 'paper' && players.player2Choice === 'scissors') {
      scoreboard.wins2 += 1;
      $(".resultsbox").html(players.player2 + " Wins!");
      playAgain();
    }
  }
}
function playAgain(){
  var button = $("<button>");
  button.addClass("playAgain");
  button.html("Play Again");
  $(".results").append(button);
  $(document).on("click",".playAgain", function(){
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
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");
console.log("connected " + connectedRef);
console.log("connection " + connectionsRef);


// $(document).ready(){
  //   database.ref().clearStorage();
  // }
  //mess with connections
  connectedRef.on("value", function(snap) {
    console.log(snap.val());
    if (snap.val()) {
      // Add user to the connections list.
      var con = connectionsRef.push(true);
      // Remove user from the connection list when they disconnect.
      con.onDisconnect().remove();
    }
  });
  //on clicks
  //keep chat
  $(document).on("click", "#send", function(){
    event.preventDefault();
    database.ref().push({
      message: message
    });
    database.ref().on("child_added", function(childSnapshot){
      console.log(childSnapshot.val());
      $('.chatbox').append("<div class='chatmsg'>" +  childSnapshot.val().message);
    })
  })
$(document).on("click", ".submit", function () {
  event.preventDefault();
  if (players.number === 0 && $(".name").val().trim() !== "") {
    $(".modal").removeClass("in");
    $("div").remove(".modal-backdrop");
    $(".modal").attr("style='display:block;'");
    players.number++;
    players.player1 = $(".name").val().trim();
              database.ref("/player1").push({
                name: players.player1,
                choice: players.player1Choice
              });
    $(".name").val("");
    $(".player1").html(players.player1);
    $(".player2").html("Waiting...");
  }
  else if ($(".name").val().trim() !== "") {

    $(".modal").removeClass("in");
    $("body").removeClass("modal-open");
    $("div").remove(".modal-backdrop");
    $(".modal").attr("style='display:block;'");
    players.number++;
    players.player2 = $(".name").val().trim();
    if(players.player2 === players.player1){
      console.log("same");
      players.players2 = players.players2 + "2";
    }
    database.ref("/player2").push({
      name: players.player2,
      choice: players.player2Choice
    });
    $(".player2").html(players.player2);
    $("button").remove(".login");
    generateBtns();

  }

})
$(document).on("click", ".choice", function () {
  players.player1Choice = $(this).attr("id");
  // $(".player1choice").html(players.player1Choice)
  players.player1Picked = true;
        database.ref("/player1").on("value", function(snapshot) {
          console.log(snapshot.val());
          $(".player1choice").html(snapshot.val().choice);
        }, function(errorObject) {
          console.log("The read failed: " + errorObject.code);
        });
  checkWin();
})
$(document).on("click", ".choice2", function () {
  players.player2Choice = $(this).attr("id");
  $(".player2choice").html(players.player2Choice)
  players.player2Picked = true;
  database.ref("/player2").on("value", function(snapshot) {
    console.log(snapshot.val());
    $(".player2choice").html(snapshot.val().choice);
  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
  checkWin();
})