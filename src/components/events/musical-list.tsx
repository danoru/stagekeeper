import MusicalItem from "./musical-item";
import classes from "./musical-list.module.css";

function MusicalList(props: any) {
  const { items } = props;

  return (
    <ul className={classes.list}>
      {items?.map((musical: any) => (
        <MusicalItem
          key={musical.id}
          title={musical.title}
          location={musical.location}
          date={musical.date}
          image={musical.image}
        />
      ))}
    </ul>
  );
}

export default MusicalList;
