import { gql } from "@apollo/client";
import { LocalizationProvider, MobileDatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { Typography, Grid, Autocomplete, TextField, useTheme } from "@mui/material";
import { useCreate_SecretaryMutation } from "@src/../../packages/graphql_code_generator/src";
import { UIModel, UIPrimaryButton, UITextField, useSnackbar } from "@src/../../packages/ui/src";
import { emptyCheck, isValidEmail } from "@src/utils";
import React, { useEffect, useState } from "react";
import { GET_SECRETARIES } from "./SecretaryDetails";

export const ADD_SECRETARY = gql`
  mutation create_secretary($input: SecrataryInput!) {
    create_secretary(input: $input)
  }
`;

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  // onDelete?: () => string;
};
const AddSecretaryModal = (props: Props) => {
  const theme = useTheme();
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { enqueueSnackbar } = useSnackbar();
  const [isError, setIsError] = useState<boolean>(false);

  const [addSecretary, addSecretaryResponse] = useCreate_SecretaryMutation(ADD_SECRETARY, {
    refetchQueries: [
      {
        query: GET_SECRETARIES,
      },
    ],
  });

  const isValid = () => {
    const errorMsg = emptyCheck([
      { name: "Email", value: email },
      { name: "Name", value: name },
      { name: "Password", value: password },
    ]);
    if (errorMsg.length >= 3) {
      enqueueSnackbar("Required Fields should not be empty", { variant: "error" });
      return false;
    } else if (errorMsg.length > 0) {
      errorMsg.map((error) => {
        enqueueSnackbar(error, { variant: "error" });
        return false;
      });
    } else if (password.length < 8) {
      enqueueSnackbar("Password must be greater than 8 characters", { variant: "error" });
    } else if (isError) {
      enqueueSnackbar("Enter Valid Email", { variant: "error" });
      return false;
    } else {
      return true;
    }
  };
  const resetFields = () => {
    setEmail("");
    setPassword("");
    setName("");
  };

  function onSave() {
    if (isValid()) {
      addSecretary({
        variables: {
          input: {
            email,
            name,
            password,
          },
        },
      });
      if (addSecretaryResponse?.error) {
        enqueueSnackbar("Secretary already added", { variant: "error" });
      } else enqueueSnackbar("Secretary added successfully", { variant: "success" });
      resetFields();
      props.onClose();
    }
  }
  useEffect(() => {
    if (addSecretaryResponse?.data && addSecretaryResponse?.data?.create_secretary) {
      props.onClose();
    }
  }, [addSecretaryResponse?.data]);
  return (
    <UIModel
      isOpen={props.isOpen}
      disableEscapeKeyDown
      onClose={() => {
        resetFields();
        props.onClose();
      }}
      maxWidth="sm"
      style={{}}
      action={
        <UIPrimaryButton
          variant="contained"
          style={{ display: "flex", justifySelf: "center", margin: 10 }}
          onClick={onSave}
          // disabled={error}
          // loading={addSecretaryResponse?.loading}
        >
          Save
        </UIPrimaryButton>
      }
      hideCancel
      title={"Add Secretary"}
      titleStyle={{ color: theme.palette.primary.main }}
    >
      <div style={{ width: "80%", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {" "}
          <UITextField
            name="Name"
            variant="outlined"
            required
            fullWidth
            id="secretary name"
            label="Name"
            // autoFocus
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {" "}
          <UITextField
            name="email"
            variant="outlined"
            required
            fullWidth
            id="email"
            label="Email"
            //autoFocus
            value={email}
            error={isError}
            onBlur={() => {
              if (!isValidEmail(email)) setIsError(true);
              else setIsError(false);
            }}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            helperText={isError && " Please enter a Valid email"}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {" "}
          <UITextField
            name="Password"
            variant="outlined"
            required
            type={"password"}
            fullWidth
            id="Password"
            label="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </div>
      </div>
    </UIModel>
  );
};

export default AddSecretaryModal;
