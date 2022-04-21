import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import { Grid, Paper, Theme, Typography, useTheme } from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import { FeedbackModal } from "@src/components/doctor/profile/FeedbackModal";
import React, { useState } from "react";

const Endorsement = () => {
  const [FeedbackModalOpen, setFeedbackModalOpen] = useState<boolean>();
  const styles = useStyles();
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      style={{
        border: `2px solid ${theme.palette.primary.main}`,
        padding: 0,
        marginLeft: 100,
        marginRight: 100,
        width: "100%",
        //backgroundColor:"red"
      }}
    >
      <FeedbackModal
        isOpen={FeedbackModalOpen}
        onCloseClick={() => {
          setFeedbackModalOpen(false);
        }}
        onClickDone={() => {}}
      />
      <Typography ml={6} mt={3} mb={1} variant="h4" style={{ fontWeight: 600 }}>
        Skills & Endorsement
      </Typography>

      <Grid container>
        <Grid item>
          <AddCircleOutlineSharpIcon
            onClick={() => {
              setFeedbackModalOpen(true);
            }}
            className={styles.addIcon}
          />
        </Grid>
        <Grid item>
          <Grid container mt={1} display="flex">
            <Typography style={{ fontWeight: 600, fontSize: "14pt" }}>Healthcare</Typography>
            <Typography style={{ fontSize: "14pt" }}>&nbsp; &nbsp;.5</Typography>
            <PeopleRoundedIcon style={{ marginLeft: 1, color: "#6e6a6a" }} />
          </Grid>
          <Typography style={{ marginTop: 5 }}>Endored By Dr.Saran</Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item>
          <CheckCircleIcon
            style={{
              color: theme.palette.primary.main,
              fontSize: 60,
              fontWeight: 600,
              marginRight: 10,
              marginLeft: 40,
              marginTop: 6,
            }}
          />
        </Grid>
        <Grid item>
          <Grid container mt={1} display="flex">
            <Typography mt={1} style={{ fontWeight: 600, fontSize: "14pt" }}>
              Public Speaking
            </Typography>
            <Typography style={{ fontSize: "14pt" }}>&nbsp; &nbsp;.5</Typography>
            <PeopleRoundedIcon style={{ marginLeft: 1, color: "#6e6a6a" }} />
          </Grid>
          <Typography style={{ marginTop: 5 }}>Endored By Dr.Saran</Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item>
          <AddCircleOutlineSharpIcon
            onClick={() => {
              setFeedbackModalOpen(true);
            }}
            className={styles.addIcon}
          />
        </Grid>
        <Grid item>
          <Grid container mt={1} display="flex">
            <Typography mt={1} style={{ fontWeight: 600, fontSize: "14pt" }}>
              Team Leadership
            </Typography>
            <Typography style={{ fontSize: "14pt" }}>&nbsp; &nbsp;.4</Typography>
            <PeopleRoundedIcon style={{ marginLeft: 1, color: "#6e6a6a" }} />
          </Grid>
          <Typography style={{ marginTop: 5 }}>Endored By Dr.Saran</Typography>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item>
          <AddCircleOutlineSharpIcon
            onClick={() => {
              setFeedbackModalOpen(true);
            }}
            className={styles.addIcon}
          />
        </Grid>
        <Grid item>
          <Grid container mt={1} display="flex">
            <Typography mt={1} style={{ fontWeight: 600, fontSize: "14pt" }}>
              Team Leadership
            </Typography>
            <Typography style={{ fontSize: "14pt" }}>&nbsp; &nbsp;.4</Typography>
            <PeopleRoundedIcon style={{ marginLeft: 1, color: "#6e6a6a" }} />
          </Grid>
          <Typography mb={2} style={{ marginTop: 5 }}>
            Endored By Dr.Saran
          </Typography>
        </Grid>
        <Grid
          item
          xs={6}
          justifyContent="flex-end"
          style={{ color: theme.palette.primary.main, marginLeft: "88%", marginBottom: "7%" }}
        >
          <AddCircleIcon style={{ fontSize: 70, fontWeight: 600, cursor: "pointer" }} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default Endorsement;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    addIcon: {
      color: theme.palette.primary.main,
      fontSize: 60,
      fontWeight: 600,
      marginRight: 10,
      marginLeft: 40,
      marginTop: 6,
      cursor: "pointer",
    },
  })
);
