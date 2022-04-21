import { gql } from "@apollo/client";
import React from "react";
import { AppointmentRequests } from "../Appointments/AppointmentRequests";

export const UPDATE_STATUS = gql`
  mutation update_status_of_appointment_request($id: Float!, $status: AppointmentRequestStatus!) {
    update_status_of_appointment_request(id: $id, status: $status) {
      id
    }
  }
`;
export const AppointmentRequestQuickView = () => {
  return (
    <>
      <AppointmentRequests isQuickView />
    </>
  );
};
