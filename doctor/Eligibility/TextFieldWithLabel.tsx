import { OutlinedTextFieldProps, InputLabel } from "@mui/material";
import { UITextField } from "@src/../../packages/ui/src";
import React from "react";

interface CustomProps {
  label: string;
  onChangeText?: (text: string) => void;
}

export const TextFieldWithLabel = (props: CustomProps & Partial<OutlinedTextFieldProps>) => {
  return (
    <div style={{ display: "flex", alignItems: "center", flexBasis: "45%", margin: "0% 1%" }}>
      <InputLabel required={props?.required || false} style={{ flexBasis: "50%" }}>
        {props.label}
      </InputLabel>{" "}
      <UITextField style={{ flexBasis: "50%" }} placeholder={props.label} {...props} />
    </div>
  );
};
