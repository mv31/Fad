import { gql } from "@apollo/client";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import {
  Hospitals,
  ProviderHospitalAffliation,
  ViewDoctorIncludesEnum,
} from "@gogocode-package/graphql_code_generator";
import { UILoader, UIModel, UIPrimaryButton, useSnackbar } from "@gogocode-package/ui-web";
import { EditRounded } from "@mui/icons-material";
import { DatePicker, LocalizationProvider, MobileDatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { Button, FormControl, Grid, IconButton, Paper, TextField, Theme, Typography, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { emptyCheck } from "@src/utils";
import _ from "lodash";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";
import { FETCH_HOSPITAL_AFFLIATIONS_DETAILS } from "./Hospital";

type Props = {
  isOpen: boolean;
  onClose?: () => void;
  prevData?: ProviderHospitalAffliation[];
  type: "Add" | "Edit";
  selectedHospital?: ProviderHospitalAffliation;
};
type SearchFields = {
  country?: string;
  state: string;
  city: string;
  hospital: string;
  year_started?: string;
};

type InputFieldsProps = {
  setSelectedHospital: Dispatch<SetStateAction<SelectedHospital>>;
  setIsSearch: (t: boolean) => void;
  onCardClick: (hospital: Hospitals) => void;
};

type ChildCardProps = {
  data: Partial<Hospitals>;
  onCardClick: () => void;
  isResultantCard?: boolean;
};

const ChildCard = (props: ChildCardProps) => {
  const theme = useTheme();
  const classes = useStyles();
  return (
    <Paper
      className={classes.paper}
      onClick={!props?.isResultantCard ? props?.onCardClick : () => {}}
      style={{ cursor: props?.isResultantCard ? "auto" : "pointer" }}
    >
      <Grid container justifyContent={"space-between"} alignItems="center">
        <Grid style={{ marginTop: "1%", marginLeft: "1%" }}>
          <Typography color={theme.palette.primary.main} fontSize={20} style={{}}>
            {" "}
            {props?.data?.name}
          </Typography>
          <Typography>{props?.data?.city}</Typography>
          <Typography>{props?.data?.state}</Typography>
          <Typography>{props?.data?.country}</Typography>
        </Grid>
        {props?.isResultantCard && (
          <IconButton
            onClick={(e) => {
              props?.onCardClick();
              e.stopPropagation();
            }}
            style={{ height: "50%" }}
          >
            <EditRounded htmlColor={theme.palette.primary.main} />
          </IconButton>
        )}
      </Grid>
    </Paper>
  );
};

const InputFields = (props: InputFieldsProps) => {
  const classes = useStyles();
  const theme = useTheme();
  const [HospitalRequest, HospitalResponse] = GoGQL.useFetch_HospitalsLazyQuery(FETCH_HOSPITAL, {
    fetchPolicy: "no-cache",
  });
  useEffect(() => {
    HospitalRequest({
      variables: {
        input: {
          country: "",
          state: "",
          city: "",
          name: "",
        },
      },
    });
  }, []);
  const [searchFields, setSearchFields] = useState<SearchFields>();
  //const [yearStarted, setYearStarted] = useState<Date>(new Date());
  const handleChange = (event, index) => {
    const fields = { ...searchFields };
    fields[index] = event.target.value;
    setSearchFields(fields);
    HospitalRequest({
      variables: {
        input: {
          country: fields.country != "" ? fields.country : null,
          state: fields.state != "" ? fields.state : null,
          city: fields.city != "" ? fields.city : null,
          name: fields.hospital != "" ? fields.hospital : null,
        },
      },
    });
  };
  return (
    <>
      <Grid container justifyContent="space-between" style={{ height: "100%" }}>
        <Grid
          // xs={12}
          // sm={7}
          lg={5}
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Paper
            elevation={2}
            style={{
              marginRight: "2%",
              overflow: "scroll",
              maxHeight: "100%",
              minHeight: "100%",
            }}
          >
            <FormControl fullWidth className={classes.input} style={{ marginTop: "4%" }}>
              <TextField
                id="countryname"
                variant="outlined"
                value={searchFields?.country}
                fullWidth
                placeholder="Enter Country"
                label="Country"
                style={{ backgroundColor: "white" }}
                onChange={(e) => handleChange(e, "country")}
              />
            </FormControl>
            <FormControl className={classes.input} style={{}}>
              <TextField
                variant="outlined"
                fullWidth
                value={searchFields?.state}
                placeholder="Enter State"
                label="State"
                style={{ backgroundColor: "white" }}
                onChange={(e) => handleChange(e, "state")}
              />
            </FormControl>
            <FormControl className={classes.input} style={{}}>
              <TextField
                variant="outlined"
                fullWidth
                value={searchFields?.city}
                placeholder=" Enter City"
                label="City"
                style={{ backgroundColor: "white" }}
                onChange={(e) => handleChange(e, "city")}
              />
            </FormControl>
            <FormControl className={classes.input} style={{}}>
              <TextField
                variant="outlined"
                fullWidth
                value={searchFields?.hospital}
                placeholder="Enter Hospital Name"
                label="Hospital Name"
                style={{ backgroundColor: "white" }}
                onChange={(e) => handleChange(e, "Hospital")}
              />
            </FormControl>
          </Paper>
        </Grid>
        <Grid
          xs={12}
          sm={10}
          lg={7}
          style={{ height: "100%", backgroundColor: theme.palette.secondary.main, overflow: "auto" }}
        >
          {HospitalResponse?.data?.fetch_hospitals?.map((item, i) => (
            <ChildCard
              key={`key + ${i}`}
              data={item}
              onCardClick={() => {
                props?.onCardClick(item);
              }}
            />
          ))}
          {HospitalResponse?.data?.fetch_hospitals?.length == 0 && (
            <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              {" "}
              <Typography>No Result</Typography>
            </Grid>
          )}
          {HospitalResponse?.loading && (
            <Grid style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <UILoader loading={HospitalResponse?.loading} />
            </Grid>
          )}{" "}
        </Grid>
      </Grid>
    </>
  );
};

const FETCH_HOSPITAL = gql`
  query fetch_hospitals($input: HospitalSearchInput!) {
    fetch_hospitals(input: $input) {
      name
      country
      state
      city
    }
  }
`;
export const UPDATE_HOSPITALS = gql`
  mutation update_doctor_membership_info_hospital_affliation(
    $input: ProviderHospitalAffliationInput!
    $row_id: Float
    $operation: DBOperation!
  ) {
    update_doctor_membership_info_hospital_affliation(input: $input, row_id: $row_id, operation: $operation)
  }
`;

type SelectedHospital = {
  name: string;
  city: string;
  state: string;
  country?: string;
};

const HospitalModel = (props: Props) => {
  let { isOpen, onClose, type } = props;
  const [isSearch, setIsSearch] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState<SelectedHospital>(null);
  const [yearStarted, setYearStarted] = useState<Date>(null);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [updateHospitalsRequest, updateHospitalResponse] =
    GoGQL.useUpdate_Doctor_Membership_Info_Hospital_AffliationMutation(UPDATE_HOSPITALS, {
      refetchQueries: [
        {
          query: FETCH_HOSPITAL_AFFLIATIONS_DETAILS,
          variables: {
            includes: [ViewDoctorIncludesEnum.HospitalAffliation],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.HospitalAffliation,
          },
        },
      ],
    });
  useEffect(() => {
    if (props?.selectedHospital) {
      console.log("selectedHospital", props?.selectedHospital);
      setSelectedHospital({
        name: props?.selectedHospital?.hospital,
        state: props?.selectedHospital?.state,
        city: props?.selectedHospital?.city,
      });
      setYearStarted(new Date(props?.selectedHospital?.year_started));
      setIsSearch(false);
    }
  }, [props?.selectedHospital]);

  const onCardClick = (hospital) => {
    setSelectedHospital({ ...hospital, hospital: hospital?.name });
    setIsSearch(false);
  };

  const handleAddRequest = () => {
    let filteredHospitals = [];
    if (props?.prevData?.length > 0) {
      filteredHospitals = props?.prevData?.map((data) => {
        return _.omit(data, ["id", "__typename"]);
      });
    }
    filteredHospitals?.push({
      state: selectedHospital?.state,
      city: selectedHospital?.city,
      hospital: selectedHospital?.name,
      year_started: yearStarted.getFullYear().toString(),
    });
    return filteredHospitals;
  };

  const handleEditRequest = () => {
    return props?.prevData?.map((data) => {
      let obj;
      if (data?.id == props?.selectedHospital?.id) {
        obj = {
          state: selectedHospital?.state,
          city: selectedHospital?.city,
          hospital: selectedHospital?.name,
          year_started: yearStarted.getFullYear().toString(),
        };
      } else {
        obj = _.omit(data, ["__typename", "id"]);
      }
      return obj;
    });
  };

  const resetFields = () => {
    setSelectedHospital(null);
    setIsSearch(true);
    setYearStarted(null);
  };

  const isValid = () => {
    if (isSearch) {
      enqueueSnackbar("No Hospitals were selected", { variant: "error" });
      return false;
    }
    if (!yearStarted) {
      enqueueSnackbar("Year started is Empty", { variant: "error" });
      return false;
    }
    return true;
  };

  const onSave = () => {
    if (isValid() && !error) {
      // let data;
      // if (props?.type == "Add") {
      //   data = handleAddRequest();
      // } else if (props?.type == "Edit") {
      //   data = handleEditRequest();
      // }
      const data = {
        state: selectedHospital?.state,
        city: selectedHospital?.city,
        hospital: selectedHospital?.name,
        year_started: yearStarted.getFullYear().toString(),
      };
      updateHospitalsRequest({
        variables: {
          input: data,
          operation: props?.type == "Add" ? GoGQL.DbOperation.Add : GoGQL.DbOperation.Edit,
          row_id: props?.type == "Add" ? null : Number(props?.selectedHospital?.id),
        },
      });
    }
  };

  useEffect(() => {
    if (
      updateHospitalResponse?.data &&
      updateHospitalResponse?.data?.update_doctor_membership_info_hospital_affliation
    ) {
      enqueueSnackbar("Updated Successfully", { variant: "success" });
      resetFields();
      onClose();
    }
  }, [updateHospitalResponse?.data]);

  return (
    <UIModel
      isOpen={isOpen}
      disableEscapeKeyDown
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          resetFields();
          props.onClose();
        }
      }}
      action={
        <UIPrimaryButton
          loading={updateHospitalResponse?.loading}
          variant="contained"
          style={{ display: "flex", justifySelf: "center", margin: 10 }}
          onClick={onSave}
          disabled={error}
        >
          Save
        </UIPrimaryButton>
      }
      hideCancel
      maxWidth="lg"
      style={{}}
      title={`${type || ""} Hospital Affiliation`}
      titleStyle={{ textAlign: "center" }}
    >
      <>
        {isSearch ? (
          <div style={{ height: "55vh" }}>
            <InputFields
              setSelectedHospital={setSelectedHospital}
              setIsSearch={setIsSearch}
              onCardClick={onCardClick}
            />
          </div>
        ) : (
          <ChildCard
            data={selectedHospital}
            onCardClick={() => {
              setIsSearch(true);
            }}
            isResultantCard
          />
        )}
        <div style={{ display: "flex", width: "40%", margin: "0 auto", justifyContent: "center", marginTop: "6%" }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MobileDatePicker
              disableCloseOnSelect={false}
              disableFuture
              okText=""
              onError={(error) => setError(error)}
              views={["year"]}
              label="Year Started"
              value={yearStarted}
              onChange={setYearStarted}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </div>
      </>
    </UIModel>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    margin: "2%",
  },
  form: {
    display: "flex",
    width: "90%",
  },
  input: {
    marginTop: "12%",
    marginLeft: "5%",
    marginRight: "5%",
    width: "90%",
  },
  emptyGrid: {
    height: 10,
  },
  paper: {
    margin: "3%",
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 10,
    padding: 10,
  },
}));

export default HospitalModel;
