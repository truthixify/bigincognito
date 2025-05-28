/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import PlayVideo from "./icons/PlayVideo";

type LyricLine = { startTime: number; line: string; endTime: number };

interface KaraokeProps {
  lyricData?: LyricLine[];
}

const Karaoke: React.FC<KaraokeProps> = ({
  lyricData = [
    { startTime: 1, endTime: 3, line: "Before my body turns to clay" },
    {
      startTime: 4,
      endTime: 7,
      line: "I pray my brain splatter that my mind be on display like an art gallery",
    },
    {
      startTime: 8,
      endTime: 10,
      line: "Part man part machine know I'm half battery",
    },
    {
      startTime: 10.5,
      endTime: 12.6,
      line: "With the kind of pristine of Tony Stark armory",
    },
    {
      startTime: 13,
      endTime: 15,
      line: "I got two hoes in front of me like Shawn Connery",
    },
    {
      startTime: 16,
      endTime: 18,
      line: "They both down to pleasure me, right orally",
    },
    {
      startTime: 18.5,
      endTime: 19.7,
      line: "When the psychology meets biology"
    },
    {
      startTime: 20,
      endTime: 23.5,
      line: "I'm the bipolar write columns, write poems write puns"
    },
    {
      startTime: 24,
      endTime: 27,
      line: "Look, regurgitating my statements I'm coming thru like an amen"
    },

    {
      startTime: 28,
      endTime: 30,
      line: "Eradicating the demons with 42's that I'm aiming"
    },

    {
      startTime: 30,
      endTime: 31,
      line: "'Stead of always complaining"
    },

    {
      startTime: 31,
      endTime: 33,
      line: "Rather work my brain and triple all of my earnings"
    },

    {
      startTime: 33,
      endTime: 37,
      line: "Ignite the fiery furnace with speeds of burning comets"
    },

    {
      startTime: 38,
      endTime: 42,
      line: "Cus I'm a rare jewel like the Israelite I travel faster than the speed of light"
    },

    {
      startTime: 42,
      endTime: 45,
      line: "Then illuminate the world when I take the night"
    },
    {
      startTime: 45,
      endTime: 51,
      line: "Before my body turn to clay Me thank the lord for everyday I"
    },

    {
      startTime: 51,
      endTime: 55,
      line: "Miss my mama everyday Sometimes I cry me a river"
    },

    {
      startTime: 56,
      endTime: 58,
      line: "Before my ashes blow away"
    },

    {
      startTime: 59,
      endTime: 61,
      line: "Me try me best to find a way"
    },

    {
      startTime: 62,
      endTime: 66,
      line: "Before my body turn to clay Me travel light years in a day"
    },

    {
      startTime: 66,
      endTime: 68,
      line: "I miss mum only God can reunite us"
    },
    {
      startTime: 68,
      endTime: 70,
      line: "So I gotta stand strong like captain Leonidas"
    },
    {
      startTime: 70,
      endTime: 72,
      line: "You a star and you shine the brightest ay"
    },
    {
      startTime: 74,
      endTime: 78,
      line: "My eternal sunshine the feelings don’t die I needed more time"
    },
    {
      startTime: 78,
      endTime: 82,
      line: "But I gotta move on right a few wrongs write a new song"
    },
    {
      startTime: 82,
      endTime: 86,
      line: "So mama watch your son as he fight fears and wipe tears and travel light years"
    },
    {
      startTime: 86,
      endTime: 92,
      line: "When I'm 80 with my great grand babies and I play this in my vintage Mercedes ayy"
    },

    {
      startTime: 93,
      endTime: 97,
      line: "Y’all welcome to my Odyssey I hope my dreams come thru like a prophecy"
    },
    {
      startTime: 97,
      endTime: 103,
      line: "And when things get dark you be my light again sky walking sky walking like Anakin"
    },
    {
      startTime: 103,
      endTime: 107,
      line: "It’s a cold world mama was my cardigan now she 6 foot breathless like a mannequin "
    },
    {
      startTime: 107,
      endTime: 111,
      line: "...",
    }
  ],
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { ref, inView } = useInView({ threshold: 0 });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Playback failed:", error);
        });
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleAudioLoading = () => { };

  const handleAudioPlaying = () => { };

  const updateCurrentTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  const handleAudioEnded = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      playAudio(); // Restart the audio when it ends
    }
  };


  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      audioElement.addEventListener("waiting", handleAudioLoading);
      audioElement.addEventListener("playing", handleAudioPlaying);
      audioElement.addEventListener("timeupdate", updateCurrentTime);
      audioElement.addEventListener("ended", handleAudioEnded);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("waiting", handleAudioLoading);
        audioElement.removeEventListener("playing", handleAudioPlaying);
        audioElement.removeEventListener("timeupdate", updateCurrentTime);
        audioElement.removeEventListener("ended", handleAudioEnded);
      }
    };
  }, []);

  useEffect(() => {
    if (inView && isPlaying) {
      playAudio();
    } else {
      pauseAudio();
      setCurrentTime(0);
    }
  }, [inView, isPlaying]);

  useEffect(() => {
    // Scroll to the active lyric line using document.querySelector
    const activeIndex = lyricData.findIndex(
      (line) => currentTime >= line.startTime && currentTime <= line.endTime
    );

    if (activeIndex !== -1) {
      const activeElement = document.querySelector(`#lyric-${activeIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentTime, lyricData]);

  const handleLineClick = (startTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = startTime;
      playAudio();
      if (!isPlaying) {
        playAudio(); // Optionally, start playing if not already playing
      }
    }
  };

  return (
    <div className="w-full flex justify-center py-10">
      <div className="w-full flex items-center justify-center relative base:h-[800px] sun:h-[900px] glow">
        {!isPlaying && (
          <div
            onClick={playAudio}
            className="absolute cursor-pointer mx-auto w-[100%] z-10 backdrop-blur flex items-center justify-center h-[90%] play-button"
          >
            <PlayVideo />
          </div>
        )}
        <div
          ref={ref}
          className="base:h-[220px] tab:h-[240px] min-[991px]:h-96 hide-scrollbar base:max-sm:w-[60%] sm:w-[40%] py-10 overflow-y-auto"
        >
          <audio
            ref={audioRef}
            src="/assets/music/light_years.mp3"
          ></audio>
          {lyricData.map((line, index) => (
            <p
              key={index}
              id={`lyric-${index}`}
              className={`hover:text-slate-100 base:mb-4 tab:mb-6 base:text-[20px] tab:text-[27px] base:max-tab:leading-7 tab:text-4xl font-bolden cursor-pointer ${currentTime >= line.startTime && currentTime <= line.endTime
                ? "text-ourWhite"
                : currentTime > line.endTime
                  ? "text-slate-200"
                  : "text-black"
                }`}
              onClick={() => handleLineClick(line.startTime)}
            >
              {line.line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Karaoke;
