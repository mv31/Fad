import { Typography } from "@mui/material";
import { genderList } from "@src/../../Constants";
import { UIButtonGroup } from "@src/../../packages/ui/src";
import React, { useState } from "react";
import { TextFieldWithLabel } from "./TextFieldWithLabel";
import * as PullState from "../../../DataPullState";

const SubscriberSearchStepper = () => {
  const subscriber = PullState.SubscriberSearchInputs.useState((s) => s.subscriber);
  const subscriberId = PullState.SubscriberSearchInputs.useState((s) => s.subscriberId);
  const ssn = PullState.SubscriberSearchInputs.useState((s) => s.ssn);
  const group = PullState.SubscriberSearchInputs.useState((s) => s.group);
  const lastName = PullState.SubscriberSearchInputs.useState((s) => s.lastName);
  const firstName = PullState.SubscriberSearchInputs.useState((s) => s.firstName);
  const middleName = PullState.SubscriberSearchInputs.useState((s) => s.middleName);
  const suffix = PullState.SubscriberSearchInputs.useState((s) => s.suffix);
  const dob = PullState.SubscriberSearchInputs.useState((s) => s.dob);
  const addressLine1 = PullState.SubscriberSearchInputs.useState((s) => s.addressLine1);
  const addressLine2 = PullState.SubscriberSearchInputs.useState((s) => s.addressLine2);
  const gender = PullState.SubscriberSearchInputs.useState((s) => s.gender);
  const zipcode = PullState.SubscriberSearchInputs.useState((s) => s.zipcode);
  const state = PullState.SubscriberSearchInputs.useState((s) => s.state);
  // const [gender, setGender] = useState<string>("");
  const handleChange = (name, value) => {
    PullState.SubscriberSearchInputs.update((s) => {
      s[name] = value;
    });
  };
  return (
    <div style={{ display: "flex", flexWrap: "wrap", flexBasis: "100%" }}>
      <TextFieldWithLabel
        label="Subscriber"
        value={subscriber}
        required
        onChangeText={(val) => {
          handleChange("subscriber", val);
        }}
      />
      <TextFieldWithLabel
        label="Subscriber ID"
        value={subscriberId}
        onChangeText={(val) => {
          handleChange("subscriberId", val);
        }}
      />
      <TextFieldWithLabel
        label="SSN"
        value={ssn}
        onChangeText={(val) => {
          handleChange("ssn", val);
        }}
      />
      <TextFieldWithLabel
        label="Group"
        value={group}
        onChangeText={(val) => {
          handleChange("group", val);
        }}
      />
      <TextFieldWithLabel
        label="Last Name"
        value={lastName}
        required
        onChangeText={(val) => {
          handleChange("lastName", val);
        }}
      />
      <TextFieldWithLabel
        label="First Name"
        value={firstName}
        required
        onChangeText={(val) => {
          handleChange("firstName", val);
        }}
      />
      <TextFieldWithLabel
        label="Middle Name"
        value={middleName}
        onChangeText={(val) => {
          handleChange("middleName", val);
        }}
      />
      <TextFieldWithLabel
        label="Suffix"
        value={suffix}
        onChangeText={(val) => {
          handleChange("suffix", val);
        }}
      />
      <TextFieldWithLabel
        label="DOB"
        type="date"
        required
        value={dob}
        onChangeText={(val) => {
          handleChange("dob", val);
        }}
      />
      <TextFieldWithLabel
        label="AddressLine1"
        value={addressLine1}
        onChangeText={(val) => {
          handleChange("addressLine1", val);
        }}
      />
      <TextFieldWithLabel
        label="AddressLine2"
        value={addressLine2}
        onChangeText={(val) => {
          handleChange("addressLine2", val);
        }}
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
        label="Zipcode"
        value={zipcode}
        onChangeText={(val) => {
          handleChange("zipcode", val);
        }}
      />

      <TextFieldWithLabel
        label="State"
        value={state}
        onChangeText={(val) => {
          handleChange("state", val);
        }}
      />
    </div>
  );
};

export default SubscriberSearchStepper;
