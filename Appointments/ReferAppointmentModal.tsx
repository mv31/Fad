import {
  Avatar,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { UIModel, useErrorNotification } from "@src/../../packages/ui/src";
import { formattedAddress, toTitleCase } from "@src/utils";
import React, { useState } from "react";
import ClearIcon from "@mui/icons-material/Clear";
import _ from "lodash";
// import { DoctorCard } from "./BookAppointmentModel";
import FilterDoctorModel from "../CommunicationRequests/FilterDoctorModel";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { makeStyles } from "@mui/styles";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (referral_provider_id: number) => void;
};

const DoctorCard = (props) => {
  const classes = useStyles();
  const theme = useTheme();
  const practiceAddress = props?.doctor?.ProviderAddresses?.filter((address) => address?.type == "Practice")[0];
  const address = formattedAddress({
    firstLineAddress: practiceAddress?.address_line1,
    secondLineAddress: practiceAddress?.address_line2,
    city: practiceAddress?.city,
    postalCode: practiceAddress?.postal_code,
    state: practiceAddress?.state,
  });

  const Specialty = props?.doctor?.specialties?.join(" | ");
  return (
    <Paper
      style={{
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 10,
        height: 150,
        alignItems: "center",
        display: "flex",
      }}
      elevation={5}
    >
      <Grid container style={{ alignItems: "center" }} gap="1%" columnGap={3}>
        <Grid xs={12} sm={4} lg={2} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Avatar sx={{ height: "70px", width: "70px" }} src={props?.doctor?.profilePicture} />
        </Grid>
        <Grid item xs={12} lg={9} sm={7} style={{}}>
          <Tooltip title={`Dr. ${props?.doctor?.name}`}>
            <Typography className={classes.textPrimary}>{`Dr. ${props?.doctor?.name}`}</Typography>
          </Tooltip>
          <Tooltip title={Specialty} placement="bottom">
            <Typography className={classes.textSecondary}>{Specialty}</Typography>
          </Tooltip>
          <Grid style={{ display: "flex", marginTop: 10 }}>
            {/* {address?.trim() != "" && <MapsHomeWorkOutlinedIcon style={{ color: "lightblue" }} />} */}
            <Typography style={{}} className={classes.textAddress}>
              {/* {props?.doctor?.address} */}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

function ReferAppointmentModal({ isOpen, onClose, onSubmit }: Props) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [provider_id, setProvider_id] = useState(null);
  const [isFilterDoctorOpen, setIsFilterDoctorOpen] = useState<boolean>(false);
  function clearDoctor() {
    setSelectedDoctor({});
  }

  return (
    <UIModel
      isOpen={isOpen}
      onClose={onClose}
      action={
        <Button
          variant="contained"
          disabled={_.isEmpty(selectedDoctor)}
          onClick={() => {
            onSubmit(provider_id);
            clearDoctor();
          }}
        >
          {"Refer Selected Provider"}
        </Button>
      }
      title={"Refer the Provider"}
      maxWidth={"md"}
    >
      <TextField
        variant="outlined"
        fullWidth
        value={
          !_.isEmpty(selectedDoctor)
            ? `${toTitleCase(selectedDoctor?.firstName)}, ${toTitleCase(selectedDoctor?.lastName)}`
            : ""
        }
        placeholder="Enter Doctor Name"
        id="DoctorName"
        label="Doctor Name"
        style={{ backgroundColor: "white", marginTop: 10 }}
        onClick={() => {
          setIsFilterDoctorOpen(true);
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => {
                  clearDoctor();
                  setIsFilterDoctorOpen(true);
                }}
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <div style={{ marginTop: "2%" }}>
        {!_.isEmpty(selectedDoctor) && <DoctorCard {...selectedDoctor} doctor={selectedDoctor} />}
      </div>
      <FilterDoctorModel
        isOpen={isFilterDoctorOpen}
        onClose={() => {
          setIsFilterDoctorOpen(false);
        }}
        onSelectDoctor={(data) => {
          setProvider_id(data.providerId);
          setSelectedDoctor(data);
        }}
        function="get_providers"
      />
    </UIModel>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  textPrimary: {
    fontWeight: 600,
    fontSize: 22,
    marginTop: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  textSecondary: {
    color: theme.palette.primary.main,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  textAddress: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    maxHeight: 70,
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
}));

export default ReferAppointmentModal;
