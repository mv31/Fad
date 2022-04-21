import React, { ReactNode } from "react";
import { createStyles, makeStyles } from "@mui/styles";

import { Paper, Theme } from "@mui/material";

interface Props {
  illustrationOnly: boolean;
  src?: string;
  children?: ReactNode[];
  style?: React.CSSProperties;
  name?: string;
}

const DoctorProfileOutline = (props: Props) => {
  const styles = useStyles();
  return !props.illustrationOnly ? (
    <Paper elevation={0} className={styles.card} style={{ ...props.style }}>
      {props.children}
    </Paper>
  ) : (
    <Paper elevation={0} className={styles.container}>
      <Paper elevation={0} className={styles.card2}>
        <img src={props.src} className={styles.img} />
      </Paper>
      <p className={styles.text}>{props.name}</p>
    </Paper>
  );
};

export default DoctorProfileOutline;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    card: {
      border: `2px solid ${theme.palette.primary.main}`,
    },
    card2: {
      border: `2px solid ${theme.palette.primary.main}`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: 100,
      width: 100,
      padding: 22,
      borderRadius: 10,
    },
    img: {
      height: "100%",
      maxWidth: "100%",
      objectFit: "cover",
    },
    container: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%",
    },
    text: {
      fontWeight: 600,
      fontSize: 18,
      textAlign: "center",
    },
  })
);
