import { gql } from "@apollo/client";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import {
  UIButtonGroup,
  UIModel,
  UIPrimaryButton,
  UIToggleButton,
  useErrorNotification,
  useSnackbar,
} from "@gogocode-package/ui-web";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import CalendarPicker from "@mui/lab/CalendarPicker";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import { Button, Divider, Grid, Paper, TextField, ToggleButtonGroup, Typography, useTheme } from "@mui/material";
import { GetMasterData, MasterData } from "@src/components/consumer/membership/Family/GetMasterData";
import { MemberType, SelectMemberOfPatient } from "@src/components/consumer/membership/Family/SelectMemberOfPatient";
import { FETCH_COMMUNICATION_REQUESTS } from "@src/pages/consumer/communication_request";
import React, { useState } from "react";
const relationshipOptions = ["Self", "Spouse", "Children", "Other"];

const FirstPanel2 = () => {
  const [member, setMember] = useState<MemberType>(null);
  const [insurance, setInsurance] = useState<MasterData>(null);

  return (
    <Paper
      elevation={0}
      style={{ width: "90%", display: "flex", flexDirection: "column", justifyContent: "space-evenly", padding: 10 }}
    >
      <div style={{ textAlign: "left", alignSelf: "center", width: "100%" }}>
        <Typography>Member Name *</Typography>
        {/* <TextField
          size="small"
          label="Member Name"
          InputProps={{ disableUnderline: true }}
          style={{ width: "100%", marginTop: 10 }}
        /> */}
        <SelectMemberOfPatient member={member} onChangeMember={(member) => setMember(member)} />
      </div>
      {/* <div style={{ marginTop: 20, textAlign: "left", alignSelf: "center" }}>
        <Typography>Relationship *</Typography>
        <TextField
          size="small"
          defaultValue={"Self"}
          select
          style={{ width: "100%", marginTop: 10 }}
        >
          {relationshipOptions.map((val, idx) => (
            <MenuItem key={idx} value={val}>
              {val}
            </MenuItem>
          ))}
        </TextField>
      </div> */}
      <div style={{ marginTop: 20, textAlign: "left", alignSelf: "center", width: "100%" }}>
        <Typography>Insurance *</Typography>
        <GetMasterData
          type={GoGQL.MasterType.Insurance}
          onChangeValue={(value) => setInsurance(value)}
          selectedValue={insurance}
        />
      </div>

      <div style={{ width: "100%" }}>
        <Typography textAlign="left" style={{ marginTop: 20 }}>
          What you need to tell doctor?{" "}
        </Typography>
        <TextField
          placeholder="Type your message..."
          multiline
          rows={8}
          style={{ marginBottom: 30, marginTop: 20, width: "100%" }}
        />
      </div>
    </Paper>
  );
};

const CREATE_COMMUNICATION_REQUEST = gql`
  mutation create_doctor_communication_request($input: DoctorRequestInput!) {
    create_doctor_communication_request(input: $input)
  }
`;

const GET_DOCTOR = gql`
  query search_by_id($npi_id: String!) {
    search_by_id(npi_id: $npi_id) {
      provider_data {
        id
      }
    }
  }
`;

export default function AppointmentDetails(props: { providerId: string }) {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const [isOpen, setIsOpen] = useState(false);
  const [member, setMember] = useState<MemberType>(null);
  const [notes, setNotes] = useState<string>("");
  const [insurance, setInsurance] = useState<MasterData>(null);
  const [date, setDate] = useState(new Date());
  const [value, setValue] = useState(0);
  const [alignment, setAlignment] = useState("");
  const steps = ["Date", "Time", "Details", "Preview"];
  const steps2 = ["Patient Details", "Description", "Preview"];
  const booleanList = [
    { value: "yes", label: "YES" },
    { value: "no", label: "NO" },
  ];
  const appointmentList = [
    { value: "voice", label: "VOICE" },
    { value: "video", label: "VIDEO" },
    { value: "office", label: "OFFICE" },
  ];
  const appointmentTiming = ["4:30 pm", "5:30 pm", "7:30 pm", "9:30 pm", "12:30 pm", "3:30 am"];

  const handle = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // const getDoctorInfoResponse = GoGQL.useSearch_By_IdQuery(GET_DOCTOR, {
  //   variables: {
  //     npi_id: props?.providerId,
  //   },
  // });
  //const Togglebutton = withStyles({
  //  root: {
  //    "&$selected": {
  //      backgroundColor: theme.palette.primary.main,
  //      color: "white",
  //      fontWeight: "bold",
  //    },
  //    "&$selected:hover": {
  //      backgroundColor: theme.palette.primary.main,
  //      color: "white",
  //      fontWeight: "bold",
  //    },
  //    color: "black",
  //    fontWeight: "bold",
  //    outlineColor: theme.palette.primary.main,
  //    outlineWidth: "1px",
  //    outlineStyle: "solid",
  //  },
  //  selected: {},
  //})(ToggleButton);

  const FirstPanel = () => {
    return (
      <Grid style={{ display: "flex" }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CalendarPicker date={date} onChange={(newDate) => setDate(newDate)} />
        </LocalizationProvider>
      </Grid>
    );
  };
  const SecondPanel = () => {
    return (
      <Grid>
        <ToggleButtonGroup
          color="primary"
          value={alignment}
          exclusive
          onChange={handle}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10%",
            alignItems: "center",
            justifyContent: "center",
            rowGap: 20,
          }}
        >
          {appointmentTiming.map((item) => {
            return (
              <UIToggleButton value={item} style={{ width: "40%" }} key={item}>
                {item}
              </UIToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Grid>
    );
  };
  const SecondPanel2 = () => {
    return (
      <Paper elevation={0} style={{ padding: 30 }}>
        <Typography textAlign="left" style={{ marginTop: 20 }}>
          What you need to tell doctor?{" "}
        </Typography>
        <TextField placeholder="Type your message..." multiline rows={8} style={{ marginBottom: 30, marginTop: 20 }} />
      </Paper>
    );
  };
  const ThirdPanel = () => {
    return (
      <>
        <div style={{ width: "80%", textAlign: "left", alignSelf: "center" }}>
          <Typography style={{ fontSize: "1vw" }}>Name *</Typography>
          <TextField variant="filled" InputProps={{ disableUnderline: true }} />
        </div>
        <UIButtonGroup
          label="Have you visited this doctor before"
          value={"JHJH"}
          onChangeValue={(val) => console.log(val)}
          buttonList={booleanList}
          centerAlignLabel
        />
        <UIButtonGroup
          label="Choose the type of appointment"
          value={"JHJH"}
          onChangeValue={(val) => console.log(val)}
          buttonList={appointmentList}
          centerAlignLabel
        />
      </>
    );
  };
  const ThirdPanel2 = () => {
    return (
      <Paper elevation={0} style={{ padding: 30 }}>
        <div style={{ textAlign: "left" }}>
          <Typography>Member Name *</Typography>
          <TextField
            size="small"
            disabled={true}
            label="Arunachalam"
            style={{ width: "100%", marginTop: 10 }}
            InputProps={{ disableUnderline: true }}
          />
        </div>
        <div style={{ marginTop: 20, textAlign: "left" }}>
          <Typography>Relationship *</Typography>
          <TextField
            size="small"
            InputProps={{ disableUnderline: true }}
            style={{ width: "100%", marginTop: 10 }}
            label="Self"
            disabled={true}
          />
        </div>
        <div style={{ marginTop: 20, textAlign: "left", alignSelf: "center" }}>
          <Typography>Insurance *</Typography>
          <TextField
            size="small"
            InputProps={{ disableUnderline: true }}
            style={{ width: "100%", marginTop: 10 }}
            label="Aetna"
            disabled={true}
          />
        </div>
        <div style={{ marginTop: 20, textAlign: "left", alignSelf: "center" }}>
          <Typography>What you need to tell doctor?</Typography>
          <TextField
            placeholder="I Am Suffering From Fever For Past One Week"
            multiline
            rows={4}
            style={{ marginBottom: 10, marginTop: 4, width: "100%" }}
            disabled={true}
          />
        </div>
      </Paper>
    );
  };
  const FourthPanel = () => {
    return (
      <>
        <Typography>What you need to tell doctor?</Typography>

        <TextField
          multiline
          variant="filled"
          InputProps={{ disableUnderline: true }}
          rows={6}
          placeholder={"I have ..."}
          maxRows={6}
          style={{ margin: "0% 10%" }}
        />
      </>
    );
  };

  const [Request, Response] = GoGQL.useCreate_Doctor_Communication_RequestMutation(CREATE_COMMUNICATION_REQUEST, {
    refetchQueries: [
      {
        query: FETCH_COMMUNICATION_REQUESTS,
        variables: {
          searchInput: {
            limit: 5,
            page_no: 0,
            status: null,
            // name: searchText,
          },
        },
      },
    ],
  });

  useErrorNotification([Response?.error]);

  /* eslint-disable */
  const panel = [<FirstPanel />, <SecondPanel />, <ThirdPanel />, <FourthPanel />];
  const panel2 = [<FirstPanel2 />, <SecondPanel2 />, <ThirdPanel2 />];

  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = completed;
    newCompleted[activeStep] = true;
    setCompleted(newCompleted);
    handleNext();
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const validateInput = (input) => {
    console.log("validation", input);
    for (const property in input) {
      if (property == "patient_id" || property == "notes") continue;
      if (input[property] == "" || !input[property]) return false;
    }
    return true;
  };
  const clearState = () => {
    // clearDoctor();
    // setState({ doctarName: "", insurance: null, member: null, notes: "" });
    setNotes("");
    setMember(null);
    setInsurance(null);
  };

  const formSubmit = () => {
    const input = {
      request_date: new Date(),
      member_id: Number(member.id),
      payer_id: Number(insurance.value),
      provider_id: Number(props?.providerId),
      notes: notes || "",
    };

    if (validateInput(input)) {
      Request({
        variables: {
          input,
        },
      });
      if (!Response.error) {
        enqueueSnackbar("Eligibility Request sent successfully", { variant: "success" });
        clearState();
      } else if (member.id == null) {
        enqueueSnackbar("Please enter member name", {
          variant: "error",
        });
      }
    } else {
      enqueueSnackbar("Please fill all Fields", {
        variant: "error",
      });
    }
  };

  return (
    // This below Paper is for user1
    // <Paper
    //   style={{
    //     backgroundColor: theme.palette.secondary.main,
    //     width: "80%",
    //     borderRadius: 20,
    //     height: "80%",
    //     marginLeft: "10%",
    //     display: "flex",
    //     flexDirection: "column",
    //     textAlign: "center",
    //     justifyContent: "space-evenly",
    //     alignItems: "center",
    //   }}
    // >
    //   <Stepper nonLinear activeStep={activeStep}>
    //     {steps.map((label, index) => (
    //       <Step key={label} completed={completed[index]} expanded={false}>
    //         <StepButton color="inherit" onClick={handleStep(index)}>
    //           {label}
    //         </StepButton>
    //       </Step>
    //     ))}
    //   </Stepper>
    //   <Typography variant="h5" style={{ fontWeight: "bold" }}>
    //     Select Available Date
    //   </Typography>
    //   <Grid
    //     style={{
    //       marginTop: "10%",
    //       backgroundColor: "white",
    //       width: "90%",
    //       // height: "60%",
    //       display: "flex",
    //       flexDirection: "column",
    //       justifyContent: "space-evenly",
    //       borderRadius: 10,
    //     }}
    //   >
    //     {panel[activeStep]}
    //   </Grid>
    // <Grid style={{ display: "flex", width: "60%", justifyContent: "space-evenly" }}>
    //   {activeStep != 0 && (
    //     <Button variant="outlined" onClick={handleBack}>
    //       Back
    //     </Button>
    //   )}
    //   <UIPrimaryButton style={{ width: "50%" }} onClick={handleNext}>
    //     Next
    //   </UIPrimaryButton>
    // </Grid>
    // </Paper>

    // This below Paper is for user2

    <div style={{ justifyContent: "center", width: "100%", padding: 10, display: "flex", overflowY: "scroll" }}>
      <Paper
        style={{
          backgroundColor: theme.palette.secondary.main,
          width: "90%",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          alignItems: "center",
          overflowY: "scroll",
        }}
      >
        <Typography style={{ margin: 0, fontSize: 24 }}>Eligibility Request</Typography>
        <>
          <Paper
            elevation={0}
            style={{
              width: "90%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              padding: 10,
            }}
          >
            <div style={{ textAlign: "left", alignSelf: "center", width: "100%" }}>
              <Typography>Member Name *</Typography>
              <SelectMemberOfPatient member={member} onChangeMember={(member) => setMember(member)} />
            </div>
            <div style={{ marginTop: 20, textAlign: "left", alignSelf: "center", width: "100%" }}>
              <Typography>Insurance *</Typography>
              <GetMasterData
                type={GoGQL.MasterType.Insurance}
                onChangeValue={(value) => setInsurance(value)}
                selectedValue={insurance}
              />
            </div>

            <div style={{ width: "100%" }}>
              <Typography textAlign="left" style={{ marginTop: 20 }}>
                What you need to tell doctor?{" "}
              </Typography>
              <TextField
                placeholder="Type your message..."
                multiline
                rows={8}
                style={{ marginBottom: 30, marginTop: 20, width: "100%" }}
                value={notes}
                onChange={(val) => setNotes(val.target.value)}
              />
            </div>
          </Paper>
        </>
        <Grid style={{ display: "flex", width: "60%", justifyContent: "space-evenly" }}>
          <UIPrimaryButton style={{ width: "50%" }} onClick={formSubmit}>
            Submit
          </UIPrimaryButton>
        </Grid>
      </Paper>
      <UIModel onClose={handleCloseModal} isOpen={isOpen}>
        <Typography style={{ fontSize: 24, fontWeight: 500, textAlign: "center" }}>Eligibility Request Sent</Typography>
        <Divider style={{ margin: "20px 0" }} />
        <img src="/doc2.png" style={{ height: "80%", width: "30%", display: "block", margin: "0 auto" }} />
        <Typography style={{ textAlign: "center", fontSize: 22, margin: "10px 0" }}>Dr. Kosaksi pasapugal</Typography>
        <Typography textAlign="center">
          View the status of the request to this doctor in eligibility request page.
        </Typography>
        <Button variant="contained" style={{ width: "25%", display: "block", margin: "20px auto 0" }}>
          Done
        </Button>
      </UIModel>
    </div>
  );
}
