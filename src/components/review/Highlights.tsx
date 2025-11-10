import type { attendance, musicals, performances, plays, theatres } from "@prisma/client";

import styles from "../../styles/highlights.module.css";

interface Props {
  highlights: (attendance & {
    performances: performances & { musicals: musicals; plays: plays; theatres: theatres };
  })[];
}

function Highlights({ highlights }: Props) {
  const { musicalCount, playCount, totalDuration } = highlights.reduce(
    (accumulator, highlight) => {
      const { musicals, plays, type } = highlight.performances;

      if (type === "MUSICAL") accumulator.musicalCount += 1;
      if (type === "PLAY") accumulator.playCount += 1;

      const duration = musicals?.duration ?? plays?.duration ?? 150;
      accumulator.totalDuration += duration;

      return accumulator;
    },
    {
      musicalCount: 0,
      playCount: 0,
      totalDuration: 0,
    }
  );

  function convertTime(num: number) {
    const hours = Math.floor(num / 60);
    const minutes = num % 60;
    return hours + " Hours & " + minutes + " Minutes";
  }

  const convertedDuration = convertTime(totalDuration);

  const locationStorage: Record<string, number> = {};
  let locationCount = 0;

  highlights.forEach((highlight) => {
    if (!locationStorage[highlight.performances.theatres.location]) {
      locationStorage[highlight.performances.theatres.location] = 1;
      locationCount++;
    }
  });

  const stageStorage: Record<string, number> = {};
  let stageCount = 0;

  highlights.forEach((highlight) => {
    if (!stageStorage[highlight.performances.theatres.name]) {
      stageStorage[highlight.performances.theatres.name] = 1;
      stageCount++;
    }
  });

  return (
    <div className={styles.stuff}>
      <div className={styles.hr}></div>
      <div className={styles.info}>
        <div>
          <h1>{musicalCount} Musicals</h1>
        </div>
        <div className={styles.dot}></div>
        <div>
          <h1>{playCount} Plays</h1>
        </div>
        <div className={styles.dot}></div>
        <div>
          <h1>{convertedDuration}</h1>
        </div>
        <div className={styles.dot}></div>
        <div>
          <h1>{locationCount} Locations</h1>
        </div>
        <div className={styles.dot}></div>
        <div>
          <h1>{stageCount} Stages</h1>
        </div>
      </div>
      <div className={styles.hr}></div>
    </div>
  );
}

export default Highlights;
