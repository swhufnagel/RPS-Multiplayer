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
function showGuesses() {
  $(".player1choice").html(playerOneData.choice)
  $(".player2choice").html(playerTwoData.choice)

}
function checkWin() {
  if (players.player1Picked === true && players.player2Picked === true) {
    if (players.player1Choice === players.player2Choice) {
      scoreboard.ties += 1;
      $(".resultsbox").html("Tie!");
      showGuesses();
      playAgain();
    }
    else if (players.player1Choice === 'rock' && players.player2Choice === 'scissors' || players.player1Choice === 'scissors' && players.player2Choice === 'paper' ||
      players.player1Choice === 'paper' && players.player2Choice === 'rock') {
      scoreboard.wins1 += 1;
      $(".resultsbox").html(playerOneData.name + " Wins!")
      showGuesses();
      playAgain();
    }
    else if (players.player1Choice === 'rock' && players.player2Choice === 'paper' || players.player1Choice === 'scissors' && players.player2Choice === 'rock' ||
      players.player1Choice === 'paper' && players.player2Choice === 'scissors') {
      scoreboard.wins2 += 1;
      $(".resultsbox").html(playerTwoData.name + " Wins!");
      showGuesses();
      playAgain();
    }
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
var config = {
  apiKey: "AIzaSyB08z3Po7GOR_UOFWv55Tg9gjCycdrBk3o",
  authDomain: "multiplay-rps.firebaseapp.com",
  databaseURL: "https://multiplay-rps.firebaseio.com",
  projectId: "multiplay-rps",
  storageBucket: "multiplay-rps.appspot.com",
  messagingSenderId: "478262105305"
};
firebase.initializeApp(config);
var user = firebase.auth().signInAnonymously();
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
    var isAnonymous = user.isAnonymous;
    uid = user.uid;
    console.log(isAnonymous);
    console.log(uid);
    console.log(user);
  } else {
    // User is signed out.
  }
});
var database = firebase.database();
var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");

var currentPlayers;
var playerOneExists;
var playerTwoExists;
var playerOneData;
var playerTwoData;
var playersRef = database.ref('players');
var uid;
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
  database.ref("/chat").on("child_added", function (data) {
    var type;
    if(data.val().user_id == uid){
      type="sent";
    }
    else{
      type="replies";
    }
    $('.chatbox').append("<div class="+type+">" + data.val().message) + "</div>";
    // $('<li class="'+type+'"><p>' + data.val().message + '</p></li>').appendTo($('.messages ul'));
    // $('.message-input input').val(null);
    // $('.contact.active .preview').html('<span>You: </span>' + data.val().message);
    //   $(".messages").animate({ scrollTop: $(".messages")[0].scrollHeight }, 0);
  });
  });
  //on clicks
  //keep chat
  $(document).on("click", "#send", function () {
    event.preventDefault();
    var message = $("#message").val().trim();
    database.ref("/chat").push({
      user_id: uid,
      message: message
    });
    $("#message").val(null);
  })
$(document).on("click", ".submit", function () {
  event.preventDefault();
  console.log(currentPlayers);
  if (currentPlayers === 1) {
    $("button").remove('.login');
    generateBtns();
  }
  if (currentPlayers >= 2) {
    alert("Error: Game is Full");
  }
  if ($(".name").val().trim() !== "" && currentPlayers < 2) {
    players.number++;
    $(".modal").removeClass("in");
    $("div").remove(".modal-backdrop");
    $(".modal").attr("style='display:block;'");

    if (currentPlayers > 0 && playerOneData.name === $(".name").val().trim()) {
      database.ref("players/" + currentPlayers).set({
        name: $(".name").val().trim() + "2",
        choice: ""
      })
    }
    else {
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
  $(".player1choice").empty();
  checkWin();
})
$(document).on("click", ".choice2", function () {
  players.player2Choice = $(this).attr("id");
  players.player2Picked = true;
  database.ref("/players/1").set({
    name: $(".player2").text(),
    choice: players.player2Choice
  });
  checkWin();
})