
$(document).ready(function(){
  var config = {
  apiKey: "AIzaSyBMDdPcrDpcaXMppTQcykqPsGE46Zd8Rzw",
  authDomain: "webdesignhw5.firebaseapp.com",
  databaseURL: "https://webdesignhw5.firebaseio.com",
  projectId: "webdesignhw5",
  storageBucket: "webdesignhw5.appspot.com",
  messagingSenderId: "223475186134"
  };
  firebase.initializeApp(config);

  var signin = function() {
    var dbRef = firebase.database().ref();
    var emailInput = $('#email')
    var passwordInput = $('#password')
    $('#sign-up-button').click(function() {
      var $messageField = $('#messageInput');
      var $nameField = $('#nameInput');
      var $messageList = $('#example-messages');
      console.log(emailInput.val(), passwordInput.val())
      firebase.auth().createUserWithEmailAndPassword(emailInput.val(), passwordInput.val()).then(() => {
        $messageList.html('sign up success!!')
      }).catch(function(error) {
        // sign up
        var errorCode = error.code;
        var errorMessage = error.message;
          $messageList.html(errorMessage)
      });
    })

    $('#sign-in-button').click(() => {
      var $messageList = $('#example-messages');
      firebase.auth().signInWithEmailAndPassword(emailInput.val(), passwordInput.val()).then(() => {
        $messageList.html('sign in success!!')
        location.replace('./chatroom.html')
      }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        $messageList.html(errorMessage)
      });
    })

  };



  var information = function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var dbRef = firebase.database().ref('users/'+user.uid);
        //$('#photo').append($('img')).attr('src', photoURL)
        //$('#username').text(displayName)
        dbRef.once('value').then(function(snapshot) {
          let data = snapshot.val()
          if(data) {
            firebase.storage().ref('image/'+user.uid).getDownloadURL().then((url) => {
              $('#photo').attr('src', url).css({width: 100})
            })
            $('#username').text(data.displayName);
            $('#occupation').text(data.occupation);
            $('#age').text(data.age);
            $('#description').text(data.description);
          }
        })
        //console.log(uid)
      } else {
        // User is signed out.
        // ...
        location.replace('./index.html')
      }
    });
  };

  var update = function() {
    firebase.auth().onAuthStateChanged(function(user){
      if (user){
        var dbRef = firebase.database().ref('users/'+user.uid);
        $('#update-file-selecter').change((e) => {
          firebase.storage().ref('image/'+user.uid).put(e.target.files[0]).then(() => {
            //完成時
            console.log('圖片上傳成功')
          })
        })

        dbRef.once('value').then(function(snapshot) {
          let data = snapshot.val()
          if(data) {
            firebase.storage().ref('image/'+user.uid).getDownloadURL().then((url) => {
              $('#photo').attr('src', url).css({width: 100})
            })
            $('#username').val(data.displayName);
            $('#occupation').val(data.occupation);
            $('#age').val(data.age);
            $('#description').val(data.description);
          }
        })
      } else {
        location.replace('./index.html')
      }
    })
    $('#user-update-submit').click(function(){
      var user = firebase.auth().currentUser;
      const $userName = $('#username').val();
      const $occupation = $('#occupation').val();
      const $age = $('#age').val();
      const $description = $('#description').val();
      firebase.database().ref('users/'+user.uid).update({
        age: $age,
        occupation: $occupation,
        displayName: $userName,
        //photoURL: photoURL,
        description: $description
      })
    })
  };

  var chat = function () {
    var $messageList = $('#example-messages');
    firebase.auth().onAuthStateChanged(function(user){
      if (user){
        var dbRef = firebase.database().ref('users/'+user.uid).once('value').then((snapshot) => {
          let data = snapshot.val()
          $('#submit').click(() => {
            firebase.database().ref('object').push({
              name: data.displayName,
              text: $('#word').val()
            })
          })
        })

        firebase.database().ref('object').limitToLast(10).on('child_added', function(snapshot){
          var data = snapshot.val();
          var username = data.name || "anonymous";
          var message = data.text;

          var $messageElement = $("<li>");
          var $nameElement = $("<strong>");
          $nameElement.text(username);
          $messageElement.text(message).prepend($nameElement);

          $messageList.append($messageElement);
          //$messageList[0].scrollTop = $messageList[0].scrollHeight;
        });
      } else {
        console.log("not logged in");
        location.replace('./index.html')
      }
    });
  };

  $('#sign-out').click(() => {
    firebase.auth().signOut().then(() => {
      console.log('登出成功')
      location.replace('./index.html')
    })
  })

  var page = $('#page').text();
  console.log(page)
  if (page === 'Sign in') {
    signin();
  } else if (page === 'User Information') {
    information();
  } else if (page === 'User Information Update') {
    update();
  } else if (page === 'Chat') {
    chat();
  }

});
