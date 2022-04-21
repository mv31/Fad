import { Paper, Theme, Typography, useTheme } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { useWindowSize } from "@src/../../packages/utils/src";
import React, { useState } from "react";
import ReactCardFlip from "react-card-flip";
import { TopCardAction } from "../Appointments/AppointmentCard";

type Props = {
  onclickCard: () => void;
  quickAction: () => void;
  title: string;
  cardDescription: string;
  img: string;
  img1: string;
  tooltipTitle: string;
};
const Card = (props: Props) => {
  const classes = useStyles();
  const theme = useTheme();
  const [flipped, setFlipped] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean>(false);

  const { height, width } = useWindowSize();
  return (
    <ReactCardFlip isFlipped={flipped} flipDirection="horizontal">
      <>
        <Paper
          className={classes.paper}
          elevation={0}
          onClick={props.onclickCard}
          style={{
            backgroundColor: isHover ? theme.palette.primary.main : theme.palette.secondary.main,
            height: (height - height * (61 / 100) - 60) / 2,
            width: (width - (20 / 100) * width) / 4,
          }}
          onMouseOver={() => {
            setIsHover(true);
          }}
          onMouseLeave={() => {
            setIsHover(false);
          }}
        >
          <div style={{ height: "20%" }}>
            <TopCardAction
              onClickInfo={(e) => {
                e.stopPropagation();
                setFlipped(true);
              }}
              onClickButton={(e) => {
                e.stopPropagation();
                props.quickAction();
              }}
              isHover={isHover}
              tooltipTitle={props?.tooltipTitle}
            />
          </div>
          <div
            style={{
              display: "flex",
              // flexDirection: "column",
              height: "80%",
              alignItems: "center",
              justifyContent: "space-between",
              // marginBottom: 5,
              padding: 10,
            }}
          >
            <Typography style={{ color: isHover && "white" }}>{props.title}</Typography>
            <div style={{ height: "60%", width: "100%" }}>
              <img src={isHover ? props.img1 : props.img} width={"100%"} height={"100%"} />
            </div>
          </div>
        </Paper>
      </>
      <>
        <Paper
          className={classes.paper}
          elevation={0}
          onClick={props.onclickCard}
          style={{
            backgroundColor: isHover ? theme.palette.primary.main : theme.palette.secondary.main,
            height: (height - height * (60 / 100) - 60) / 2 - 10,
            width: (width - (20 / 100) * width) / 4,
          }}
          onMouseOver={() => {
            setIsHover(true);
          }}
          onMouseLeave={() => {
            setIsHover(false);
          }}
        >
          <div style={{ height: "20%" }}>
            <TopCardAction
              onClickInfo={(e) => {
                e.stopPropagation();
                setFlipped(false);
              }}
              onClickButton={(e) => {
                e.stopPropagation();
                props.quickAction();
              }}
              isHover={isHover}
              tooltipTitle={props?.tooltipTitle}
            />
          </div>
          <div
            style={{
              display: "flex",
              height: "80%",
              alignItems: "center",
              justifyContent: "center",
              // marginBottom: 5,
              // padding: 10,
            }}
          >
            <Typography style={{ fontSize: 20, color: isHover && "white" }}>{props.cardDescription}</Typography>
          </div>
        </Paper>
      </>
    </ReactCardFlip>
  );
};

export default Card;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      // height: "150px",
      // width: "100%",
      alignItems: "center",
      // marginBottom: "2%",
      cursor: "pointer",
      padding: "2%",
      backgroundColor: theme.palette.secondary.main,
    },
  })
);
