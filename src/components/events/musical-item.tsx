import Image from "next/image";

import classes from "./musical-item.module.css";

function MusicalItem(props: any) {
  const { title, premiere, genre, date, location, playhouse, image } = props;

  const humanReadableDate = new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <li className={classes.item}>
      <Image src={"/" + image} alt={title} width={250} height={160} />
      <div className={classes.content}>
        <div className={classes.summary}>
          <h2>{title}</h2>
          <div className={classes.date}>
            <time>{humanReadableDate}</time>
          </div>
          <div className={classes.address}>
            <h3>{location}</h3>
          </div>
        </div>
      </div>
    </li>
  );
}

export default MusicalItem;
