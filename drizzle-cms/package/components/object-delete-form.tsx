"use client";

import { capitalCase } from "change-case-all";
import {
  Alert,
  Button,
  Checkbox,
  Form,
  FormControl,
  Input,
  Label,
} from "drizzle-ui";
import { renderValue } from "../utils";
import { useState } from "react";
import { ColumnInfoMap } from "../types";

type AlertVariant =
  | "primary"
  | "muted"
  | "success"
  | "danger"
  | "warning"
  | "info";

interface UpdateStatus {
  message?: string;
  status?: AlertVariant;
}

export function ObjectDeleteForm({
  obj,
  curTable,
  columnInfoMap,
}: {
  obj: any;
  curTable: string;
  columnInfoMap: ColumnInfoMap;
}) {
  const [state, setState] = useState<UpdateStatus>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    // api call
    const data = Object.fromEntries(formData.entries());

    const res = await fetch(`/api/${curTable}/${obj.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    setState({ message: json.message, status: json.status });
  }

  if (state.message) {
    return (
      <Alert variant={state.status} className="mb-5">
        {state.message}
      </Alert>
    );
  }

  return (
    <Form onSubmit={handleSubmit}>
      <input type="hidden" name="curTable" defaultValue={curTable} />
      <FormControl>
        <Label>Are you sure you want to delete this {curTable}</Label>
        <Button type="submit">Submit</Button>
      </FormControl>
    </Form>
  );
}
