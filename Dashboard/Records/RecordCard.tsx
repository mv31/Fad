import { Button, CircularProgress, IconButton, Paper, Theme, Typography, useTheme } from "@mui/material";
import React, { FC, useEffect, useState } from "react";
import { createStyles, makeStyles } from "@mui/styles";
import { DashboardItems } from "../Dashboard";
import { UIPrimaryButton, useSnackbar } from "@src/../../packages/ui/src";
import { InfoOutlined } from "@mui/icons-material";
import ReactCardFlip from "react-card-flip";
import { BackendEndpoints } from "@src/routes/BackendEndpoints";
import useFetch, { CachePolicies } from "use-http";
import { Attachment } from "@src/components/mailbox/ComposeMail/ComposeMailModal";
import { gql } from "@apollo/client";
import { useAdd_RecordsMutation } from "@src/../../packages/graphql_code_generator/src";
import ViewRecords, { GET_RECORDS } from "./ViewRecordsModal";
import { TopCardAction } from "../DashboardCard";
import AddMedicalRecordModal from "../../MedicaRecords/AddMedicalRecordModal";
import { useWindowSize } from "@src/../../packages/utils/src";

// export type DashboardItems = Props;

interface Props {
  onclickCard: () => void;
  item: DashboardItems;
  quickAction?: () => void;
  cardDescription?: string;
}

const ADD_RECORDS = gql`
  mutation add_records($input: AddRecordsInput!) {
    add_records(input: $input)
  }
`;

const RecordCard: FC<Props> = (props: Props) => {
  const theme = useTheme();
  const classes = useStyles();
  const [detailView, setDetailView] = useState<boolean>(false);
  const [isHover, setisHover] = useState<boolean>(false);
  const [viewRecordsModalOpen, setViewRecordsModalOpen] = useState<boolean>(false);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState<boolean>(false);
  const onViewRecords = (e) => {
    e.stopPropagation();
    setViewRecordsModalOpen(true);
  };

  const { height, width } = useWindowSize();

  return (
    <ReactCardFlip isFlipped={detailView} flipDirection="horizontal">
      <>
        <Paper
          className={classes.paper}
          elevation={0}
          onClick={props.onclickCard}
          onMouseOver={() => {
            setisHover(true);
          }}
          onMouseLeave={() => {
            setisHover(false);
          }}
          style={{
            backgroundColor: isHover ? theme.palette.primary.main : theme.palette.secondary.main,
            height: height - height * (60 / 100) - 60,
            width: (width - (20 / 100) * width) / 4,
          }}
        >
          {!isHover ? (
            <>
              <div style={{ height: "20%" }}>
                <TopCardAction
                  onClickInfo={(e) => {
                    e.stopPropagation();
                    setDetailView(false);
                  }}
                  onClickButton={(e) => {
                    e.stopPropagation();
                    props.quickAction();
                  }}
                  infoOnly
                  isHover={isHover}
                  tooltipTitle="Quick View For Medical Records"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "80%",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  marginBottom: 5,
                  backgroundColor: isHover ? theme.palette.primary.main : theme.palette.secondary.main,
                }}
              >
                <div style={{ height: "60%", width: "100%" }}>
                  <img src={props.item.src} width={"100%"} height={"100%"} />
                </div>

                <Typography className={classes.title}>{props.item.title}</Typography>
              </div>
            </>
          ) : (
            <>
              <div style={{ height: "20%" }}>
                <TopCardAction
                  onClickInfo={(e) => {
                    e.stopPropagation();
                    setDetailView(true);
                  }}
                  onClickButton={(e) => {
                    e.stopPropagation();
                    props.quickAction();
                  }}
                  infoOnly
                  isHover={isHover}
                  tooltipTitle="Quick View For Medical Records"
                />
              </div>
              <div
                style={{
                  height: "80%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5%",
                }}
              >
                <UIPrimaryButton
                  style={{
                    border: isHover ? "1px solid white" : `1px solid ${theme.palette.primary.main}`,
                    color: isHover ? "white" : theme.palette.primary.main,
                  }}
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAttachmentsModalOpen(true);
                  }}
                >
                  Add Records
                </UIPrimaryButton>
                <UIPrimaryButton
                  style={{
                    border: isHover ? "1px solid white" : `1px solid ${theme.palette.primary.main}`,
                    color: isHover ? "white" : theme.palette.primary.main,
                  }}
                  variant="outlined"
                  onClick={(e) => {
                    onViewRecords(e);
                  }}
                >
                  View Records
                </UIPrimaryButton>
              </div>
            </>
          )}
        </Paper>
      </>
      <>
        <Paper
          className={classes.paper}
          elevation={0}
          onClick={props.onclickCard}
          onMouseOver={() => {
            setisHover(true);
          }}
          onMouseLeave={() => {
            setisHover(false);
          }}
          style={{
            backgroundColor: isHover ? theme.palette.primary.main : theme.palette.secondary.main,
            height: height - height * (60 / 100) - 60,
            width: (width - (20 / 100) * width) / 4,
          }}
        >
          <TopCardAction
            onClickInfo={(e) => {
              e.stopPropagation();
              setDetailView(false);
            }}
            onClickButton={(e) => {
              e.stopPropagation();
              props.quickAction();
            }}
            infoOnly
            isHover={isHover}
            tooltipTitle="Quick View For Medical Records"
          />
          <div
            style={{
              display: "flex",
              height: "80%",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 5,
              padding: 10,
            }}
          >
            <Typography style={{ fontSize: 20, color: isHover && "white" }}>{props.cardDescription}</Typography>
          </div>
        </Paper>
        <ViewRecords isOpen={viewRecordsModalOpen} onClose={() => setViewRecordsModalOpen(false)} />
        <AddMedicalRecordModal
          isOPen={attachmentsModalOpen}
          onClose={() => {
            setAttachmentsModalOpen(false);
          }}
        />
      </>
    </ReactCardFlip>
  );
};

export default RecordCard;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      height: "308px",
      width: "335px",
      // display: "flex",
      // justifyContent: "space-evenly",
      alignItems: "center",
      marginBottom: "2%",
      // borderRadius: "5%",
      // flexDirection: "column",
      padding: "1%",
      cursor: "pointer",
      backgroundColor: theme.palette.secondary.main,
    },
    title: {
      // fontWeight: "bold",
    },
  })
);
