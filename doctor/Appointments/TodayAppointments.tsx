import React from "react";
import { AppointmentRequests } from "./AppointmentRequests";
export const TodayAppointments = () => {
  return (
    <div>
      <AppointmentRequests isTodayAppointment isQuickView />
    </div>
  );
};
