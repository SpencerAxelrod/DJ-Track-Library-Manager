// Track Library state
var track_library = {
  tracks: {},
  count: 0
  //2020-11-12 NEXT UP: LIBRARY CANT HAVE DUPLICATES
};

var track_stack = [];
var track_pointer = -1;
var current_track = null;

// function to set a track's id -> CURRENTLY NOT USING?
function set_track_id() {
  track_library.count = track_library.count + 1;
  return track_library.count;
}

// Track data type
function Track(artist, title, track_id, bpm, key) {
  this.artist = artist;
  this.title = title;
  this.id = track_id;
  this.bpm = bpm;
  this.key = key;
  this.mixable_tracks = {};
}

// function to store track library in local storage
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
      add_button.classList.add('add_mixible_button');
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
  var current_artist_div = document.querySelector('.current_artist');
  var current_bpm_div = document.querySelector('.current_bpm');
  var current_key_div = document.querySelector('.current_key');
  var current_prev_next_container_div = document.querySelector('.current_prev_next_container');
  
  while (current_track_div.hasChildNodes()){
    current_track_div.removeChild(current_track_div.childNodes[0])
  }

  while (current_artist_div.hasChildNodes()){
    current_artist_div.removeChild(current_artist_div.childNodes[0])
  }

  while (current_bpm_div.hasChildNodes()){
    current_bpm_div.removeChild(current_bpm_div.childNodes[0])
  }

  while (current_key_div.hasChildNodes()){
    current_key_div.removeChild(current_key_div.childNodes[0])
  }

  while (current_prev_next_container_div.hasChildNodes()){
    current_prev_next_container_div.removeChild(current_prev_next_container_div.childNodes[0])
  }

  if (Track) {
    current_track_div.classList.remove('no_track_selected')
    var item = document.createTextNode(Track.title);
    current_track_div.appendChild(item)

    current_artist_div.classList.remove('no_track_selected')
    var artist_text = document.createTextNode(Track.artist);
    current_artist_div.appendChild(artist_text);

    current_bpm_div.classList.remove('no_track_selected')
    var bpm_text = document.createTextNode("BPM: " + Track.bpm);
    current_bpm_div.appendChild(bpm_text);

    current_key_div.classList.remove('no_track_selected')
    var key_text = document.createTextNode("Key: " + Track.key);
    current_key_div.appendChild(key_text);

    var left = document.createElement('div');
    left.classList.add('previous_in_stack');
    if (track_pointer == 0) {
      left.classList.add('no_previous');
    }

    var right = document.createElement('div');
    right.classList.add('next_in_stack');
    if (track_pointer == track_stack.length - 1) {
      right.classList.add('no_next');
    }

    current_prev_next_container_div.appendChild(left);
    current_prev_next_container_div.appendChild(right);

  } else {
    current_track_div.appendChild(document.createTextNode("Select a Track from Library"))
    current_track_div.classList.add('no_track_selected')
    current_track = null;

    var artist_text = document.createTextNode('Artists');
    current_artist_div.classList.add('no_track_selected')
    current_artist_div.appendChild(artist_text);

    var bpm_text = document.createTextNode("BPM: ");
    current_bpm_div.classList.add('no_track_selected')
    current_bpm_div.appendChild(bpm_text);

    var key_text = document.createTextNode("Key: ");
    current_key_div.classList.add('no_track_selected')
    current_key_div.appendChild(key_text);

    var left = document.createElement('div');
    left.classList.add('previous_in_stack');
    if (track_pointer <= 0) {
      left.classList.add('no_previous');
    }

    var right = document.createElement('div');
    right.classList.add('next_in_stack');
    if (track_pointer == track_stack.length - 1) {
      right.classList.add('no_next');
    }

    current_prev_next_container_div.appendChild(left);
    current_prev_next_container_div.appendChild(right);

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
      var next_track_li_div = document.createElement('div');
      next_track_li_div.classList.add('next_track_li_div')
      next_track_li_div.appendChild(document.createTextNode(next_tracks[i].artist + " - " + next_tracks[i].title));
      item.appendChild(next_track_li_div);

      function isElementOverflowing(element) {
        var overflowX = element.offsetWidth < element.scrollWidth,
            overflowY = element.offsetHeight < element.scrollHeight;
    
        return (overflowX || overflowY);
      }

      next_track_div.appendChild(item);
      //alert(isElementOverflowing(item));
      if (isElementOverflowing(item)) {
        next_track_li_div.classList.add('next_track_li_div_overflow');
        next_track_li_div.appendChild(document.createTextNode("\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0" 
                                                              + next_tracks[i].artist 
                                                              + " - " 
                                                              + next_tracks[i].title
                                                              + "\u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0 \u00A0"));
      }
    }
  } else {
    next_track_div.classList.add('next_tracks_empty')
  }
};

// Initial Current Track render from local storage
if (track_pointer >= 0) {
  console.log(track_stack);
  console.log(track_pointer);
  console.log(track_stack[track_pointer]);
  current_track = track_library.tracks[track_stack[track_pointer]];
  update_current_track(current_track);
  update_next_tracks(current_track);
}

// function to process id after a library track is clicked
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
  update_next_track_info_view(null);
};

// function to process id after add button is clicked
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
  } else if (e.target && e.target.className == "add_mixible_button") {
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
  if(e.target && e.target.classList.contains("next_track_li_div")) {
    clickedNextTrack(e.target.parentNode.id);
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
  track_stack.splice(track_pointer, 0, track_id);
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

var clickedNextButton = function() {
  if (track_pointer + 1 < track_stack.length) {
    track_pointer++;
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

document.querySelector('.current_prev_next_container').addEventListener("click", function(e) {
  if(e.target && e.target.classList.contains("previous_in_stack")) {
    console.log(track_pointer);
    clickedPreviousButton();
  }
  if(e.target && e.target.classList.contains("next_in_stack")) {
    console.log(track_pointer);
    clickedNextButton();
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
        
        var bpm = null;
        var key = null;

        try {
          console.log(tag.tags.TBPM.data);
          bpm = tag.tags.TBPM.data;
        } catch (error) {
          console.error('tag read error: ' + bpm);
        }

        try {
          console.log(tag.tags.TKEY.data);
          key = tag.tags.TKEY.data;
        } catch (error) {
          console.error('tag read error: ' + key);
        }

        // Create new Track from tags
        let track = new Track(tag.tags.artist, tag.tags.title, tag.tags.artist + " - " + tag.tags.title, bpm, key);
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

// Load demo library button functionality
var demo_lib = {"tracks":{"deadmau5 - Monophobia (Rinzen Remix)":{"artist":"deadmau5","title":"Monophobia (Rinzen Remix)","id":"deadmau5 - Monophobia (Rinzen Remix)","bpm":"124","key":"Gbmin","mixable_tracks":{}},"Dezza - Honey (Original Mix)":{"artist":"Dezza","title":"Honey (Original Mix)","id":"Dezza - Honey (Original Mix)","bpm":"126","key":"D#maj","mixable_tracks":{}},"Stanton Warriors, Sian Evans - Up2U (Extended Mix)":{"artist":"Stanton Warriors, Sian Evans","title":"Up2U (Extended Mix)","id":"Stanton Warriors, Sian Evans - Up2U (Extended Mix)","bpm":"128","key":"Gmin","mixable_tracks":{}},"G Jones - Immortal Light (Original Mix)":{"artist":"G Jones","title":"Immortal Light (Original Mix)","id":"G Jones - Immortal Light (Original Mix)","bpm":"150","key":"Fmin","mixable_tracks":{}},"Ben Bohmer - Maelstrom (Original Mix)":{"artist":"Ben Bohmer","title":"Maelstrom (Original Mix)","id":"Ben Bohmer - Maelstrom (Original Mix)","bpm":"123","key":"Fmaj","mixable_tracks":{}},"Cubicolor - Points Beyond (Extended Mix)":{"artist":"Cubicolor","title":"Points Beyond (Extended Mix)","id":"Cubicolor - Points Beyond (Extended Mix)","bpm":"116","key":"Amin","mixable_tracks":{}},"Le Youth - Waves (Extended Mix)":{"artist":"Le Youth","title":"Waves (Extended Mix)","id":"Le Youth - Waves (Extended Mix)","bpm":"124","key":"A#maj","mixable_tracks":{}},"Gorgon City, Drama - You've Done Enough (Extended Mix)":{"artist":"Gorgon City, Drama","title":"You've Done Enough (Extended Mix)","id":"Gorgon City, Drama - You've Done Enough (Extended Mix)","bpm":"125","key":"Cmin","mixable_tracks":{}},"Panama, Jerro - Together (Il:lo Remix)":{"artist":"Panama, Jerro","title":"Together (Il:lo Remix)","id":"Panama, Jerro - Together (Il:lo Remix)","bpm":"114","key":"Amin","mixable_tracks":{}}},"count":0};


var load_demo_library = function () {
  
  localStorage.clear();
  track_stack = []
  track_pointer = -1;
  track_library = demo_lib;
  set_local_storage_lib();
  get_local_storage_lib();
  update_library_view();
  update_current_track(null);
  update_next_tracks([]);
}

var demo_button = document.querySelector('.demo_button');
demo_button.addEventListener("click", function() {
  load_demo_library();
});