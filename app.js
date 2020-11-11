function Track(artist, title) {
  this.artist = artist;
  this.title = title;
  this.mixable_tracks = [];
}
  
let example_track = new Track('Artist', 'Title');
  
// Track Library state
var track_library = {
  tracks: [example_track]
};

// Libary view component
var update_library_view = function () {
  var list = document.createElement('ul');
    for (var i = 0; i < track_library.tracks.length; i++) {
        var item = document.createElement('li');
        item.setAttribute("id", "Tracklist");
        item.appendChild(document.createTextNode(track_library.tracks[i].artist + " - " + track_library.tracks[i].title));
        list.appendChild(item);
    }
  return list.outerHTML; 
    // return '<p>' + track_library.title + ', ' + track_library.artist + '!</p>';
};

// Initial Library render
var app = document.querySelector('#app');
app.innerHTML = update_library_view();

const mm = window.musicmetadata;

function dropHandler(ev) {
  console.log('File(s) dropped');

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (ev.dataTransfer.items[i].kind === 'file') {
        var file = ev.dataTransfer.items[i].getAsFile();

        var parser = mm(file, function (err, metadata) {
          if (err) throw err;
          console.log(metadata);
        });

        let example_track = new Track(file.name, file.name);
        track_library.tracks.push(example_track);
        app.innerHTML = update_library_view();
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      track_library.tracks.push(file.name);
      app.innerHTML = update_library_view();
    }
  }
}

function dragOverHandler(ev) {
  console.log('File(s) in drop zone'); 

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

document.getElementById("Tracklist").addEventListener("click",function(e) {
  // e.target is our targetted element.
  if(e.target && e.target.nodeName == "LI") {
    alert("worked");
  }
});