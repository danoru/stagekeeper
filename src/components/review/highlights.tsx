import styles from "../../styles/highlights.module.css";

function Highlights(props: any) {
  const { highlights } = props;
  const musicalCount = highlights.length;

  return (
    <div className={styles.stuff}>
      <h1>{musicalCount} Musicals</h1>
      <h1>22 Hours & 10 Minutes</h1>
      <h1>5 Locations</h1>
      <h1>7 Stages</h1>
    </div>
  );
}

export default Highlights;
