import {
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  Paper,
  Stack,
  Table,
  TableCell,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { ComponentWithLoader, UIPrimaryButton, useErrorNotification, useSnackbar } from "@gogocode-package/ui-web";
import React, { useEffect, useState } from "react";
import { AddCircle, DeleteOutlined, Done, EditOutlined } from "@mui/icons-material";
import { LocalizationProvider, DesktopDatePicker, MobileDatePicker, TimePicker, DateTimePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { gql } from "@apollo/client";
import LoadingOverlay from "react-loading-overlay";
import {
  AppointmentServices,
  ProviderTimeSlotInput,
  useGet_Provider_Available_Timeslots_Per_DateLazyQuery,
  useUpdate_Doctor_Membership_Info_Practice_SetupMutation,
  useView_Doctor_Membership_InfoLazyQuery,
  ViewDoctorIncludesEnum,
  WeekDays,
} from "@src/../../packages/graphql_code_generator/src";
import { styled, withStyles } from "@mui/styles";
import moment from "moment";
import _ from "lodash";
import SlotInputModal from "./SlotInputModal";
import Close from "@mui/icons-material/Close";

type Slots = {
  from: string;
  to: string;
};

type TimeSlots = {
  [key: string]: Slots[];
};

const Services_Items = [
  { label: "TeleHealth", value: AppointmentServices.Telehealth, isChecked: false },
  { label: "Office", value: AppointmentServices.Office, isChecked: false },
  { label: "Phone", value: AppointmentServices.Phone, isChecked: false },
  // { label: "Mail", value: AppointmentServices.Email, isChecked: false },
  // { label: "Chat", value: AppointmentServices.Chat, isChecked: false },
];

const GET_TIME_SLOTS = gql`
  query view_doctor_membership_info($includes: [ViewDoctorIncludesEnum!]!) {
    view_doctor_membership_info(includes: $includes) {
      services
      time_initial
      time_followup
      ProviderTimeSlots {
        day
        from
        to
      }
    }
  }
`;

const UPDATE_PRACTICE_SETUP = gql`
  mutation update_doctor_membership_info_practice_setup($input: ProviderPracticeSetupInput!) {
    update_doctor_membership_info_practice_setup(input: $input) {
      services
      slots {
        day
        from
        to
      }
      time_slot_interval {
        time_followup
        time_initial
      }
    }
  }
`;

export const StyledTableCell = withStyles({
  root: {
    borderBottom: "none",
  },
})(TableCell);

const TimeSlotComponent = (props) => {
  const { from, to, onEdit, onDelete } = props;
  return (
    <>
      <UIPrimaryButton variant="outlined" onClick={onEdit} style={{ minWidth: "25%", height: "50%" }}>
        {`${moment(from, "HH:mm").format("HH:mm")} - ${moment(to, "HH:mm").format("HH:mm")}`}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Close />
        </IconButton>
      </UIPrimaryButton>
    </>
  );
};

const PracticeSetup = () => {
  const theme = useTheme();
  const [offeredServices, setOfferedServices] = useState(null);
  const [availableDay, setAvailableDay] = useState("Sunday");
  const [timeSlotInput, setTimeSlotInput] = useState<{ from: Date; to: Date }>(null);
  const [timeSlotIntervals, setTimeSlotIntervals] = useState<{
    time_followup: Date | string;
    time_initial: Date | string;
  }>({
    time_followup: moment(30, "mm").toDate(),
    time_initial: moment(40, "mm").toDate(),
  });
  const [timeWithPatient, setTimeWithPatient] = useState("40");
  const [isEditTimeSlot, setIsEditTimeSlot] = useState<boolean>(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlots>(null);
  const [editingIndex, setEditingIndex] = useState<number>(null);
  const [slotInputModalOpen, setSlotInputModalOpen] = useState<boolean>(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState();
  const { enqueueSnackbar } = useSnackbar();
  const min = 15;
  const max = 80;
  const toggleCheckboxValue = (index) => {
    if (
      offeredServices
        .map((v, i) => (i === index ? { ...v, isChecked: !v.isChecked } : v))
        .filter((v) => v.isChecked)
        .map((v) => v.value).length
    ) {
      setOfferedServices(offeredServices.map((v, i) => (i === index ? { ...v, isChecked: !v.isChecked } : v)));

      updatePracticeSetupRequest({
        variables: {
          input: {
            services: offeredServices
              .map((v, i) => (i === index ? { ...v, isChecked: !v.isChecked } : v))
              .filter((v) => v.isChecked)
              .map((v) => v.value),
            slots: null,
          },
        },
      });
    } else {
      enqueueSnackbar("Atleast one services should be provided", {
        variant: "error",
      });
    }
  };

  const [getTimeSlotsRequest, getTimeSlotsResponse] = useView_Doctor_Membership_InfoLazyQuery(GET_TIME_SLOTS, {
    variables: {
      includes: [ViewDoctorIncludesEnum.AppointmentService, ViewDoctorIncludesEnum.TimeSlot],
    },
    fetchPolicy: "cache-and-network",
  });

  const [updatePracticeSetupRequest, updatePracticeSetupResponse] =
    useUpdate_Doctor_Membership_Info_Practice_SetupMutation(UPDATE_PRACTICE_SETUP, {
      refetchQueries: [
        {
          query: GET_TIME_SLOTS,
          variables: {
            includes: [ViewDoctorIncludesEnum.AppointmentService, ViewDoctorIncludesEnum.TimeSlot],
          },
        },
      ],
      fetchPolicy: "network-only",
    });
  useEffect(() => {
    if (!updatePracticeSetupResponse?.error) {
      setSlotInputModalOpen(false);
      setSelectedTimeSlot(null);
    }
    getTimeSlotsResponse?.refetch();
  }, [updatePracticeSetupResponse?.error]);

  useEffect(() => {
    getTimeSlotsRequest();
  }, []);

  useEffect(() => {
    if (updatePracticeSetupResponse?.data?.update_doctor_membership_info_practice_setup) {
      enqueueSnackbar("Settings Updated", {
        variant: "success",
      });
      setSlotInputModalOpen(false);
      setSelectedTimeSlot(null);
    }
  }, [updatePracticeSetupResponse?.data]);

  useErrorNotification([updatePracticeSetupResponse?.error]);

  useEffect(() => {
    if (getTimeSlotsResponse?.data && getTimeSlotsResponse?.data?.view_doctor_membership_info) {
      let timeSlotsArray: TimeSlots = {
        [WeekDays.Sunday]: [],
        [WeekDays.Monday]: [],
        [WeekDays.Tuesday]: [],
        [WeekDays.Wednesday]: [],
        [WeekDays.Thursday]: [],
        [WeekDays.Friday]: [],
        [WeekDays.Saturday]: [],
      };
      getTimeSlotsResponse?.data?.view_doctor_membership_info?.ProviderTimeSlots?.map((timeSlots) => {
        timeSlotsArray?.[timeSlots.day]?.push({ from: timeSlots.from, to: timeSlots.to });
      });
      setTimeSlots(timeSlotsArray);
      let serverData = getTimeSlotsResponse?.data?.view_doctor_membership_info?.services;
      setOfferedServices(
        Services_Items.map((data) => (serverData.includes(data?.value) ? { ...data, isChecked: true } : data))
      );
      setTimeSlotIntervals({
        time_initial: moment(
          getTimeSlotsResponse?.data?.view_doctor_membership_info?.time_initial || 40,
          "mm"
        ).toDate(),
        time_followup: moment(
          getTimeSlotsResponse?.data?.view_doctor_membership_info?.time_followup || 30,
          "mm"
        ).toDate(),
      });
      setTimeWithPatient(getTimeSlotsResponse?.data?.view_doctor_membership_info?.time_initial?.toString());
    }
  }, [getTimeSlotsResponse?.data]);

  const onAddTimeSlot = (day) => {
    console.log("day", day);
    setAvailableDay(day);
    setSlotInputModalOpen(true);
    setIsEditTimeSlot(true);
  };

  const handlechange = (evt) => {
    const value = evt.target;
    if (value < 30) {
      return;
    } else {
      setTimeWithPatient(value);
      // enqueueSnackbar("Time should be greater than 30 mins",{variant:"error"})
    }
  };

  const onAddTimeSlotDone = (timeSlot, isEdit) => {
    let copySlot = Object.assign({}, timeSlots);
    if (isEdit) {
      let newSlotTime = copySlot?.[timeSlot.day]?.[timeSlot?.index];
      newSlotTime = {
        ...newSlotTime,
        from: moment(timeSlot.from).format("HH:mm"),
        to: moment(timeSlot.to).format("HH:mm"),
      };
      copySlot[timeSlot.day][timeSlot.index] = newSlotTime;
    } else {
      let availableDaySlots = [...copySlot[availableDay]];
      availableDaySlots.push({
        from: moment(timeSlot.from).format("HH:mm"),
        to: moment(timeSlot.to).format("HH:mm"),
      });
      copySlot[availableDay] = availableDaySlots;
    }
    // setTimeSlots(slot);

    let slots = [];
    console.log("timeSlots", timeSlots);
    for (const timeSlot in copySlot) {
      copySlot[timeSlot].forEach((slot) => {
        slots.push({
          day: timeSlot,
          from: slot.from,
          to: slot.to,
        });
      });
    }

    updatePracticeSetupRequest({
      variables: {
        input: {
          slots,
        },
      },
    });
    // setSlotInputModalOpen(false);
  };

  useEffect(() => {
    // setTimeSlots({ ...timeSlots });
    // setTimeSlots({ ...timeSlots, timeSlots?.[availableDay]: timeSlots[availableDay] });
  }, [updatePracticeSetupResponse?.error]);

  const onEditTimeSlot = (timeSlot) => {
    console.log("selectedTimeSlot", timeSlot);
    setSelectedTimeSlot(timeSlot);
  };

  const onDeleteTimeSlot = (day, id) => {
    console.log("deleteTimeSlot", day, id);
    let delslots = { ...timeSlots };
    let newSlotTime = delslots?.[day]?.filter((slot, i) => i != id);
    console.log(
      "newSlotTime",
      delslots["Sunday"].filter((_, i) => i != id)
    );
    delslots[day] = newSlotTime;
    // setTimeSlots(delslots);
    // slotRequest();

    let slots = [];
    for (const timeSlot in delslots) {
      delslots[timeSlot].map((slot) => {
        slots.push({
          day: timeSlot,
          from: slot.from,
          to: slot.to,
        });
      });
    }
    updatePracticeSetupRequest({
      variables: {
        input: {
          slots,
        },
      },
    });
  };

  // const onSave = () => {
  //   let slots = [];
  //   for (const timeSlot in timeSlots) {
  //     console.log("timeSlot", timeSlot);
  //     timeSlots[timeSlot].map((slot) => {
  //       slots.push({
  //         day: timeSlot,
  //         from: slot.from,
  //         to: slot.to,
  //       });
  //     });
  //   }
  //   updatePracticeSetupRequest({
  //     variables: {
  //       input: {
  //         slots,
  //         services: offeredServices?.filter((v) => v.isChecked).map((v) => v.value),
  //         time_slot_interval: {
  //           time_initial: Number(moment(timeSlotIntervals.time_initial).format("mm")),
  //           time_followup: Number(moment(timeSlotIntervals.time_followup).format("mm")),
  //         },
  //       },
  //     },
  //   });

  //   if (!getTimeSlotsResponse?.error) {
  //     enqueueSnackbar("Settings Updated", {
  //       variant: "success",
  //     });
  //   }
  // };
  return (
    <>
      <div style={{ flexBasis: "80%" }}>
        <Paper
          style={{
            margin: "5%",
            padding: "5% 5%",
            border: "1px solid #E0E0E0",
            display: "flex",
            flexDirection: "column",
            //   columnGap: "2%",
            //   rowGap: "2%",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" color={theme.palette.primary.main}>
            Offered Services
          </Typography>
          <div
            style={{
              // border: "1px solid #E0E0E0",
              justifyContent: "space-evenly",
              // margin: "1%",
              borderRadius: 5,
              padding: "2%",
              // marginTop: "2%",
            }}
          >
            <ComponentWithLoader loading={getTimeSlotsResponse?.loading} loaderStyle={{ height: "75%" }}>
              <FormControl component="fieldset" style={{ rowGap: 2 }}>
                {/* <FormLabel component="legend">Offered Services</FormLabel> */}
                <FormGroup aria-label="offered-services" row>
                  {offeredServices?.map((services, i) => (
                    <FormControlLabel
                      key={i}
                      value={services?.value}
                      control={
                        <Checkbox checked={offeredServices[i]?.isChecked} onClick={() => toggleCheckboxValue(i)} />
                      }
                      label={services.label}
                      labelPlacement="end"
                    />
                  ))}
                </FormGroup>
              </FormControl>
            </ComponentWithLoader>
          </div>
          {/* Doctor's Available Timing */}
          <div style={{ marginTop: "3%" }}>
            <Typography variant="h5" color={theme.palette.primary.main}>
              Doctor&apos;s Available Timing
            </Typography>
            {/* <div style={{ display: "flex", columnGap: "3%", marginTop: "1%" }}>
              {WeekCalendar.map((data, index) => (
                <UIPrimaryButton
                  variant={data.value === availableDay ? "contained" : "outlined"}
                  onClick={() => {
                    setAvailableDay(data.value);
                  }}
                  key={index}
                >
                  {data.label}
                </UIPrimaryButton>
              ))}
            </div> */}
            <Table>
              {getTimeSlotsResponse?.loading && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <CircularProgress color="success" />
                </div>
              )}
              {timeSlots &&
                Object.entries(timeSlots).map(([day, daySlots1]) => (
                  <TableRow key={day}>
                    <StyledTableCell width={"15%"} style={{}}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={() => onAddTimeSlot(day)}>
                          <AddCircle htmlColor={theme.palette.primary.main} />
                        </IconButton>
                        {day}{" "}
                      </div>
                    </StyledTableCell>
                    <StyledTableCell>
                      <div style={{ display: "flex", columnGap: "2%", overflowX: "auto" }}>
                        {daySlots1?.length == 0 && (
                          <Typography
                            style={{
                              fontStyle: "italic",
                              fontSize: 18,
                              color: "GrayText",
                              alignContent: "center",
                              display: "flex",
                              gap: 5,
                            }}
                          >
                            No Available Time Slots for this day, Add one by clicking
                            <AddCircle
                              onClick={() => onAddTimeSlot(day)}
                              htmlColor={theme.palette.primary.main}
                              fontSize="small"
                              style={{ alignSelf: "center" }}
                            />
                          </Typography>
                        )}
                        {daySlots1.map((data, i) => (
                          <TimeSlotComponent
                            key={i}
                            from={data?.from}
                            to={data?.to}
                            onEdit={() => onEditTimeSlot({ from: data?.from, to: data?.to, index: i, day: day })}
                            onDelete={() => onDeleteTimeSlot(day, i)}
                          />
                        ))}
                      </div>
                    </StyledTableCell>
                  </TableRow>
                ))}
            </Table>
          </div>
          {/* Timing */}
          <Table sx={{ width: "50%", marginTop: "2%" }} size="small">
            {/* <TableRow>
              <StyledTableCell>From</StyledTableCell>
              <StyledTableCell>To</StyledTableCell>
            </TableRow> */}
            {/* {timeSlots
              ?.filter((slots) => slots.day == availableDay)
              ?.map((data, i) =>
                editingIndex != i ? (
                  <TableRow key={i}>
                    <StyledTableCell>
                      <UIPrimaryButton variant={"outlined"} key={i} fullWidth>
                        {moment(data?.from, "HH:mm").format("HH:mm")}
                      </UIPrimaryButton>
                    </StyledTableCell>
                    <StyledTableCell>
                      <UIPrimaryButton variant="outlined" key={i} fullWidth>
                        {moment(data?.to, "HH:mm").format("HH:mm")}
                      </UIPrimaryButton>
                    </StyledTableCell>
                    <StyledTableCell style={{ gap: "10%", display: "flex", alignItems: "center" }}>
                      <IconButton
                        style={{ padding: 0 }}
                        onClick={() => {
                          setEditingIndex(i);
                        }}
                      >
                        <EditOutlined htmlColor={theme.palette.primary.main} />
                      </IconButton>
                      <IconButton
                        style={{ padding: 0 }}
                        onClick={() => {
                          onDeleteTimeSlot(i);
                        }}
                      >
                        <DeleteOutlined htmlColor={theme.palette.primary.main} />
                      </IconButton>
                    </StyledTableCell>
                  </TableRow>
                ) : (
                  <TimeInput
                    timeSlotInput={timeSlotInput}
                    setTimeSlotInput={setTimeSlotInput}
                    onAddTimeSlotDone={onAddTimeSlotDone}
                    isEdit={true}
                    id={i}
                  />
                )
              )} */}

            {/* {isEditTimeSlot && (
              <TimeInput
                timeSlotInput={timeSlotInput}
                setTimeSlotInput={setTimeSlotInput}
                onAddTimeSlotDone={onAddTimeSlotDone}
                isEdit={false}
                id={null}
              />
            )} */}
            {/* {timeSlots?.filter((slot) => slot[0].day === availableDay)?.length == 0 && !isEditTimeSlot && (
              <TableRow>
                <StyledTableCell colSpan={3}>
                  <div>
                    <Typography
                      style={{
                        display: "flex",
                        fontStyle: "italic",
                        color: "GrayText",
                        alignItems: "center",
                      }}
                    >
                      Click{" "}
                      <AddCircle
                        fontSize="small"
                        htmlColor={theme.palette.primary.main}
                        style={{ marginLeft: "1%", marginRight: "1%" }}
                      />{" "}
                      to add time slots for the selected day
                    </Typography>
                  </div>
                </StyledTableCell>
              </TableRow>
            )} */}

            {/* <StyledTableCell>
              <IconButton onClick={onAddTimeSlot}>
                <AddCircle fontSize="large" htmlColor={theme.palette.primary.main} />
              </IconButton>
            </StyledTableCell> */}
          </Table>
          {/*  Time Interval */}
          <div style={{ marginTop: "5%" }}>
            <Typography variant="h5" color={theme.palette.primary.main}>
              Time With Patient
            </Typography>
            <div style={{ marginTop: "2%" }}>
              <ComponentWithLoader loading={getTimeSlotsResponse?.loading} loaderStyle={{ height: "75%" }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <StyledTableCell>
                    {/* <TimePicker
                      ampm={false}
                      openTo="minutes"
                      inputFormat="mm"
                      label="Time With Patient"
                      value={timeSlotIntervals?.time_initial}
                      onChange={(newValue: Date | null) => {
                        setTimeSlotIntervals({ ...timeSlotIntervals, time_initial: newValue });
                        let slots = [];
                        for (const timeSlot in timeSlots) {
                          timeSlots[timeSlot].map((slot) => {
                            slots.push({
                              day: timeSlot,
                              from: slot.from,
                              to: slot.to,
                            });
                          });
                        }
                        updatePracticeSetupRequest({
                          variables: {
                            input: {
                              slots,
                              services: offeredServices?.filter((v) => v.isChecked).map((v) => v.value),
                              time_slot_interval: {
                                time_initial: Number(moment(newValue).format("mm")),
                                time_followup: Number(moment(timeSlotIntervals.time_followup).format("mm")),
                              },
                            },
                          },
                        });
                      }}
                      renderInput={(params) => <TextField {...params} />}
                      shouldDisableTime={(timeValue, clockType) => {
                        if (clockType === "minutes" && timeValue != 0 && timeValue % 10) {
                          return true;
                        }

                        return false;
                      }}
                    /> */}
                    <TextField
                      value={timeWithPatient}
                      type="number"
                      fullWidth
                      inputProps={{ min, max }}
                      // InputProps={{ inputProps: { min: 30, max: 120 } }}
                      placeholder="Please Enter the Time Spent with Patient"
                      label="Time With Patient (in mins)"
                      onChange={(event) => {
                        // if (event.target.value === "") {
                        //   setTimeWithPatient(event.target.value)
                        //   return;
                        // }
                        const value = +event.target.value;
                        if (value > max) {
                          setTimeWithPatient("80");
                        } else if (value < min) {
                          setTimeWithPatient("15");
                        } else {
                          setTimeWithPatient(event.target.value);
                        }
                      }}
                      onBlur={() => {
                        updatePracticeSetupRequest({
                          variables: {
                            input: {
                              slots: null,
                              time_slot_interval: {
                                time_initial: Number(timeWithPatient),
                                time_followup: Number(moment(timeSlotIntervals.time_followup).format("mm")),
                              },
                            },
                          },
                        });
                      }}
                    />
                  </StyledTableCell>
                  {/* <StyledTableCell>
                    <TimePicker
                      ampm={false}
                      openTo="minutes"
                      inputFormat="mm"
                      label="Time Followup"
                      value={timeSlotIntervals?.time_followup}
                      onChange={(newValue: Date | null) => {
                        setTimeSlotIntervals({ ...timeSlotIntervals, time_followup: newValue });
                        updatePracticeSetupRequest({
                          variables: {
                            input: {
                              services: offeredServices?.filter((v) => v.isChecked).map((v) => v.value),
                              time_slot_interval: {
                                time_initial: Number(moment(timeSlotIntervals.time_initial).format("mm")),
                                time_followup: Number(moment(newValue).format("mm")),
                              },
                            },
                          },
                        });
                      }}
                      renderInput={(params) => <TextField {...params} />}
                      shouldDisableTime={(timeValue, clockType) => {
                        if (clockType === "minutes" && timeValue % 10) {
                          return true;
                        }

                        return false;
                      }}
                    />
                  </StyledTableCell> */}
                </LocalizationProvider>
              </ComponentWithLoader>
            </div>
          </div>
          {/* Actions */}
          {/* <div style={{ display: "flex", columnGap: "2%", marginTop: "5%" }}>
            <UIPrimaryButton onClick={onSave}>Save Settings</UIPrimaryButton>
          </div> */}
        </Paper>
      </div>
      <SlotInputModal
        isOpen={slotInputModalOpen || selectedTimeSlot != null}
        onClose={() => {
          setSlotInputModalOpen(false);
          setSelectedTimeSlot(null);
        }}
        onDone={onAddTimeSlotDone}
        selectedTimeSlot={selectedTimeSlot}
      />
    </>
  );
};

export default PracticeSetup;
