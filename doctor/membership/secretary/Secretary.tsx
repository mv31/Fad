import { Paper } from "@mui/material";
import React from "react";
import SecretaryDetails from "./SecretaryDetails";

const Secretary = () => {
  return (
    <div style={{ flexBasis: "80%" }}>
      <Paper style={{ margin: "5%", padding: "5% 4%", border: "1px solid #E0E0E0" }}>
        <SecretaryDetails />
      </Paper>
    </div>
  );
};
export default Secretary;
