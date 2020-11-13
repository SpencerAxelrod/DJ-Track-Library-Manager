// Track data type
function Track(artist, title) {
  this.artist = artist;
  this.title = title;
  this.mixable_tracks = [];
}

// Track Library state
var track_library = {
  tracks: []//myStorage.getItem('local_storage_track_library')

  //2020-11-12 NEXT UP: LIBRARY CANT HAVE DUPLICATES

};

//console.log(myStorage.getItem('local_storage_track_library'))
var set_local_storage_lib = function () {
  localStorage.setItem('local_storage_track_library', JSON.stringify(track_library));
  //alert("set storage");
}

var get_local_storage_lib = function () {
  if (localStorage.getItem('local_storage_track_library')){
    track_library.tracks = JSON.parse(localStorage.getItem('local_storage_track_library')).tracks;
  } else {
    track_library.tracks = []
  }
  //alert("get storage");
}

get_local_storage_lib();

// Libary view component
var track_library_list = document.querySelector('#lib_list');

var update_library_view = function () {
  //list = document.querySelector('#lib_list');
  //list.setAttribute("id", "Tracklist");
  //alert("updatelib");
  while (track_library_list.childNodes[0]) {
    track_library_list.removeChild(track_library_list.childNodes[0]);
  }
  if (track_library.tracks.length > 0) {
    track_library_list.classList.remove( 'lib_empty' );
    for (var i = 0; i < track_library.tracks.length; i++) {
      var item = document.createElement('li');
      item.appendChild(document.createTextNode(track_library.tracks[i].artist + " - " + track_library.tracks[i].title));
      track_library_list.appendChild(item);
    }
  } else {
    track_library_list.classList.add( 'lib_empty' );
    var item = document.createTextNode("Library Empty");
    track_library_list.appendChild(item);
  }
  
};

// Initial Library render
update_library_view();

var update_current_track = function (Track) {
  var current_track_div = document.querySelector('.current_track');
  while (current_track_div.hasChildNodes()){
    current_track_div.removeChild(current_track_div.childNodes[0])
  }
  if (Track) {
    //var item = document.createTextNode(Track.artist + " - " + Track.title);
    var item = document.createTextNode(Track);
    current_track_div.appendChild(item)
  } else {
    current_track_div.appendChild(document.createTextNode("Select a Track from Library"))
  }
  
}

// Track selection intitial on click functionality
document.getElementById("lib_list").addEventListener("click", function(e) {
  // e.target is our targetted element.
  if(e.target && e.target.nodeName == "LI") {
    //alert(localStorage.getItem('local_storage_track_library'));
    update_current_track(e.target.textContent);
  }
});

// Function to check for drag and drop functionality
var isAdvancedUpload = function() {
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

// applying the effect for every form
// select all elements with class box
var form = document.querySelector( '.box' );

// submit form function, used below
var triggerFormSubmit = function() {
  var event = document.createEvent( 'HTMLEvents' );
  event.initEvent( 'submit', true, false );
  input.dispatchEvent( event );
};

// init dropped files
var droppedFiles = false;

// automatically submit the form on file select
var input = document.querySelector( 'input[type="file"]' )
input.addEventListener( 'change', function( e ) {
  //showFiles( e.target.files );
  triggerFormSubmit();
});

// check for drag and drop functionality
if( isAdvancedUpload ) {
  
  // add class to .box form for css styling
  form.classList.add( 'has-advanced-upload' );
  document.querySelector( '.box__dragndrop' ).classList.add( 'has-advanced-upload' );

  // add a listener for drag events
  [ 'drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop' ].forEach( function( event ) {
    form.addEventListener( event, function( e ) {
      // preventing the unwanted behaviours
      e.preventDefault();
      e.stopPropagation();
    });
  });
 
  // add class upon dragover/dragenter states for css styling
  [ 'dragover', 'dragenter' ].forEach( function( event ) {
    form.addEventListener( event, function() {
      form.classList.add( 'is-dragover' );
    });
  });
  
  // remove the above class upon dragleave/dragend/drop states for css styling
  [ 'dragleave', 'dragend', 'drop' ].forEach( function( event ) {
    form.addEventListener( event, function() {
      form.classList.remove( 'is-dragover' );
    });
  });
  
  // capture dropped files upon drop
  form.addEventListener( 'drop', function( e ) {
    droppedFiles = e.dataTransfer.items; // the files that were dropped
    //showFiles( droppedFiles );
    triggerFormSubmit();
  });
} //else {
  //otherwise use choose file selection
//}

// initialize jsmediatags
var jsmediatags = window.jsmediatags;

// Promisify the jsmediatags reader
var awaitableHelper = function(mp3_file) {
  return new Promise ((resolve, reject) => {
    jsmediatags.read(mp3_file, {
      onSuccess: (tag) => {
        
        // Create new Track from tags
        let track = new Track(tag.tags.artist, tag.tags.title);
        resolve(track);
      },
      onError: (error) => {
        alert('read error');
        reject(error);
      }
    });
  });
}

// if the form was submitted
input.addEventListener( 'submit', function( e )
{
  // advanced upload check, legacy support to come
  if( isAdvancedUpload ) {
    e.preventDefault();  
    if( droppedFiles && (droppedFiles.length > 0)) {
      
      for (var i = 0; i < droppedFiles.length; i++) {
        
        // if dropped items aren't files, reject them
        if (droppedFiles[i].kind === 'file') {
          var file = droppedFiles[i].getAsFile();
          
          // Promise consumption, based on result of jsmediatag read attempt
          awaitableHelper(file)
          .then((track) => {
            track_library.tracks.push(track);
            set_local_storage_lib();
            update_library_view();

            //2020-11-12 NEXT: WAIT UNTIL ALL TRACKS READ, THEN CLEAR DATATRANSFER

          })
          .catch((err) => {
            alert(err)
          });
        }

      }
    } else {
      
      // non-drop functionality
      for (var i = 0; i < input.files.length; i++) {
        var file = input.files[i];

         // Promise consumption, based on result of jsmediatag read attempt
         awaitableHelper(file)
         .then((track) => {
           track_library.tracks.push(track);
           set_local_storage_lib();
           update_library_view();

           //2020-11-12 NEXT: WAIT UNTIL ALL TRACKS READ, THEN CLEAR DATATRANSFER

         })
         .catch((err) => {
           alert(err)
         });
      }

    }
  }
});

// Clear Library button functionality
var clear = document.getElementById("clear");
clear.addEventListener("click", function() {
  localStorage.clear();

  get_local_storage_lib();

  update_library_view();
  update_current_track(null);

});