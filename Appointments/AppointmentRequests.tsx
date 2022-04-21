import {
  Autocomplete,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { createStyles, makeStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { FETCH_APPOINTMENT_REQUESTS } from "../../doctor/Appointments/AppointmentRequests";
import AppointmentCard from "./AppointmentCard";
import { getUserType } from "@src/api/api";
import { DashboardRoutes } from "@src/routes/DashboardRoutes";
import VisibilitySensor from "react-visibility-sensor";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AppointmentDetailsModal from "../../doctor/Appointments/AppointmentDetailsModal";
import Info from "@src/components/Documentation/Info";
import BookingCalendar, { GET_AVAILABLE_TIME_SLOTS } from "./BookingCalendar";
import { UIPrimaryButton } from "@src/../../packages/ui/src/UIPrimaryButton";
import MobileNumberPromptModel from "@src/components/MobileNumberPromptModel";
import { FETCH_COMMUNICATION_REQUESTS } from "@src/pages/consumer/communication_request";
import { ConsumerCard, CREATE_APPOINTMENT_REQUEST, DoctorCard } from "./BookAppointmentModel";
import { useSnackbar } from "notistack";
import { gql } from "@apollo/client";
import { UPDATE_MEMBER } from "../membership/Family/AddModel";
import { FETCH_PATIENT_COMMUNICATION } from "@src/pages/doctor/communication_request";
import { DoctorRequestStatus } from "@gogocode-package/graphql_code_generator";
import BrowseRecordsModal from "./BrowseRecordsModal";
import { emptyCheck } from "@src/utils";
import moment from "moment";
import { UIModel } from "@gogocode-package/ui-web";
import CreateRequests from "../CommunicationRequests/CreateRequests";

type Props = {
  status?: GoGQL.AppointmentListing;
};

export const MEMBER_AUTOCOMPLETE = gql`
  query member_autocomplete {
    member_autocomplete {
      member_full_name
      member_type
      id
    }
  }
`;

export const PROVIDER_AUTOCOMPLETE = gql`
  query get_provider_by_member($member_id: Float!) {
    get_provider_by_member(member_id: $member_id) {
      provider_id
      patient_id
      Provider {
        User {
          first_name
          last_name
          profile_picture
          name
          id
        }
        ProviderAppointmentServices {
          id
          service_type
        }
        ProviderSpecialties {
          Taxonomy {
            specialty
            sub_specialty
          }
        }
      }
      Patient {
        User {
          profile_picture
          id
        }
      }
    }
  }
`;

const COMMUNICATION_FOR_MEMBER = gql`
  query get_communication_requests_for_member($member_id: Float!, $status: DoctorRequestStatus!) {
    get_communication_requests_for_member(member_id: $member_id, status: $status) {
      rows {
        status
        Provider {
          npi
          User {
            name
          }
        }
      }
      count
    }
  }
`;

export const AppointmentRequests = (props: Props) => {
  const styles = useStyles();
  const userType = getUserType();
  const [pageNo, setPageNo] = useState<number>(0);
  const [isLoadMore, setIsLoadMore] = useState<boolean>(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentDetailsModel, setAppointmentDetailsModel] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchText, setSearchText] = useState<string>("");
  const [type, setType] = useState<GoGQL.AppointmentListing>(GoGQL.AppointmentListing.All);
  const [AppointmentRequests, AppointmentResponse] = GoGQL.useGet_Appointment_RequestsLazyQuery(
    FETCH_APPOINTMENT_REQUESTS,
    {
      variables: {
        page_no: 0,
        limit: 20,
        type: props?.status,
        searchName: searchText,
      },
      fetchPolicy: "no-cache",
    }
  );
  useEffect(() => {
    AppointmentRequests({
      variables: {
        page_no: 0,
        limit: 20,
        type: props?.status,
        searchName: "",
      },
    });
  }, []);

  useEffect(() => {
    if (AppointmentResponse.data && AppointmentResponse.data?.get_appointment_requests) {
      if (pageNo == 0) setAppointments(AppointmentResponse?.data?.get_appointment_requests?.rows);
      else {
        setAppointments([...appointments, ...AppointmentResponse?.data?.get_appointment_requests?.rows]);
        setIsLoadMore(false);
      }
    }
  }, [AppointmentResponse?.data]);

  useEffect(() => {
    setIsLoadMore(true);
    AppointmentRequests({
      variables: {
        page_no: pageNo,
        limit: 20,
        type: props?.status,
      },
    });
  }, [pageNo, props?.status, searchText]);
  const handleStatusChange = (evt) => {
    setPageNo(0);
    setType(evt.target.value);
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography style={{ fontSize: 35 }}>Appointment</Typography>
        <Info link={DashboardRoutes.consuAppoint} />
      </div>

      {/* <div style={{ display: "flex", alignItems: "center", gap: "5%", marginTop: "2%" }}>
        <InputBase
          fullWidth
          startAdornment={<SearchOutlinedIcon style={{ marginRight: "1%" }} />}
          style={{
            borderRadius: 10,
            padding: "0 1%",
            backgroundColor: "white",
            height: 50,
            border: `1px solid ${theme.palette.primary.main}`,
          }}
          placeholder={"Search Appointment Requests"}
          size="medium"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            setPageNo(0);
          }}
        />
        <FormControl variant="standard" sx={{ minWidth: "10%", alignSelf: "center" }}>
          <InputLabel id="demo-simple-select-standard-label">Status</InputLabel>
          <Select
            labelId="demo-simple-select-standard-label"
            id="demo-simple-select-standard"
            value={type}
            onChange={handleStatusChange}
            label="Status"
          >
            <MenuItem value={GoGQL.AppointmentListing.All}>{GoGQL.AppointmentListing.All}</MenuItem>
            <MenuItem value={GoGQL.AppointmentListing.Pending}>{GoGQL.AppointmentListing.Pending}</MenuItem>
            <MenuItem value={GoGQL.AppointmentListing.Completed}>{GoGQL.AppointmentListing.Completed}</MenuItem>
            <MenuItem value={GoGQL.AppointmentListing.Upcoming}>{GoGQL.AppointmentListing.Upcoming}</MenuItem>
          </Select>
        </FormControl>
      </div> */}
      <div className={styles.wrapper2}>
        {appointments.map((item, idx) => (
          <AppointmentCard
            key={idx}
            appointment={item}
            userType={userType}
            onCardClick={() => {
              setAppointmentDetailsModel(true);
              setSelectedAppointment(item);
            }}
            // selectedSubSpecialty={selectedSubSpecialities}
          />
        ))}
        {appointments?.length >= 20 && isLoadMore && (
          <VisibilitySensor
            onChange={(isVisible) => {
              if (isVisible) {
                setPageNo(pageNo + 1);
              }
            }}
          >
            <div style={{ flex: 1, display: "flex", justifyContent: "center", margin: 20, marginTop: 40 }}>
              <CircularProgress color="success" />
            </div>
          </VisibilitySensor>
        )}
        {AppointmentResponse?.data?.get_appointment_requests?.count == 0 && (
          <Typography style={{ display: "flex", justifySelf: "center" }}>
            You don&apos;t have Appointments. Please book an appointment from the dashboard.
          </Typography>
        )}
      </div>
      <AppointmentDetailsModal
        isOpen={appointmentDetailsModel}
        onClose={() => {
          setAppointmentDetailsModel(false);
        }}
        appointment={selectedAppointment}
      />
    </div>
  );
};

type StateType = {
  member: any;
  provider: any;
};
export const BookAppointment = (props: Props) => {
  const [dateValue, setDateValue] = React.useState<Date | null>(new Date());
  const { enqueueSnackbar } = useSnackbar();

  const [member, setMember] = useState<{
    member_name: string;
    type: GoGQL.RelationShip;
    patient_id: number;
    member_id: string;
  }>(null);
  const [state, setState] = useState<StateType>({
    member: null,
    provider: null,
  });
  const [appointmentType, setAppointmentType] = useState<GoGQL.AppointmentServices>(null);
  const [visitedDoctor, setVisitedDoctor] = useState<string>("no");
  const [timeSlots, setTimeSlots] = useState(null);
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<DoctorRequestStatus | "All">("All");
  const [isResetFields, setIsResetFields] = useState<boolean>(false);
  const [eligibilityModelOpen, setEligibilityModelOpen] = useState<boolean>(false);

  const [recordIds, setRecordIds] = useState<number[]>([]);
  const [browseRecordsModalOpen, setBrowseRecordsModalOpen] = useState<boolean>(false);
  const MemberAutoComplete = GoGQL.useMember_AutocompleteQuery(MEMBER_AUTOCOMPLETE);
  const [providerListRequest, providerListResponse] = GoGQL.useGet_Provider_By_MemberLazyQuery(PROVIDER_AUTOCOMPLETE, {
    variables: {
      member_id: state?.member,
    },
  });
  const [communicationRequestsForMemberReq, communicationRequestsForMemberRes] =
    GoGQL.useGet_Communication_Requests_For_MemberLazyQuery(COMMUNICATION_FOR_MEMBER);

  const renderNoOption = () => {
    if (
      state?.member &&
      communicationRequestsForMemberRes?.data &&
      communicationRequestsForMemberRes?.data?.get_communication_requests_for_member?.count > 0
    ) {
      return (
        <div>
          <Typography>This member have pending Eligibility Request with: </Typography>
          {communicationRequestsForMemberRes?.data?.get_communication_requests_for_member?.rows?.map((provider) => (
            <ul key={provider?.id}>
              <Typography variant="inherit" fontStyle={"italic"}>
                <a
                  style={{ cursor: "pointer", textDecorationColor: "ButtonHighlight", textDecorationLine: "underline" }}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open(
                        `${window.location.origin}/doctor/profile/${provider?.Provider?.npi}`,
                        "_blank",
                        "location=yes,height=800,width=1500,scrollbars=yes,status=yes"
                      );
                    }
                  }}
                >
                  {provider?.Provider?.User?.name}
                </a>
              </Typography>
            </ul>
          ))}
          <Typography variant="inherit" fontSize={18}>
            Please wait for Doctor to accept your eligibility request
          </Typography>
        </div>
      );
    }
    if (state?.member) {
      return (
        <Typography variant="inherit">
          This member have no doctor to communicate. Do you want to{" "}
          <a
            style={{ cursor: "pointer", textDecorationColor: "ButtonHighlight", textDecorationLine: "underline" }}
            onClick={() => setEligibilityModelOpen(true)}
          >
            Make Eligibility Request
          </a>
        </Typography>
      );
    }
    return <Typography variant="inherit">Please Select Member</Typography>;
  };

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
      if (!updateMemberResponse?.data?.update_member?.mobile) {
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
          member_full_name: state?.member?.name,
          member_type: state?.member?.type,
          mobile,
        },
        id: Number(state?.member?.id),
      },
    });
    setMobilePromptOpen(false);
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

  const resetFields = () => {
    setIsResetFields(true);
    setNotes("");
    setState({
      ...state,
      provider: null,
      member: null,
    });
    console.log("notes", notes);
    console.log("state", state?.provider);

    setTimeSlots(null);
  };

  const sendRequest = () => {
    createAppointmentRequest({
      variables: {
        input: {
          from: moment(
            moment(dateValue).format("YYYY-MM-DD") + " " + moment(timeSlots.split("-")[0], "hh:mm a").format("HH:mm")
          ).toDate(),
          member_id: Number(state?.member?.id),
          provider_id: Number(state?.provider?.id),
          is_first_time_visit: true,
          notes,
          service: appointmentType,
          record_ids: recordIds,
        },
      },
    });
    resetFields();
  };

  useEffect(() => {
    if (createAppointmentResponse.data && createAppointmentResponse.data?.create_appointment_request) {
      enqueueSnackbar("Appointment request sent", { variant: "success" });
      // props?.onClose();
    }
  }, [createAppointmentResponse.data]);

  useEffect(() => {
    if (createAppointmentResponse.error && createAppointmentResponse.error?.message) {
      enqueueSnackbar("Failed to book appointment", { variant: "error" });
      // props?.onClose();
    }
  }, [createAppointmentResponse.error]);

  // let service = providerListResponse?.data?.get_provider_by_member?.map((index)=>{
  //    service=index?.Provider?.ProviderAppointmentServices
  // })

  return (
    // <UIModel
    //   isOpen={props?.isOpen}
    //   onClose={props?.onClose}
    //   maxWidth="lg"
    //   title="Book Appointment"
    //   titleStyle={{ fontSize: 25 }}
    //   action={
    //     <UIPrimaryButton loading={createAppointmentResponse?.loading} onClick={onSend}>
    //       Book Appointment
    //     </UIPrimaryButton>
    //   }
    // >
    <div>
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
            <Autocomplete
              disablePortal
              value={state?.member}
              style={{ backgroundColor: "white" }}
              id="Member1"
              // disabled={props?.disableMemberNameEdit}
              options={
                MemberAutoComplete?.data?.member_autocomplete?.map((idx) => {
                  console.log("members", idx);
                  return {
                    id: idx?.id,
                    name: idx?.member_full_name,
                    type: idx?.member_type,
                  };
                }) || []
              }
              ListboxProps={{ style: { maxHeight: "20rem" } }}
              renderInput={(params) => <TextField {...params} label="Member" />}
              onChange={(_, newValue) => {
                setState({
                  ...state,
                  member: newValue,
                });
                if (newValue?.id != null) {
                  providerListRequest({
                    variables: {
                      member_id: Number(newValue?.id),
                    },
                  });
                  communicationRequestsForMemberReq({
                    variables: {
                      member_id: Number(newValue?.id),
                      status: DoctorRequestStatus.Pending,
                    },
                  });
                  setIsResetFields(false);
                } else {
                  setState({
                    ...state,
                    provider: null,
                    member: null,
                  });
                }

                // searchProvider()
                // setMember({member_id:newValue})
              }}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => {
                return (
                  <li {...props}>
                    {option.name} ({option.type})
                  </li>
                );
              }}
            />
            {state?.member == null ? (
              ""
            ) : (
              <div style={{ marginTop: "3%" }}>
                <ConsumerCard
                  patient={
                    {
                      // patient_id: props?.selectedRequest?.Patient?.id,
                      // patient_name: props?.selectedRequest?.Patient?.User?.name,
                      //  patient_profile: .Patient?.User?.profile_picture,
                    }
                  }
                  member={{
                    member_id: state?.member?.id,
                    member_name: state?.member?.name,
                    // patient_id: props?.selectedRequest?.patient_id,
                    type: state?.member?.type,
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ width: "100%", height: 100 }}>
            {/* <Autocomplete></Autocomplete> */}
            <Autocomplete
              disablePortal
              value={state.provider}
              style={{ backgroundColor: "white" }}
              id="provider1"
              noOptionsText={renderNoOption()}
              options={
                providerListResponse?.data?.get_provider_by_member?.map((provider) => {
                  return {
                    id: provider?.provider_id,
                    name: provider?.Provider?.User?.name,
                    services: provider?.Provider?.ProviderAppointmentServices,
                    Provider: provider?.Provider,
                  };
                }) || []
              }
              ListboxProps={{ style: { maxHeight: "20rem" } }}
              renderInput={(params) => <TextField {...params} label="Doctor" />}
              onChange={(_, newValue) => {
                setState({
                  ...state,
                  provider: newValue,
                });
              }}
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => {
                return <li {...props}>{option.name}</li>;
              }}
            />
            {state?.provider == null ? (
              ""
            ) : (
              <div style={{ marginTop: "3%" }}>
                {" "}
                <DoctorCard doctor={state?.provider?.Provider} />{" "}
              </div>
            )}
          </div>
        </div>
        {/* Date Section */}
        <div style={{ marginTop: "7%" }}>
          <BookingCalendar
            member_id={state?.member?.id}
            provider_id={state?.provider?.id}
            setDate={setDateValue}
            setTimeSlots={setTimeSlots}
            disableLabels
            isResetFields={isResetFields}
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
              {state?.provider?.Provider?.ProviderAppointmentServices?.map((service, i) => (
                <UIPrimaryButton
                  key={i}
                  variant={appointmentType == service?.service_type ? "contained" : "outlined"}
                  value={service?.service_type}
                  onClick={() => {
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
            value={notes}
            id="notes"
            minRows={2}
            placeholder="I have ...."
            multiline
            onChange={(e) => {
              setNotes(e.target.value);
            }}
          />
        </div>

        <div style={{ width: "100%", display: "flex", justifyContent: "right", marginTop: "2%" }}>
          <UIPrimaryButton
            loading={createAppointmentResponse?.loading}
            style={{ width: "20%", marginRight: "2%" }}
            fullWidth
            onClick={onSend}
          >
            Book Appointment
          </UIPrimaryButton>
        </div>
      </Card>
      <BrowseRecordsModal
        isOpen={browseRecordsModalOpen}
        onClose={() => {
          setBrowseRecordsModalOpen(false);
        }}
        onSave={onBrowseSave}
        memberId={state?.member?.id}
        selection
      />
      <MobileNumberPromptModel
        isOpen={mobilePromptOpen}
        onClose={() => setMobilePromptOpen(false)}
        onSave={onMobileSave}
      />
      <UIModel
        isOpen={eligibilityModelOpen}
        onClose={() => {
          setEligibilityModelOpen(false);
        }}
        maxWidth={"lg"}
        title={"Make Eligibility Request"}
      >
        <CreateRequests
          modalClose={() => {
            setEligibilityModelOpen(false);
            providerListResponse.refetch();
          }}
          member_id={{ member_full_name: state?.member?.name, member_type: state?.member?.type, id: state?.member?.id }}
          disableMemberNameEdit
        />
      </UIModel>
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper2: {
      display: "flex",
      justifyContent: "space-around",
      flexWrap: "wrap",
      width: "100%",
      gap: "1%",
      rowGap: 30,
      marginTop: "3%",
    },
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
  })
);
