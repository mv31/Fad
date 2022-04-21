// import {
//   ProviderTraining,
//   ProviderTrainingType,
//   useUpdate_Doctor_Membership_Info_TrainingMutation,
//   useView_Doctor_Membership_InfoQuery,
//   ViewDoctorIncludesEnum,
// } from "@gogocode-package/graphql_code_generator";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Button, Grid, Paper, Theme, Typography, useTheme } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { makeStyles } from "@mui/styles";
import { gql } from "@apollo/client";
import _ from "lodash";
import { generateLocation } from "@src/utils";
import React, { useEffect, useState } from "react";
import Hospital from "./Hospital";
import TrainingModel, { UPDATE_DOCTOR_MEMBERSHIP_INFO_TRAINING } from "./TrainingModel";
import { PENDING_STATUS_TEXT } from "@src/../../Constants";
import { GetUpdateStatus, GET_UPDATE_STATUS } from "../GetUpdateStatus";
import ConfirmationPrompt from "@src/components/ConfirmationPrompt";

type ChildProps = {
  children: React.ReactNode;
};

type TrainingChildCardProps = {
  onEdit: () => void;
  onDelete: (id: string) => void;
  data: GoGQL.ProviderTraining;
};
//const ChildCard = (props) => {
//  return (
//    <div
//      style={{
//        border: `1px solid ${theme.palette.primary.main}`,
//        display: "flex",
//        justifyContent: "space-between",
//        margin: "1%",
//        borderRadius: 5,
//        backgroundColor: "fff",
//      }}
//    >
//      {props.children}
//    </div>
//  );
//};

const TrainingChildCard = (props: TrainingChildCardProps) => {
  const styles = useStyles();
  const textColor = "rgba(115, 115, 115, 1)";
  const location = generateLocation(props?.data?.city, props?.data?.state, props?.data?.country);
  console.log("TrainingsChild", props?.data);
  return (
    <div
      style={{
        border: "1px solid #E0E0E0",
        display: "flex",
        justifyContent: "space-between",
        margin: "1%",
        borderRadius: 5,
        backgroundColor: "#ffff",
      }}
    >
      <div style={{ margin: "1%" }}>
        <Typography variant="subtitle1" fontSize={20}>
          {props?.data?.hospital}
        </Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography style={{ fontSize: 20 }}>{`${props.data?.year_from || "-"} - ${
            props.data?.year_to || "-"
          } , `}</Typography>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="inherit" color={textColor} fontSize={18}>
            {location}
          </Typography>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography style={{ fontWeight: 600, color: "#555", fontSize: 18 }}>Training Type : </Typography>
          <Typography variant="inherit" color={textColor} fontSize={18} ml={1}>
            {props?.data?.training_type || "-"}
          </Typography>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginRight: "2%", justifyContent: "space-between" }}>
        <IconButton color="primary" className={styles.iconDiv} onClick={props?.onEdit}>
          <EditRoundedIcon />
        </IconButton>

        <IconButton
          color="primary"
          className={styles.iconDiv}
          onClick={() => {
            props?.onDelete(props?.data?.id);
          }}
        >
          <DeleteOutlineRounded />
        </IconButton>
      </div>
    </div>
  );
};

export const FETCH_MEMBERSHIP_DETAILS = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      ProviderTrainings {
        id
        hospital
        year_from
        year_to
        city
        state
        country
        type
        training_type
      }
    }
  }
`;

const initialTrainingState = {
  [GoGQL.ProviderTrainingType?.Internship]: [],
  [GoGQL.ProviderTrainingType?.Residency]: [],
  [GoGQL.ProviderTrainingType?.Fellowship]: [],
};

const TrainingPractice = () => {
  const styles = useStyles();
  const theme = useTheme();
  const responses = GoGQL.useView_Doctor_Membership_InfoQuery(FETCH_MEMBERSHIP_DETAILS, {
    variables: {
      includes: [GoGQL.ViewDoctorIncludesEnum.Training],
    },
    fetchPolicy: "network-only",
  });
  const [type, setType] = useState<"Add" | "Edit">(null);
  const [trainingType, setTrainingType] = useState<GoGQL.ProviderTrainingType>(GoGQL.ProviderTrainingType.Internship);

  const [trainingState, setTrainingState] = useState(initialTrainingState);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [conformPromptOpen, setConformPromptOpen] = useState<boolean>(false);
  // useEffect(() => {
  //   console.log(hospitalAffiliations?.data);
  // }, [hospitalAffiliations]);
  useEffect(() => {
    if (responses?.data && responses?.data?.view_doctor_membership_info) {
      let existingTrainings = { ...initialTrainingState };
      responses?.data?.view_doctor_membership_info?.ProviderTrainings?.map((training) => {
        existingTrainings = {
          ...existingTrainings,
          [training?.type]: [...existingTrainings?.[training?.type], training],
        };
        console.log("training", training);
      });
      setTrainingState(existingTrainings);
    }
  }, [responses?.data]);
  const [TrainingRequest, TrainingResponse] = GoGQL.useUpdate_Doctor_Membership_Info_TrainingMutation(
    UPDATE_DOCTOR_MEMBERSHIP_INFO_TRAINING,
    {
      refetchQueries: [
        {
          query: FETCH_MEMBERSHIP_DETAILS,
          variables: {
            includes: [GoGQL.ViewDoctorIncludesEnum.Training],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Training,
          },
        },
      ],
    }
  );
  const onDeleteTraining = () => {
    // let trainings = responses?.data?.view_doctor_membership_info?.ProviderTrainings;
    // let updatedTrainings = trainings
    //   ?.filter((training) => training?.id != id)
    //   .map((training) => {
    //     return _.omit(training, ["__typename", "id"]);
    //   });
    setConformPromptOpen(false);
    TrainingRequest({
      variables: {
        input: _.omit(selectedTraining, ["__typename", "id"]),
        row_id: Number(selectedTraining?.id),
        operation: GoGQL.DbOperation.Delete,
      },
    });
  };
  return (
    <div style={{ justifyContent: "center", width: "92%" }}>
      <Paper className={styles.paper} style={{ margin: "5%" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
            Hospital Affiliations
          </Typography>
          <GetUpdateStatus
            pendingStatusText={PENDING_STATUS_TEXT}
            section={GoGQL.ViewDoctorIncludesEnum.HospitalAffliation}
          />
        </div>
        <Hospital />
      </Paper>

      <Paper className={styles.paper}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
            TRAINING
          </Typography>
          <GetUpdateStatus pendingStatusText={PENDING_STATUS_TEXT} section={GoGQL.ViewDoctorIncludesEnum.Training} />
        </div>
        <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
          Internship
        </Typography>
        {trainingState[GoGQL.ProviderTrainingType.Internship]?.map((data, index) => (
          <TrainingChildCard
            key={`key ${index}`}
            onEdit={() => {
              setSelectedTraining(data);
              setType("Edit");
              setTrainingType(GoGQL.ProviderTrainingType?.Internship);
            }}
            onDelete={() => {
              setSelectedTraining(data);
              setConformPromptOpen(true);
            }}
            data={data}
          />
        ))}
        {trainingState[GoGQL.ProviderTrainingType.Internship]?.length == 0 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography>No Internship Training is found</Typography>
          </div>
        )}
        <Grid mt={3} mb={3} justifyContent="center" textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setType("Add");
              setTrainingType(GoGQL.ProviderTrainingType?.Internship);
            }}
          >
            <AddIcon />
            ADD
          </Button>
        </Grid>
        <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
          Residency
        </Typography>
        {trainingState[GoGQL.ProviderTrainingType.Residency]?.map((data, index) => (
          <TrainingChildCard
            key={`key ${index}`}
            onEdit={() => {
              setType("Edit");
              setSelectedTraining(data);
              setTrainingType(GoGQL.ProviderTrainingType?.Residency);
            }}
            onDelete={() => {
              setSelectedTraining(data);
              setConformPromptOpen(true);
            }}
            data={data}
          />
        ))}
        {trainingState[GoGQL.ProviderTrainingType.Residency]?.length == 0 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography>No Residency Training is found</Typography>
          </div>
        )}
        <Grid mt={3} mb={3} justifyContent="center" textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setType("Add");
              setTrainingType(GoGQL.ProviderTrainingType?.Residency);
            }}
          >
            <AddIcon />
            ADD
          </Button>
        </Grid>
        <Typography variant="h5" color={theme.palette.primary.main} style={{ margin: "1%" }}>
          Fellowship
        </Typography>
        {trainingState[GoGQL.ProviderTrainingType.Fellowship]?.map((data, index) => (
          <TrainingChildCard
            key={`key ${index}`}
            onEdit={() => {
              setType("Edit");
              setSelectedTraining(data);
              setTrainingType(GoGQL.ProviderTrainingType?.Fellowship);
            }}
            data={data}
            onDelete={() => {
              setSelectedTraining(data);
              setConformPromptOpen(true);
            }}
          />
        ))}
        {trainingState[GoGQL.ProviderTrainingType.Fellowship]?.length == 0 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography>No Fellowship Training is found</Typography>
          </div>
        )}
        <Grid mt={3} mb={3} justifyContent="center" textAlign="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setType("Add");
              setTrainingType(GoGQL.ProviderTrainingType?.Fellowship);
            }}
          >
            <AddIcon />
            ADD
          </Button>
        </Grid>
      </Paper>
      <TrainingModel
        isOpen={type == "Add" || type == "Edit"}
        onClose={() => {
          setType(null);
          setTrainingType(null);
        }}
        type={type}
        trainingType={trainingType}
        editableTraining={selectedTraining}
        trainings={responses?.data?.view_doctor_membership_info?.ProviderTrainings}
      />
      <ConfirmationPrompt
        action={onDeleteTraining}
        isOpen={conformPromptOpen}
        onClose={() => {
          setSelectedTraining(null);
          setConformPromptOpen(false);
        }}
        message="Are You sure to delete this Training"
        title={"Conformation Prompt"}
        actionLoading={TrainingResponse?.loading}
      />
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  paper: {
    // elevation: 2,
    justifySelf: "center",
    margin: "5%",
    marginBottom: "2%",
    width: "100%",
    borderRadius: 5,
    border: "1px solid #E0E0E0",
  },
  iconDiv: {
    margin: "1%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    width: 40,
    height: 40,
    cursor: "pointer",
    //border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
  },
  paper2: {
    margin: "5%",
    justifySelf: "center",
    borderRadius: 5,
    border: "1px solid #E0E0E0",
    width: "90%",
  },
}));

export default TrainingPractice;
