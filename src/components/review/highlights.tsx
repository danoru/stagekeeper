import { MUSICAL_LIST_TYPE } from "../../types";

import styles from "../../styles/highlights.module.css";

interface Props {
  highlights: MUSICAL_LIST_TYPE[];
}

function Highlights(props: Props) {
  const { highlights } = props;
  const musicalCount = highlights.length;
  const filteredHighlights = highlights.filter(
    (highlight: MUSICAL_LIST_TYPE) => highlight.groupAttended
  );

  const totalDuration = filteredHighlights.reduce(
    (accumulator: number, highlight: MUSICAL_LIST_TYPE): number => {
      return accumulator + highlight.duration;
    },
    0
  );

  function convertTime(num: number) {
    let hours = Math.floor(num / 60);
    let minutes = num % 60;
    return hours + " Hours & " + minutes + " Minutes";
  }

  const convertedDuration = convertTime(totalDuration);

  const locationStorage: Record<string, number> = {};
  let locationCount = 0;

  filteredHighlights.forEach((highlight: MUSICAL_LIST_TYPE) => {
    if (!locationStorage[highlight.location]) {
      locationStorage[highlight.location] = 1;
      locationCount++;
    }
  });

  const stageStorage: Record<string, number> = {};
  let stageCount = 0;

  filteredHighlights.forEach((highlight: MUSICAL_LIST_TYPE) => {
    if (!stageStorage[highlight.playhouse]) {
      stageStorage[highlight.playhouse] = 1;
      stageCount++;
    }
  });

  return (
    <div className={styles.stuff}>
      <h1>{musicalCount} Musicals</h1>
      <h1>{convertedDuration}</h1>
      <h1>{locationCount} Locations</h1>
      <h1>{stageCount} Stages</h1>
    </div>
  );
}

export default Highlights;
