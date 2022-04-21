import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { UIMaskInput, UIModel, UIPrimaryButton, useSnackbar } from "@gogocode-package/ui-web";
import * as GoGQL from "@gogocode-package/graphql_code_generator";
import { gql } from "@apollo/client";
import { FETCH_DOCTOR_MEMBERSHIP_INFO } from "./LocationDetails";
import { emptyCheck } from "@src/utils";
import _ from "lodash";
import { GET_UPDATE_STATUS } from "../GetUpdateStatus";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedLocationType: "Mailing" | "Practice";
  type: "Add" | "Edit";
  selectedAddress: GoGQL.ProviderAddress;
  addresses: GoGQL.ProviderAddress[];
};

// export const UPDATE_DOCTOR_ADDRESS = gql`
//   mutation update_provider_address($input: ProviderAddressInput!, $id: Float!) {
//     update_provider_address(input: $input, id: $id) {
//       id
//       address_line1
//       address_line2
//       city
//       state
//       postal_code
//       fax
//       type
//     }
//   }
// `;

export const UPDATE_DOCTOR_ADDRESS = gql`
  mutation update_doctor_membership_info_provider_address(
    $input: ProviderAddressInput!
    $operation: DBOperation!
    $row_id: Float
  ) {
    update_doctor_membership_info_provider_address(input: $input, operation: $operation, row_id: $row_id)
  }
`;

const ADD_DOCTOR_ADDRESS = gql`
  mutation add_provider_address($input: ProviderAddressInput!) {
    add_provider_address(input: $input) {
      id
      address_line1
      address_line2
      city
      state
      postal_code
      fax
      type
    }
  }
`;

export const FETCH_CITIES = gql`
  query fetch_cities($state: String, $city: String) {
    fetch_cities(state: $state, city: $city) {
      city
    }
  }
`;

export const FETCH_STATES = gql`
  query fetch_states($state: String) {
    fetch_states(state: $state) {
      state_name
    }
  }
`;

const AddLocationDetailsModel = (props: Props) => {
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const [addressState, setAddressState] = useState<GoGQL.ProviderAddress>(null);
  const [error, setError] = useState(null);
  const [updateAddressRequest, updateAddressResponse] = GoGQL.useUpdate_Doctor_Membership_Info_Provider_AddressMutation(
    UPDATE_DOCTOR_ADDRESS,
    {
      refetchQueries: [
        {
          query: FETCH_DOCTOR_MEMBERSHIP_INFO,
          variables: {
            includes: [GoGQL.ViewDoctorIncludesEnum.Address],
          },
        },
        {
          query: GET_UPDATE_STATUS,
          variables: {
            section: GoGQL.ViewDoctorIncludesEnum.Address,
          },
        },
      ],
      fetchPolicy: "no-cache",
    }
  );
  // const [updateAddressRequest, updateAddressResponse] =
  //   GoGQL.useUpdate_Provider_AddressMutation(UPDATE_DOCTOR_ADDRESS);
  // const [addProviderAddressRequest, addProviderAddressResponse] =
  //   GoGQL.useAdd_Provider_AddressMutation(ADD_DOCTOR_ADDRESS, {
  //     refetchQueries: [
  //       {
  //         query: FETCH_DOCTOR_MEMBERSHIP_INFO,
  //         variables: {
  //           includes: [
  //             GoGQL.ViewDoctorIncludesEnum.Address,
  //             GoGQL.ViewDoctorIncludesEnum.User,
  //           ],
  //         },
  //       },
  //     ],
  //   });

  const CityResponse = GoGQL.useFetch_CitiesQuery(FETCH_CITIES, {
    variables: {
      city: addressState?.city,
      state: addressState?.state,
    },
    fetchPolicy: "cache-and-network",
  });
  const StateResponse = GoGQL.useFetch_StatesQuery(FETCH_STATES, {
    variables: {
      state: addressState?.state,
    },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (props?.type == "Edit") {
      setAddressState(props?.selectedAddress);
    }
  }, [props?.isOpen]);

  const isValid = () => {
    const error_msg = emptyCheck([
      { name: "Address Line 1", value: addressState?.address_line1 },
      { name: "Address Line 2", value: addressState?.address_line2 },
      { name: " City ", value: addressState?.city },
      { name: " State", value: addressState?.state },
      { name: "Zipcode", value: addressState?.postal_code },
    ]);
    if (error) return false;
    if (error_msg.length >= 5) {
      enqueueSnackbar("Fields should not be empty", { variant: "error" });
      return false;
    } else if (error_msg.length > 0) {
      enqueueSnackbar(error_msg[0], { variant: "error" });
      return false;
    } else return true;
  };

  const isValidInput = (value: string, length: number) => {
    if (String(value).length > length) {
      return false;
    }
    return true;
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setAddressState((prevSt) => ({ ...prevSt, [name]: value }));
  };

  const resetFields = () => {
    setAddressState(null);
  };

  const onAddRequest = () => {
    return {
      address_line1: addressState?.address_line1,
      address_line2: addressState?.address_line2,
      city: addressState?.city,
      state: addressState?.city,
      postal_code: addressState?.postal_code,
      fax: addressState?.fax,
      type: addressState?.type,
    };
  };
  const onEditRequest = () => {
    return {
      address_line1: addressState?.address_line1,
      address_line2: addressState?.address_line2,
      city: addressState?.city,
      state: addressState?.state,
      postal_code: addressState?.postal_code,
      fax: addressState?.fax,
      type: addressState?.type,
    };
  };

  const handleUpdateDoctorAddress = () => {
    if (isValid()) {
      let data: GoGQL.ProviderAddressInput = {
        address_line1: addressState?.address_line1,
        address_line2: addressState?.address_line2,
        city: addressState?.city,
        state: addressState?.state,
        postal_code: addressState?.postal_code,
        phone: addressState?.phone,
        fax: addressState?.fax,
        type: addressState?.type || props?.selectedLocationType,
      };
      updateAddressRequest({
        variables: {
          input: data,
          operation: props?.type == "Add" ? GoGQL.DbOperation.Add : GoGQL.DbOperation.Edit,
          row_id: props?.type == "Add" ? null : Number(props?.selectedAddress?.id),
        },
      });
    }
  };
  useEffect(() => {
    if (updateAddressResponse?.data) {
      resetFields();
      props?.onClose();
    }
  }, [updateAddressResponse?.data]);
  return (
    <UIModel
      isOpen={props.isOpen}
      hideCancel
      disableEscapeKeyDown
      onClose={(event, reason) => {
        resetFields();
        props.onClose();
      }}
      action={
        <>
          <UIPrimaryButton
            onClick={handleUpdateDoctorAddress}
            style={{ display: "flex", justifySelf: "center", margin: 10 }}
            loading={updateAddressResponse?.loading}
            disabled={error}
          >
            Save
          </UIPrimaryButton>
        </>
      }
      maxWidth="lg"
      style={{}}
      title={`${props.type} Location Details`}
      titleStyle={{ color: theme.palette.primary.main }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          padding: "0 10%",
          columnGap: "10%",
        }}
      >
        <div style={{ flexBasis: "40%", margin: "1% 0" }}>
          {/* <Typography>Address Line 1</Typography> */}
          <TextField
            placeholder={"Address Line 1"}
            name="address_line1"
            fullWidth
            label="Address Line 1"
            value={addressState?.address_line1}
            onChange={(event) => {
              isValidInput(event.target.value, 50) && handleChange(event);
            }}
          />
        </div>
        <div style={{ flexBasis: "40%", margin: "1% 0" }}>
          {/* <Typography>Address Line 2</Typography> */}
          <TextField
            placeholder={"Address Line 2"}
            name="address_line2"
            fullWidth
            label="Address Line 2"
            value={addressState?.address_line2}
            onChange={(event) => {
              isValidInput(event.target.value, 50) && handleChange(event);
            }}
          />
        </div>
        <div style={{ flexBasis: "40%", margin: "1% 0" }}>
          {/* <Typography>State</Typography> */}
          <Autocomplete
            disablePortal
            fullWidth
            style={{ backgroundColor: "white" }}
            id="state"
            ListboxProps={{ style: { maxHeight: "10rem" } }}
            value={addressState?.state || ""}
            options={
              StateResponse?.data?.fetch_states?.map((state) => state.state_name != "" && state.state_name) || []
            }
            onChange={(_, state: string) => {
              setAddressState({ ...addressState, state });
            }}
            onInputChange={(_, value) => {
              setAddressState({ ...addressState, state: value });
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} label="State" />}
          />
        </div>
        <div style={{ flexBasis: "40%", margin: "1% 0" }}>
          {/* <Typography>City</Typography> */}
          <Autocomplete
            disablePortal
            ListboxProps={{ style: { maxHeight: "10rem" } }}
            fullWidth
            style={{ backgroundColor: "white" }}
            id="city"
            value={addressState?.city || ""}
            options={CityResponse?.data?.fetch_cities.map((city) => city.city != "" && city.city) || []}
            onChange={(_, city: string) => {
              setAddressState({ ...addressState, city });
            }}
            onInputChange={(event, value) => {
              setAddressState({ ...addressState, city: value });
            }}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} label="City" />}
          />
        </div>
        <div style={{ flexBasis: "40%", margin: "1% 0" }}>
          {/* <Typography>Zip code</Typography> */}
          <TextField
            placeholder={"Zip code"}
            name="postal_code"
            fullWidth
            label="Zip Code"
            value={addressState?.postal_code}
            onChange={(event) => {
              !isNaN(Number(event.target.value)) && isValidInput(event.target.value, 5) && handleChange(event);
            }}
          />
        </div>
        <div style={{ flexBasis: "40%", margin: "1% 0" }}>
          {/* <Typography>Phone</Typography> */}
          <UIMaskInput
            fullWidth
            mask="us-mobile"
            placeholder={"Phone"}
            name="phone"
            value={addressState?.phone}
            onChange={handleChange}
            error={!/\(\d\d\d\) \d\d\d-\d\d\d\d/.test(addressState?.phone)}
            onError={(error) => {
              setError(error);
            }}
            style={{ marginTop: "1%" }}
          />
        </div>
        <div style={{ flexBasis: "40%", margin: "1% 0" }}>
          {/* <Typography>fax</Typography> */}
          <TextField
            placeholder={"Fax"}
            name="fax"
            fullWidth
            label="Fax"
            value={addressState?.fax}
            onChange={(event) => {
              handleChange(event);
            }}
          />
        </div>
        <div style={{ flexBasis: "40%", margin: "1% 0" }}>
          <FormControl fullWidth>
            <InputLabel id="location-type-input-label">Type</InputLabel>
            <Select
              labelId="location-type-input-label"
              id="location-type-select"
              value={addressState?.type || props?.selectedLocationType}
              label="Type"
              name="type"
              onChange={handleChange}
            >
              <MenuItem value={"Mailing"}>Mailing</MenuItem>
              <MenuItem value={"Practice"}>Practice</MenuItem>
            </Select>
          </FormControl>
        </div>
      </div>
    </UIModel>
  );
};

export default AddLocationDetailsModel;
