import { Button, Step, StepLabel, Stepper, Theme, Typography, useTheme } from "@mui/material";
import { UIModel, UIPrimaryButton, useSnackbar } from "@src/../../packages/ui/src";
import EligibilityRequestStepper from "./EligibilityRequestStepper";
import React, { ReactElement, useEffect, useState } from "react";
import SubscriberSearchStepper from "./SubscriberSearchStepper";
import { makeStyles } from "@mui/styles";
import PatientStepper from "./PatientStepper";
import ServiceStepper from "./ServiceStepper";
import * as PullState from "../../../DataPullState";
import { gql } from "@apollo/client";
import { RelationShip, useCreate_Eligibility_RequestMutation } from "@src/../../packages/graphql_code_generator/src";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

interface Steps {
  component?: ReactElement;
  label: string;
}

const steps: Steps[] = [
  { label: "EligibilityRequest", component: <EligibilityRequestStepper /> },
  { label: "SubscriberSearch", component: <SubscriberSearchStepper /> },
  { label: "Patient", component: <PatientStepper /> },
  { label: "Service", component: <ServiceStepper /> },
];

const CREATE_ELIGIBILITY_REQUEST = gql`
  mutation create_eligibility_request($eligibility_input: EligibilityInput!, $services: [Float!]!) {
    create_eligibility_request(eligibility_input: $eligibility_input, services: $services) {
      id
    }
  }
`;

const CreateEligibilityRequestModel = (props: Props) => {
  const styles = useStyles();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(0);
  const [disableBack, setDisableBack] = useState<boolean>(true);
  const [nextText, setNextText] = useState<string>("Next");
  const [submitDisabled, setSubmitDisabled] = useState<boolean>(true);
  const eligibilityRequestData = PullState.EligibilityRequestInputs.useState((s) => s);
  const subscriberSearchData = PullState.SubscriberSearchInputs.useState((s) => s);
  const patientData = PullState.PatientStepperInputs.useState((s) => s);
  const servicesData = PullState.ServiceStepperInputs.useState((s) => s);
  const [createEligibilityRequest, createEligibilityResponse] =
    useCreate_Eligibility_RequestMutation(CREATE_ELIGIBILITY_REQUEST);
  const handleBack = () => {
    if (activeStep == 0) {
      setDisableBack(true);
      return;
    }
    setDisableBack(false);
    setActiveStep(activeStep - 1);
  };
  const handleNext = () => {
    if (activeStep == steps.length - 1) {
      submit();
      return;
    }
    setNextText("Next");
    setActiveStep(activeStep + 1);
  };

  useEffect(() => {
    if (activeStep == 0) setDisableBack(true);
    else setDisableBack(false);
    if (activeStep == steps.length - 1) setNextText("Submit");
    else setNextText("Next");
  }, [activeStep]);

  const completeCheck = (index) => {
    switch (index) {
      case 0:
        return PullState.EligibilityRequestActions.eligibilityRequestValidation();
      case 1:
        return PullState.EligibilityRequestActions.subscriberSearchValidation();
      case 2:
        return PullState.EligibilityRequestActions.patientValidation();
      // case 3:
      //   return PullState.EligibilityRequestActions.servicesValidation();
    }
  };

  useEffect(() => {
    if (eligibilityRequestData.isCompleted && subscriberSearchData.isCompleted && patientData.isCompleted) {
      setSubmitDisabled(false);
    } else {
      setSubmitDisabled(true);
    }
  }, [eligibilityRequestData.isCompleted, subscriberSearchData.isCompleted, patientData.isCompleted]);

  const submit = () => {
    createEligibilityRequest({
      variables: {
        eligibility_input: {
          provider_last_name: eligibilityRequestData.providerLastName,
          provider_first_name: eligibilityRequestData?.providerFirstName,
          npi: eligibilityRequestData.npi,
          payer_id: Number(eligibilityRequestData.payerId),
          from: eligibilityRequestData.from,
          to: eligibilityRequestData.to,
          type: eligibilityRequestData.type,
          practice_name: eligibilityRequestData.practiceName,
          office_location: eligibilityRequestData.officeLocation,
          practice_tax_id: eligibilityRequestData.practiceTaxId,
          subscriber: `${subscriberSearchData.lastName}, ${subscriberSearchData.firstName}`,
          subscriber_id: subscriberSearchData?.subscriberId,
          subscriber_ssn: subscriberSearchData?.ssn,
          subscriber_dob: subscriberSearchData?.dob,
          subscriber_state: subscriberSearchData?.state,
          subscriber_suffix: subscriberSearchData?.suffix,
          subscriber_gender: subscriberSearchData?.gender,
          subscriber_zipcode: subscriberSearchData?.zipcode,
          subscriber_last_name: subscriberSearchData?.lastName,
          subscriber_first_name: subscriberSearchData?.firstName,
          subscriber_middle_name: subscriberSearchData?.lastName,
          subscriber_address_line1: subscriberSearchData?.addressLine1,
          subscriber_address_line2: subscriberSearchData?.addressLine2,
          patient_ssn: patientData?.ssn,
          patient_dob: patientData?.dob,
          patient_city: patientData?.city,
          patient_name: `${patientData.lastName}, ${patientData.firstName}`,
          patient_state: patientData?.state,
          patient_suffix: patientData?.suffix,
          patient_gender: patientData?.gender,
          patient_zipcode: patientData?.zipcode,
          patient_relation: RelationShip[patientData?.relation],
          patient_first_name: patientData?.firstName,
          patient_last_name: patientData?.lastName,
          patient_middle_name: patientData?.middleName,
          patient_address_line1: patientData?.addressLine1,
          patient_address_line2: patientData?.addressLine2,
          group: subscriberSearchData?.group,
        },
        services: servicesData?.services?.map((service) => Number(service.id)),
      },
    });
  };
  useEffect(() => {
    if (createEligibilityResponse?.data) {
      enqueueSnackbar("Eligibility Request created!", { variant: "success" });
      props?.onClose();
    }
  }, [createEligibilityResponse?.data]);
  return (
    <UIModel isOpen={props?.isOpen} onClose={props?.onClose} title="Enter the Details" maxWidth="xl">
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((step, index) => {
          return (
            <Step
              key={index}
              completed={completeCheck(index)}
              onClick={() => {
                setActiveStep(index);
              }}
              style={{
                cursor: "pointer",
              }}
            >
              <StepLabel>{step.label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <div className={styles.title}>
        <Typography color={"white"} textAlign={"center"}>
          {steps[activeStep].label}
        </Typography>
      </div>
      <div style={{ height: 500, overflow: "auto" }}>{steps[activeStep]?.component}</div>
      <div className={styles.buttonwrapper}>
        <Button variant="outlined" disabled={disableBack} onClick={() => handleBack()}>
          Back
        </Button>
        <UIPrimaryButton
          loading={createEligibilityResponse?.loading}
          variant="contained"
          onClick={() => handleNext()}
          disabled={nextText != "Next" && submitDisabled}
        >
          {nextText}
        </UIPrimaryButton>
      </div>
    </UIModel>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  row: { display: "flex" },
  title: { backgroundColor: theme.palette.primary.main, padding: "0.5%", margin: "1% 0%" },
  buttonwrapper: { display: "flex", justifyContent: "center", columnGap: "3%", margin: "1% 0%" },
}));

export default CreateEligibilityRequestModel;
