import { Badge, IconButton, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import { createStyles, makeStyles } from "@mui/styles";
import { DashboardItems } from "./Dashboard";
import { UIPrimaryButton } from "@src/../../packages/ui/src";
import ReactCardFlip from "react-card-flip";
import MarkunreadIcon from "@mui/icons-material/Markunread";
import { useWindowSize } from "@src/../../packages/utils/src";
import DraftsIcon from "@mui/icons-material/Drafts";
import { InfoOutlined } from "@mui/icons-material";
import MailCount from "@src/components/mailbox/MailCount";

// export type DashboardItems = Props;

interface Props {
  onclickCard: () => void;
  item: DashboardItems;
  quickAction?: () => void;
  cardDescription?: string;
  tooltipTitle: string;
}

type TopCardProps = {
  onClickInfo: (e: any) => void;
  onClickButton: (e: any) => void;
  infoOnly?: boolean;
  isHover?: boolean;
  tooltipTitle: string;
};
export const TopCardAction = (props: TopCardProps) => {
  const theme = useTheme();

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "1%" }}>
      <div>
        <IconButton onClick={(e) => props?.onClickInfo(e)}>
          <InfoOutlined htmlColor={props.isHover ? "white" : theme.palette.primary.main} />
        </IconButton>
      </div>
      <Tooltip title={props.tooltipTitle}>
        <div style={{ borderColor: "green" }}>
          {!props?.infoOnly && (
            <UIPrimaryButton
              variant="outlined"
              onClick={(e) => props.onClickButton(e)}
              style={{
                fontSize: 15,
                border: props.isHover ? "1px solid white" : `1px solid ${theme.palette.primary.main}`,
                color: props.isHover ? "white" : theme.palette.primary.main,
              }}
            >
              {"Quick View"}
            </UIPrimaryButton>
          )}
        </div>
      </Tooltip>
    </div>
  );
};

const CardItem: FC<Props> = (props: Props) => {
  const theme = useTheme();
  const classes = useStyles();
  const [detailView, setDetailView] = useState<boolean>(false);
  const [isHover, setIsHover] = useState<boolean>(false);
  const quickAction = (e) => {
    e.stopPropagation();
    props.quickAction();
  };
  const { height, width } = useWindowSize();
  const styles = useStyles();
  useEffect(() => {
    console.log("height", height, "width: ", width);
  }, [height, width]);

  useEffect(() => {
    if (props?.item && props?.item?.openWhenRoute) {
      props?.quickAction();
    }
  }, [props?.item]);

  return (
    <ReactCardFlip isFlipped={detailView} flipDirection="horizontal">
      <>
        <Paper
          className={classes.paper}
          elevation={0}
          onClick={props.onclickCard}
          style={{
            backgroundColor: isHover ? theme.palette.primary.main : theme.palette.secondary.main,
            height: height - height * (60 / 100) - 60,
            width: (width - (20 / 100) * width) / 4,
          }}
          onMouseOver={() => {
            setIsHover(true);
          }}
          onMouseLeave={() => {
            setIsHover(false);
          }}
        >
          <div style={{ height: "20%", backgroundColor: "green2" }}>
            {props.item.component && (
              <TopCardAction
                onClickInfo={(e) => {
                  e.stopPropagation();
                  setDetailView(true);
                }}
                onClickButton={(e) => {
                  e.stopPropagation();
                  props.quickAction();
                }}
                isHover={isHover}
                tooltipTitle={props.tooltipTitle}
              />
            )}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "80%",
              alignItems: "center",
              justifyContent: "space-evenly",
              // marginBottom: 5,
              // backgroundColor: "red",
            }}
          >
            <div style={{ height: "60%", width: "100%" }}>
              <img src={isHover ? props.item.src1 : props.item.src} width={"100%"} height={"100%"} />
            </div>
            <div style={{ display: "flex" }}>
              <Typography style={{ color: isHover && "white" }} className={classes.title}>
                {props.item.title}
              </Typography>
              {props.item.title == "Communication" && (
                // <Badge badgeContent={props.item.badgeCount} color={"error"} classes={{ badge: styles.badge }}>
                //   {" "}
                //   <MarkunreadIcon style={{ color: isHover ? "white" : theme.palette.primary.main, marginLeft: "10" }} />
                // </Badge>
                <MailCount badgeCount={props?.item?.badgeCount} onHover={isHover} />
              )}
            </div>
          </div>
        </Paper>
      </>
      <>
        <Paper
          className={classes.paper}
          style={{
            backgroundColor: isHover ? theme.palette.primary.main : theme.palette.secondary.main,
            height: height - height * (60 / 100) - 50,
            width: (width - (20 / 100) * width) / 4,
          }}
          elevation={0}
          onClick={props.onclickCard}
          onMouseOver={() => {
            setIsHover(true);
          }}
          onMouseLeave={() => {
            setIsHover(false);
          }}
        >
          {props.item.component && (
            <TopCardAction
              onClickInfo={(e) => {
                e.stopPropagation();
                setDetailView(false);
              }}
              onClickButton={(e) => {
                e.stopPropagation();
                props.quickAction();
              }}
              isHover={isHover}
              tooltipTitle={props.tooltipTitle}
            />
          )}
          <div
            style={{
              display: "flex",
              height: "80%",
              alignItems: "center",
              justifyContent: "center",
              // marginBottom: 5,
              padding: 10,
            }}
          >
            <Typography style={{ fontSize: 20, color: isHover && "white" }}>{props.cardDescription}</Typography>
          </div>
        </Paper>
      </>
    </ReactCardFlip>
  );
};

export default CardItem;

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      // height: "300px",
      // width: "330px",
      // display: "flex",
      // justifyContent: "space-evenly",
      alignItems: "center",
      // marginBottom: "2%",
      // borderRadius: "5%",
      // flexDirection: "column",
      padding: "2%",
      cursor: "pointer",
      // backgroundColor: theme.palette.secondary.main,
    },
    title: {
      // fontWeight: "bold",
    },
    upperContent: {
      // background: theme.palette.primary.main,hoverContent
      // backgroundColor: "red",
      alignSelf: "flex-start",
      width: "100%",
      height: "100%",
      transition: "all .3s",
      borderRadius: 0,
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
      padding: 0,
      margin: 0,
    },
    badge: {
      fontSize: 18,
      height: 25,
      width: 25,
      borderRadius: 50,
    },
  })
);
