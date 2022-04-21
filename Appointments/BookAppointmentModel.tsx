import { gql } from "@apollo/client";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { CalendarPicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import {
  Avatar,
  Card,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { UILoader, UIModel, UIPrimaryButton } from "@src/../../packages/ui/src";
import { FETCH_COMMUNICATION_REQUESTS } from "@src/pages/consumer/communication_request";
import { emptyCheck, formattedAddress } from "@src/utils";
import moment from "moment";
import { useSnackbar } from "notistack";
import React, { CSSProperties, useEffect, useState } from "react";
import { UPDATE_MEMBER } from "../membership/Family/AddModel";
import MobileNumberPromptModel from "../../MobileNumberPromptModel";
import BookingCalendar from "./BookingCalendar";
import BrowseRecordsModal from "./BrowseRecordsModal";

type Props = {
  isOpen: boolean;
  onClose: (isBooked: boolean) => void;
  selectedRequest: any;
};

type MemberProps = { member_name: string; type: GoGQL.RelationShip; patient_id?: number; member_id: string };

export const FETCH_MEMBERS = gql`
  query {
    member_autocomplete {
      id
      member_full_name
      member_type
      patient_id
    }
  }
`;

export const CREATE_APPOINTMENT_REQUEST = gql`
  mutation create_appointment_request($input: AppointmentRequestInput!) {
    create_appointment_request(input: $input) {
      id
    }
  }
`;

const AppointmentType = [
  GoGQL.AppointmentServices.Telehealth,
  GoGQL.AppointmentServices.Office,
  // GoGQL.AppointmentServices.Phone,
  // GoGQL.AppointmentServices.Email,
  // GoGQL.AppointmentServices.Chat,
];

const getTimeSLot = (from: string, to: string) => {
  return `${moment(from).format("hh:mm a")} - ${moment(to).format("hh:mm a")}`;
};
export const DoctorCard = (props: {
  doctor?: GoGQL.Provider;
  consumer?: GoGQL.Patient;
  containerStyle?: CSSProperties;
}) => {
  const theme = useTheme();
  const classes = useStyles();
  const practiceAddress = props?.doctor?.ProviderAddresses?.filter((address) => address?.type == "Practice")[0];
  const address = formattedAddress({
    firstLineAddress: practiceAddress?.address_line1,
    secondLineAddress: practiceAddress?.address_line2,
    city: practiceAddress?.city,
    postalCode: practiceAddress?.postal_code,
    state: practiceAddress?.state,
  });

  const Specialty = props?.doctor?.ProviderSpecialties?.map((e) => e.Taxonomy?.specialty).join(" | ");
  return (
    <Paper
      style={{
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 10,
        height: 100,
        alignItems: "center",
        display: "flex",
        ...props?.containerStyle,
      }}
      elevation={5}
    >
      <Grid container style={{ alignItems: "center" }} gap="1%" columnGap={3}>
        <Grid xs={12} sm={4} lg={2} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Avatar sx={{ height: "70px", width: "70px" }} src={props?.doctor?.User?.profile_picture} />
        </Grid>
        <Grid item xs={12} lg={9} sm={7} style={{}}>
          <Tooltip title={`Dr. ${props?.doctor?.User?.name}`}>
            <Typography className={classes.textPrimary}>{`Dr. ${props?.doctor?.User?.name}`}</Typography>
          </Tooltip>
          <Tooltip title={Specialty} placement="bottom">
            <Typography className={classes.textSecondary}>{Specialty}</Typography>
          </Tooltip>
          <Grid style={{ display: "flex", marginTop: 10 }}>
            {/* {address?.trim() != "" && <MapsHomeWorkOutlinedIcon style={{ color: "lightblue" }} />} */}
            <Typography style={{}} className={classes.textAddress}>
              {address}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export const ConsumerCard = (props: {
  member?: MemberProps;
  patient?: { patient_id?: string | number; patient_name?: string; patient_profile?: string };
  containerStyle?: CSSProperties;
}) => {
  const theme = useTheme();
  const { member, patient } = props;
  const classes = useStyles();
  const fetchMembersResponse = GoGQL.useMember_AutocompleteQuery(FETCH_MEMBERS);
  // const [member, setMember] = useState<{ member_name: string; type: GoGQL.RelationShip; patient_id: number }>(null);
  return (
    <Paper
      style={{
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 10,
        height: 100,
        alignItems: "center",
        display: "flex",
        ...props?.containerStyle,
      }}
      elevation={5}
    >
      {/* <div style={{ justifyContent: "center", alignItems: "center", margin: "3%" }}>
        <div>
          <Typography>{patient?.patient_name}</Typography>
          <br />
        </div>
        <div>
          <Typography>{`${member?.member_name}(${member?.type})`}</Typography>
        </div>
      </div> */}
      <Grid container style={{ alignItems: "center" }} gap="1%" columnGap={3}>
        <Grid xs={12} sm={4} lg={2} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Avatar sx={{ height: "70px", width: "70px" }} src={props?.patient?.patient_profile} />
        </Grid>
        <Grid item xs={12} sm={7} lg={9} style={{}}>
          {/* <Tooltip title={`${props?.patient?.patient_name}`}> */}
          <Typography className={classes.textPrimary}>{`${member?.member_name}`}</Typography>
          {/* </Tooltip> */}
          {/* <Tooltip title={`${props?.patient?.patient_name}`}>
            <Typography style={{ marginTop: "2%" }}>{`${
              patient?.patient_name == null ? "" : patient?.patient_name
          <Tooltip title={`${props?.patient?.patient_name}`}>
            <Typography style={{ marginTop: "2%" }}>{`${patient?.patient_name == null ? "" : patient?.patient_name} ${
              member?.type == null ? "" : `(${member?.type})`
            }`}</Typography>
          </Tooltip> */}
        </Grid>
      </Grid>
    </Paper>
  );
};

const BookAppointmentModel = (props: Props) => {
  const [dateValue, setDateValue] = React.useState<Date | null>(new Date());
  const { enqueueSnackbar } = useSnackbar();
  const [member, setMember] = useState<{
    member_name: string;
    type: GoGQL.RelationShip;
    patient_id: number;
    member_id: string;
  }>(null);
  const [appointmentType, setAppointmentType] = useState<GoGQL.AppointmentServices>(
    props?.selectedRequest?.Provider?.ProviderAppointmentServices[0]?.service_type
  );
  const [visitedDoctor, setVisitedDoctor] = useState<string>("no");
  const [timeSlots, setTimeSlots] = useState(null);
  const [notes, setNotes] = useState<string>("");
  const [recordIds, setRecordIds] = useState<number[]>([]);
  const [browseRecordsModalOpen, setBrowseRecordsModalOpen] = useState<boolean>(false);
  const [mobilePromptOpen, setMobilePromptOpen] = useState<boolean>(false);
  const [createAppointmentRequest, createAppointmentResponse] =
    GoGQL.useCreate_Appointment_RequestMutation(CREATE_APPOINTMENT_REQUEST);
  const [updateMemberRequest, updateMemberResponse] = GoGQL.useUpdate_MemberMutation(UPDATE_MEMBER, {
    refetchQueries: [
      {
        query: FETCH_COMMUNICATION_REQUESTS,
        variables: {
          searchInput: {
            limit: 5,
            page_no: 0,
            status: null,
          },
        },
      },
    ],
  });

  const onBrowseSave = (ids) => {
    setRecordIds(ids);
  };

  const isValid = () => {
    const error_msg = emptyCheck([
      { name: "Time Slots", value: timeSlots },
      { name: " Appointment Type", value: appointmentType },
    ]);
    if (error_msg.length >= 4) {
      enqueueSnackbar("Required Fields should not be empty", { variant: "error" });

      return false;
    } else if (error_msg.length > 0) {
      error_msg.map((error) => {
        enqueueSnackbar(error, { variant: "error" });
        return false;
      });
    } else {
      return true;
    }
  };

  const isvalidAppointmentType = () => {
    if (appointmentType == GoGQL.AppointmentServices.Phone) {
      if (!props?.selectedRequest?.PatientMember?.mobile && !updateMemberResponse?.data?.update_member?.mobile) {
        enqueueSnackbar("Please update mobile number", { variant: "error" });
        setMobilePromptOpen(true);
      } else {
        sendRequest();
      }
    } else {
      sendRequest();
    }
  };

  const onMobileSave = (mobile) => {
    updateMemberRequest({
      variables: {
        input: {
          member_full_name: props?.selectedRequest?.PatientMember?.member_full_name,
          member_type: props?.selectedRequest?.PatientMember?.member_type,
          mobile,
        },
        id: Number(props?.selectedRequest?.PatientMember?.id),
      },
    });
  };

  useEffect(() => {
    if (updateMemberResponse?.data) {
      enqueueSnackbar("Mobile Number Updated", { variant: "success" });
      setMobilePromptOpen(false);
    }
  }, [updateMemberResponse?.data]);

  const onSend = () => {
    if (isValid()) {
      isvalidAppointmentType();
    }
  };

  const sendRequest = () => {
    createAppointmentRequest({
      variables: {
        input: {
          from: moment(
            moment(dateValue).format("YYYY-MM-DD") + " " + moment(timeSlots.split("-")[0], "hh:mm a").format("HH:mm")
          ).toDate(),
          member_id: Number(props?.selectedRequest?.PatientMember?.id),
          provider_id: Number(props?.selectedRequest?.Provider?.id),
          is_first_time_visit: true,
          notes,
          service: appointmentType,
          record_ids: recordIds,
        },
      },
    });
  };

  useEffect(() => {
    if (createAppointmentResponse.data && createAppointmentResponse.data?.create_appointment_request) {
      enqueueSnackbar("Appointment request sent", { variant: "success" });
      props?.onClose(true);
    }
  }, [createAppointmentResponse.data]);

  useEffect(() => {
    if (createAppointmentResponse.error && createAppointmentResponse.error?.message) {
      enqueueSnackbar("Failed to book appointment", { variant: "error" });
      props?.onClose(true);
    }
  }, [createAppointmentResponse.error]);

  return (
    <UIModel
      isOpen={props?.isOpen}
      onClose={() => props?.onClose(false)}
      maxWidth="lg"
      title="Book Appointment"
      titleStyle={{ fontSize: 25 }}
      action={
        <UIPrimaryButton loading={createAppointmentResponse?.loading} onClick={onSend}>
          Book Appointment
        </UIPrimaryButton>
      }
    >
      <Card
        style={{
          padding: "2%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          // height: "40vw",
          // overflowY: "auto",
        }}
      >
        {/* Doctor Name Section */}
        <div style={{ display: "flex", columnGap: "2%", width: "100%", justifyContent: "space-between" }}>
          <div style={{ width: "100%", height: 100 }}>
            {/* <TextField
              fullWidth
              id="doctor-name"
              value={`Dr. ${props?.selectedRequest?.Provider?.User?.name}`}
              disabled
            /> */}
            <DoctorCard doctor={props?.selectedRequest?.Provider} />
          </div>
          <div style={{ width: "100%", height: 100 }}>
            <ConsumerCard
              patient={{
                // patient_id: props?.selectedRequest?.Patient?.id,
                // patient_name: props?.selectedRequest?.Patient?.User?.name,
                patient_profile: props?.selectedRequest?.Patient?.User?.profile_picture,
              }}
              member={{
                member_id: props?.selectedRequest?.PatientMember?.id,
                member_name: props?.selectedRequest?.PatientMember?.member_full_name,
                patient_id: props?.selectedRequest?.patient_id,
                type: props?.selectedRequest?.PatientMember?.member_type,
              }}
            />
          </div>
        </div>
        {/* Date Section */}
        <div style={{ marginTop: "2%" }}>
          <BookingCalendar
            member_id={member?.member_id}
            provider_id={props?.selectedRequest?.Provider?.id}
            setDate={setDateValue}
            setTimeSlots={setTimeSlots}
            disableLabels
          />
        </div>
        <div style={{ display: "flex", marginTop: "2%" }}>
          {/* Doctor Visit */}
          {/* <div style={{ flexBasis: "48%" }}>
            <Typography>Have you visited this doctor before ?</Typography>
            <div style={{ display: "flex", columnGap: "1%", marginTop: "1%", justifyContent: "flex-start" }}>
              <UIPrimaryButton
                variant={visitedDoctor == "yes" ? "contained" : "outlined"}
                value="yes"
                onClick={() => {
                  setVisitedDoctor("yes");
                }}
              >
                {"YES"}
              </UIPrimaryButton>
              <UIPrimaryButton
                variant={visitedDoctor == "no" ? "contained" : "outlined"}
                value="no"
                onClick={() => {
                  setVisitedDoctor("no");
                }}
              >
                {"NO"}
              </UIPrimaryButton>
            </div>
          </div> */}
          {/* Records */}
          <div style={{ flexBasis: "48%" }}>
            <Typography>Do you want to share any records?</Typography>
            <div style={{ marginTop: "2%", display: "flex", gap: "2%", alignItems: "center" }}>
              <UIPrimaryButton
                onClick={() => {
                  setBrowseRecordsModalOpen(true);
                }}
              >
                Share Records
              </UIPrimaryButton>
              <Typography>{recordIds.length} Record(s) Selected</Typography>
            </div>
          </div>
          <Divider orientation="vertical" flexItem style={{ flexBasis: "2%" }} />
          {/* Type of Appointment */}
          <div style={{ flexBasis: "48%", marginLeft: "3%" }}>
            <Typography>Choose the type of appointment*</Typography>
            <div style={{ display: "flex", columnGap: "1%", marginTop: "1%", justifyContent: "flex-start" }}>
              {props?.selectedRequest?.Provider?.ProviderAppointmentServices.map((service, i) => (
                <UIPrimaryButton
                  key={i}
                  variant={appointmentType == service?.service_type ? "contained" : "outlined"}
                  value={service?.service_type}
                  onClick={() => {
                    console.log("service_type", service?.service_type);
                    setAppointmentType(service?.service_type);
                  }}
                >
                  {service?.service_type}
                </UIPrimaryButton>
              ))}
            </div>
          </div>
        </div>
        {/* Notes Section */}
        <div style={{ marginTop: "1%" }}>
          <Typography>Reason for Appointment</Typography>
          <TextField
            fullWidth
            id="notes"
            minRows={2}
            placeholder="I have ...."
            multiline
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </Card>
      <BrowseRecordsModal
        isOpen={browseRecordsModalOpen}
        onClose={() => {
          setBrowseRecordsModalOpen(false);
        }}
        onSave={onBrowseSave}
        memberId={props?.selectedRequest?.PatientMember?.id}
        selection
      />
      <MobileNumberPromptModel
        isOpen={mobilePromptOpen}
        onClose={() => setMobilePromptOpen(false)}
        onSave={onMobileSave}
      />
    </UIModel>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    margin: "2%",
  },
  form: {
    display: "flex",
    width: "90%",
  },
  gap: {
    marginTop: "2%",
  },
  emptyGrid: {
    height: 10,
  },
  textPrimary: {
    fontWeight: 600,
    fontSize: 22,
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  textSecondary: {
    color: theme.palette.primary.main,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  textAddress: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    maxHeight: 70,
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
}));

export default BookAppointmentModel;
