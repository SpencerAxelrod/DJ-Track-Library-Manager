// Track data type
function Track(artist, title) {
  this.artist = artist;
  this.title = title;
  this.mixable_tracks = [];
}

// Track Library state
var track_library = {
  tracks: []
};

myStorage = window.localStorage;
myStorage.setItem('local_storage_track_library', JSON.stringify(track_library));

var set_local_storage_lib = function () {
  myStorage.setItem('local_storage_track_library', JSON.stringify(track_library));
}

var get_local_storage_lib = function () {
  track_library = JSON.parse = myStorage.getItem('local_storage_track_library');
}

// Libary view component
var track_library_list = document.querySelector('#lib_list');

var update_library_view = function () {
  //list = document.querySelector('#lib_list');
  //list.setAttribute("id", "Tracklist");
  while (track_library_list.childNodes[1]) {
    track_library_list.removeChild(track_library_list.childNodes[1]);
  }
  for (var i = 0; i < track_library.tracks.length; i++) {
      var item = document.createElement('li');
      item.appendChild(document.createTextNode(track_library.tracks[i].artist + " - " + track_library.tracks[i].title));
      track_library_list.appendChild(item);

      //2020-11-11 DELETE CHILD ELEMENTS? 
  }
  //return track_library_list.outerHTML; 
    // return '<p>' + track_library.title + ', ' + track_library.artist + '!</p>';
};

// Initial Library render
update_library_view();

// track selection intitial
document.getElementById("lib_list").addEventListener("click",function(e) {
  // e.target is our targetted element.
  if(e.target && e.target.nodeName == "LI") {
    alert(myStorage.getItem('local_storage_track_library'));
  }
});

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
  form.dispatchEvent( event );
};

// init dropped files
var droppedFiles = false;

// automatically submit the form on file select
var input = form.querySelector( 'input[type="file"]' )
input.addEventListener( 'change', function( e ) {
  //showFiles( e.target.files );
  triggerFormSubmit();
});

// check for drag and drop functionality
if( isAdvancedUpload ) {
  
  // add class to .box form for css styling
  form.classList.add( 'has-advanced-upload' );

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
}

const mm = window.musicmetadata;

// if the form was submitted
form.addEventListener( 'submit', function( e )
{
  
  if( isAdvancedUpload ) {
    e.preventDefault();  
    if( droppedFiles ) {
      for (var i = 0; i < droppedFiles.length; i++) {
        // If dropped items aren't files, reject them
        if (droppedFiles[i].kind === 'file') {
          var file = droppedFiles[i].getAsFile();
  
          var parser = mm(file, function (err, metadata) {
            if (err) throw err;
            //console.log(metadata);
            let track = new Track(metadata.artist[0], metadata.title);
            track_library.tracks.push(track);
            set_local_storage_lib();
            update_library_view();
          });
        }
      }
    }
  }
});