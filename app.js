// Track Library state
var track_library = {
  tracks: {},
  count: 0
  //2020-11-12 NEXT UP: LIBRARY CANT HAVE DUPLICATES
};

var track_stack = [];
var track_pointer = -1;
var current_track = null;

// function to set a track's id
function set_track_id() {
  track_library.count = track_library.count + 1;
  return track_library.count;
}

// Track data type
function Track(artist, title, track_id) {
  this.id = track_id;
  this.artist = artist;
  this.title = title;
  this.mixable_tracks = {};
}

// function to stor track library in local storage
var set_local_storage_lib = function () {
  var lib_and_stack = {'local_storage_track_library': track_library, 
                       'local_storage_stack': track_stack, 
                       'local_storage_track_pointer': track_pointer}
  localStorage.setItem('lib_and_stack', JSON.stringify(lib_and_stack));
}


// function to retrieve track library to local storage
var get_local_storage_lib = function () {
  if (localStorage.getItem('lib_and_stack')){
    var lib_and_stack = JSON.parse(localStorage.getItem('lib_and_stack'));
    track_library = lib_and_stack['local_storage_track_library'];
    track_stack = lib_and_stack['local_storage_stack']
    track_pointer = lib_and_stack['local_storage_track_pointer'];
  } else {
    track_library.tracks = {}
    track_library.count = 0;
    track_stack = []
    track_pointer = -1;
  }
}

get_local_storage_lib();

// Libary view component
var track_library_list = document.querySelector('#lib_list');

var update_library_view = function () {
  while (track_library_list.childNodes[0]) {
    track_library_list.removeChild(track_library_list.childNodes[0]);
  }
  if (Object.keys(track_library.tracks).length > 0) {
    track_library_list.classList.remove( 'lib_empty' );

    for (var id in track_library.tracks) {
      var item = document.createElement('li');
      item.appendChild(document.createTextNode(track_library.tracks[id].artist + " - " + track_library.tracks[id].title));
      // add track id to html id
      item.id = id;
      var add_button = document.createElement('div');
      add_button.classList.add('myButton');
      add_button.appendChild(document.createTextNode('Add'));
      item.appendChild(add_button);
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

// function that takes a track or null, updates current track div with track artist-title
var update_current_track = function (Track) {
  var current_track_div = document.querySelector('.current_track');
  //current_track_div.insertBefore( ,document.querySelector('.next_in_stack'))
  while (current_track_div.hasChildNodes()){
    current_track_div.removeChild(current_track_div.childNodes[0])
  }
  if (Track) {
    //var item = document.createTextNode(Track.artist + " - " + Track.title);
    current_track_div.classList.remove('no_track_selected')
    var item = document.createTextNode(Track.artist + " - " + Track.title);
    var left = document.createElement('div');
    left.classList.add('previous_in_stack');
    var right = document.createElement('div');
    right.classList.add('next_in_stack');
    current_track_div.appendChild(left);
    current_track_div.appendChild(item)
    current_track_div.appendChild(right);
  } else {
    var left = document.createElement('div');
    left.classList.add('previous_in_stack');
    var right = document.createElement('div');
    right.classList.add('next_in_stack');
    current_track_div.appendChild(left);
    current_track_div.appendChild(document.createTextNode("Select a Track from Library"))
    current_track_div.appendChild(right);
    current_track_div.classList.add('no_track_selected')
    current_track = null;
  }

};

// function that updates next tracks div with next/mixable tracks
var update_next_tracks = function (next_tracks) {
  var next_track_div = document.querySelector('.next_tracks');
  while (next_track_div.hasChildNodes()) {
    next_track_div.removeChild(next_track_div.childNodes[0]);
  }
  if (next_tracks.length > 0) {
    next_track_div.classList.remove('next_tracks_empty')
    for (var i = 0; i < next_tracks.length; i++) {
      var item = document.createElement('li');
      item.id = next_tracks[i].id;
      item.appendChild(document.createTextNode(next_tracks[i].artist + " - " + next_tracks[i].title));
      next_track_div.appendChild(item);
    }
  } else {
    next_track_div.classList.add('next_tracks_empty')
  }
};

// function to process id after a library tracked is clicked
var clickedLibraryTrack = function(track_id) {
  var selected_track = track_library.tracks[track_id]
  if (current_track != selected_track) {
    if (track_stack.length > 99) {
      track_stack.shift();
      track_pointer--;
    }
    track_pointer++;
    track_stack.push(track_id);
    current_track = selected_track;
    console.log(track_pointer);
    console.log(track_stack);
  }
  set_local_storage_lib();
  update_current_track(current_track);
  var next_tracks_ids = selected_track.mixable_tracks;
  var next_tracks = []
  for (var i = 0; i < Object.keys(next_tracks_ids).length; i++) {
    next_tracks.push(track_library.tracks[Object.keys(next_tracks_ids)[i]])
  }
  update_next_tracks(next_tracks);
};

// function to process id after add button is clocked
var clickedAddMixable = function(track_id) {
  if (current_track) {
    var track_to_add = track_library.tracks[track_id];
    if ((current_track != track_to_add) && (!current_track.mixable_tracks.hasOwnProperty(track_to_add.id))) { //} current_track.mixable_tracks.includes(track_to_add.id))) {
      current_track.mixable_tracks[track_to_add.id] = {}; //current_track.mixable_tracks.push(track_to_add.id);
    }
    //update_current_track(track_to_add);
    var next_tracks_ids = current_track.mixable_tracks;
    var next_tracks = []
    for (var i = 0; i < Object.keys(next_tracks_ids).length; i++) {
      next_tracks.push(track_library.tracks[Object.keys(next_tracks_ids)[i]])
    }
    set_local_storage_lib();
    update_next_tracks(next_tracks);
  }
};

// Track selection/track library click listener functionality
document.getElementById("lib_list").addEventListener("click", function(e) {
  // e.target is our targetted element.
  if(e.target && e.target.nodeName == "LI") {
    clickedLibraryTrack(e.target.id);
  } else if (e.target && e.target.className == "myButton") {
    clickedAddMixable(e.target.parentElement.id);
  }
});

// function that updates next track info div
var update_next_track_info_view = function (track_id) {
  var next_track_info_div = document.querySelector(".next_track_info"); 
  if (track_id) { 
    if (track_id != next_track_info_div.id) {

    while (next_track_info_div.hasChildNodes()) {
      next_track_info_div.removeChild(next_track_info_div.childNodes[0]);
    }

    next_track_info_div.id = track_id;
    var next_track = track_library.tracks[track_id];
    var next_track_artist_title = next_track.artist + " - " + next_track.title;
    var next_track_info = current_track.mixable_tracks[track_id];
    
    
    var item = document.createElement('div');
    item.classList.add("next_track_artist_title");
    item.appendChild(document.createTextNode(next_track_artist_title));
    next_track_info_div.appendChild(item);

    if (Object.keys(next_track_info).length === 0) {
      item = document.createElement('form');
    } else {
      item = document.createElement('div');
    }

    }
  } else {
    while (next_track_info_div.hasChildNodes()) {
      next_track_info_div.removeChild(next_track_info_div.childNodes[0]);
    }
    next_track_info_div.id = "";
  }
};

// function to process id after a next/mixable track is clicked
var clickedNextTrack =  function (track_id) {
  //var next_track_id = x;
  update_next_track_info_view(track_id);
};

// Next/mixable tracks click listener functionality
document.querySelector(".next_tracks").addEventListener("click", function(e) {
  //e.target is our targetted element.
  if(e.target && e.target.nodeName == "LI") {
    clickedNextTrack(e.target.id);
  }
});

// function to process id after a track from next track info is clicked
var clickedNextTrackToCurrent = function (track_id) {
  var selected_track = track_library.tracks[track_id]
  if (track_stack.length > 99) {
    track_stack.shift();
    track_pointer--;
  }
  track_pointer++;
  track_stack.push(track_id);
  current_track = selected_track;
  set_local_storage_lib();
  update_current_track(track_library.tracks[track_id]);

  var next_tracks_ids = selected_track.mixable_tracks;
  var next_tracks = []
  for (var i = 0; i < Object.keys(next_tracks_ids).length; i++) {
    next_tracks.push(track_library.tracks[Object.keys(next_tracks_ids)[i]])
  }

  update_next_tracks(next_tracks);

  update_next_track_info_view(null);
  
};

// Next track info click listener functionality
document.querySelector(".next_track_info").addEventListener("click", function(e) {
  //e.target is our targetted element.
  if(e.target && e.target.classList.contains("next_track_artist_title")) {
    clickedNextTrackToCurrent(e.target.parentElement.id);
  }
  
});

var clickedPreviousButton = function() {
  if (track_pointer > 0) {
    track_pointer--;
    var track_id = track_stack[track_pointer]
    var selected_track = track_library.tracks[track_id]
    current_track = selected_track;
    set_local_storage_lib();
    update_current_track(selected_track);
    var next_tracks_ids = selected_track.mixable_tracks;
    var next_tracks = [];
    for (var i = 0; i < Object.keys(next_tracks_ids).length; i++) {
      next_tracks.push(track_library.tracks[Object.keys(next_tracks_ids)[i]])
    }
    update_next_tracks(next_tracks);
    update_next_track_info_view(null);
  }
}

document.querySelector('.current_track').addEventListener("click", function(e) {
  if(e.target && e.target.classList.contains("previous_in_stack")) {
    alert("click");
    clickedPreviousButton();
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
        let track = new Track(tag.tags.artist, tag.tags.title, tag.tags.artist + " - " + tag.tags.title);
        //track.mixable_tracks.push(example_track);
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
            if (track_library.tracks[track.id]) {
              alert(track_library.tracks[track.id].id + " is already in library");
            } else {
              track_library.tracks[track.id] = track;
              set_local_storage_lib();
              update_library_view();
            }
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
           track_library.tracks[track.id] = track;
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
  update_next_tracks([]);
});