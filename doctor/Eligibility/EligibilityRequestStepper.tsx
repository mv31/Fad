import { Autocomplete, Box, InputLabel, OutlinedTextFieldProps, Switch, TextField, Typography } from "@mui/material";
import { UITextField } from "@gogocode-package/ui-web";
import React, { useEffect, useState } from "react";
import { LocalizationProvider, DateRangePicker, DateRange } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import * as PullState from "../../../DataPullState";
import { gql } from "@apollo/client";
import * as GoGQL from "@gogocode-package/graphql_code_generator";

interface CustomProps {
  label: string;
  onChangeText?: (text: string) => void;
}

interface EligibilityRequest {
  type: "INDIVIDUAL" | "ORGANIZATION";
  provider_name: string;
  npi: string;
  payer: string;
  payer_id: string;
  from: string;
  to: string;
}

const TextFieldWithLabel = (props: CustomProps & Partial<OutlinedTextFieldProps>) => {
  return (
    <div style={{ display: "flex", alignItems: "center", flexBasis: "45%", margin: "0% 1%" }}>
      <InputLabel required={props?.required || false} style={{ flexBasis: "50%" }}>
        {props.label}
      </InputLabel>{" "}
      <UITextField style={{ flexBasis: "50%" }} placeholder={props.label} {...props} />
    </div>
  );
};

const FETCH_PAYERS = gql`
  query get_payers($input: GetPayersInput!) {
    get_payers(input: $input) {
      id
      payer_name
      payer_type
    }
  }
`;

const EligibilityRequestStepper = () => {
  const type = PullState.EligibilityRequestInputs.useState((s) => s.type);
  const providerLastName = PullState.EligibilityRequestInputs.useState((s) => s.providerLastName);
  const providerFirstName = PullState.EligibilityRequestInputs.useState((s) => s.providerFirstName);
  const npi = PullState.EligibilityRequestInputs.useState((s) => s.npi);
  const payer = PullState.EligibilityRequestInputs.useState((s) => s.payer);
  const payerId = PullState.EligibilityRequestInputs.useState((s) => s.payerId);
  const from = PullState.EligibilityRequestInputs.useState((s) => s.from);
  const to = PullState.EligibilityRequestInputs.useState((s) => s.to);
  const practiceName = PullState.EligibilityRequestInputs.useState((s) => s.practiceName);
  const officeLocation = PullState.EligibilityRequestInputs.useState((s) => s.officeLocation);
  const practiceTaxId = PullState.EligibilityRequestInputs.useState((s) => s.practiceTaxId);
  const handleChange = (name, value) => {
    PullState.EligibilityRequestInputs.update((s) => {
      s[name] = value;
    });
  };

  useEffect(() => {
    console.log("payer", payer);
  }, [payer]);

  const [fetchPayersRequest, fetchPayersResponse] = GoGQL.useGet_PayersLazyQuery(FETCH_PAYERS, {
    fetchPolicy: "network-only",
  });
  useEffect(() => {
    fetchPayersRequest({ variables: { input: { search_text: "" } } });
  }, []);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignContent: "space-evenly", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", flexBasis: "100%", columnGap: "20%", margin: "0% 1%" }}>
        <Typography>Type</Typography>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Typography>Individual</Typography>
          <Switch
            checked={type == GoGQL.EligibilityRequestType.Organization ? true : false}
            onChange={(e) => {
              handleChange(
                "type",
                e.target.checked ? GoGQL.EligibilityRequestType.Organization : GoGQL.EligibilityRequestType.Individual
              );
            }}
          />{" "}
          <Typography>Organization</Typography>
        </div>
      </div>
      {type == GoGQL.EligibilityRequestType.Organization && (
        <>
          <TextFieldWithLabel
            label="Practice Name"
            value={practiceName}
            onChangeText={(val) => {
              handleChange("practiceName", val);
            }}
            required
          />
          <TextFieldWithLabel
            label="Office Location"
            value={officeLocation}
            onChangeText={(val) => {
              handleChange("officeLocation", val);
            }}
          />
          <TextFieldWithLabel
            label="Practice Tax ID"
            value={practiceTaxId}
            onChangeText={(val) => {
              handleChange("practiceTaxId", val);
            }}
          />
        </>
      )}
      <TextFieldWithLabel
        label="Provider Last Name"
        value={providerLastName}
        onChangeText={(val) => {
          handleChange("providerLastName", val);
        }}
        required
      />
      <TextFieldWithLabel
        label="Provider First Name"
        value={providerFirstName}
        onChangeText={(val) => {
          handleChange("providerFirstName", val);
        }}
        required
      />
      <TextFieldWithLabel
        label="NPI"
        value={npi}
        onChangeText={(val) => {
          handleChange("npi", val);
        }}
        required={type == GoGQL.EligibilityRequestType.Individual}
      />

      {/* <TextFieldWithLabel
        label="Payer"
        value={payer}
        onChangeText={(val) => {
          handleChange("payer", val);
        }}
        required
      /> */}
      <div style={{ display: "flex", alignItems: "center", flexBasis: "45%", margin: "0% 1%" }}>
        <InputLabel required style={{ flexBasis: "50%" }}>
          Payer
        </InputLabel>
        <Autocomplete
          style={{ flexBasis: "50%" }}
          options={fetchPayersResponse?.data?.get_payers || []}
          value={payer || ""}
          onInputChange={(_, value) => {
            fetchPayersRequest({ variables: { input: { search_text: value } } });
          }}
          onChange={(_, value: GoGQL.Payers) => {
            handleChange("payer", value?.payer_name);
            handleChange("payerId", value?.id);
          }}
          renderInput={(params) => <TextField {...params} label="Payer" placeholder="Select Payer" />}
          //   getOptionLabel={(option) => option?.payer_name}
          renderOption={(props, option) => {
            return <li {...props}>{option?.payer_name}</li>;
          }}
        />
      </div>
      <TextFieldWithLabel
        label="Payer ID"
        value={payerId}
        onChangeText={(val) => {
          handleChange("payerId", val);
        }}
      />
      <div style={{ display: "flex", alignItems: "center", flexBasis: "100%", margin: "0% 1%", columnGap: "1%" }}>
        <InputLabel required>Date to Check for Eligibility</InputLabel>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DateRangePicker
            startText="Date From"
            endText="Date To"
            value={[from, to]}
            onChange={(newValue) => {
              handleChange("from", newValue[0]);
              handleChange("to", newValue[1]);
            }}
            renderInput={(startProps, endProps) => (
              <React.Fragment>
                <TextField {...startProps} />
                <Box sx={{ mx: 2 }}> to </Box>
                <TextField {...endProps} />
              </React.Fragment>
            )}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
};

export default EligibilityRequestStepper;
