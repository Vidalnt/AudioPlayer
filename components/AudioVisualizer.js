import React, { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

const AudioVisualizer = ({ audioLink, isPlaying }) => {
  const wavesurferRef = useRef(null);

  useEffect(() => {
    const wavesurfer = WaveSurfer.create({
      container: wavesurferRef.current,
      responsive: true,
      height: 100, // Altura del visualizador
    });

    wavesurfer.load(audioLink);

    if (isPlaying) {
      wavesurfer.play();
    } else {
      wavesurfer.pause();
    }

    return () => {
      wavesurfer.destroy();
    };
  }, [audioLink, isPlaying]);

  return <div ref={wavesurferRef}></div>;
};

export default AudioVisualizer;
