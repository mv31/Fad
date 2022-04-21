import { LocalizationProvider, CalendarPicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { Grid, Typography } from "@mui/material";
import { UIPrimaryButton, UILoader } from "@gogocode-package/ui-web";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import moment from "moment";

type Props = {
  provider_id: number | string;
  member_id: number | string;
  setTimeSlots: (slot: string) => void;
  setDate: (date: Date | null) => void;
  selectedAppointment?: GoGQL.AppointmentRequest;
  disableLabels?: boolean;
  isResetFields?: boolean;
};

export const GET_AVAILABLE_TIME_SLOTS = gql`
  query get_available_timeslots_for_doctor(
    $date: DateTime!
    $is_initial_visit: Boolean!
    $provider_id: Float
    $member_id: Float
  ) {
    get_available_timeslots_for_doctor(
      date: $date
      is_initial_visit: $is_initial_visit
      provider_id: $provider_id
      member_id: $member_id
    ) {
      from
      to
    }
  }
`;

const getTimeSLot = (from: string, to: string) => {
  return `${moment(from).format("hh:mm a")} - ${moment(to).format("hh:mm a")}`;
};
const BookingCalendar = (props: Props) => {
  const [getAvailableTimeSlotsRequest, getAvailableTimeSlotsResponse] =
    GoGQL.useGet_Available_Timeslots_For_DoctorLazyQuery(GET_AVAILABLE_TIME_SLOTS);
  const [dateValue, setDateValue] = useState<Date | null>(
    props?.selectedAppointment ? moment(props?.selectedAppointment?.from).toDate() : new Date()
  );
  const [timeSlots, setTimeSlots] = useState(
    props?.selectedAppointment ? getTimeSLot(props?.selectedAppointment?.from, props?.selectedAppointment?.to) : null
  );

  const makeTimeSlotRequest = () => {
    console.log("provider_id", props?.provider_id);
    getAvailableTimeSlotsRequest({
      variables: {
        date: dateValue,
        is_initial_visit: false,
        provider_id: Number(props?.provider_id),
        member_id: Number(props?.member_id),
      },
    });
  };

  function resetField() {
    setTimeSlots(null);
    getAvailableTimeSlotsRequest({
      variables: {
        date: dateValue,
        is_initial_visit: false,
        provider_id: null,
        member_id: null,
      },
    });
  }

  useEffect(() => {
    console.log("provider_id 1", props?.provider_id);
    if (props?.provider_id) makeTimeSlotRequest();
  }, [props?.provider_id]);

  useEffect(() => {
    makeTimeSlotRequest();
  }, []);

  useEffect(() => {
    if (props?.selectedAppointment) {
      makeTimeSlotRequest();
    }
  }, [props?.selectedAppointment]);

  useEffect(() => {
    {
      props.isResetFields && resetField();
    }
  }, [props.isResetFields]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container>
        <Grid item xs={12} md={6} style={{}}>
          {!props?.disableLabels && <Typography>Date</Typography>}
          <div style={{ height: 330 }}>
            <CalendarPicker
              disablePast
              onChange={(newValue: Date | null) => {
                setDateValue(newValue);
                props?.setDate(newValue);
                setTimeSlots(null);
                getAvailableTimeSlotsRequest({
                  variables: {
                    date: newValue,
                    is_initial_visit: false,
                    provider_id: Number(props?.provider_id),
                    member_id: Number(props?.member_id),
                  },
                });
              }}
              date={dateValue}
            />
          </div>
        </Grid>
        {/* Time Section */}
        <Grid item xs={12} md={6}>
          {!props?.disableLabels && <Typography>Time(Select the day to get Time Slots)*</Typography>}
          <div style={{}}>
            <div
              style={{
                display: "flex",
                columnGap: "1%",
                marginTop: "1%",
                flexWrap: "wrap",
                gap: 30,
                rowGap: 25,
                height: 330,
                alignContent: "flex-start",

                overflow: "auto",
              }}
            >
              <UILoader loading={getAvailableTimeSlotsResponse?.loading} />
              {getAvailableTimeSlotsResponse?.data?.get_available_timeslots_for_doctor.map((data, i) => (
                <UIPrimaryButton
                  variant={getTimeSLot(data?.from, data?.to) === timeSlots ? "contained" : "outlined"}
                  key={i}
                  style={{ height: "20%", width: "45%" }}
                  onClick={() => {
                    setTimeSlots(getTimeSLot(data?.from, data?.to));
                    props?.setTimeSlots(getTimeSLot(data?.from, data?.to));
                  }}
                >
                  {getTimeSLot(data?.from, data?.to)}
                </UIPrimaryButton>
              ))}
              {getAvailableTimeSlotsResponse?.data?.get_available_timeslots_for_doctor?.length == 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    alignContent: "center",
                    height: "100%",
                    width: "100%",
                  }}
                >
                  <Typography style={{ fontStyle: "italic", color: "grey", fontSize: 18 }}>
                    No Available slots for the selected date
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default BookingCalendar;
