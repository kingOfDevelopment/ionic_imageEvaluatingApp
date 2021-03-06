angular.module('polling.addPollController', [])

.controller('addPollCtrl', function($scope, $ionicModal, $timeout, $state, $cordovaCamera, $cordovaSocialSharing, $window, Polls, Poll, ImageFile, $cordovaContacts, $ionicHistory, Auth) {
  
  $scope.imageSources = [];
  $scope.rateOptions = [];
  $scope.z_h_button_click = 'button-clicked';
  $scope.y_n_button_click = '';
  $scope.b_e_label_click = 'button-clicked';
  $scope.z_h_label_click = '';

  $scope.sendPoll = function() {
    if ($scope.imageSources.length == 0 || $scope.imageSources == undefined) {
      alert("Select Images to Send");
      return;
    }
    if ($scope.rateOptions.length == 0 || $scope.rateOptions == undefined) {
      alert("Select Options to Rate");
      return;
    }
    if ($scope.usersToInvite.length == 0 || $scope.usersToInvite == undefined) {
      alert("Select Peoples to Invite");
      return;
    }
    if ($scope.expireTime == '' || $scope.expireTime == undefined) {
      alert("Select Expire Time");
      return;
    }

    var getFileBlob = function (url, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "blob";
        xhr.addEventListener('load', function() {
            cb(xhr.response);
        });
        xhr.send();
    };

    var blobToFile = function (blob, name) {
        blob.lastModifiedDate = new Date();
        blob.name = name;
        return blob;
    };

    var getFileObject = function(filePathOrUrl, cb) {
        getFileBlob(filePathOrUrl, function (blob) {
            cb(blobToFile(blob, 'test.jpg'));
        });
    };

    var tempFileName;
    var uploadedImage = 0;

    $scope.imageSources.forEach(function(image) {
        getFileObject(image, function (fileObject) {
         console.log(fileObject);
         tempFileName = Auth.getID() + '_' + new Date().getTime();
         ImageFile.upload(fileObject, tempFileName).then(function(uploadname){
            alert('File Upload Success');
            setPollAfterUpload(uploadname);
         }).catch(function(error){
            alert('File Upload Fail');
            return;
         });      
      }); 
    });

    var setPollAfterUpload = function(uploadname) {
      var tempInvitedPeopleIDandRate_array = [];
      if ($scope.usersToInvite != undefined) {
        $scope.usersToInvite.forEach(function(user){
          tempInvitedPeopleIDandRate_array.push({
            peopleID: user.id,
            rate_array: $scope.rateOptions,
          })
        });
      }
      
      var tempPoll = new Poll({
        photo: uploadname,
        rateOption_array: $scope.rateOptions,
        invitedPeopleIDandRate_array: tempInvitedPeopleIDandRate_array,
        created_time: (new Date()),
        expire_time: $scope.expireTime,
      });
      Polls.setPoll(tempPoll).then(function(poll){
         alert('Send Poll Success', poll);
         poll.invitedPeopleIDandRate_array.forEach(function(invitedPeopleIDandRate){
            $scope.sendNotification(invitedPeopleIDandRate.peopleID, 'we');
         });
      }).catch(function(error){
         alert('Send Poll Fail');
      });   
     };  
    
  };

  $scope.getImageFromGallery = function() {

    getImageFromSource(0);
  };

  $scope.getImageFromCamera = function() {
    getImageFromSource(1);
  };

  var getImageFromSource = function(sourceType) {
    document.addEventListener("deviceready", function () {
        console.log('readyCamera');
        var options = {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: sourceType,
            allowEdit: false,
            encodingType: Camera.EncodingType.PNG,
            targetWidth: 800,
            targetHeight: 1100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        console.log(Camera.PictureSourceType.CAMERA);
        $cordovaCamera.getPicture(options).then(function (imageData) {
            console.log('imageData');
            $scope.imageSources.push("data:image/png;base64," + imageData);
        }, function (err) {
            alert('error');
        });
    }, false);
  }

  $scope.b_e_label_clicked = function() {
    $scope.b_e_label_click = 'button-clicked';
    $scope.z_h_label_click = '';   
  }

  $scope.z_h_label_clicked = function() {
    $scope.z_h_label_click = 'button-clicked';
    $scope.b_e_label_click = '';
  }

  $scope.z_h_button_clicked = function() {
    $scope.z_h_button_click = 'button-clicked';
    $scope.y_n_button_click = '';
  }

  $scope.y_n_button_clicked = function() {
    $scope.y_n_button_click = 'button-clicked';
    $scope.z_h_button_click = '';
  }

  $scope.addOptionToRateFromDrop = function() {
    console.log($scope.selectOptionToRate);
    if ($scope.selectOptionToRate == undefined || $scope.selectOptionToRate == '') {
      alert("select option from drop down menu");
      return;
    }
    if ($scope.z_h_button_click == 'button-clicked') {
      $scope.rateOptions.push({name:$scope.selectOptionToRate, value:'0-100'});
    }
    else if ($scope.y_n_button_click == 'button-clicked') {
      $scope.rateOptions.push({name:$scope.selectOptionToRate, value:$scope.ui.yn}); 
    }
  }

  $scope.addOptionToRateFromCustom = function(customOptionToRate) {
    if (customOptionToRate == '' || customOptionToRate == undefined) {
      alert("input custom option to Text Field");
      return;
    }
    if ($scope.b_e_label_click == 'button-clicked') {
      $scope.rateOptions.push({name:customOptionToRate, value:'0-100'});
    }
    else if ($scope.z_h_label_click == 'button-clicked') {
      $scope.rateOptions.push({name:customOptionToRate, value:$scope.ui.yn}); 
    }
  }

  $scope.showSelectValue = function(mySelect) {
    console.log(mySelect);
    $scope.selectOptionToRate = mySelect;
  }

  $scope.gotoContact = function() {
    $state.go('app.contact');
  }

  $scope.setExpireTime = function(expireTime) {
    $scope.expireTime = expireTime;
  }
});

