import { Done } from "@mui/icons-material";
import { LocalizationProvider, TimePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { IconButton, TableRow, TextField } from "@mui/material";
import { UIModel, UIPrimaryButton } from "@src/../../packages/ui/src";
import { id } from "date-fns/locale";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { StyledTableCell } from ".";

type TimeSlot = {
  from: Date;
  to: Date;
};
type Props = {
  isOpen: boolean;
  onClose: () => void;
  onDone: (timeSlot: { from: Date; to: Date; day: string; index: number }, isEdit: boolean) => void;
  selectedTimeSlot: { from: string; to: string; index: number; day: string };
};
const SlotInputModal = (props: Props) => {
  const [timeSlotInput, setTimeSlotInput] = useState<TimeSlot>({
    from: moment("9.00 AM", "HH:mm").toDate(),
    to: moment("10.00 AM", "HH:mm").toDate(),
  });
  useEffect(() => {
    if (props?.selectedTimeSlot) {
      setTimeSlotInput({
        from: moment(props?.selectedTimeSlot?.from, "HH:mm").toDate(),
        to: moment(props?.selectedTimeSlot?.to, "HH:mm").toDate(),
      });
    }
  }, [props]);
  return (
    <UIModel
      isOpen={props?.isOpen}
      onClose={props?.onClose}
      action={
        <>
          <UIPrimaryButton
            onClick={() =>
              props?.onDone(
                { ...timeSlotInput, day: props?.selectedTimeSlot?.day, index: props?.selectedTimeSlot?.index },
                props?.selectedTimeSlot ? true : false
              )
            }
          >
            Done
          </UIPrimaryButton>
        </>
      }
    >
      <TableRow>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StyledTableCell>
            <TimePicker
              label="From"
              value={timeSlotInput?.from}
              onChange={(newValue: Date | null) => {
                setTimeSlotInput({ ...timeSlotInput, from: newValue });
              }}
              renderInput={(params) => <TextField {...params} />}
              shouldDisableTime={(timeValue, clockType) => {
                if (clockType === "minutes" && timeValue % 15) {
                  return true;
                }

                return false;
              }}
            />
          </StyledTableCell>
          <StyledTableCell>
            <TimePicker
              label="To"
              value={timeSlotInput?.to}
              onChange={(newValue: Date | null) => {
                setTimeSlotInput({ ...timeSlotInput, to: newValue });
              }}
              renderInput={(params) => <TextField {...params} />}
              shouldDisableTime={(timeValue, clockType) => {
                if (clockType === "minutes" && timeValue % 10) {
                  return true;
                }

                return false;
              }}
              minTime={moment(timeSlotInput?.from).add(40, "minutes").toDate()}
            />
          </StyledTableCell>
          {/* <StyledTableCell style={{ borderBottom: "none", gap: "10%", display: "flex", alignItems: "center" }}>
            <IconButton style={{}} onClick={() => onAddTimeSlotDone(isEdit, id)}>
              <Done htmlColor={theme.palette.primary.main} />
            </IconButton>
          </StyledTableCell> */}
        </LocalizationProvider>
      </TableRow>
    </UIModel>
  );
};
export default SlotInputModal;
