import { MUSICAL_LIST_TYPE } from "../../types";

import styles from "../../styles/highlights.module.css";

interface Props {
  highlights: MUSICAL_LIST_TYPE[];
}

function Highlights(props: Props) {
  const { highlights } = props;
  const musicalCount = highlights.length;

  const totalDuration = highlights
    .filter((highlight: MUSICAL_LIST_TYPE) => highlight.groupAttended)
    .reduce((accumulator: number, highlight: MUSICAL_LIST_TYPE): number => {
      return accumulator + highlight.duration;
    }, 0);

  const locationStorage: Record<string, number> = {};
  let locationCount = 0;

  highlights
    .filter((highlight: MUSICAL_LIST_TYPE) => highlight.groupAttended)
    .forEach((highlight: MUSICAL_LIST_TYPE) => {
      if (!locationStorage[highlight.location]) {
        locationStorage[highlight.location] = 1;
        locationCount++;
      }
    });

  const stageStorage: Record<string, number> = {};
  let stageCount = 0;

  highlights
    .filter((highlight: MUSICAL_LIST_TYPE) => highlight.groupAttended)
    .forEach((highlight: MUSICAL_LIST_TYPE) => {
      if (!stageStorage[highlight.playhouse]) {
        stageStorage[highlight.playhouse] = 1;
        stageCount++;
      }
    });

  return (
    <div className={styles.stuff}>
      <h1>{musicalCount} Musicals</h1>
      <h1>{totalDuration} Minutes</h1>
      <h1>{locationCount} Locations</h1>
      <h1>{stageCount} Stages</h1>
    </div>
  );
}

export default Highlights;
