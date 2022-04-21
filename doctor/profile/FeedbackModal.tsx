import { UIModel, UIPrimaryButton } from "@gogocode-package/ui-web";
import { Grid, Typography } from "@mui/material";
import React, { FC } from "react";

interface Props {
  isOpen: boolean;
  onClickDone: () => void;
  onCloseClick: () => void;
}

export const FeedbackModal: FC<Props> = ({ isOpen, onClickDone, onCloseClick }) => {
  return (
    <UIModel
      hideCancel
      isOpen={isOpen}
      onClose={() => {
        onCloseClick();
      }}
    >
      <div style={{ display: "flex", textAlign: "center", justifyContent: "center" }}>
        <Typography style={{ alignSelf: "center", fontWeight: 600 }}>How Good Is Doctor At This Skill?</Typography>
      </div>
      <Grid
        style={{ display: "flex", justifyContent: "space-between", marginTop: 20, marginRight: 10, marginLeft: 10 }}
      >
        <div style={{ justifyContent: "center", marginTop: 20 }}>
          <UIPrimaryButton variant="outlined" type="submit" id="good">
            Good
          </UIPrimaryButton>
        </div>
        <div style={{ justifyContent: "center", marginTop: 20, marginLeft: 20 }}>
          <UIPrimaryButton variant="outlined" type="submit" id="very_good">
            Very Good
          </UIPrimaryButton>
        </div>
        <div style={{ justifyContent: "center", marginTop: 20, marginLeft: 20 }}>
          <UIPrimaryButton variant="outlined" type="submit" id="highly_skilled">
            Highly Skilled
          </UIPrimaryButton>
        </div>
      </Grid>
    </UIModel>
  );
};
