
let currentSong = new Audio();
let songs;
let currFolder;

// convert seconds to minutes:seconds format
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;

}

//  function to get the song name using fetch API
async function getSongs(folder) {
    currFolder = folder;




    let a = await fetch(`http://127.0.0.1:3000/${currFolder}/`);
    // when hosting on domain -   await fetch(`/${currFolder}/`);




    let reponse = await a.text();
    let div = document.createElement("div");
    div.innerHTML = reponse;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // show all songs in the playlist
    let songUl = document.querySelector(".song-list ").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    for (const song of songs) {

        // decoding the song name
        let songName = song.replaceAll("%20", " ");
        decodedSongName = decodeURI(songName);


        // creating a list item for each song and inserting the list item into your library
        songUl.innerHTML = songUl.innerHTML + `<li > <img src="img/music.svg" class="invert" alt="">
                            <div class="info">
                                <div class="song-name">${decodedSongName}</div>
                                <div>Artist</div>
                            </div>
                            <div class="play-now">
                                <span>Play Now</span>
                                <img src="img/play.svg" alt="" class="invert" >
                            </div></li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })

    })
    return songs

}

// play music function deals with the playbar as well
const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }

    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00/00:00"
}


// display albums function
async function displayAlbums() {




    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    // when hosting on domain -   await fetch(`/songs/`);




    let reponse = await a.text();
    let div = document.createElement("div");
    div.innerHTML = reponse;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")  /* && !e.href.includes(".htaccess")*/) {
            let folder = e.href.split("/").slice(-2)[0]
            //get meta deta of the folder 
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            // when hosting on domain -   await fetch(`/songs/${folder}/info.json`);

            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card ">
                        <div class="play"><svg height="35px" width="35px" viewBox="0 0 340 340"
                                xmlns="http://www.w3.org/2000/svg">
                                <!-- Circle with reduced radius to leave "padding" -->
                                <circle cx="170" cy="170" r="150" fill="#3be477" />

                                <!-- Triangle path shifted inward -->
                                <path d="M225.846,178.266l-86.557,49.971c-1.32,0.765-2.799,1.144-4.272,1.144
                                c-1.473,0-2.949-0.379-4.274-1.144c-2.64-1.525-4.269-4.347-4.269-7.402V120.89
                                c0-3.053,1.631-5.88,4.269-7.402c2.648-1.528,5.906-1.528,8.551,0l86.557,49.974
                                c2.645,1.53,4.274,4.352,4.269,7.402C230.12,173.916,228.494,176.741,225.846,178.266z"
                                    fill="#000000" />
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // load playlist whenever card is clicked 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // get playlist of all the songs
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])

            // getting meta data 

            document.querySelector(".loadedLibrary").innerHTML = ""
            document.querySelector(".loadedLibrary").innerHTML = e.querySelector("h2").innerHTML;

        })
    });

}

// main function to get the songs and put them in the library
async function main() {

    // get playlist of all the songs
    await getSongs("songs/cs")

    //setting the first soong to be played
    playMusic(songs[0], true)

    //    display all the albums on the page 
    displayAlbums()

    // attach an event listener to the play, next and previous button 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })


    // time updating event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        const percent = (currentSong.currentTime / currentSong.duration) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        // Change seekbar background color for the played area
        document.querySelector(".seekbar").style.background = `linear-gradient(to right, #1db954 ${percent}%, #535353 ${percent}%)`;
    })

    // seekbar click event - Eventlistener to allow for seekbar navigation
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration) * percent / 100;
    })



    // seekbar drag event - Eventlistener to allow for seekbar navigation by dragging the cricle
    let isDragging = false;
    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");

    // Mouse down on the circle starts dragging
    circle.addEventListener("mousedown", (e) => {
        isDragging = true;
        e.preventDefault();
    });


    //---------------------Mouse move on the document while dragging updates the position smoothly---------------------------//
    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const rect = seekbar.getBoundingClientRect();
            let offsetX = e.clientX - rect.left;
            offsetX = Math.max(0, Math.min(offsetX, rect.width));
            let percent = (offsetX / rect.width) * 100;
            circle.style.left = percent + "%";
            currentSong.currentTime = (currentSong.duration) * percent / 100;
            // Update seekbar background as you drag
            seekbar.style.background = `linear-gradient(to right, #1db954 ${percent}%, #535353 ${percent}%)`;
            // Update time display as you drag
            document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        }
    });

    // Mouse up anywhere stops dragging
    document.addEventListener("mouseup", () => {
        isDragging = false;
    });
    //-------------------------------------------------------------------------------------------------------------------------//

    // add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    // add event listener for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    })

    // adding event listeners to previous and next

    previous.addEventListener("click", () => {

        next.style.display = "block";
        console.log("previous is clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
        if ((index) == (1)) {
            previous.style.display = "none";
        }

        // else {
        //     playMusic(songs[(songs.length - 1)]);
        // }
    })


    next.addEventListener("click", () => {
        previous.style.display = "block";
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
        if ((index) == (songs.length - 2)) {
            next.style.display = "none";
        }

        //  else {
        //     playMusic(songs[0]);
        //     next.style.display = "none";
        // }
    });


    // event listener for volume 
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
          document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }
    })

    // add event listener to mute the track 
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

}

// calling main function 
main()