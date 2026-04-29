const tracks = [
  {
    img: "/asset/cover3.png",
    name: "Name of song",
    desc: "Artist · description",
  },
  {
    img: "/asset/album-cover-1.jpg",
    name: "Name of song",
    desc: "Artist · description",
  },
];

function Radio() {
  return (
    <section className="radio">
      <div className="banner">
        <h2>Audtlist Radio</h2>
        <br />
        <img src="/asset/cover1.jpg" alt="Nightmares show poster" />
        <p>The Nightmares Show</p>
      </div>

      <div className="banner-2">
        <img src="/asset/radio1.jpg" alt="Now playing" />
        <p>Name of song and description — now playing on Audtlist Radio</p>
        <div className="play-icon">
          <svg
            className="play-button"
            xmlns="http://www.w3.org/2000/svg"
            height="48px"
            viewBox="0 -960 960 960"
            width="48px"
            fill="#000000"
          >
            <path d="m383-310 267-170-267-170v340Zm97 230q-82 0-155-31.5t-127.5-86Q143-252 111.5-325T80-480q0-83 31.5-156t86-127Q252-817 325-848.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 82-31.5 155T763-197.5q-54 54.5-127 86T480-80Zm0-60q142 0 241-99.5T820-480q0-142-99-241t-241-99q-141 0-240.5 99T140-480q0 141 99.5 240.5T480-140Zm0-340Z" />
          </svg>
        </div>
      </div>

      <div className="track-list">
        <h2>Tracklist</h2>
        <p>
          Discover a new way to experience music with AudioList Radio. Enjoy
          carefully curated playlists designed for every mood whether you're
          relaxing, working, or on the move.
        </p>

        <div className="track-img">
          {tracks.map((track, i) => (
            <div className="track" key={i}>
              <img src={track.img} alt="Track cover" />
              <div className="track1-txt">
                <p>{track.name}</p>
                <p>{track.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Radio;
