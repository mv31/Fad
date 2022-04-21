import { InputLabel, Typography } from "@mui/material";
import { genderList } from "@src/../../Constants";
import { UIButtonGroup } from "@src/../../packages/ui/src";
import React, { useState } from "react";
import { TextFieldWithLabel } from "./TextFieldWithLabel";
import * as PullState from "../../../DataPullState";

const relationShip = [
  { value: "Spouse", label: "Spouse" },
  { value: "Child", label: "Child" },
  { value: "Others", label: "Others" },
];

const PatientStepper = () => {
  const isSubscriber = PullState.PatientStepperInputs.useState((s) => s.isSubscriber);
  const ssn = PullState.PatientStepperInputs.useState((s) => s.ssn);
  const lastName = PullState.PatientStepperInputs.useState((s) => s.lastName);
  const firstName = PullState.PatientStepperInputs.useState((s) => s.firstName);
  const middleName = PullState.PatientStepperInputs.useState((s) => s.middleName);
  const suffix = PullState.PatientStepperInputs.useState((s) => s.suffix);
  const dob = PullState.PatientStepperInputs.useState((s) => s.dob);
  const gender = PullState.PatientStepperInputs.useState((s) => s.gender);
  const addressLine1 = PullState.PatientStepperInputs.useState((s) => s.addressLine1);
  const addressLine2 = PullState.PatientStepperInputs.useState((s) => s.addressLine2);
  const city = PullState.PatientStepperInputs.useState((s) => s.city);
  const state = PullState.PatientStepperInputs.useState((s) => s.state);
  const zipcode = PullState.PatientStepperInputs.useState((s) => s.zipcode);
  const patient = PullState.PatientStepperInputs.useState((s) => s.patient);
  const relation = PullState.PatientStepperInputs.useState((s) => s.relation);
  const handleChange = (name, value) => {
    PullState.PatientStepperInputs.update((s) => {
      s[name] = value;
    });
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", flexBasis: "100%" }}>
      <div style={{ display: "flex", width: "45%", margin: "0% 1%" }}>
        <UIButtonGroup
          label="Patient is Subscriber"
          buttonList={[
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ]}
          containerStyle={{ display: "flex", flexBasis: "100%", columnGap: "15%" }}
          value={isSubscriber.toString()}
          onChangeValue={(val) => {
            handleChange("isSubscriber", val == "true" ? true : false);
          }}
        />
      </div>
      {!isSubscriber && (
        <TextFieldWithLabel label="Patient" value={patient} onChangeText={(val) => handleChange("patient", val)} />
      )}
      {!isSubscriber && (
        <div
          style={{
            display: "flex",
            width: "45%",
            flexBasis: "45%",
            margin: "0% 1%",
            alignItems: "center",
            columnGap: "10%",
          }}
        >
          <InputLabel required>Relation to Subscriber</InputLabel>
          <UIButtonGroup
            buttonList={relationShip}
            value={relation}
            onChangeValue={(val) => handleChange("relation", val)}
          />
        </div>
      )}
      <TextFieldWithLabel label="SSN" value={ssn} onChangeText={(val) => handleChange("ssn", val)} />
      <TextFieldWithLabel
        label="Last Name"
        required
        value={lastName}
        onChangeText={(val) => handleChange("lastName", val)}
      />
      <TextFieldWithLabel
        label="First Name"
        required
        value={firstName}
        onChangeText={(val) => handleChange("firstName", val)}
      />
      <TextFieldWithLabel
        label="Middle Name"
        value={middleName}
        onChangeText={(val) => handleChange("middleName", val)}
      />
      <TextFieldWithLabel label="Suffix" value={suffix} onChangeText={(val) => handleChange("suffix", val)} />
      <TextFieldWithLabel
        label="DOB"
        type="date"
        required
        value={dob}
        onChangeText={(val) => handleChange("dob", val)}
      />
      <div style={{ display: "flex", width: "50%", margin: "0% 1%" }}>
        <UIButtonGroup
          label="Gender"
          buttonList={genderList}
          containerStyle={{ display: "flex", columnGap: "65%" }}
          value={gender}
          onChangeValue={(val) => handleChange("gender", val)}
        />
      </div>
      <TextFieldWithLabel
        label="AddressLine1"
        value={addressLine1}
        onChangeText={(val) => handleChange("addressLine1", val)}
      />
      <TextFieldWithLabel
        label="AddressLine2"
        value={addressLine2}
        onChangeText={(val) => handleChange("addressLine2", val)}
      />
      <TextFieldWithLabel label="City" required value={city} onChangeText={(val) => handleChange("city", val)} />
      <TextFieldWithLabel label="State" value={state} onChangeText={(val) => handleChange("state", val)} />
      <TextFieldWithLabel label="Zipcode" value={zipcode} onChangeText={(val) => handleChange("zipcode", val)} />
    </div>
  );
};

export default PatientStepper;
