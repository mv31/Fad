import { styled, TableRow } from "@mui/material";
import React from "react";
import { CommunicationRequestsList } from "./CommunicationRequestsList";

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    // border: 0,
  },
}));

export const CommunicationRequestQuickView = () => {
  return (
    <>
      <CommunicationRequestsList isQuickView />
    </>
  );
};
